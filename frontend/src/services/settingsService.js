import api from './api'

export const settingsService = {
  async getSettings() {
    const res = await api.get('/api/settings')
    return res.data
  },

  async updateSettings({ ai_provider, ai_api_key, ai_model }) {
    const res = await api.put('/api/settings', { ai_provider, ai_api_key, ai_model })
    return res.data
  },

  async clearKey() {
    const res = await api.delete('/api/settings/key')
    return res.data
  },
}
