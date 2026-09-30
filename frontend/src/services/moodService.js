import api from './api'

export const moodService = {
  async getMoodEntries() {
    const res = await api.get('/api/mood')
    return res.data
  },

  async logMood(score, note = '') {
    const res = await api.post('/api/mood', { score, note })
    return res.data
  },
}
