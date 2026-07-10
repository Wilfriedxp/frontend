/**
 * frontend/src/components/common/Sidebar.jsx
 * Responsive sidebar — collapses to overlay on mobile with hamburger toggle.
 */
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/',            icon: '📊', label: 'Dashboard'   },
  { to: '/upload',      icon: '📁', label: 'Upload Logs' },
  { to: '/predictions', icon: '🤖', label: 'Predictions' },
  { to: '/reports',     icon: '📧', label: 'Reports'     },
  { to: '/profile',     icon: '👤', label: 'Profile'     },
]

export default function Sidebar({ open, onClose, apiStatus }) {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    onClose?.()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed top-0 left-0 h-screen w-56 bg-slate-900 border-r border-slate-700
        flex flex-col z-30 transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-blue-400 font-bold text-lg tracking-tight">📡 WebMine BI</div>
            <div className="text-slate-500 text-xs mt-0.5">Access Records Mining</div>
          </div>
          {/* Close on mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-slate-200 text-xl leading-none"
          >×</button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <span>{icon}</span><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          {user && (
            <div className="bg-slate-800 rounded-lg px-3 py-2.5">
              <div className="text-slate-200 text-xs font-medium truncate">{user.full_name}</div>
              <div className="text-slate-500 text-xs truncate">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                       text-slate-400 hover:bg-red-500/10 hover:text-red-400
                       text-sm transition-colors"
          >
            <span>🚪</span><span>Sign out</span>
          </button>
          <div className="flex items-center gap-2 text-xs pt-1">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              apiStatus === 'healthy' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-slate-500 truncate">API {apiStatus}</span>
          </div>
        </div>
      </aside>
    </>
  )
}
