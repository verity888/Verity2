const db = require('./database')

function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL DEFAULT '',
      username_hash TEXT UNIQUE NOT NULL DEFAULT '',
      email TEXT NOT NULL,
      email_hash TEXT UNIQUE NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      otp_code TEXT,
      otp_expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT DEFAULT 'New conversation',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );

    CREATE TABLE IF NOT EXISTS mood_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      ai_provider TEXT NOT NULL DEFAULT 'gemini',
      ai_api_key  TEXT NOT NULL DEFAULT '',
      ai_model    TEXT NOT NULL DEFAULT '',
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)

  // Add new columns to existing databases that were created before these migrations
  const alterStatements = [
    "ALTER TABLE users ADD COLUMN username TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN username_hash TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN email_hash TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN otp_code TEXT",
    "ALTER TABLE users ADD COLUMN otp_expires_at DATETIME",
  ]
  for (const sql of alterStatements) {
    try {
      db.exec(sql)
    } catch {
      // Column already exists — safe to ignore
    }
  }

  console.log('✅ Database migrations complete.')
}

module.exports = { runMigrations }
