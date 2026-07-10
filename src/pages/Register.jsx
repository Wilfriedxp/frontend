/**
 * frontend/src/pages/Register.jsx
 * Registration page — creates a new WebMine BI analyst account.
 * On success the user is automatically logged in and redirected to the dashboard.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register }              = useAuth()
  const navigate                  = useNavigate()
  const [form,    setForm]        = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [showPw,  setShowPw]      = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error,   setError]       = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    if (form.fullName.trim().length < 2) return 'Full name must be at least 2 characters.'
    if (!form.email.includes('@'))       return 'Enter a valid email address.'
    if (form.password.length < 8)        return 'Password must be at least 8 characters.'
    if (form.password !== form.confirm)  return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      await register(form.fullName.trim(), form.email.trim(), form.password)
      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const pwStrength = () => {
    const p = form.password
    if (!p) return null
    if (p.length < 8)  return { label: 'Too short',  color: 'bg-red-500',   w: 'w-1/4' }
    if (p.length < 10) return { label: 'Weak',        color: 'bg-amber-500', w: 'w-2/4' }
    if (p.length < 14) return { label: 'Good',        color: 'bg-blue-500',  w: 'w-3/4' }
    return                    { label: 'Strong',      color: 'bg-green-500', w: 'w-full' }
  }
  const strength = pwStrength()

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📡</div>
          <h1 className="text-2xl font-semibold text-slate-100">WebMine BI</h1>
          <p className="text-slate-400 text-sm mt-1">Create your analyst account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
          <h2 className="text-slate-200 font-semibold text-lg mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Jane Smith"
                required
                autoComplete="name"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5
                           text-slate-200 placeholder-slate-500 text-sm
                           focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="analyst@university.edu"
                required
                autoComplete="email"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5
                           text-slate-200 placeholder-slate-500 text-sm
                           focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 pr-12
                             text-slate-200 placeholder-slate-500 text-sm
                             focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-sm"
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              {/* Strength meter */}
              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
                  </div>
                  <span className={`text-xs ${strength.color.replace('bg-', 'text-')}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5
                            text-slate-200 placeholder-slate-500 text-sm
                            focus:outline-none focus:ring-1 transition-colors
                            ${form.confirm && form.confirm !== form.password
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500'}`}
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                         disabled:cursor-not-allowed text-white font-medium text-sm transition-colors mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
