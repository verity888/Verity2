const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

let db = null
const dbPath = path.resolve(process.env.DB_PATH || './verity.db')

async function initDb() {
  const SQL = await initSqlJs()
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }
  db.run('PRAGMA foreign_keys = ON;')
  console.log(`✅ Database initialized: ${dbPath}`)
  return db
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.')
  return db
}

function saveDb() {
  if (!db) return
  try {
    const data = db.export()
    fs.writeFileSync(dbPath, Buffer.from(data))
  } catch (err) {
    console.error('Failed to save database:', err.message)
  }
}

// Execute a write statement (INSERT, UPDATE, DELETE)
function run(sql, params = []) {
  const database = getDb()
  database.run(sql, params)
  const lastId = database.exec('SELECT last_insert_rowid() as id')
  const lastInsertRowid = lastId[0]?.values[0][0] ?? null
  saveDb()
  return { lastInsertRowid }
}

// Get a single row
function get(sql, params = []) {
  const database = getDb()
  const stmt = database.prepare(sql)
  stmt.bind(params)
  let row
  if (stmt.step()) {
    row = stmt.getAsObject()
  }
  stmt.free()
  return row || null
}

// Get all rows
function all(sql, params = []) {
  const database = getDb()
  const stmt = database.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

// Execute DDL (CREATE TABLE, etc.)
function exec(sql) {
  const database = getDb()
  database.exec(sql)
  saveDb()
}

module.exports = { initDb, getDb, saveDb, run, get, all, exec }
