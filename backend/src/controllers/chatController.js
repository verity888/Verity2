const db = require('../db/database')
const { getAIResponse, getUserGeminiStatus } = require('../services/aiService')

function getConversations(req, res) {
  const convs = db.all(
    'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
    [req.user.id]
  )
  res.json(convs)
}

function createConversation(req, res) {
  const result = db.run(
    "INSERT INTO conversations (user_id, title) VALUES (?, 'New conversation')",
    [req.user.id]
  )
  const conv = db.get('SELECT * FROM conversations WHERE id = ?', [result.lastInsertRowid])
  res.status(201).json(conv)
}

function getMessages(req, res) {
  const { id } = req.params
  const conv = db.get(
    'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  )
  if (!conv) return res.status(404).json({ message: 'Conversation not found.' })

  const msgs = db.all(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    [id]
  )
  res.json(msgs)
}

async function sendMessage(req, res, next) {
  try {
    const { id } = req.params
    const { content } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required.' })
    }

    const conv = db.get(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    )
    if (!conv) return res.status(404).json({ message: 'Conversation not found.' })

    // Save user message
    db.run(
      "INSERT INTO messages (conversation_id, role, content) VALUES (?, 'user', ?)",
      [id, content.trim()]
    )

    // Auto-title from first message
    const msgs = db.all(
      'SELECT id FROM messages WHERE conversation_id = ?',
      [id]
    )
    if (msgs.length === 1) {
      db.run(
        'UPDATE conversations SET title = ? WHERE id = ?',
        [content.trim().slice(0, 50), id]
      )
    }

    // Get history for context (last 20)
    const history = db.all(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 20',
      [id]
    )

    // Get AI response — pass userId so the Gemini key is looked up per user
    const aiContent = await getAIResponse(history, content.trim(), req.user.id)

    // Save AI message
    db.run(
      "INSERT INTO messages (conversation_id, role, content) VALUES (?, 'assistant', ?)",
      [id, aiContent]
    )

    // Update conversation timestamp
    db.run(
      "UPDATE conversations SET updated_at = datetime('now') WHERE id = ?",
      [id]
    )

    // Return all messages
    const allMsgs = db.all(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [id]
    )
    res.json({ messages: allMsgs })
  } catch (err) {
    next(err)
  }
}

// Returns Gemini connection status for the current user (safe: no key exposure)
function getGeminiStatus(req, res) {
  const status = getUserGeminiStatus(req.user.id)
  res.json({ status })
}

module.exports = { getConversations, createConversation, getMessages, sendMessage, getGeminiStatus }
