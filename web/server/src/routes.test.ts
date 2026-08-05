import assert from 'node:assert/strict'
import { access, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import { env } from './env.js'
import { registerRoutes } from './routes.js'

test('does not create the upload directory for a text-only invalid blessing', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'wedding-routes-'))
  const previousUploadDir = env.UPLOAD_DIR
  const uploadDir = join(root, 'uploads')
  env.UPLOAD_DIR = uploadDir

  const app = Fastify()
  await app.register(multipart)
  await registerRoutes(app)

  context.after(async () => {
    env.UPLOAD_DIR = previousUploadDir
    await app.close()
    await rm(root, { recursive: true, force: true })
  })

  const boundary = '----wedding-test-boundary'
  const payload = [
    `--${boundary}\r\nContent-Disposition: form-data; name="clientId"\r\n\r\ninvalid-id\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="message"\r\n\r\n祝福\r\n`,
    `--${boundary}--\r\n`,
  ].join('')
  const response = await app.inject({
    method: 'POST',
    url: '/api/blessings',
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload,
  })

  assert.equal(response.statusCode, 400)
  await assert.rejects(access(uploadDir), (error: NodeJS.ErrnoException) => error.code === 'ENOENT')
})

test('rejects admin dashboard requests before querying the database', async (context) => {
  const previousToken = env.ADMIN_EXPORT_TOKEN
  env.ADMIN_EXPORT_TOKEN = 'test-admin-token'
  const app = Fastify()
  await registerRoutes(app)

  context.after(async () => {
    env.ADMIN_EXPORT_TOKEN = previousToken
    await app.close()
  })

  const missing = await app.inject({ method: 'GET', url: '/api/admin/dashboard' })
  const incorrect = await app.inject({
    method: 'GET',
    url: '/api/admin/dashboard',
    headers: { authorization: 'Bearer wrong-token' },
  })

  assert.equal(missing.statusCode, 401)
  assert.equal(incorrect.statusCode, 401)
  assert.equal(missing.headers['cache-control'], 'no-store')
})
