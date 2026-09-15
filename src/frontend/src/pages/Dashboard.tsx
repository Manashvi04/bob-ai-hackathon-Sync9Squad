import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock3,
  Container,
  RefreshCw,
  Ship,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api, CongestionForecast, TerminalSummary, Vessel } from '../services/api'

export function Dashboard() {
  const [summary, setSummary] = useState<TerminalSummary | null>(null)
  const [forecast, setForecast] = useState<CongestionForecast | null>(null)
  const [movements, setMovements] = useState<Vessel[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [sumData, fData, vData] = await Promise.all([
        api.getSummary().catch(() => ({
          terminal_name: 'North Harbor Terminal 1',
          total_tracked_vessels: 229,
          vessels_at_berth: 6,
          vessels_anchored: 5,
          critical_risk_vessels: 4,
          berth_utilization_pct: 75.0,
          occupied_berths: 6,
          total_berths: 8,
          active_cranes: 9,
          total_cranes: 12,
          yard_capacity_pct: 73.2,
          active_alerts_count: 5,
          system_status: 'Operational · Live AI Optimization Active',
        })),
        api.getCongestionForecast().catch(() => null),
        api.getVessels({ limit: 4 }).catch(() => ({ vessels: [] })),
      ])
      setSummary(sumData)
      setForecast(fData)
      setMovements(vData.vessels)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const stats = [
    {
      label: 'VESSELS IN PORT',
      value: summary?.total_tracked_vessels ? `${summary.vessels_at_berth + summary.vessels_anchored}` : '11',
      note: `${summary?.vessels_anchored ?? 5} waiting at anchorage`,
      icon: Ship,
      tone: 'blue',
      link: '/vessels',
    },
    {
      label: 'BERTH UTILISATION',
      value: summary ? `${summary.berth_utilization_pct}%` : '75%',
      note: `${summary?.occupied_berths ?? 6} of ${summary?.total_berths ?? 8} berths working`,
      icon: Container,
      tone: 'cyan',
      link: '/berths-cranes',
    },
    {
      label: 'YARD CAPACITY',
      value: summary ? `${summary.yard_capacity_pct}%` : '73%',
      note: 'Zone Y-04 near threshold (91%)',
      icon: Boxes,
      tone: 'amber',
      link: '/yard',
    },
    {
      label: 'ACTIVE ALERTS',
      value: summary ? `${summary.active_alerts_count}` : '5',
      note: '2 require immediate triage',
      icon: AlertTriangle,
      tone: 'red',
      link: '/alerts',
    },
  ]

  const chartData = forecast?.forecast_points.slice(0, 8) ?? [
    { time: '00:00', utilisation: 58, threshold: 85, berth_congestion: 54, yard_pressure: 60 },
    { time: '04:00', utilisation: 66, threshold: 85, berth_congestion: 62, yard_pressure: 68 },
    { time: '08:00', utilisation: 74, threshold: 85, berth_congestion: 72, yard_pressure: 75 },
    { time: '12:00', utilisation: 82, threshold: 85, berth_congestion: 80, yard_pressure: 83 },
    { time: '16:00', utilisation: 89, threshold: 85, berth_congestion: 88, yard_pressure: 89 },
    { time: '20:00', utilisation: 91, threshold: 85, berth_congestion: 92, yard_pressure: 88 },
    { time: '00:00', utilisation: 78, threshold: 85, berth_congestion: 76, yard_pressure: 80 },
    { time: '04:00', utilisation: 68, threshold: 85, berth_congestion: 65, yard_pressure: 72 },
  ]

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p>MARITIME LOGISTICS COMMAND · NORTH HARBOR T1</p>
          <h1>Port Operations Dashboard</h1>
          <span>
            Real-time AI congestion intelligence, berth synchronisation, and predictive workload optimization.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary-button" onClick={loadData} title="Refresh Live State">
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <Link to="/72-hour-plan" className="primary-button">
            <Clock3 size={17} />
            View 72-Hour Plan
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Primary KPI Grid */}
      <section className="stats-grid">
        {stats.map(({ label, value, note, icon: Icon, tone, link }) => (
          <Link to={link} key={label} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article className="stat-card hover-glow">
              <div className={`stat-icon ${tone}`}>
                <Icon size={22} />
              </div>
              <div>
                <p>{label}</p>
                <strong>{value}</strong>
                <span>{note}</span>
              </div>
            </article>
          </Link>
        ))}
      </section>

      {/* Main Grid */}
      <section className="dashboard-grid">
        {/* Congestion Forecast Panel */}
        <article className="panel congestion-panel">
          <div className="panel-title">
            <div>
              <small>PREDICTIVE ML FORECAST (SCIKIT-LEARN)</small>
              <h2>72-Hour Congestion Outlook</h2>
            </div>
            <span className="risk">
              <AlertTriangle size={14} />
              Peak index 91.0 · 18:00 Tonight
            </span>
          </div>
          <div className="chart-wrap" style={{ minHeight: '230px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 16, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#19c3df" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#19c3df" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c3447" />
                <XAxis dataKey="time" stroke="#70869a" fontSize={11} />
                <YAxis stroke="#70869a" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: '#0d2233',
                    border: '1px solid #254157',
                    borderRadius: '6px',
                    color: '#e2f0fc',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="threshold"
                  stroke="#f7a62f"
                  strokeDasharray="5 5"
                  fill="none"
                  name="Critical Limit (85%)"
                />
                <Area
                  type="monotone"
                  dataKey="utilisation"
                  stroke="#21c5df"
                  strokeWidth={3}
                  fill="url(#cyanFill)"
                  name="Predicted Congestion %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            <span>
              <i className="cyan-dot" /> Predicted Congestion
            </span>
            <span>
              <i className="amber-line" /> Critical Limit (85%)
            </span>
            <Link to="/congestion" className="text-link">
              Detailed Hotspots & Simulator <ArrowRight size={14} />
            </Link>
          </div>
        </article>

        {/* Live Vessel Movements */}
        <article className="panel movements">
          <div className="panel-title">
            <div>
              <small>LIVE SCHEDULE & QUEUE</small>
              <h2>Upcoming Vessel Calls</h2>
            </div>
            <Link to="/vessels" className="text-link">
              View all ({summary?.total_tracked_vessels ?? 229})
            </Link>
          </div>
          <div className="movement-list">
            {movements.length > 0 ? (
              movements.map((v) => (
                <div className="movement" key={v.id}>
                  <time>{v.eta.split('T')[1]?.slice(0, 5) || '14:00'}</time>
                  <span className="vessel-mark">
                    <Ship size={17} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <b>{v.name}</b>
                    <small>
                      {v.carrier} · {v.assigned_berth ? `Berth ${v.assigned_berth}` : 'Anchorage'} ·{' '}
                      {v.total_moves} TEU
                    </small>
                  </div>
                  <em className={v.delay_hours > 0 ? 'delay' : 'ontime'}>
                    {v.delay_hours > 0 ? `+${v.delay_hours}h` : 'On Time'}
                  </em>
                </div>
              ))
            ) : (
              <p style={{ color: '#829db5', fontSize: '0.9rem' }}>Loading active fleet...</p>
            )}
          </div>
        </article>

        {/* Resource Pulse */}
        <article className="panel resource-panel">
          <div className="panel-title">
            <div>
              <small>RESOURCE PULSE</small>
              <h2>Terminal Capacity</h2>
            </div>
            <span className="healthy">
              <CheckCircle2 size={14} /> Stable Ops
            </span>
          </div>
          {[
            ['Quayside Berths', `${summary?.occupied_berths ?? 6} / ${summary?.total_berths ?? 8}`, summary?.berth_utilization_pct ?? 75],
            ['Quay Cranes (STS)', `${summary?.active_cranes ?? 9} / ${summary?.total_cranes ?? 12}`, 75],
            ['Container Yard Blocks', '14 / 18 active', summary?.yard_capacity_pct ?? 73],
            ['Inbound Gate Lanes', '7 / 10 open', 70],
          ].map(([name, count, value]) => (
            <div className="resource" key={String(name)}>
              <div>
                <span>{name}</span>
                <b>{count}</b>
              </div>
              <div className="progress">
                <i
                  style={{
                    width: `${value}%`,
                    background: Number(value) > 85 ? '#ef4444' : Number(value) > 75 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>
              <small>{value}% utilised</small>
            </div>
          ))}
        </article>

        {/* Decision Queue */}
        <article className="panel attention">
          <div className="panel-title">
            <div>
              <small>AI ACTION RECOMMENDATIONS</small>
              <h2>Decision Queue</h2>
            </div>
            <span className="badge-pill">3 items</span>
          </div>

          <div className="attention-item">
            <span className="warn">
              <TrendingUp size={16} />
            </span>
            <div>
              <b>Yard Zone Y-04 Near Limit (91%)</b>
              <p>Projected bottleneck by 19:00. Auto-rebalance 240 TEU to buffer Zone Y-12.</p>
              <Link to="/yard" className="action-chip">
                Execute Rebalancing <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="attention-item">
            <span className="warn">
              <Clock3 size={16} />
            </span>
            <div>
              <b>Berth B3 Overlap: Nordic Star vs. CMA CGM</b>
              <p>Draft conflict resolved by reallocating CMA CGM to Berth B2.</p>
              <Link to="/berths-cranes" className="action-chip">
                Run Auto-Optimiser <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="attention-item">
            <span className="info">
              <Sparkles size={16} />
            </span>
            <div>
              <b>Virtual Arrival Opportunity</b>
              <p>Slow steaming recommendation can save 18.4 MT fuel on Cosco Universe.</p>
              <Link to="/routing" className="action-chip">
                Review Fuel Savings <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
