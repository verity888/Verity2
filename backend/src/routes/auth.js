const express = require('express')
const router = express.Router()
const { register, login, verifyOTP, getMe } = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.post('/verify-2fa', verifyOTP)
router.get('/me', authMiddleware, getMe)

module.exports = router
