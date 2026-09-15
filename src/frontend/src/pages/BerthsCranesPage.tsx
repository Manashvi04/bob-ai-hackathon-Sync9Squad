import { useEffect, useState } from 'react'
import {
  Anchor,
  ArrowRight,
  CheckCircle2,
  Container,
  Cpu,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react'
import {
  api,
  Berth,
  OptimizationResult,
  QuayCrane,
} from '../services/api'

export function BerthsCranesPage() {
  const [berths, setBerths] = useState<Berth[]>([])
  const [cranes, setCranes] = useState<QuayCrane[]>([])
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [optResult, setOptResult] = useState<OptimizationResult | null>(null)
  const [selectedBerth, setSelectedBerth] = useState<Berth | null>(null)

  const loadResources = async () => {
    try {
      setLoading(true)
      const [bData, cData] = await Promise.all([api.getBerths(), api.getCranes()])
      setBerths(bData)
      setCranes(cData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  const handleRunOptimizer = async () => {
    try {
      setOptimizing(true)
      const res = await api.runOptimization({
        prioritize_express: true,
        max_cranes_per_vessel: 4,
      })
      setOptResult(res)
    } catch (err) {
      alert('Optimization error: ' + err)
    } finally {
      setOptimizing(false)
    }
  }

  // Visual Gantt schedule data for berths
  const ganttSchedule = [
    {
      berth: 'A1',
      slots: [
        { name: 'MV Pacific Dawn', start: 0, width: 45, color: '#19c3df', text: '06:00 - 14:00 · 3,200 TEU' },
        { name: 'Cosco Shipping Universe', start: 50, width: 48, color: '#3b82f6', text: '16:00 - 04:00 · 4,100 TEU' },
      ],
    },
    {
      berth: 'A2',
      slots: [
        { name: 'Ever Apex', start: 0, width: 60, color: '#10b981', text: '08:00 - 18:00 · 3,800 TEU' },
        { name: 'HMM Algeciras', start: 65, width: 33, color: '#8b5cf6', text: '20:00 - 06:00 · 3,900 TEU' },
      ],
    },
    {
      berth: 'B1',
      slots: [
        { name: 'MSC Orion', start: 10, width: 55, color: '#f59e0b', text: '10:00 - 20:00 · 2,400 TEU' },
        { name: 'ONE Apus', start: 70, width: 28, color: '#ec4899', text: '22:00 - 08:00 · 2,200 TEU' },
      ],
    },
    {
      berth: 'B2',
      slots: [
        { name: 'Available / Maintenance', start: 0, width: 30, color: '#334e68', text: 'Trolley Servicing' },
        { name: 'Madrid Express', start: 35, width: 55, color: '#06b6d4', text: '12:00 - 22:00 · 1,950 TEU' },
      ],
    },
    {
      berth: 'B3',
      slots: [
        { name: 'Nordic Star (Delayed)', start: 0, width: 65, color: '#ef4444', text: '04:00 - 19:30 · 1,450 TEU' },
        { name: 'CMA CGM Palais Royal', start: 70, width: 28, color: '#14b8a6', text: '21:00 - 09:00 · 3,600 TEU' },
      ],
    },
    {
      berth: 'C1',
      slots: [
        { name: 'Baltic Trader', start: 15, width: 45, color: '#6366f1', text: '09:00 - 17:00 · 920 TEU' },
        { name: 'Pacific Leader', start: 65, width: 32, color: '#84cc16', text: '19:00 - 05:00 · 850 TEU' },
      ],
    },
    {
      berth: 'C2',
      slots: [
        { name: 'Ocean Meridian', start: 0, width: 50, color: '#eab308', text: '06:00 - 16:00 · 680 TEU' },
      ],
    },
    {
      berth: 'C3',
      slots: [
        { name: 'Regional Feeder 4', start: 20, width: 40, color: '#a855f7', text: '11:00 - 18:00 · 420 TEU' },
      ],
    },
  ]

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p>INFRASTRUCTURE & RESOURCE DISPATCH</p>
          <h1>Berths & Cranes Optimisation</h1>
          <span>
            Real-time allocation across 8 quay berths and 12 Super Post-Panamax ship-to-shore cranes to minimize turnaround delays.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary-button" onClick={loadResources}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Refresh Status
          </button>
          <button
            className="primary-button"
            onClick={handleRunOptimizer}
            disabled={optimizing}
          >
            <Sparkles size={16} />
            {optimizing ? 'Solving Constraints...' : 'Run Auto-Optimiser'}
          </button>
        </div>
      </section>

      {/* KPI Overview */}
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon cyan">
            <Container size={22} />
          </div>
          <div>
            <p>QUAYSIDE BERTHS</p>
            <strong>6 / 8 Occupied</strong>
            <span>75.0% Fleet Capacity</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon blue">
            <Zap size={22} />
          </div>
          <div>
            <p>ACTIVE SHIP-TO-SHORE CRANES</p>
            <strong>9 / 12 Operating</strong>
            <span>32.4 gross moves/hr avg</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon amber">
            <Wrench size={22} />
          </div>
          <div>
            <p>SCHEDULED MAINTENANCE</p>
            <strong>QC-07 on Berth B2</strong>
            <span>Hydraulic valve check</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p>OPTIMISATION STATUS</p>
            <strong style={{ color: '#10b981' }}>Synchronized</strong>
            <span>Zero overlapping slots</span>
          </div>
        </article>
      </section>

      {/* Optimization Results Banner */}
      {optResult && (
        <article className="optimization-banner">
          <div className="opt-banner-header">
            <div>
              <span className="badge-pill">
                <Sparkles size={13} /> Mathematical Solver Result
              </span>
              <h2>Constraint Optimization Succeeded</h2>
              <p>{optResult.summary_notes}</p>
            </div>
            <button className="close-btn" onClick={() => setOptResult(null)}>
              ×
            </button>
          </div>

          <div className="opt-metrics-strip">
            <div className="opt-stat">
              <small>VESSELS SYNCHRONIZED</small>
              <b>{optResult.total_vessels_optimized} Calls</b>
            </div>
            <div className="opt-stat">
              <small>WAITING TIME REDUCTION</small>
              <b style={{ color: '#10b981' }}>-{optResult.average_waiting_time_reduction_pct}%</b>
            </div>
            <div className="opt-stat">
              <small>TOTAL DELAYS PREVENTED</small>
              <b>{optResult.total_delay_hours_prevented} Hours</b>
            </div>
            <div className="opt-stat">
              <small>UTILISATION IMPROVEMENT</small>
              <b style={{ color: '#19c3df' }}>+{optResult.berth_utilization_improvement_pct}%</b>
            </div>
          </div>

          <div className="opt-table-wrap">
            <table className="opt-table">
              <thead>
                <tr>
                  <th>VESSEL NAME</th>
                  <th>CARRIER</th>
                  <th>OPTIMIZED BERTH</th>
                  <th>ALLOCATED CRANES</th>
                  <th>TIME WINDOW</th>
                  <th>EST. TURNAROUND</th>
                  <th>DELAY SAVED</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {optResult.assignments.map((a) => (
                  <tr key={a.vessel_id}>
                    <td><b>{a.vessel_name}</b></td>
                    <td>{a.carrier}</td>
                    <td><span className="berth-badge">Berth {a.optimized_berth}</span></td>
                    <td>{a.allocated_cranes.join(', ')}</td>
                    <td>{a.start_time.slice(5)} to {a.end_time.slice(11)}</td>
                    <td>{a.turnaround_hours}h</td>
                    <td style={{ color: '#10b981' }}><b>-{a.waiting_time_saved_hours}h</b></td>
                    <td>
                      <span className="healthy" style={{ fontSize: '0.78rem' }}>
                        <CheckCircle2 size={13} /> {a.conflict_resolved ? 'Conflict Resolved' : 'Optimized'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {/* Visual Berth Gantt Chart */}
      <article className="panel gantt-panel">
        <div className="panel-title">
          <div>
            <small>TIMELINE VISUALIZATION</small>
            <h2>72-Hour Berth Occupancy Schedule (Gantt)</h2>
          </div>
          <div className="gantt-legend">
            <span><i style={{ background: '#19c3df' }} /> ULCV</span>
            <span><i style={{ background: '#3b82f6' }} /> Neo-Panamax</span>
            <span><i style={{ background: '#ef4444' }} /> Delayed Call</span>
            <span><i style={{ background: '#10b981' }} /> Normal Call</span>
          </div>
        </div>

        <div className="gantt-timeline-header">
          <span>DAY 1 (00:00 - 24:00)</span>
          <span>DAY 2 (00:00 - 24:00)</span>
          <span>DAY 3 (00:00 - 24:00)</span>
        </div>

        <div className="gantt-container">
          {ganttSchedule.map((row) => (
            <div className="gantt-row" key={row.berth}>
              <div className="gantt-label">
                <b>Berth {row.berth}</b>
              </div>
              <div className="gantt-track">
                {row.slots.map((slot, i) => (
                  <div
                    key={i}
                    className="gantt-bar"
                    style={{
                      left: `${slot.start}%`,
                      width: `${slot.width}%`,
                      background: slot.color,
                    }}
                    title={`${slot.name} (${slot.text})`}
                  >
                    <span>{slot.name}</span>
                    <small>{slot.text}</small>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* 8 Berths Cards Grid */}
      <section className="section-title">
        <h2>Quay Berths Specifications & Current Status</h2>
        <span>Click any berth to inspect detailed draft depth, crane rails, and current vessel.</span>
      </section>

      <div className="berths-grid">
        {berths.map((b) => (
          <div
            className={`berth-card ${b.status === 'occupied' ? 'occupied' : 'available'} ${selectedBerth?.id === b.id ? 'selected' : ''}`}
            key={b.id}
            onClick={() => setSelectedBerth(b)}
          >
            <div className="berth-card-header">
              <div>
                <b>{b.name}</b>
                <small>{b.length_m}m Length · {b.max_draft_m}m Max Draft</small>
              </div>
              <span className={`berth-status-pill pill-${b.status}`}>
                {b.status.toUpperCase()}
              </span>
            </div>

            <div className="berth-body">
              {b.current_vessel_name ? (
                <div className="current-vessel-box">
                  <small>WORKING VESSEL:</small>
                  <strong>{b.current_vessel_name}</strong>
                  <span>Assigned Cranes: {b.assigned_crane_ids.join(', ')}</span>
                </div>
              ) : (
                <div className="empty-berth-box">
                  <span>Available for Inbound Vessel</span>
                  <small>Bollards: {b.bollard_count} · Rate: ${b.hourly_rate_usd}/hr</small>
                </div>
              )}

              <div className="berth-utilization">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>Occupancy</span>
                  <b>{b.utilization_pct}%</b>
                </div>
                <div className="progress">
                  <i
                    style={{
                      width: `${b.utilization_pct}%`,
                      background: b.utilization_pct > 85 ? '#ef4444' : '#19c3df',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quay Cranes Fleet Matrix */}
      <section className="section-title" style={{ marginTop: '2rem' }}>
        <h2>Quay Cranes Fleet (Ship-to-Shore)</h2>
        <span>12 Heavy STS gantry cranes distributed along Quays A, B, and C.</span>
      </section>

      <div className="cranes-grid">
        {cranes.map((c) => (
          <div className={`crane-card ${c.status}`} key={c.id}>
            <div className="crane-header">
              <span className="crane-icon">
                <Cpu size={16} />
              </span>
              <div>
                <b>{c.id}</b>
                <small>Assigned to Berth {c.berth_id}</small>
              </div>
              <span className={`crane-status-pill status-${c.status}`}>{c.status}</span>
            </div>

            <div className="crane-details">
              <div className="crane-stat">
                <small>HANDLING RATE</small>
                <b>{c.moves_per_hour} moves/hr</b>
              </div>
              <div className="crane-stat">
                <small>OPERATOR GANG</small>
                <b>{c.operator_gang || 'Standby'}</b>
              </div>
              <div className="crane-stat">
                <small>EFFICIENCY</small>
                <b>{c.efficiency_pct}%</b>
              </div>
              <div className="crane-stat">
                <small>NEXT SERVICE</small>
                <span>{c.next_maintenance}</span>
              </div>
            </div>

            {c.assigned_vessel_name && (
              <div className="crane-assigned-vessel">
                <small>WORKING ON:</small>
                <span>{c.assigned_vessel_name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
