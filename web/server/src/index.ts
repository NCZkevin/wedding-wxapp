import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { env } from './env.js'
import { registerRoutes } from './routes.js'

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  trustProxy: env.TRUST_PROXY,
  bodyLimit: env.MAX_UPLOAD_MB * 1024 * 1024,
})

await app.register(helmet, {
  contentSecurityPolicy: false,
})
await app.register(rateLimit, {
  max: 80,
  timeWindow: '1 minute',
})
await app.register(multipart, {
  limits: {
    files: 6,
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
    fields: 8,
  },
})

app.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error }, 'request failed')
  const multipartError =
    error instanceof Error &&
    'code' in error &&
    String(error.code).startsWith('FST_')
  reply.code(multipartError ? 413 : 500).send({
    message: multipartError ? '上传的图片过大或数量过多' : '服务暂时不可用，请稍后再试',
  })
})

await registerRoutes(app)

const close = async () => {
  await app.close()
  process.exit(0)
}

process.on('SIGTERM', close)
process.on('SIGINT', close)

await app.listen({ host: env.HOST, port: env.PORT })
