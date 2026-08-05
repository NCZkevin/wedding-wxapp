import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import test from 'node:test'
import { parseEnv } from './env.js'

test('uses a project-local upload directory in development', () => {
  const parsed = parseEnv({ NODE_ENV: 'development' }, '/tmp/wedding-web')

  assert.equal(parsed.UPLOAD_DIR, resolve('/tmp/wedding-web', 'data/uploads'))
})

test('keeps the dedicated server upload directory in production', () => {
  const parsed = parseEnv({ NODE_ENV: 'production' })

  assert.equal(parsed.UPLOAD_DIR, '/data/wedding/uploads')
})

test('honours an explicitly configured upload directory', () => {
  const parsed = parseEnv({ NODE_ENV: 'development', UPLOAD_DIR: '/srv/wedding-media' })

  assert.equal(parsed.UPLOAD_DIR, '/srv/wedding-media')
})
