/**
 * frontend/src/pages/Predictions.jsx
 * Responsive predictions panel — stacks vertically on mobile.
 */
import { useState } from 'react'
import { predictReturn, predictTraffic } from '../services/api'

const DEFAULT = { session_duration:8.5, page_views:12, visit_frequency:15, bounce_rate:0.25, navigation_depth:2.5 }
const SLIDERS = [
  { key:'session_duration', label:'Session duration', min:0,  max:60, step:0.5,  fmt:v=>`${v} min`},
  { key:'page_views',       label:'Page views',       min:1,  max:100,step:1,    fmt:v=>`${v} pages`},
  { key:'visit_frequency',  label:'Visit frequency',  min:1,  max:50, step:1,    fmt:v=>`${v} sessions`},
  { key:'bounce_rate',      label:'Bounce rate',      min:0,  max:1,  step:0.01, fmt:v=>`${(v*100).toFixed(0)}%`},
  { key:'navigation_depth', label:'Navigation depth', min:0,  max:5,  step:0.1,  fmt:v=>`${v} levels`},
]

export default function Predictions() {
  const [features, setFeatures]     = useState(DEFAULT)
  const [returnRes,  setReturnRes]  = useState(null)
  const [trafficRes, setTrafficRes] = useState(null)
  const [loadR, setLoadR]           = useState(false)
  const [loadT, setLoadT]           = useState(false)
  const [errR,  setErrR]            = useState(null)
  const [errT,  setErrT]            = useState(null)

  const set = (k,v) => setFeatures(f => ({ ...f, [k]: parseFloat(v) }))

  const handleReturn = async () => {
    setLoadR(true); setErrR(null)
    try { const { data } = await predictReturn([features]); setReturnRes(data.predictions[0]) }
    catch (e) { setErrR(e.message) } finally { setLoadR(false) }
  }

  const handleTraffic = async () => {
    setLoadT(true); setErrT(null)
    try { const { data } = await predictTraffic(); setTrafficRes(data) }
    catch (e) { setErrT(e.message) } finally { setLoadT(false) }
  }

  const prob = returnRes?.probability ?? 0
  const willReturn = returnRes?.will_return

  return (
    <div className="p-4 md:p-6 space-y-6 pt-14 md:pt-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Predictions</h1>
        <p className="text-slate-400 text-sm">Run ML inference using your trained models.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Return prediction */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
          <div>
            <h2 className="text-slate-200 font-medium">User return prediction</h2>
            <p className="text-slate-500 text-xs mt-0.5">Random Forest Classifier</p>
          </div>
          <div className="space-y-4">
            {SLIDERS.map(({ key, label, min, max, step, fmt }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-200 font-medium">{fmt(features[key])}</span>
                </div>
                <input type="range" min={min} max={max} step={step}
                  value={features[key]}
                  onChange={e => set(key, e.target.value)}
                  className="w-full accent-blue-500"/>
              </div>
            ))}
          </div>
          <button onClick={handleReturn} disabled={loadR}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500
                       disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {loadR ? '⏳ Predicting…' : '🎯 Predict return'}
          </button>
          {errR && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">⚠ {errR}</div>}
          {returnRes && (
            <div className={`rounded-xl p-4 border ${willReturn ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <div className={`text-lg font-semibold ${willReturn ? 'text-green-400' : 'text-amber-400'}`}>
                {willReturn ? '✓ Will return' : '✗ Won\'t return'}
              </div>
              <div className="text-slate-400 text-sm mt-1">
                Probability: <span className="text-slate-200 font-medium">{(prob*100).toFixed(1)}%</span>
              </div>
              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${willReturn?'bg-green-400':'bg-amber-400'}`}
                     style={{width:`${prob*100}%`}}/>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Confidence: <span className="text-slate-300">{returnRes.confidence_band}</span>
              </div>
            </div>
          )}
        </div>

        {/* Traffic forecast */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
          <div>
            <h2 className="text-slate-200 font-medium">Tomorrow's traffic forecast</h2>
            <p className="text-slate-500 text-xs mt-0.5">Random Forest Regressor · Lag + calendar features</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
            <div className="text-slate-400 text-sm">
              The model uses the last 14 days of visitor history plus calendar features
              to predict tomorrow's total visitors.
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Features: lag_1, lag_7, lag_14, rolling_mean_7, rolling_mean_14,
              rolling_std_7, day_of_week, month, is_weekend…
            </div>
          </div>
          <button onClick={handleTraffic} disabled={loadT}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500
                       disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {loadT ? '⏳ Forecasting…' : '📈 Predict tomorrow\'s traffic'}
          </button>
          {errT && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">⚠ {errT}</div>}
          {trafficRes && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 space-y-4">
              <div>
                <div className="text-slate-400 text-xs mb-1">Prediction date</div>
                <div className="text-slate-200 font-medium">{trafficRes.date}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-1">Predicted visitors</div>
                <div className="text-3xl font-bold text-blue-400">
                  {trafficRes.predicted_visitors?.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-2">80% confidence interval</div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-300 text-sm">{trafficRes.confidence_low?.toLocaleString()}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/40 rounded-full w-full"/>
                  </div>
                  <span className="text-slate-300 text-sm">{trafficRes.confidence_high?.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Std deviation: ±{trafficRes.std_deviation?.toLocaleString()} visitors
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
