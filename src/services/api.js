/**
 * frontend/src/services/api.js
 * Centralised Axios client — auto-attaches JWT, handles 401 globally.
 */
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api/v1'

const http = axios.create({ baseURL: BASE, timeout: 60_000 })

// Attach token from localStorage on every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('webmine_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → clear session and redirect to login
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('webmine_token')
      window.location.href = '/login'
    }
    const msg =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message || 'Unknown error'
    return Promise.reject(new Error(msg))
  }
)

// ── Auth ───────────────────────────────────────────────────────────────────────
export const registerUser  = (fullName, email, password) =>
  http.post('/auth/register', { full_name: fullName, email, password })
export const loginUser     = (email, password) =>
  http.post('/auth/login', { email, password })
export const getMe         = () => http.get('/auth/me')
export const updateProfile = (body) => http.put('/auth/profile', body)
export const changePassword = (currentPassword, newPassword) =>
  http.put('/auth/change-password', { current_password: currentPassword, new_password: newPassword })
export const regenerateCollectorToken = () =>
  http.post('/auth/regenerate-collector-token')

// ── Upload ─────────────────────────────────────────────────────────────────────
export const uploadLog = (file, onUploadProgress) => {
  const form = new FormData()
  form.append('file', file)
  return http.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
}

// ── ML training ────────────────────────────────────────────────────────────────
export const trainReturnModel  = () => http.post('/train-return-model')
export const trainTrafficModel = () => http.post('/train-traffic-model')

// ── Predictions ────────────────────────────────────────────────────────────────
export const predictReturn  = (users) => http.post('/predict-return', { users })
export const predictTraffic = ()      => http.post('/predict-traffic')

// ── Dashboard ──────────────────────────────────────────────────────────────────
export const getDashboardData = () => http.get('/dashboard-data')

// ── Reports ────────────────────────────────────────────────────────────────────
export const generateReport  = () => http.post('/reports/generate')
export const sendReportEmail = (toEmail, subject, ccEmail = null) =>
  http.post('/reports/send-email', {
    to_email: toEmail, subject, cc_email: ccEmail || undefined,
  })
export const getSmtpStatus   = () => http.get('/reports/smtp-status')
export const testSmtp        = () => http.post('/reports/test-smtp')

// ── Health ─────────────────────────────────────────────────────────────────────
export const getHealth = () =>
  http.get('/health').catch(() => ({ data: { status: 'offline' } }))
