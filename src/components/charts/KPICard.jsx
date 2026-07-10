/**
 * frontend/src/components/charts/KPICard.jsx
 * Reusable KPI metric card with value, label, and optional trend indicator.
 */
export default function KPICard({ label, value, change, unit, icon, color = 'blue' }) {
  const colorMap = {
    blue:   'bg-blue-500/10   border-blue-500/30   text-blue-400',
    green:  'bg-green-500/10  border-green-500/30  text-green-400',
    amber:  'bg-amber-500/10  border-amber-500/30  text-amber-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    red:    'bg-red-500/10    border-red-500/30    text-red-400',
    slate:  'bg-slate-500/10  border-slate-500/30  text-slate-400',
  }

  const isPositive = change !== null && change !== undefined && change > 0
  const isNegative = change !== null && change !== undefined && change < 0

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-xs font-medium tracking-wide uppercase">{label}</span>
        {icon && (
          <span className={`text-xs px-2 py-1 rounded-md border ${colorMap[color]}`}>{icon}</span>
        )}
      </div>
      <div className="text-xl md:text-2xl font-semibold text-slate-100 truncate">
        {value ?? '—'}
        {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
      </div>
      {change !== null && change !== undefined && (
        <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-slate-400'}`}>
          <span>{isPositive ? '↑' : isNegative ? '↓' : '→'}</span>
          <span>{Math.abs(change).toFixed(1)}% vs prev. period</span>
        </div>
      )}
    </div>
  )
}
