import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Filter,
  Layers,
  MoveRight,
  RefreshCw,
  Sparkles,
  ThermometerSnowflake,
  Truck,
  Warehouse,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api, YardZone } from '../services/api'
import { useTheme } from '../context/ThemeContext'

export function YardPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [zones, setZones] = useState<YardZone[]>([])
  const [selectedType, setSelectedType] = useState('All')
  const [loading, setLoading] = useState(true)
  const [rebalancing, setRebalancing] = useState(false)
  const [rebalanceMessage, setRebalanceMessage] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<YardZone | null>(null)

  const loadYard = async () => {
    try {
      setLoading(true)
      const data = await api.getYardZones()
      setZones(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadYard()
  }, [])

  const handleRebalance = async () => {
    try {
      setRebalancing(true)
      const res = await api.rebalanceYard('Y-04', 'Y-12', 240)
      setRebalanceMessage(`Rebalancing complete: 240 TEU transferred from Zone Y-04 to Zone Y-12 buffer. Y-04 pressure reduced to ${res.source.utilization_pct}%.`)
      loadYard()
    } catch (err) {
      alert('Error rebalancing: ' + err)
    } finally {
      setRebalancing(false)
    }
  }

  const filteredZones =
    selectedType === 'All'
      ? zones
      : zones.filter((z) => z.zone_type.toLowerCase().includes(selectedType.toLowerCase()))

  const dwellData = [
    { range: '0 - 3 Days', count: 48, note: 'Normal velocity' },
    { range: '4 - 7 Days', count: 32, note: 'Standard staging' },
    { range: '8 - 14 Days', count: 14, note: 'Extended dwell' },
    { range: '15+ Days', count: 6, note: 'Demurrage risk' },
  ]

  const totalCap = zones.reduce((acc, z) => acc + z.capacity_teu, 0)
  const totalOcc = zones.reduce((acc, z) => acc + z.current_occupancy_teu, 0)
  const avgUtil = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 73
  const criticalCount = zones.filter((z) => z.risk_level === 'critical').length

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p>TERMINAL INVENTORY & YARD VELOCITY</p>
          <h1>Yard Capacity & Dwell Time Monitoring</h1>
          <span>
            Real-time stacking density, dwell time metrics, and automated inter-block container balancing across 18 terminal yard zones.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary-button" onClick={loadYard}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Refresh Yard
          </button>
          <button
            className="primary-button"
            onClick={handleRebalance}
            disabled={rebalancing}
          >
            <Sparkles size={16} />
            {rebalancing ? 'Transferring Cargo...' : 'Run Yard Rebalancing'}
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon amber">
            <Warehouse size={22} />
          </div>
          <div>
            <p>OVERALL YARD CAPACITY</p>
            <strong>{avgUtil}% Utilised</strong>
            <span>{totalOcc.toLocaleString()} / {totalCap.toLocaleString()} TEU</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p>CRITICAL PRESSURE ZONES</p>
            <strong style={{ color: '#ef4444' }}>{criticalCount} Zones</strong>
            <span>Zone Y-04 (91%) & Y-13 (87%)</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon blue">
            <ThermometerSnowflake size={22} />
          </div>
          <div>
            <p>REEFER PLUG CONSUMPTION</p>
            <strong>384 / 450 Plugs</strong>
            <span>85.3% Refrigerated active</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon cyan">
            <Truck size={22} />
          </div>
          <div>
            <p>AVG CONTAINER DWELL</p>
            <strong>4.2 Days</strong>
            <span>-0.6 days vs target SLA</span>
          </div>
        </article>
      </section>

      {/* Rebalance Toast */}
      {rebalanceMessage && (
        <div className="alert-banner healthy-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#10b981" />
            <span>{rebalanceMessage}</span>
          </div>
          <button className="close-btn" onClick={() => setRebalanceMessage(null)}>
            ×
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="yard-tabs-bar">
        {['All', 'Import', 'Export', 'Reefer', 'Transshipment', 'Empty'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${selectedType === tab ? 'active' : ''}`}
            onClick={() => setSelectedType(tab)}
          >
            {tab} Blocks
          </button>
        ))}
      </div>

      {/* 18-Zone Terminal Yard Map Grid */}
      <article className="panel yard-map-panel">
        <div className="panel-title">
          <div>
            <small>TOPOLOGICAL MAP</small>
            <h2>Terminal Stacking Blocks (18 Zones)</h2>
          </div>
          <div className="yard-legend">
            <span><i className="yard-safe-dot" /> Safe (&lt;75%)</span>
            <span><i className="yard-warn-dot" /> Warning (75-87%)</span>
            <span><i className="yard-crit-dot" /> Critical (&gt;87%)</span>
          </div>
        </div>

        <div className="yard-zones-grid">
          {filteredZones.map((z) => (
            <div
              key={z.id}
              className={`yard-zone-card card-${z.risk_level} ${selectedZone?.id === z.id ? 'active-zone' : ''}`}
              onClick={() => setSelectedZone(z)}
            >
              <div className="zone-card-top">
                <b>{z.id}</b>
                <span className={`risk-tag tag-${z.risk_level}`}>{z.risk_level.toUpperCase()}</span>
              </div>
              <small className="zone-type-badge">{z.zone_type}</small>

              <div className="zone-occupancy-bar">
                <div className="progress">
                  <i
                    style={{
                      width: `${z.utilization_pct}%`,
                      background: z.risk_level === 'critical' ? '#ef4444' : z.risk_level === 'warning' ? '#f59e0b' : '#10b981',
                    }}
                  />
                </div>
                <div className="zone-numbers">
                  <span>{z.utilization_pct}%</span>
                  <small>{z.current_occupancy_teu} / {z.capacity_teu} TEU</small>
                </div>
              </div>

              <div className="zone-footer-meta">
                <span>Avg Dwell: <b>{z.avg_dwell_days}d</b></span>
                <span>RTGs: <b>{z.assigned_rtgs}</b></span>
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Bottom Row: Dwell Time Chart & Zone Inspector */}
      <div className="two-column-grid">
        {/* Dwell Time Chart */}
        <article className="panel">
          <div className="panel-title">
            <div>
              <small>VELOCITY ANALYSIS</small>
              <h2>Container Dwell Time Distribution</h2>
            </div>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dwellData} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1c3447' : '#e2e8f0'} />
                <XAxis dataKey="range" stroke={isDark ? '#70869a' : '#64748b'} fontSize={11} />
                <YAxis stroke={isDark ? '#70869a' : '#64748b'} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#0d2233' : '#ffffff',
                    border: isDark ? '1px solid #254157' : '1px solid #cbd5e1',
                    borderRadius: '6px',
                    color: isDark ? '#e2f0fc' : '#0f172a',
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 4px 16px rgba(15,23,42,0.1)',
                  }}
                />
                <Bar dataKey="count" name="Zone Clusters" radius={[4, 4, 0, 0]}>
                  {dwellData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 3 ? '#ef4444' : index === 2 ? '#f59e0b' : '#19c3df'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#829db5', marginTop: '0.75rem' }}>
            6 zones exhibit dwell times exceeding 15 days, posing significant demurrage and stacking re-handle penalties.
          </p>
        </article>

        {/* Selected Zone Inspector / Rebalance Sandbox */}
        <article className="panel">
          <div className="panel-title">
            <div>
              <small>INSPECTION & ACTION</small>
              <h2>{selectedZone ? selectedZone.name : 'Yard Zone Inspector'}</h2>
            </div>
          </div>

          {selectedZone ? (
            <div className="zone-inspector-content">
              <div className="metric-row">
                <div className="metric-box">
                  <small>ZONE TYPE</small>
                  <b>{selectedZone.zone_type}</b>
                </div>
                <div className="metric-box">
                  <small>CAPACITY</small>
                  <b>{selectedZone.capacity_teu.toLocaleString()} TEU</b>
                </div>
                <div className="metric-box">
                  <small>CURRENT LOAD</small>
                  <b style={{ color: selectedZone.risk_level === 'critical' ? '#ef4444' : '#10b981' }}>
                    {selectedZone.utilization_pct}%
                  </b>
                </div>
              </div>

              <div className="spec-grid" style={{ marginTop: '1rem' }}>
                <div><span>Rubber Tired Gantries (RTGs):</span> <b>{selectedZone.assigned_rtgs} units</b></div>
                <div><span>Reefer Plugs Active:</span> <b>{selectedZone.reefer_plugs_used} / {selectedZone.reefer_plugs_total}</b></div>
                <div><span>Hazmat Containers:</span> <b>{selectedZone.hazmat_count} units</b></div>
                <div><span>Average Stacking Dwell:</span> <b>{selectedZone.avg_dwell_days} days</b></div>
              </div>

              {selectedZone.id === 'Y-04' && (
                <div className="recommendation-callout" style={{ marginTop: '1.25rem' }}>
                  <small>AUTOMATED INTER-BLOCK DISPATCH</small>
                  <p>Zone Y-04 is at critical 91% capacity. Transfer 240 TEU to buffer Zone Y-12 to restore safe operating corridors.</p>
                  <button
                    className="primary-button full-width"
                    style={{ marginTop: '0.75rem' }}
                    onClick={handleRebalance}
                    disabled={rebalancing}
                  >
                    <MoveRight size={16} /> Execute 240 TEU Transfer to Y-12
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <Boxes size={32} color="#70869a" />
              <p style={{ color: '#829db5', marginTop: '0.75rem' }}>
                Click on any yard zone card above to inspect live equipment, dwell time, and rebalancing options.
              </p>
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
