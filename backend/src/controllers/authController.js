const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db/database')
const { generateOTP, sendOTPEmail } = require('../services/emailService')
const { encrypt, decrypt, hmac } = require('../services/encryptionService')

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * Decrypt sensitive fields on a raw DB user row, returning a plain object.
 */
function decryptUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: decrypt(row.name),
    username: decrypt(row.username),
    email: decrypt(row.email),
    password_hash: row.password_hash,
    otp_code: row.otp_code,
    otp_expires_at: row.otp_expires_at,
    created_at: row.created_at,
  }
}

async function register(req, res, next) {
  try {
    const { name, username, email, password } = req.body
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Name, username, email, and password are required.' })
    }
    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters.' })
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: 'Username may only contain letters, numbers and underscores.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    // Use HMAC hashes for existence lookups
    const emailHash = hmac(email)
    const usernameHash = hmac(username)

    const existingEmail = db.get('SELECT id FROM users WHERE email_hash = ?', [emailHash])
    if (existingEmail) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const existingUsername = db.get('SELECT id FROM users WHERE username_hash = ?', [usernameHash])
    if (existingUsername) {
      return res.status(409).json({ message: 'That username is already taken.' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const result = db.run(
      'INSERT INTO users (name, username, username_hash, email, email_hash, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [encrypt(name), encrypt(username), usernameHash, encrypt(email), emailHash, password_hash]
    )

    const user = { id: result.lastInsertRowid, name, username, email }
    const token = generateToken(user)
    res.status(201).json({ user, token })
  } catch (err) {
    next(err)
  }
}

/**
 * Step 1 of login: validate username + password.
 * 2FA is currently disabled — issues JWT directly.
 * To re-enable 2FA: uncomment the OTP block and remove the direct-token block.
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' })
    }

    const row = db.get('SELECT * FROM users WHERE username_hash = ?', [hmac(username)])
    if (!row) {
      return res.status(401).json({ message: 'Invalid username or password.' })
    }

    const user = decryptUser(row)

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid username or password.' })
    }

    // --- 2FA DISABLED --- issue token directly
    const safeUser = { id: user.id, name: user.name, username: user.username, email: user.email }
    const token = generateToken(safeUser)
    return res.json({ user: safeUser, token })

    // --- 2FA ENABLED (uncomment below + comment out the block above) ---
    // const otp = generateOTP()
    // const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    // db.run('UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [otp, expiresAt, user.id])
    // await sendOTPEmail(user.email, otp)
    // return res.json({
    //   requiresOTP: true,
    //   userId: user.id,
    //   message: `A verification code has been sent to ${maskEmail(user.email)}.`,
    // })
  } catch (err) {
    next(err)
  }
}

/**
 * Step 2 of login: verify OTP code. Returns JWT on success.
 */
async function verifyOTP(req, res, next) {
  try {
    const { userId, otp } = req.body
    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP code are required.' })
    }

    const row = db.get('SELECT * FROM users WHERE id = ?', [userId])
    if (!row) {
      return res.status(404).json({ message: 'User not found.' })
    }

    const user = decryptUser(row)

    if (!user.otp_code || !user.otp_expires_at) {
      return res.status(400).json({ message: 'No verification code found. Please sign in again.' })
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(401).json({ message: 'Verification code has expired. Please sign in again.' })
    }

    if (user.otp_code !== String(otp).trim()) {
      return res.status(401).json({ message: 'Invalid verification code.' })
    }

    // Clear OTP after successful use
    db.run('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [user.id])

    const safeUser = { id: user.id, name: user.name, username: user.username, email: user.email }
    const token = generateToken(safeUser)
    res.json({ user: safeUser, token })
  } catch (err) {
    next(err)
  }
}

function getMe(req, res) {
  const row = db.get(
    'SELECT id, name, username, email, created_at FROM users WHERE id = ?',
    [req.user.id]
  )
  if (!row) return res.status(404).json({ message: 'User not found.' })
  res.json({
    id: row.id,
    name: decrypt(row.name),
    username: decrypt(row.username),
    email: decrypt(row.email),
    created_at: row.created_at,
  })
}

/**
 * Mask an email address for display: jo**@example.com
 */
function maskEmail(email) {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 2))}@${domain}`
}

module.exports = { register, login, verifyOTP, getMe }
