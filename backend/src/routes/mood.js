const express = require('express')
const router = express.Router()
const { getMoodEntries, logMood } = require('../controllers/moodController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware)

router.get('/', getMoodEntries)
router.post('/', logMood)

module.exports = router
