/**
 * encryptionService.js
 * AES-256-GCM symmetric encryption + HMAC-SHA256 deterministic hashing.
 *
 * Encrypted values are stored as:  iv_hex:authTag_hex:ciphertext_hex
 * This format is recognisable so we can skip re-encrypting already-encrypted rows.
 *
 * Required env vars:
 *   ENCRYPTION_KEY  — 64 hex chars (32 bytes).  Generate with:
 *                     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *   HMAC_SECRET     — 64 hex chars (32 bytes).  Generate same way.
 */

const crypto = require('crypto')
require('dotenv').config()

const ALGORITHM = 'aes-256-gcm'
const ENC_PREFIX = 'enc:'   // marker so we can detect already-encrypted strings

function getKey() {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes). See encryptionService.js for generation instructions.')
  }
  return Buffer.from(hex, 'hex')
}

function getHmacSecret() {
  const hex = process.env.HMAC_SECRET
  if (!hex || hex.length !== 64) {
    throw new Error('HMAC_SECRET must be 64 hex characters (32 bytes).')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a plaintext string. Returns the stored representation.
 * If value is null/undefined/empty, returns it as-is.
 */
function encrypt(plaintext) {
  if (!plaintext) return plaintext
  if (isEncrypted(plaintext)) return plaintext   // idempotent

  const key = getKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${ENC_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypt a stored encrypted string back to plaintext.
 * If the value does not look encrypted, returns it unchanged (graceful fallback for legacy plaintext rows).
 */
function decrypt(stored) {
  if (!stored) return stored
  if (!isEncrypted(stored)) return stored   // legacy plaintext fallback

  const raw = stored.slice(ENC_PREFIX.length)
  const parts = raw.split(':')
  if (parts.length !== 3) throw new Error('Malformed encrypted value.')

  const [ivHex, authTagHex, ciphertextHex] = parts
  const key = getKey()
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const ciphertext = Buffer.from(ciphertextHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

/**
 * Returns true if the string was produced by encrypt().
 */
function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith(ENC_PREFIX)
}

/**
 * Deterministic HMAC-SHA256 hash — used as a lookup key in place of the plaintext.
 * Always lowercases the value before hashing so comparisons are case-insensitive.
 */
function hmac(value) {
  if (!value) return value
  return crypto
    .createHmac('sha256', getHmacSecret())
    .update(value.toLowerCase())
    .digest('hex')
}

module.exports = { encrypt, decrypt, hmac, isEncrypted }
