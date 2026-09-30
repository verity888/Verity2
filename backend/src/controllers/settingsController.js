const db = require('../db/database')
const { invalidateUserClient, getUserAIStatus } = require('../services/aiService')
const { encrypt, decrypt } = require('../services/encryptionService')

const ALLOWED_PROVIDERS = ['gemini', 'openai', 'anthropic', 'openrouter']

// GET /api/settings — return current settings (key is masked for security)
function getSettings(req, res) {
  const row = db.get('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id])
  if (!row) {
    return res.json({
      ai_provider: 'gemini',
      ai_model: '',
      has_key: false,
      status: getUserAIStatus(req.user.id),
    })
  }

  // Decrypt the key only to determine whether one is stored and for the preview
  const decryptedKey = row.ai_api_key ? decrypt(row.ai_api_key) : ''

  res.json({
    ai_provider: row.ai_provider,
    ai_model: row.ai_model,
    // Never send the raw key; only whether one is stored
    has_key: Boolean(decryptedKey && decryptedKey.length > 0),
    key_preview: decryptedKey ? `${decryptedKey.slice(0, 6)}…` : null,
    status: getUserAIStatus(req.user.id),
  })
}

// PUT /api/settings — save provider + key, bust cached client
function updateSettings(req, res) {
  const { ai_provider, ai_api_key, ai_model } = req.body

  if (!ai_provider || !ALLOWED_PROVIDERS.includes(ai_provider)) {
    return res.status(400).json({ message: `ai_provider must be one of: ${ALLOWED_PROVIDERS.join(', ')}` })
  }

  // Encrypt the API key before storing
  const encryptedKey = ai_api_key ? encrypt(ai_api_key) : null

  const existing = db.get('SELECT id FROM user_settings WHERE user_id = ?', [req.user.id])

  if (existing) {
    db.run(
      `UPDATE user_settings
         SET ai_provider = ?,
             ai_api_key  = COALESCE(NULLIF(?, ''), ai_api_key),
             ai_model    = ?,
             updated_at  = datetime('now')
       WHERE user_id = ?`,
      [ai_provider, encryptedKey || '', ai_model || '', req.user.id]
    )
  } else {
    db.run(
      `INSERT INTO user_settings (user_id, ai_provider, ai_api_key, ai_model)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, ai_provider, encryptedKey || '', ai_model || '']
    )
  }

  // Bust cached client so the new key/provider is picked up on next message
  invalidateUserClient(req.user.id)

  res.json({ message: 'Settings saved.' })
}

// DELETE /api/settings/key — clear the stored API key for this user
function clearKey(req, res) {
  db.run(
    `UPDATE user_settings SET ai_api_key = '', updated_at = datetime('now') WHERE user_id = ?`,
    [req.user.id]
  )
  invalidateUserClient(req.user.id)
  res.json({ message: 'API key removed.' })
}

module.exports = { getSettings, updateSettings, clearKey }
