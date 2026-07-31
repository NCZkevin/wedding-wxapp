import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pool } from './db.js'

const migration = await readFile(resolve('server/migrations/001_initial.sql'), 'utf8')
const statements = migration
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean)

for (const statement of statements) {
  await pool.query(statement)
}

await pool.end()
console.log(`Applied ${statements.length} migration statements.`)
