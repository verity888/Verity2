import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('verity_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('verity_token')
      localStorage.removeItem('verity_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
