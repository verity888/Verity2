const db = require('../db/database')

function getMoodEntries(req, res) {
  const entries = db.all(
    'SELECT * FROM mood_entries WHERE user_id = ? ORDER BY created_at ASC',
    [req.user.id]
  )
  res.json(entries)
}

function logMood(req, res, next) {
  try {
    const { score, note = '' } = req.body
    const scoreNum = Number(score)
    if (!score || scoreNum < 1 || scoreNum > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5.' })
    }
    const result = db.run(
      'INSERT INTO mood_entries (user_id, score, note) VALUES (?, ?, ?)',
      [req.user.id, scoreNum, note]
    )
    const entry = db.get(
      'SELECT * FROM mood_entries WHERE id = ?',
      [result.lastInsertRowid]
    )
    res.status(201).json(entry)
  } catch (err) {
    next(err)
  }
}

module.exports = { getMoodEntries, logMood }
