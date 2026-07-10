/**
 * frontend/src/pages/UploadPage.jsx — responsive CSV upload + training panel.
 */
import { useState } from 'react'
import FileUploader from '../components/upload/FileUploader'
import { trainReturnModel, trainTrafficModel } from '../services/api'

function TrainCard({ title, desc, icon, status, metrics, onTrain }) {
  const isTraining = status === 'training'
  const isDone     = status === 'done'
  const isError    = status?.startsWith('error:')
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-slate-200 font-medium text-sm">{title}</div>
          <div className="text-slate-500 text-xs">{desc}</div>
        </div>
      </div>
      <button onClick={onTrain} disabled={isTraining}
        className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50
                   bg-blue-600 hover:bg-blue-500 text-white">
        {isTraining ? '⏳ Training…' : isDone ? '✓ Retrain' : 'Train model'}
      </button>
      {isError && <p className="text-red-400 text-xs">{status.replace('error:','')}</p>}
      {isDone && metrics && (
        <div className="space-y-1">
          {Object.entries(metrics.test_metrics||{})
            .filter(([,v]) => typeof v === 'number')
            .map(([k,v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-500">{k.replace(/_/g,' ')}</span>
                <span className="text-slate-300 font-medium">{v}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default function UploadPage() {
  const [uploadResult,  setUploadResult]  = useState(null)
  const [trainStatus,   setTrainStatus]   = useState({})
  const [trainMetrics,  setTrainMetrics]  = useState({})

  const train = async (type) => {
    setTrainStatus(s => ({ ...s, [type]: 'training' }))
    try {
      const fn = type === 'return' ? trainReturnModel : trainTrafficModel
      const { data } = await fn()
      setTrainMetrics(m => ({ ...m, [type]: data }))
      setTrainStatus(s => ({ ...s, [type]: 'done' }))
    } catch (err) {
      setTrainStatus(s => ({ ...s, [type]: 'error:' + err.message }))
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pt-14 md:pt-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Upload Access Log</h1>
        <p className="text-slate-400 text-sm">Upload a CSV web access log to start the BI pipeline.</p>
      </div>

      <FileUploader onSuccess={setUploadResult} />

      {uploadResult && (
        <>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 md:p-5 space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <span>✓</span> {uploadResult.message}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Rows ingested', uploadResult.rows_ingested?.toLocaleString()],
                ['Users found',   uploadResult.users_found?.toLocaleString()],
                ['Date start',    uploadResult.date_range?.start],
                ['Date end',      uploadResult.date_range?.end],
              ].map(([l,v]) => (
                <div key={l} className="bg-slate-800 rounded-lg px-3 py-2">
                  <div className="text-slate-500 text-xs">{l}</div>
                  <div className="text-slate-200 font-medium text-sm">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature preview — scroll on mobile */}
          {uploadResult.feature_preview?.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 md:p-5">
              <h3 className="text-slate-300 font-medium mb-3">Feature preview (first 5 users)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-400 min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {Object.keys(uploadResult.feature_preview[0]).map(k => (
                        <th key={k} className="text-left py-2 pr-4 text-slate-500 font-medium whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.feature_preview.map((row,i) => (
                      <tr key={i} className="border-b border-slate-700/50">
                        {Object.values(row).map((v,j) => (
                          <td key={j} className="py-2 pr-4 whitespace-nowrap">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TrainCard title="Train Return-User Classifier" desc="Random Forest · 5-fold CV"
              icon="🎯" status={trainStatus.return}  metrics={trainMetrics.return}
              onTrain={() => train('return')} />
            <TrainCard title="Train Traffic Forecaster" desc="RF Regressor · TimeSeriesSplit"
              icon="📈" status={trainStatus.traffic} metrics={trainMetrics.traffic}
              onTrain={() => train('traffic')} />
          </div>
        </>
      )}
    </div>
  )
}
