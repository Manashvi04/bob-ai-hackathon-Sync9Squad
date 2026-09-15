import { useEffect, useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CloudRain,
  Flame,
  Layers,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api, CongestionForecast, HotspotZone, HourlyCongestion } from '../services/api'

export function CongestionPage() {
  const [forecast, setForecast] = useState<CongestionForecast | null>(null)
  const [loading, setLoading] = useState(true)

  // What-If Simulator State
  const [surgePct, setSurgePct] = useState(15)
  const [craneEff, setCraneEff] = useState(85)
  const [badWeather, setBadWeather] = useState(false)
  const [dwellMult, setDwellMult] = useState(1.2)
  const [simResult, setSimResult] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)

  const loadForecast = async () => {
    try {
      setLoading(true)
      const data = await api.getCongestionForecast()
      setForecast(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForecast()
  }, [])

  const handleSimulate = async () => {
    try {
      setSimulating(true)
      const res = await api.simulateCongestion({
        arrival_surge_pct: surgePct,
        crane_efficiency_pct: craneEff,
        adverse_weather: badWeather,
        yard_dwell_multiplier: dwellMult,
      })
      setSimResult(res)
    } catch (err) {
      alert('Simulation error: ' + err)
    } finally {
      setSimulating(false)
    }
  }

  const activePoints: HourlyCongestion[] =
    simResult?.simulated_hourly_forecast ?? forecast?.forecast_points ?? []

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p>ARTIFICIAL INTELLIGENCE & TERMINAL DYNAMICS</p>
          <h1>Congestion Intelligence & Hotspots</h1>
          <span>
            Scikit-learn random forest regressor forecasting quayside bottlenecks, yard pressure, and arrival surges across 72 hours.
          </span>
        </div>
        <button className="secondary-button" onClick={loadForecast}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Refresh Intelligence
        </button>
      </section>

      {/* Primary KPI Strip */}
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon red">
            <Flame size={22} />
          </div>
          <div>
            <p>PEAK CONGESTION INDEX</p>
            <strong style={{ color: '#ef4444' }}>
              {simResult ? `${simResult.simulated_congestion_score}` : `${forecast?.peak_forecast_index ?? 91.0}`} / 100
            </strong>
            <span>{simResult ? simResult.peak_congestion_time : `${forecast?.peak_forecast_time ?? '18:00 Tonight'} (Critical)`}</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon cyan">
            <Activity size={22} />
          </div>
          <div>
            <p>CURRENT TERMINAL INDEX</p>
            <strong>{forecast?.current_index ?? 68.4} / 100</strong>
            <span>{forecast?.status ?? 'Elevated Risk'}</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon amber">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p>ACTIVE HOTSPOTS</p>
            <strong>{forecast?.hotspots.length ?? 4} Zones</strong>
            <span>Berth B3 & Yard Block Y-04</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon blue">
            <Layers size={22} />
          </div>
          <div>
            <p>WHAT-IF SIMULATION DELTA</p>
            <strong>{simResult ? `+${simResult.delta_pct}%` : 'Baseline'}</strong>
            <span>{simResult ? `${simResult.vessels_delayed_count} vessels affected` : 'Configure sliders below'}</span>
          </div>
        </article>
      </section>

      {/* 72-Hour Interactive Chart Section */}
      <article className="panel chart-container-panel">
        <div className="panel-title">
          <div>
            <small>MULTI-VARIABLE TIME SERIES</small>
            <h2>
              72-Hour Congestion Forecast Curve {simResult && <span className="badge-pill warn-pill">Simulated Scenario Active</span>}
            </h2>
          </div>
          {simResult && (
            <button className="secondary-button" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setSimResult(null)}>
              Reset to Baseline
            </button>
          )}
        </div>

        <div style={{ width: '100%', height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activePoints} margin={{ top: 20, right: 20, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#19c3df" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#19c3df" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="yardGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
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
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Area type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" fill="none" name="Critical Threshold (85%)" />
              <Area type="monotone" dataKey="utilisation" stroke="#19c3df" strokeWidth={3} fill="url(#overallGrad)" name="Overall Congestion %" />
              <Area type="monotone" dataKey="berth_congestion" stroke="#3b82f6" strokeWidth={2} fill="none" name="Berth Occupancy %" />
              <Area type="monotone" dataKey="yard_pressure" stroke="#f59e0b" strokeWidth={2} fill="url(#yardGrad)" name="Yard Pressure %" />
              <Area type="monotone" dataKey="crane_demand" stroke="#a855f7" strokeWidth={1.5} fill="none" name="Crane Demand %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      {/* Grid: Simulator on Left, Hotspots on Right */}
      <div className="two-column-grid">
        {/* Interactive What-If Simulator Panel */}
        <article className="panel simulator-panel">
          <div className="panel-title">
            <div>
              <small>PROACTIVE SCENARIO PLANNING</small>
              <h2>What-If Congestion Simulator</h2>
            </div>
            <span className="badge-pill">
              <Sliders size={13} /> Real-Time Engine
            </span>
          </div>




          <p style={{ color: '#8aa3b9', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Stress test port operations by simulating weather anomalies, crane fleet downtime, and container arrival spikes.
          </p>

          <div className="slider-control">
            <div className="slider-header">
              <span>Arrival Surge Spike</span>
              <b>+{surgePct}%</b>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={surgePct}
              onChange={(e) => setSurgePct(Number(e.target.value))}
            />
            <small>Simulates unexpected bunched arrivals from upstream canal delays.</small>
          </div>

          <div className="slider-control">
            <div className="slider-header">
              <span>Quay Crane Fleet Availability</span>
              <b>{craneEff}%</b>
            </div>
            <input
              type="range"
              min="50"
              max="120"
              value={craneEff}
              onChange={(e) => setCraneEff(Number(e.target.value))}
            />
            <small>Drop below 100% to simulate unscheduled equipment maintenance.</small>
          </div>

          <div className="slider-control">
            <div className="slider-header">
              <span>Yard Dwell Time Multiplier</span>
              <b>{dwellMult}x</b>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.1"
              value={dwellMult}
              onChange={(e) => setDwellMult(Number(e.target.value))}
            />
            <small>Simulates customs inspection delays or rail wagon bottlenecks.</small>
          </div>

          <div className="checkbox-control">
            <label>
              <input
                type="checkbox"
                checked={badWeather}
                onChange={(e) => setBadWeather(e.target.checked)}
              />
              <span>
                <CloudRain size={16} /> Simulate Gale Winds (&gt; 35 kts) & Heavy Swell
              </span>
            </label>
          </div>

          <button
            className="primary-button full-width"
            onClick={handleSimulate}
            disabled={simulating}
          >
            <Sparkles size={16} />
            {simulating ? 'Computing ML Scenario...' : 'Run What-If Simulation'}
          </button>

          {simResult && (
            <div className="sim-result-box">
              <h4>Simulation Analysis:</h4>
              <p>
                Congestion score jumps from <b>{simResult.baseline_congestion_score}</b> to{' '}
                <b style={{ color: '#ef4444' }}>{simResult.simulated_congestion_score} (+{simResult.delta_pct}%)</b>.
              </p>
              <p>
                <b>{simResult.vessels_delayed_count} vessels</b> projected to experience delays (+{simResult.additional_delay_hours} hours total waiting time).
              </p>
              <div className="mitigation-list">
                <small>AUTOMATED MITIGATION STEPS:</small>
                {simResult.mitigation_steps.map((step: string, i: number) => (
                  <div key={i} className="mitigation-item">
                    <CheckCircle2 size={14} color="#10b981" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Hotspots Breakdown */}
        <article className="panel hotspots-panel">
          <div className="panel-title">
            <div>
              <small>RISK RADAR</small>
              <h2>Emerging Congestion Hotspots</h2>
            </div>
            <span className="badge-pill">4 Detected</span>
          </div>

          <div className="hotspots-list">
            {(forecast?.hotspots ?? []).map((h) => (
              <div className="hotspot-card" key={h.id}>
                <div className="hotspot-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`hotspot-dot dot-${h.severity}`} />
                    <b>{h.name}</b>
                  </div>
                  <span className={`severity-tag sev-${h.severity}`}>{h.severity.toUpperCase()}</span>
                </div>

                <div className="hotspot-meta">
                  <span>Current Load: <b>{h.current_load_pct}%</b></span>
                  <span>Peak Window: <b>{h.peak_time}</b></span>
                </div>

                <div className="hotspot-factors">
                  <small>ROOT CAUSES:</small>
                  <ul>
                    {h.contributing_factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="hotspot-action">
                  <small>RECOMMENDED ACTION:</small>
                  <p>{h.recommendation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Factor contribution breakdown */}
          <div className="factor-breakdown">
            <h3>Congestion Factor Contribution</h3>
            {Object.entries(forecast?.contributing_factors_summary ?? {
              'Berth Berth Occupancy': 42,
              'Yard Dwell Time Pressure': 28,
              'Quay Crane Fleet Availability': 18,
              'Arrival Schedule Clumping': 12,
            }).map(([name, pct]) => (
              <div className="factor-bar" key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>{name}</span>
                  <b>{pct}%</b>
                </div>
                <div className="progress">
                  <i style={{ width: `${pct}%`, background: '#19c3df' }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
