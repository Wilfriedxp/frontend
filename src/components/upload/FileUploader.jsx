import { useState, useRef } from 'react'
import { uploadLog } from '../../services/api'

export default function FileUploader({ onSuccess }) {
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [error,     setError]     = useState(null)
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are accepted.')
      return
    }
    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      const { data } = await uploadLog(file, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      onSuccess?.(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
          ${dragging ? 'border-blue-400 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'}`}
      >
        <div className="text-4xl mb-3">📁</div>
        <p className="text-slate-300 font-medium">Drop your access log CSV here</p>
        <p className="text-slate-500 text-sm mt-1">or click to browse · Max 50 MB</p>
        <p className="text-slate-600 text-xs mt-3">
          Required columns: ip_address · timestamp · url · status_code
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Uploading &amp; preprocessing…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          ⚠ {error}
        </div>
      )}
    </div>
  )
}
