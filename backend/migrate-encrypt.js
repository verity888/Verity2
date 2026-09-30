/**
 * migrate-encrypt.js
 * One-time script to encrypt all existing plaintext sensitive fields in the DB.
 *
 * Run ONCE after adding ENCRYPTION_KEY + HMAC_SECRET to .env:
 *   node migrate-encrypt.js
 *
 * Safe to re-run — already-encrypted values are skipped (idempotent).
 */
require('dotenv').config()
const { initDb, all, run } = require('./src/db/database')
const { runMigrations } = require('./src/db/migrations')
const { encrypt, hmac, isEncrypted } = require('./src/services/encryptionService')

async function migrate() {
  await initDb()
  runMigrations()

  console.log('\n🔐 Starting encryption migration...\n')

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = all('SELECT id, name, username, email FROM users')
  console.log(`Found ${users.length} user(s).`)

  let usersUpdated = 0
  for (const u of users) {
    const namePlain     = isEncrypted(u.name)     ? null : u.name
    const usernamePlain = isEncrypted(u.username) ? null : u.username
    const emailPlain    = isEncrypted(u.email)    ? null : u.email

    const needsUpdate = namePlain !== null || usernamePlain !== null || emailPlain !== null
    if (!needsUpdate) {
      console.log(`  [user ${u.id}] already encrypted — skip`)
      continue
    }

    const encName     = namePlain     ? encrypt(namePlain)     : u.name
    const encUsername = usernamePlain ? encrypt(usernamePlain) : u.username
    const encEmail    = emailPlain    ? encrypt(emailPlain)    : u.email

    // Recompute hashes for lookup columns
    const uHash = usernamePlain ? hmac(usernamePlain) : hmac(decryptTemp(u.username))
    const eHash = emailPlain    ? hmac(emailPlain)    : hmac(decryptTemp(u.email))

    run(
      'UPDATE users SET name = ?, username = ?, username_hash = ?, email = ?, email_hash = ? WHERE id = ?',
      [encName, encUsername, uHash, encEmail, eHash, u.id]
    )
    console.log(`  [user ${u.id}] encrypted (name=${!!namePlain}, username=${!!usernamePlain}, email=${!!emailPlain})`)
    usersUpdated++
  }

  // ── User settings (AI API keys) ────────────────────────────────────────────
  const settings = all('SELECT id, user_id, ai_api_key FROM user_settings')
  console.log(`\nFound ${settings.length} settings row(s).`)

  let settingsUpdated = 0
  for (const s of settings) {
    if (!s.ai_api_key || s.ai_api_key === '') {
      console.log(`  [settings user_id=${s.user_id}] no key — skip`)
      continue
    }
    if (isEncrypted(s.ai_api_key)) {
      console.log(`  [settings user_id=${s.user_id}] already encrypted — skip`)
      continue
    }
    run('UPDATE user_settings SET ai_api_key = ? WHERE id = ?', [encrypt(s.ai_api_key), s.id])
    console.log(`  [settings user_id=${s.user_id}] api_key encrypted`)
    settingsUpdated++
  }

  console.log(`\n✅ Migration complete.`)
  console.log(`   Users updated:    ${usersUpdated} / ${users.length}`)
  console.log(`   Settings updated: ${settingsUpdated} / ${settings.length}`)
  process.exit(0)
}

/**
 * Temporary helper used only when a value was already encrypted by a previous
 * partial run — we need the plaintext to re-hash it. This is only ever called
 * in the already-encrypted branch above, so it is safe.
 */
function decryptTemp(val) {
  const { decrypt } = require('./src/services/encryptionService')
  return decrypt(val)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
