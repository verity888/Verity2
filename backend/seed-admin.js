/**
 * Seed script: creates the admin account if it doesn't exist.
 * Run once: node seed-admin.js
 */
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { initDb, run, get } = require('./src/db/database')
const { runMigrations } = require('./src/db/migrations')

async function seed() {
  await initDb()
  runMigrations()

  const email = 'admin@verity.app'
  const username = 'admin'
  const name = 'Admin'
  const password = 'verity2026?!p'

  const existing = get('SELECT id FROM users WHERE email = ?', [email])
  if (existing) {
    console.log(`Admin account already exists (id=${existing.id}). Nothing to do.`)
    process.exit(0)
  }

  const hash = await bcrypt.hash(password, 12)
  const result = run(
    'INSERT INTO users (name, username, email, password_hash) VALUES (?, ?, ?, ?)',
    [name, username, email, hash]
  )

  console.log(`✅ Admin account created.`)
  console.log(`   Email:    ${email}`)
  console.log(`   Username: ${username}`)
  console.log(`   Password: ${password}`)
  console.log(`   User ID:  ${result.lastInsertRowid}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
