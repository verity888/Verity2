const express = require('express')
const router = express.Router()
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  getGeminiStatus,
} = require('../controllers/chatController')
const authMiddleware = require('../middleware/authMiddleware')

router.use(authMiddleware)

router.get('/conversations', getConversations)
router.post('/conversations', createConversation)
router.get('/conversations/:id/messages', getMessages)
router.post('/conversations/:id/messages', sendMessage)
router.get('/gemini-status', getGeminiStatus)

module.exports = router
