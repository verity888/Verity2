import api from './api'

export const authService = {
  async register(name, username, email, password) {
    const res = await api.post('/api/auth/register', { name, username, email, password })
    return res.data
  },

  async login(username, password) {
    const res = await api.post('/api/auth/login', { username, password })
    return res.data
  },

  async verify2FA(userId, otp) {
    const res = await api.post('/api/auth/verify-2fa', { userId, otp })
    return res.data
  },

  async getMe() {
    const res = await api.get('/api/auth/me')
    return res.data
  },
}
