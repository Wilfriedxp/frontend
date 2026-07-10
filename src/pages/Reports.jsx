/**
 * frontend/src/pages/Reports.jsx
 * Generate HTML report, preview it, email it.
 * Includes SMTP diagnostic panel so you can see exactly what fails.
 */
import { useState } from 'react'
import { generateReport, sendReportEmail, getSmtpStatus, testSmtp } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Reports() {
  const { user } = useAuth()

  // Report state
  const [preview,   setPreview]   = useState(null)
  const [genLoad,   setGenLoad]   = useState(false)

  // Email form
  const [emailForm, setEmailForm] = useState({
    to:      user?.email || '',
    subject: 'WebMine BI — Business Intelligence Report',
    cc:      '',
  })
  const [sending,   setSending]   = useState(false)
  const [emailOk,   setEmailOk]   = useState(null)
  const [emailErr,  setEmailErr]  = useState(null)

  // SMTP diagnostic state
  const [smtpStatus,  setSmtpStatus]  = useState(null)
  const [smtpDiag,    setSmtpDiag]    = useState(null)
  const [diagLoading, setDiagLoading] = useState(false)

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenLoad(true); setPreview(null)
    try   { const { data } = await generateReport(); setPreview(data) }
    catch (err) { alert('Report error: ' + err.message) }
    finally { setGenLoad(false) }
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!preview?.report_html) return
    const a = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(new Blob([preview.report_html], { type: 'text/html' })),
      download: `webmine-report-${new Date().toISOString().slice(0,10)}.html`,
    })
    a.click()
  }

  // ── Send email ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!emailForm.to) { setEmailErr('Recipient email is required.'); return }
    setSending(true); setEmailOk(null); setEmailErr(null)
    try {
      const { data } = await sendReportEmail(
        emailForm.to,
        emailForm.subject,
        emailForm.cc || null,
      )
      setEmailOk(data.message)
    } catch (err) {
      // Show the full SMTP error message from the backend
      setEmailErr(err.message)
    } finally {
      setSending(false)
    }
  }

  // ── SMTP status check ─────────────────────────────────────────────────────
  const handleSmtpStatus = async () => {
    setDiagLoading(true); setSmtpStatus(null); setSmtpDiag(null)
    try   { const { data } = await getSmtpStatus(); setSmtpStatus(data) }
    catch (err) { setSmtpStatus({ error: err.message }) }
    finally { setDiagLoading(false) }
  }

  // ── Full SMTP test ────────────────────────────────────────────────────────
  const handleSmtpTest = async () => {
    setDiagLoading(true); setSmtpDiag(null); setSmtpStatus(null)
    try   { const { data } = await testSmtp(); setSmtpDiag(data) }
    catch (err) { setSmtpDiag({ error: err.message, stages: {} }) }
    finally { setDiagLoading(false) }
  }

  const stageColor = (val) =>
    !val    ? 'text-slate-500'  :
    val.startsWith('✓') ? 'text-green-400' : 'text-red-400'

  return (
    <div className="p-4 md:p-6 space-y-6 pt-14 md:pt-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Reports</h1>
        <p className="text-slate-400 text-sm">
          Generate and email your BI report.{' '}
          <span className="text-blue-400">
            Reports are sent to your registered email by default.
          </span>
        </p>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT: Controls */}
        <div className="space-y-4">

          {/* Generate */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-3">
            <h2 className="text-slate-200 font-medium">Generate report</h2>
            <p className="text-slate-400 text-sm">
              Compiles KPIs, model metrics, forecasts, and return distribution
              into a professional HTML report.
            </p>
            <button onClick={handleGenerate} disabled={genLoad}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500
                         disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {genLoad ? '⏳ Generating…' : '📄 Generate report'}
            </button>
            {preview && (
              <div className="space-y-2">
                <div className="bg-green-500/10 border border-green-500/30 text-green-400
                                rounded-lg px-4 py-3 text-sm">
                  ✓ Generated at {new Date(preview.generated_at).toLocaleTimeString()}
                </div>
                <button onClick={handleDownload}
                  className="w-full py-2 rounded-lg border border-slate-600 text-slate-300
                             hover:bg-slate-700 text-sm transition-colors">
                  ⬇ Download as HTML
                </button>
              </div>
            )}
          </div>

          {/* Email form */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
            <h2 className="text-slate-200 font-medium">Send report by email</h2>

            {/* Explain the two addresses */}
            <div className="bg-slate-700/60 rounded-lg p-3 text-xs text-slate-300 space-y-1">
              <div><span className="text-blue-400 font-medium">Sender</span> — your Gmail in <code>.env</code> (SMTP_USER)</div>
              <div><span className="text-green-400 font-medium">Recipient</span> — pre-filled with <strong>your account email</strong> from the database</div>
              <div className="text-slate-500 pt-1">Change the To field to send to your supervisor instead.</div>
            </div>

            {[
              { key: 'to',      label: 'To *',          placeholder: user?.email || 'recipient@email.com', type: 'email' },
              { key: 'subject', label: 'Subject',        placeholder: 'Report subject',                    type: 'text'  },
              { key: 'cc',      label: 'CC (optional)',  placeholder: 'cc@example.com',                    type: 'email' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="text-slate-400 text-xs block mb-1">{label}</label>
                <input type={type} placeholder={placeholder}
                  value={emailForm[key]}
                  onChange={e => setEmailForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2
                             text-sm text-slate-200 placeholder-slate-500
                             focus:outline-none focus:border-blue-500"/>
              </div>
            ))}

            <button onClick={handleSend} disabled={sending}
              className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-500
                         disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {sending ? '📤 Sending…' : '📧 Send report email'}
            </button>

            {emailOk && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400
                              rounded-lg px-4 py-3 text-sm">
                ✓ {emailOk}
              </div>
            )}

            {/* Error — shows the full SMTP error, not a generic message */}
            {emailErr && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400
                              rounded-lg px-4 py-3 text-sm space-y-2">
                <div className="font-medium">⚠ Email failed</div>
                <div className="text-xs opacity-90 leading-relaxed">{emailErr}</div>
                <div className="text-xs text-slate-500 pt-1">
                  Use the SMTP diagnostic tools below to find the exact problem.
                </div>
              </div>
            )}
          </div>

          {/* SMTP Diagnostics */}
          <div className="bg-slate-800 rounded-xl border border-amber-500/30 p-5 space-y-3">
            <h2 className="text-amber-400 font-medium text-sm">🔧 SMTP Diagnostics</h2>
            <p className="text-slate-400 text-xs">
              If email sending fails, run these tools to find the exact problem.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleSmtpStatus} disabled={diagLoading}
                className="py-2 rounded-lg border border-slate-600 text-slate-300
                           hover:bg-slate-700 text-xs transition-colors disabled:opacity-50">
                {diagLoading ? '⏳' : '📋'} Check .env settings
              </button>
              <button onClick={handleSmtpTest} disabled={diagLoading}
                className="py-2 rounded-lg border border-amber-500/40 text-amber-400
                           hover:bg-amber-500/10 text-xs transition-colors disabled:opacity-50">
                {diagLoading ? '⏳' : '🧪'} Test SMTP connection
              </button>
            </div>

            {/* Settings status */}
            {smtpStatus && (
              <div className="bg-slate-700/60 rounded-lg p-3 text-xs space-y-1">
                <div className="text-slate-300 font-medium mb-2">Settings loaded from .env:</div>
                {[
                  ['SMTP_HOST',    smtpStatus.smtp_host],
                  ['SMTP_PORT',    smtpStatus.smtp_port],
                  ['SMTP_USER',    smtpStatus.smtp_user],
                  ['PASSWORD SET', smtpStatus.password_set ? '✓ Yes' : '✗ No'],
                  ['EMAIL_FROM',   smtpStatus.email_from],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-slate-500 w-28 flex-shrink-0">{k}:</span>
                    <span className={
                      String(v).includes('not set') || v === false || v === '✗ No'
                        ? 'text-red-400' : 'text-green-400'
                    }>{String(v)}</span>
                  </div>
                ))}
                {smtpStatus.error && (
                  <div className="text-red-400 mt-2 pt-2 border-t border-slate-600">
                    {smtpStatus.error}
                  </div>
                )}
              </div>
            )}

            {/* Full diagnostic result */}
            {smtpDiag && (
              <div className="bg-slate-700/60 rounded-lg p-3 text-xs space-y-2">
                <div className="text-slate-300 font-medium">Connection test stages:</div>
                {Object.entries(smtpDiag.stages || {}).map(([stage, result]) => (
                  <div key={stage} className={`flex gap-2 ${stageColor(result)}`}>
                    <span className="text-slate-500 w-28 flex-shrink-0 capitalize">
                      {stage.replace(/_/g, ' ')}:
                    </span>
                    <span>{result}</span>
                  </div>
                ))}
                {smtpDiag.ready === true && (
                  <div className="text-green-400 font-medium pt-1 border-t border-slate-600">
                    ✓ All stages passed — email should work!
                  </div>
                )}
                {smtpDiag.error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mt-2 space-y-1">
                    <div className="text-red-400 font-medium">Problem found:</div>
                    <div className="text-red-300 leading-relaxed">{smtpDiag.error}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h2 className="text-slate-200 font-medium">Report preview</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Exact HTML that will be emailed
            </p>
          </div>
          <div className="h-[560px] overflow-auto">
            {preview
              ? <iframe srcDoc={preview.report_html} title="Preview"
                        className="w-full h-full border-0" sandbox="allow-same-origin"/>
              : <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  Generate a report to preview it here.
                </div>
            }
          </div>
        </div>
      </div>

      {/* Setup instructions */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
        <h3 className="text-slate-300 font-medium text-sm mb-3">
          ⚙ How to configure Gmail SMTP (one-time setup)
        </h3>
        <ol className="space-y-2 text-xs text-slate-400 list-decimal list-inside">
          <li>Enable <strong className="text-slate-300">2-Factor Authentication</strong> on your Google account</li>
          <li>Go to <code className="text-blue-400">myaccount.google.com → Security → App passwords</code></li>
          <li>Click <strong className="text-slate-300">Select app → Mail</strong>, then <strong className="text-slate-300">Generate</strong></li>
          <li>Copy the <strong className="text-slate-300">16-character code</strong> (e.g. <code className="text-amber-400">abcdefghijklmnop</code>) — no spaces</li>
          <li>Open <code className="text-blue-400">backend/.env</code> and set:
            <pre className="mt-1 ml-4 text-green-400 bg-slate-900 rounded p-2">
{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-address@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
EMAIL_FROM=WebMine BI`}
            </pre>
          </li>
          <li><strong className="text-slate-300">Restart the backend</strong> after editing .env — settings are only read at startup</li>
          <li>Click <strong className="text-slate-300">Test SMTP connection</strong> above to verify before sending</li>
        </ol>
      </div>
    </div>
  )
}
