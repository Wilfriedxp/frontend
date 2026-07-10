/**
 * frontend/src/context/AuthContext.jsx
 * Global authentication state — wraps the entire app.
 * Stores the JWT token in localStorage and exposes login / logout helpers.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
const BASE = import.meta.env.VITE_API_URL || '/api/v1'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(() => localStorage.getItem('webmine_token'))
  const [loading, setLoading] = useState(true)   // true while we verify stored token

  // ── Attach token to every outgoing request ─────────────────────────────────
  useEffect(() => {
    const id = axios.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
    return () => axios.interceptors.request.eject(id)
  }, [token])

  // ── On mount: restore session from localStorage ────────────────────────────
  useEffect(() => {
    if (!token) { setLoading(false); return }
    axios.get(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r  => setUser(r.data))
      .catch(() => { localStorage.removeItem('webmine_token'); setToken(null) })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (fullName, email, password) => {
    const { data } = await axios.post(`${BASE}/auth/register`, {
      full_name: fullName,
      email,
      password,
    })
    localStorage.setItem('webmine_token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    return data.user
  }, [])

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${BASE}/auth/login`, { email, password })
    localStorage.setItem('webmine_token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    return data.user
  }, [])

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('webmine_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook — use inside any component inside <AuthProvider> */
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
