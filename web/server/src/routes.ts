import { createWriteStream } from 'node:fs'
import { mkdir, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { buildAdminDashboard, isAdminAuthorized, type AdminRsvpRecord } from './admin.js'
import { pool } from './db.js'
import { env } from './env.js'
import { blessingFieldsSchema, rsvpSchema } from './schemas.js'
import { createWeddingCalendar } from './calendar.js'
import { createWechatConfig } from './wechat.js'

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
}

function validationMessage(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message || '提交内容不完整'
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function authorizeAdmin(request: FastifyRequest, reply: FastifyReply) {
  reply.header('Cache-Control', 'no-store')
  if (isAdminAuthorized(request.headers.authorization, env.ADMIN_EXPORT_TOKEN)) return true
  reply.code(401).send({ message: '管理密码错误' })
  return false
}

export async function registerRoutes(app: FastifyInstance) {
  app.get('/api/health', async () => ({ ok: true }))

  app.get('/api/calendar.ics', async (_request, reply) => {
    reply
      .header('Content-Type', 'text/calendar; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="wedding-2026-09-12.ics"')
      .send(createWeddingCalendar())
  })

  app.get('/api/wechat/jssdk', async (request, reply) => {
    const url = (request.query as { url?: string }).url
    if (!url) return reply.code(400).send({ message: '缺少待签名页面地址' })

    try {
      return await createWechatConfig(url)
    } catch (error) {
      request.log.error({ err: error }, 'wechat jssdk configuration failed')
      return reply.code(503).send({ message: '微信分享增强暂时不可用' })
    }
  })

  app.post('/api/rsvp', async (request, reply) => {
    const parsed = rsvpSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: validationMessage(parsed.error) })
    }

    const input = parsed.data
    const hasArrivalPlan = input.attendance !== 'no'
    const guestCount = input.attendance === 'yes' ? input.guestCount : 1
    const transportMode = hasArrivalPlan ? input.transportMode : ''
    const arrivalTime = hasArrivalPlan && input.arrivalTime
      ? `${input.arrivalTime.replace('T', ' ')}:00`
      : null
    const arrivalLocation = hasArrivalPlan ? input.arrivalLocation : ''
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO rsvps
        (client_id, name, attendance, guest_count, transport_mode, arrival_time, arrival_location, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id),
        name = VALUES(name),
        attendance = VALUES(attendance),
        guest_count = VALUES(guest_count),
        transport_mode = VALUES(transport_mode),
        arrival_time = VALUES(arrival_time),
        arrival_location = VALUES(arrival_location),
        message = VALUES(message)`,
      [
        input.clientId,
        input.name,
        input.attendance,
        guestCount,
        transportMode,
        arrivalTime,
        arrivalLocation,
        input.message,
      ],
    )

    return {
      id: result.insertId,
      updated: result.affectedRows === 2,
    }
  })

  app.post('/api/blessings', async (request, reply) => {
    const fields: Record<string, string> = {}
    const uploads: Array<{
      storageName: string
      originalName: string
      mimeType: string
      size: number
      path: string
    }> = []
    const cleanUploads = () =>
      Promise.all(uploads.map((upload) => unlink(upload.path).catch(() => undefined)))

    try {
      for await (const part of request.parts()) {
        if (part.type === 'field') {
          fields[part.fieldname] = String(part.value ?? '')
          continue
        }

        const extension = MIME_EXTENSIONS[part.mimetype]
        if (!extension) {
          part.file.resume()
          await cleanUploads()
          return reply.code(415).send({ message: '仅支持 JPEG、PNG、WebP 或 HEIC 图片' })
        }

        await mkdir(env.UPLOAD_DIR, { recursive: true })
        const originalName = part.filename.slice(0, 240)
        const storageName = `${Date.now()}-${randomUUID()}${extension}`
        const path = join(env.UPLOAD_DIR, storageName)
        const upload = {
          storageName,
          originalName,
          mimeType: part.mimetype,
          size: 0,
          path,
        }
        uploads.push(upload)
        await pipeline(part.file, createWriteStream(path, { flags: 'wx', mode: 0o640 }))
        upload.size = part.file.bytesRead
      }

      const parsed = blessingFieldsSchema.safeParse(fields)
      if (!parsed.success) {
        await cleanUploads()
        return reply.code(400).send({ message: validationMessage(parsed.error) })
      }
      if (!parsed.data.message && uploads.length === 0) {
        return reply.code(400).send({ message: '请写一句祝福或上传照片' })
      }

      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        const [blessingResult] = await connection.execute<ResultSetHeader>(
          'INSERT INTO blessings (client_id, guest_name, message) VALUES (?, ?, ?)',
          [parsed.data.clientId, parsed.data.name, parsed.data.message],
        )
        for (const upload of uploads) {
          await connection.execute(
            `INSERT INTO blessing_media
              (blessing_id, storage_name, original_name, mime_type, byte_size)
             VALUES (?, ?, ?, ?, ?)`,
            [blessingResult.insertId, upload.storageName, upload.originalName, upload.mimeType, upload.size],
          )
        }
        await connection.commit()
        return { id: blessingResult.insertId, photoCount: uploads.length }
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    } catch (error) {
      await cleanUploads()
      throw error
    }
  })

  app.get('/api/admin/dashboard', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    if (!authorizeAdmin(request, reply)) return

    type DashboardRsvpRow = RowDataPacket & AdminRsvpRecord
    type DashboardBlessingRow = RowDataPacket & {
      id: number
      name: string
      message: string
      photoCount: number
      createdAt: string
    }

    const [rsvpRows] = await pool.query<DashboardRsvpRow[]>(
      `SELECT id, name, attendance, guest_count AS guestCount,
              transport_mode AS transportMode,
              DATE_FORMAT(arrival_time, '%Y-%m-%dT%H:%i') AS arrivalTime,
              arrival_location AS arrivalLocation, message,
              DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s') AS updatedAt
       FROM rsvps ORDER BY updated_at DESC`,
    )
    const [blessingRows] = await pool.query<DashboardBlessingRow[]>(
      `SELECT b.id, b.guest_name AS name, b.message,
              COUNT(media.id) AS photoCount,
              DATE_FORMAT(b.created_at, '%Y-%m-%dT%H:%i:%s') AS createdAt
       FROM blessings b
       LEFT JOIN blessing_media media ON media.blessing_id = b.id
       GROUP BY b.id, b.guest_name, b.message, b.created_at
       ORDER BY b.created_at DESC`,
    )
    const blessings = blessingRows.map((row) => ({
      ...row,
      id: Number(row.id),
      photoCount: Number(row.photoCount),
    }))
    return {
      ...buildAdminDashboard(rsvpRows, {
        blessings: blessings.length,
        photos: blessings.reduce((total, blessing) => total + blessing.photoCount, 0),
      }),
      blessings,
    }
  })

  app.get('/api/admin/rsvp.csv', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    if (!authorizeAdmin(request, reply)) return

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT name, attendance, guest_count, transport_mode, arrival_time, arrival_location,
              message, created_at, updated_at
       FROM rsvps ORDER BY created_at ASC`,
    )
    const header = ['姓名', '出席状态', '人数', '交通方式', '到达时间', '到达地点', '留言', '提交时间', '更新时间']
    const body = rows.map((row) =>
      [
        row.name,
        row.attendance,
        row.guest_count,
        row.transport_mode,
        row.arrival_time,
        row.arrival_location,
        row.message,
        row.created_at,
        row.updated_at,
      ].map(csvCell).join(','),
    )
    const csv = `\uFEFF${header.map(csvCell).join(',')}\r\n${body.join('\r\n')}\r\n`
    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="wedding-rsvp.csv"')
      .send(csv)
  })
}
