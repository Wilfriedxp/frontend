/**
 * frontend/src/pages/Profile.jsx
 * Full user profile — edit details, toggle auto email, collector token,
 * change password, Chrome extension setup guide.
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword, regenerateCollectorToken } from '../services/api'

// ── Field component ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5
                   text-slate-200 placeholder-slate-500 text-sm
                   focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  )
}

// ── Toggle component ───────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-slate-200 text-sm font-medium">{label}</div>
        <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors relative ${
          checked ? 'bg-blue-600' : 'bg-slate-600'
        }`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
          checked ? 'left-6' : 'left-1'
        }`} />
      </button>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, login } = useAuth()

  const [form, setForm] = useState({
    full_name:          '',
    phone:              '',
    company:            '',
    website:            '',
    bio:                '',
    auto_email_reports: false,
  })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [saving,    setSaving]    = useState(false)
  const [saveOk,    setSaveOk]    = useState(false)
  const [saveErr,   setSaveErr]   = useState(null)
  const [pwSaving,  setPwSaving]  = useState(false)
  const [pwOk,      setPwOk]      = useState(false)
  const [pwErr,     setPwErr]     = useState(null)
  const [tokenCopied,  setTokenCopied]  = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [collectorToken, setCollectorToken] = useState('')
  const [showPw, setShowPw] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        full_name:          user.full_name          || '',
        phone:              user.phone              || '',
        company:            user.company            || '',
        website:            user.website            || '',
        bio:                user.bio                || '',
        auto_email_reports: user.auto_email_reports || false,
      })
      setCollectorToken(user.collector_token || '')
    }
  }, [user])

  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  // ── Save profile ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setSaveOk(false); setSaveErr(null)
    try {
      await updateProfile(form)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 3000)
    } catch (err) {
      setSaveErr(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Change password ───────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (pwForm.newPw !== pwForm.confirm) {
      setPwErr('New passwords do not match.'); return
    }
    if (pwForm.newPw.length < 8) {
      setPwErr('New password must be at least 8 characters.'); return
    }
    setPwSaving(true); setPwOk(false); setPwErr(null)
    try {
      await changePassword(pwForm.current, pwForm.newPw)
      setPwOk(true)
      setPwForm({ current: '', newPw: '', confirm: '' })
      setTimeout(() => setPwOk(false), 3000)
    } catch (err) {
      setPwErr(err.message)
    } finally {
      setPwSaving(false)
    }
  }

  // ── Copy collector token ──────────────────────────────────────────────────────
  const handleCopyToken = () => {
    navigator.clipboard.writeText(collectorToken)
    setTokenCopied(true)
    setTimeout(() => setTokenCopied(false), 2000)
  }

  // ── Regenerate token ──────────────────────────────────────────────────────────
  const handleRegenToken = async () => {
    if (!confirm('Regenerate collector token? The Chrome extension will need to be updated with the new token.')) return
    setRegenerating(true)
    try {
      const { data } = await regenerateCollectorToken()
      setCollectorToken(data.collector_token)
    } catch (err) {
      alert(err.message)
    } finally {
      setRegenerating(false)
    }
  }

  const initials = (user?.full_name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="pt-10 md:pt-0">
        <h1 className="text-xl font-semibold text-slate-100">My Profile</h1>
        <p className="text-slate-400 text-sm">Manage your account information and settings.</p>
      </div>

      {/* Avatar + summary */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center
                        text-white text-2xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-slate-100 font-semibold text-lg truncate">{user?.full_name}</div>
          <div className="text-slate-400 text-sm truncate">{user?.email}</div>
          {form.company && <div className="text-slate-500 text-xs mt-0.5">{form.company}</div>}
        </div>
        <div className="ml-auto">
          <div className={`text-xs px-2 py-1 rounded-full ${
            user?.is_active
              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
          }`}>
            {user?.is_active ? '● Active' : '○ Inactive'}
          </div>
        </div>
      </div>

      {/* Two-column layout on desktop, single column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Personal info ──────────────────────────────────────────────────── */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
          <h2 className="text-slate-200 font-medium">Personal Information</h2>

          <Field label="Full name *"     value={form.full_name} onChange={set('full_name')} placeholder="Jane Smith" />
          <Field label="Email address"   value={user?.email}    onChange={() => {}} type="email"
                 placeholder={user?.email} />
          <Field label="Phone"           value={form.phone}     onChange={set('phone')} type="tel"
                 placeholder="+237 6XX XXX XXX" />
          <Field label="Company / Institution" value={form.company} onChange={set('company')}
                 placeholder="SEAS-IUC" />
          <Field label="Website"         value={form.website}   onChange={set('website')} type="url"
                 placeholder="https://example.com" />
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Bio</label>
            <textarea
              value={form.bio ?? ''}
              onChange={e => set('bio')(e.target.value)}
              placeholder="Short description of your role…"
              rows={3}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5
                         text-slate-200 placeholder-slate-500 text-sm resize-none
                         focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            onClick={handleSave} disabled={saving}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500
                       disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {saving ? '⏳ Saving…' : '💾 Save profile'}
          </button>

          {saveOk && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400
                            rounded-lg px-4 py-3 text-sm">
              ✓ Profile saved successfully
            </div>
          )}
          {saveErr && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400
                            rounded-lg px-4 py-3 text-sm">
              ⚠ {saveErr}
            </div>
          )}
        </div>

        {/* ── Settings + Security ────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Report settings */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
            <h2 className="text-slate-200 font-medium">Report Settings</h2>
            <Toggle
              checked={form.auto_email_reports}
              onChange={v => { set('auto_email_reports')(v); }}
              label="Auto-send reports by email"
              desc="Automatically email the BI report to your registered address every time you click 'Generate report'."
            />
            <p className="text-xs text-slate-500 leading-relaxed">
              Reports are always sent to <span className="text-blue-400">{user?.email}</span>.
              Configure a different recipient on the Reports page.
            </p>
            <button
              onClick={handleSave} disabled={saving}
              className="w-full py-2 rounded-lg border border-slate-600 text-slate-300
                         hover:bg-slate-700 text-sm transition-colors"
            >
              Save settings
            </button>
          </div>

          {/* Change password */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
            <h2 className="text-slate-200 font-medium">Change Password</h2>
            {[
              { key: 'current', label: 'Current password',  placeholder: '••••••••' },
              { key: 'newPw',   label: 'New password',      placeholder: 'Min. 8 characters' },
              { key: 'confirm', label: 'Confirm new password', placeholder: 'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 pr-10
                               text-slate-200 placeholder-slate-500 text-sm
                               focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {key === 'current' && (
                    <button
                      type="button"
                      onClick={() => setShowPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                    >
                      {showPw ? '🙈' : '👁'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={handleChangePassword} disabled={pwSaving}
              className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600
                         disabled:opacity-50 text-slate-200 text-sm font-medium transition-colors"
            >
              {pwSaving ? '⏳ Updating…' : '🔐 Change password'}
            </button>
            {pwOk  && <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 text-sm">✓ Password updated</div>}
            {pwErr && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">⚠ {pwErr}</div>}
          </div>
        </div>
      </div>

      {/* ── Chrome Extension section ────────────────────────────────────────── */}
      <div className="bg-slate-800 rounded-xl border border-amber-500/30 p-5 space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔌</span>
          <div>
            <h2 className="text-slate-200 font-medium">Chrome Extension — Data Collector</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Install the extension on your browser to collect live data from your own website automatically.
            </p>
          </div>
        </div>

        {/* Collector token */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Your Collector Token
            <span className="text-slate-600 font-normal ml-2">
              — paste this into the extension popup
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={collectorToken}
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5
                         text-amber-400 text-sm font-mono focus:outline-none"
            />
            <button
              onClick={handleCopyToken}
              className="px-4 py-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40
                         text-amber-400 text-sm hover:bg-amber-500/30 transition-colors flex-shrink-0"
            >
              {tokenCopied ? '✓ Copied' : '📋 Copy'}
            </button>
            <button
              onClick={handleRegenToken} disabled={regenerating}
              className="px-3 py-2.5 rounded-lg border border-slate-600 text-slate-400
                         hover:text-red-400 hover:border-red-500/30 text-sm transition-colors flex-shrink-0"
              title="Regenerate token (invalidates the old one)"
            >
              {regenerating ? '⏳' : '🔄'}
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-1.5">
            ⚠ Keep this private. Regenerating it disconnects any currently active extensions.
          </p>
        </div>

        {/* Setup steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Install extension',   body: 'Open Chrome → Settings → Extensions → Enable Developer mode → Load unpacked → select the chrome-extension/ folder.' },
            { step: '2', title: 'Connect to dashboard', body: 'Click the WebMine BI icon in the toolbar. Enter your API URL (e.g. http://localhost:8000) and paste the Collector Token above.' },
            { step: '3', title: 'Start collecting',     body: 'Visit your website. The extension collects page views automatically and sends them to your dashboard every 30 seconds.' },
          ].map(({ step, title, body }) => (
            <div key={step} className="bg-slate-700/50 rounded-lg p-4">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40
                              text-amber-400 text-xs font-bold flex items-center justify-center mb-3">
                {step}
              </div>
              <div className="text-slate-200 text-sm font-medium mb-1">{title}</div>
              <div className="text-slate-400 text-xs leading-relaxed">{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Account info */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h2 className="text-slate-300 font-medium text-sm mb-4">Account Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Account ID',   value: `#${user?.id || '—'}` },
            { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
            { label: 'Status',       value: user?.is_active ? 'Active' : 'Disabled' },
            { label: 'Auto reports', value: form.auto_email_reports ? 'Enabled ✓' : 'Disabled' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-slate-500 text-xs">{label}</div>
              <div className="text-slate-300 text-sm font-medium mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
