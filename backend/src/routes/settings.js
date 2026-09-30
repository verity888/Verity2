const express = require('express')
const router = express.Router()
const { getSettings, updateSettings, clearKey } = require('../controllers/settingsController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware)

router.get('/', getSettings)
router.put('/', updateSettings)
router.delete('/key', clearKey)

module.exports = router
