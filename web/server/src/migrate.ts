import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { RowDataPacket } from 'mysql2/promise'
import { pool } from './db.js'

const migrationsDirectory = resolve('server/migrations')
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((file) => /^\d+_.+\.sql$/.test(file))
  .sort()

await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name VARCHAR(255) NOT NULL PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

const [appliedRows] = await pool.query<RowDataPacket[]>('SELECT name FROM schema_migrations')
const applied = new Set(appliedRows.map((row) => row.name))
let appliedCount = 0

for (const file of migrationFiles) {
  if (applied.has(file)) continue

  const migration = await readFile(resolve(migrationsDirectory, file), 'utf8')
  const statements = migration
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean)

  for (const statement of statements) {
    await pool.query(statement)
  }
  await pool.execute('INSERT INTO schema_migrations (name) VALUES (?)', [file])
  appliedCount += 1
}

await pool.end()
console.log(`Applied ${appliedCount} migration files.`)
