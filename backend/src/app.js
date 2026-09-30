const express = require('express')
const cors = require('cors')
const errorHandler = require('./middleware/errorHandler')
const authRoutes = require('./routes/auth')
const chatRoutes = require('./routes/chat')
const moodRoutes = require('./routes/mood')
const settingsRoutes = require('./routes/settings')

const app = express()

// CORS — allow frontend dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Verity API is running 💛' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/mood', moodRoutes)
app.use('/api/settings', settingsRoutes)

// Global error handler (must be last)
app.use(errorHandler)

module.exports = app
