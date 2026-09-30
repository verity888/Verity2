require('dotenv').config()
const { initDb } = require('./src/db/database')
const { runMigrations } = require('./src/db/migrations')

const PORT = process.env.PORT || 3001

async function start() {
  try {
    await initDb()
    runMigrations()

    const app = require('./src/app')
    app.listen(PORT, () => {
      console.log(`🚀 Verity API server running on http://localhost:${PORT}`)
      console.log(`💛 Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
