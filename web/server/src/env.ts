import 'dotenv/config'
import { resolve } from 'node:path'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  TRUST_PROXY: z.string().default('true').transform((value) => value === 'true'),
  PUBLIC_BASE_URL: z.string().url().default('https://wedding.nczkevin.com'),
  MYSQL_HOST: z.string().default('127.0.0.1'),
  MYSQL_PORT: z.coerce.number().int().default(3306),
  MYSQL_DATABASE: z.string().default('wedding'),
  MYSQL_USER: z.string().default('wedding_app'),
  MYSQL_PASSWORD: z.string().default(''),
  WECHAT_APP_ID: z.string().default(''),
  WECHAT_APP_SECRET: z.string().default(''),
  UPLOAD_DIR: z.string().min(1).optional(),
  MAX_UPLOAD_MB: z.coerce.number().int().min(1).max(30).default(10),
  ADMIN_EXPORT_TOKEN: z.string().default(''),
})

export function parseEnv(input: NodeJS.ProcessEnv, cwd = process.cwd()) {
  const parsed = envSchema.parse(input)
  return {
    ...parsed,
    UPLOAD_DIR:
      parsed.UPLOAD_DIR ??
      (parsed.NODE_ENV === 'production' ? '/data/wedding/uploads' : resolve(cwd, 'data/uploads')),
  }
}

export const env = parseEnv(process.env)
