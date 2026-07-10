/**
 * frontend/src/pages/Dashboard.jsx
 * Fully responsive BI dashboard.
 */
import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import KPICard from '../components/charts/KPICard'
import { getDashboardData } from '../services/api'

const C = { blue:'#3b82f6', green:'#10b981', amber:'#f59e0b', slate:'#64748b' }
const TT = { backgroundColor:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#cbd5e1' }

const ICON_MAP = {
  'Total Page Views':     { icon:'👁',  color:'blue'   },
  'Unique Users':         { icon:'👥',  color:'green'  },
  'Avg Session Duration': { icon:'⏱',  color:'purple' },
  'Bounce Rate':          { icon:'↩',  color:'amber'  },
  'Return Rate':          { icon:'🔄', color:'green'  },
  'Predicted Tomorrow':   { icon:'📈', color:'blue'   },
}

function MetricGroup({ title, metrics }) {
  const col = { accuracy:'text-green-400', roc_auc:'text-blue-400', f1_macro:'text-purple-400',
                r2:'text-green-400', mae:'text-amber-400', rmse:'text-red-400' }
  return (
    <div>
      <div className="text-slate-400 text-xs font-medium mb-2">{title}</div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(metrics).map(([k, v]) => (
          <div key={k} className="bg-slate-700/50 rounded-lg px-3 py-2">
            <div className="text-slate-500 text-xs">{k.replace(/_/g,' ').toUpperCase()}</div>
            <div className={`text-sm font-semibold ${col[k]||'text-slate-200'}`}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getDashboardData()
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-96 text-slate-400">
      <div className="text-center"><div className="text-3xl animate-spin mb-3">⚙</div><p>Loading…</p></div>
    </div>
  )
  if (error) return (
    <div className="m-4 md:m-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-6">
      <div className="font-medium mb-1">Could not load dashboard</div>
      <div className="text-sm opacity-75">{error}</div>
    </div>
  )

  const { kpis, traffic_trend, return_distribution, forecast_comparison, model_metrics } = data
  const pieData = [
    { name:'Will return',  value: return_distribution?.will_return  || 1316 },
    { name:"Won't return", value: return_distribution?.wont_return  || 2531 },
  ]

  return (
    <div className="p-4 md:p-6 space-y-5 pt-14 md:pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 text-sm">Real-time business intelligence overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* KPIs — 2 cols mobile / 3 cols tablet / 6 cols desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <KPICard key={k.label} label={k.label} value={k.value}
                   change={k.change} {...(ICON_MAP[k.label]||{icon:'📊',color:'slate'})} />
        ))}
      </div>

      {/* Traffic + Return distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-4 md:p-5">
          <h2 className="text-slate-200 font-medium mb-1">Traffic trend &amp; forecast</h2>
          <p className="text-slate-500 text-xs mb-4">30-day actual visitors with RF forecast overlay</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={traffic_trend} margin={{ top:4, right:4, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.blue}  stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.blue}  stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.amber} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={C.amber} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="date" tick={{fill:'#64748b',fontSize:10}} tickLine={false} axisLine={false} interval={6}/>
              <YAxis tick={{fill:'#64748b',fontSize:10}} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={TT}/>
              <Area type="monotone" dataKey="visits"    stroke={C.blue}  fill="url(#gA)" strokeWidth={2} name="Actual"   dot={false}/>
              <Area type="monotone" dataKey="predicted" stroke={C.amber} fill="url(#gF)" strokeWidth={2} name="Forecast" dot={false} strokeDasharray="5 3"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 md:p-5">
          <h2 className="text-slate-200 font-medium mb-1">Return distribution</h2>
          <p className="text-slate-500 text-xs mb-2">RF classifier prediction results</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                <Cell fill={C.blue}/><Cell fill={C.slate}/>
              </Pie>
              <Tooltip contentStyle={TT}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d,i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{background:i===0?C.blue:C.slate}}/>
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="text-slate-200 font-medium">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast comparison + Model metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 md:p-5">
          <h2 className="text-slate-200 font-medium mb-1">Actual vs predicted traffic</h2>
          <p className="text-slate-500 text-xs mb-4">RF Regressor — last 14 days</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={forecast_comparison?.slice(-14)} margin={{left:-20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="date" tick={{fill:'#64748b',fontSize:9}} tickLine={false} axisLine={false} interval={2}/>
              <YAxis tick={{fill:'#64748b',fontSize:9}} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={TT}/>
              <Legend iconSize={10} wrapperStyle={{fontSize:11,color:'#64748b'}}/>
              <Bar dataKey="actual"    name="Actual"    fill={C.blue}  radius={[3,3,0,0]}/>
              <Bar dataKey="predicted" name="Predicted" fill={C.amber} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 md:p-5">
          <h2 className="text-slate-200 font-medium mb-4">Model performance</h2>
          <div className="space-y-4">
            {model_metrics?.return_model  && <MetricGroup title="Return-user classifier 🎯" metrics={model_metrics.return_model}/>}
            {model_metrics?.traffic_model && <MetricGroup title="Traffic forecaster 📈"     metrics={model_metrics.traffic_model}/>}
            {!model_metrics?.return_model && !model_metrics?.traffic_model && (
              <p className="text-slate-500 text-sm">Train both models to see performance here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
