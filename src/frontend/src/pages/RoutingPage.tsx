import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Fuel,
  Leaf,
  Navigation,
  RefreshCw,
  Route,
  Ship,
  Sparkles,
} from 'lucide-react'
import { api, RoutingRecommendation, RoutingResponse } from '../services/api'

export function RoutingPage() {
  const [data, setData] = useState<RoutingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadRouting = async () => {
    try {
      setLoading(true)
      const res = await api.getRouting()
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRouting()
  }, [])

  const handleApply = async (rec: RoutingRecommendation) => {
    try {
      setApplying(rec.id)
      await api.applyRouting(rec.id)
      setToastMessage(`Successfully executed ${rec.strategy_type} for ${rec.vessel_name}. Vessel schedule and 72-hour operations plan have been updated.`)
      loadRouting()
    } catch (err) {
      alert('Error applying recommendation: ' + err)
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p>GREEN MARITIME & RESILIENT LOGISTICS</p>
          <h1>Alternate Routing & Rescheduling</h1>
          <span>
            AI-driven Virtual Arrival protocols, berth window swapping, and slow-steaming speed reductions to eliminate port anchorage delays while saving bunker fuel.
          </span>
        </div>
        <button className="secondary-button" onClick={loadRouting}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Refresh Strategies
        </button>
      </section>

      {/* Environmental & Financial Impact Strip */}
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon green">
            <Fuel size={22} />
          </div>
          <div>
            <p>PROJECTED BUNKER FUEL SAVED</p>
            <strong style={{ color: '#10b981' }}>{data?.total_fuel_saved_tons ?? 63.0} Metric Tons</strong>
            <span>Via speed optimization</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon cyan">
            <Leaf size={22} />
          </div>
          <div>
            <p>CO2 EMISSIONS MITIGATED</p>
            <strong style={{ color: '#19c3df' }}>{data?.total_co2_reduction_tons ?? 197.0} Tons CO2</strong>
            <span>IMO Decarbonization alignment</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon amber">
            <DollarSign size={22} />
          </div>
          <div>
            <p>ESTIMATED OPERATIONAL SAVINGS</p>
            <strong style={{ color: '#f59e0b' }}>${data?.total_cost_savings_usd.toLocaleString() ?? '40,945'}</strong>
            <span>Bunker & anchorage fees</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon blue">
            <Compass size={22} />
          </div>
          <div>
            <p>ACTIVE STRATEGIES</p>
            <strong>{data?.recommendations.length ?? 5} Candidate Calls</strong>
            <span>Virtual Arrival & Berth Swaps</span>
          </div>
        </article>
      </section>

      {toastMessage && (
        <div className="alert-banner healthy-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
          <button className="close-btn" onClick={() => setToastMessage(null)}>
            ×
          </button>
        </div>
      )}

      {/* Educational Concept Card */}
      <div className="concept-card">
        <div className="concept-icon">
          <Route size={26} color="#19c3df" />
        </div>
        <div>
          <h3>How Virtual Arrival Reduces Port Congestion</h3>
          <p>
            Instead of vessels speeding across the ocean only to sit idle for hours or days at the outer anchorage queue burning expensive marine gas oil (MGO),
            PortFlowAI calculates the exact just-in-time berth availability. Vessels are advised to slow steam by 2–3 knots, arriving exactly when the berth is cleared.
          </p>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <section className="section-title">
        <h2>Active Rescheduling & Routing Proposals</h2>
        <span>Review candidate calls and apply recommendations to update live terminal scheduling.</span>
      </section>

      <div className="recommendations-list">
        {(data?.recommendations ?? []).map((rec) => (
          <article className={`rec-card ${rec.status}`} key={rec.id}>
            <div className="rec-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="vessel-mark">
                  <Ship size={18} />
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <b>{rec.vessel_name}</b>
                    <span className="carrier-pill">{rec.carrier}</span>
                  </div>
                  <small style={{ color: '#829db5' }}>Status: {rec.current_status}</small>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className={`strategy-pill strat-${rec.strategy_type.toLowerCase().replace(' ', '-')}`}>
                  {rec.strategy_type}
                </span>
                <span className={`rec-status-tag tag-${rec.status}`}>
                  {rec.status === 'applied' ? 'Active / Applied' : 'Pending Review'}
                </span>
              </div>
            </div>

            <div className="rec-card-body">
              <div className="rec-meta-grid">
                <div className="rec-meta-item">
                  <small>ORIGINAL ETA</small>
                  <span>{rec.original_eta.replace('T', ' ').slice(0, 16)}</span>
                </div>
                <div className="rec-meta-item">
                  <small>RECOMMENDED ETA</small>
                  <b style={{ color: '#19c3df' }}>{rec.recommended_eta.replace('T', ' ').slice(0, 16)}</b>
                </div>
                <div className="rec-meta-item">
                  <small>TARGET BERTH WINDOW</small>
                  <span>{rec.berth_window}</span>
                </div>
                <div className="rec-meta-item">
                  <small>DELAY MITIGATED</small>
                  <b style={{ color: '#10b981' }}>-{rec.delay_hours_mitigated} Hours</b>
                </div>
              </div>

              <div className="rec-rationale">
                <small>OPERATIONAL RATIONALE:</small>
                <p>{rec.rationale}</p>
              </div>

              <div className="rec-impact-strip">
                <div>
                  <span>Bunker Fuel Saved:</span> <b>{rec.fuel_saved_tons} MT</b>
                </div>
                <div>
                  <span>CO2 Avoided:</span> <b>{rec.co2_reduction_tons} Tons</b>
                </div>
                <div>
                  <span>Cost Saved:</span> <b>${rec.cost_savings_usd.toLocaleString()}</b>
                </div>
              </div>
            </div>

            <div className="rec-card-footer">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#70869a', fontSize: '0.85rem' }}>
                <Clock size={14} />
                <span>Decision required before 16:00 UTC</span>
              </div>

              {rec.status === 'applied' ? (
                <span className="healthy">
                  <CheckCircle2 size={16} /> Strategy Enforced in TOS
                </span>
              ) : (
                <button
                  className="primary-button"
                  onClick={() => handleApply(rec)}
                  disabled={applying === rec.id}
                >
                  <Sparkles size={15} />
                  {applying === rec.id ? 'Applying to TOS...' : rec.action_label}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
