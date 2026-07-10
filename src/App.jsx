/**
 * frontend/src/App.jsx
 * Root — AuthProvider, routing, responsive layout with hamburger menu.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar     from './components/common/Sidebar'
import Dashboard   from './pages/Dashboard'
import UploadPage  from './pages/UploadPage'
import Predictions from './pages/Predictions'
import Reports     from './pages/Reports'
import Profile     from './pages/Profile'
import Login       from './pages/Login'
import Register    from './pages/Register'
import { getHealth } from './services/api'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center text-slate-400">
        <div className="text-3xl animate-spin mb-3">⚙</div>
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function AppShell() {
  const [apiStatus,  setApiStatus]  = useState('checking…')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    getHealth()
      .then(r  => setApiStatus(r?.data?.status === 'healthy' ? 'healthy' : 'error'))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 bg-slate-800 border border-slate-700
                   text-slate-300 hover:text-white rounded-lg p-2 shadow-lg transition-colors"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect y="3"  width="20" height="2" rx="1"/>
          <rect y="9"  width="20" height="2" rx="1"/>
          <rect y="15" width="20" height="2" rx="1"/>
        </svg>
      </button>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        apiStatus={apiStatus}
      />

      {/* Main content — no left margin on mobile (sidebar is overlay) */}
      <main className="flex-1 md:ml-56 min-h-screen overflow-y-auto">
        <Routes>
          <Route path="/"            element={<Dashboard />}   />
          <Route path="/upload"      element={<UploadPage />}  />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/reports"     element={<Reports />}     />
          <Route path="/profile"     element={<Profile />}     />
          <Route path="*"            element={
            <div className="p-6 text-slate-400">404 — Page not found</div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<Login />}    />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute><AppShell /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
