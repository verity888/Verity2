import api from './api'

export const chatService = {
  async getConversations() {
    const res = await api.get('/api/chat/conversations')
    return res.data
  },

  async createConversation() {
    const res = await api.post('/api/chat/conversations')
    return res.data
  },

  async getMessages(conversationId) {
    const res = await api.get(`/api/chat/conversations/${conversationId}/messages`)
    return res.data
  },

  async sendMessage(conversationId, content) {
    const res = await api.post(`/api/chat/conversations/${conversationId}/messages`, { content })
    return res.data
  },

  async getGeminiStatus() {
    const res = await api.get('/api/chat/gemini-status')
    return res.data // { status: 'connected' | 'pending_key' }
  },
}
