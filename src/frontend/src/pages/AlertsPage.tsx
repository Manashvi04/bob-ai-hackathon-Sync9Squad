import { useEffect, useState } from 'react'
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { api, OperationalAlert } from '../services/api'

export function AlertsPage() {
  const [alerts, setAlerts] = useState<OperationalAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState('All')
  const [activeOnly, setActiveOnly] = useState(false)
  const [resolving, setResolving] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const data = await api.getAlerts(activeOnly)
      setAlerts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [activeOnly])

  const handleResolve = async (id: string) => {
    try {
      setResolving(id)
      await api.resolveAlert(id)
      setToast(`Alert ${id} marked as resolved. Operations log updated.`)
      loadAlerts()
    } catch (err) {
      alert('Error resolving alert: ' + err)
    } finally {
      setResolving(null)
    }
  }

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== 'All' && a.severity.toLowerCase() !== filterSeverity.toLowerCase()) {
      return false
    }
    return true
  })

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.is_resolved).length
  const highCount = alerts.filter((a) => a.severity === 'high' && !a.is_resolved).length

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p>RISK RADAR & INCIDENT TRIAGE</p>
          <h1>Operational Alerts & Warnings</h1>
          <span>
            Real-time monitoring of quayside bottlenecks, yard capacity warnings, equipment anomalies, and tidal/weather restrictions.
          </span>
        </div>
        <button className="secondary-button" onClick={loadAlerts}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Refresh Alerts
        </button>
      </section>

      {/* KPI Stats */}
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon red">
            <AlertOctagon size={22} />
          </div>
          <div>
            <p>CRITICAL RISKS</p>
            <strong style={{ color: '#ef4444' }}>{criticalCount} Active</strong>
            <span>Immediate supervisor triage</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon amber">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p>HIGH SEVERITY</p>
            <strong style={{ color: '#f59e0b' }}>{highCount} Active</strong>
            <span>Actionable within 2 hours</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon blue">
            <Bell size={22} />
          </div>
          <div>
            <p>TOTAL LOGGED</p>
            <strong>{alerts.length} Warnings</strong>
            <span>Across all terminal zones</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p>RESOLVED ACTIONS</p>
            <strong style={{ color: '#10b981' }}>{alerts.filter((a) => a.is_resolved).length} Resolved</strong>
            <span>Verified in TOS log</span>
          </div>
        </article>
      </section>

      {toast && (
        <div className="alert-banner healthy-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#10b981" />
            <span>{toast}</span>
          </div>
          <button className="close-btn" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              className={`filter-pill-btn ${filterSeverity === sev ? 'active' : ''}`}
              onClick={() => setFilterSeverity(sev)}
            >
              {sev}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c4d7e5', fontSize: '0.88rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
            Show Active Only
          </label>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="alerts-feed">
        {filtered.length === 0 ? (
          <div className="empty-state-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <CheckCircle2 size={36} color="#10b981" />
            <h3 style={{ marginTop: '0.75rem' }}>No Alerts Found</h3>
            <p style={{ color: '#829db5' }}>All systems within acceptable operational tolerances.</p>
          </div>
        ) : (
          filtered.map((alert) => (
            <article className={`alert-card-row sev-${alert.severity} ${alert.is_resolved ? 'resolved' : ''}`} key={alert.id}>
              <div className="alert-icon-col">
                {alert.severity === 'critical' ? (
                  <AlertOctagon size={24} color="#ef4444" />
                ) : alert.severity === 'high' ? (
                  <AlertTriangle size={24} color="#f59e0b" />
                ) : (
                  <Info size={24} color="#3b82f6" />
                )}
              </div>

              <div className="alert-content-col">
                <div className="alert-row-top">
                  <div>
                    <b>{alert.title}</b>
                    <small style={{ marginLeft: '0.5rem', color: '#829db5' }}>
                      {alert.timestamp.replace('T', ' ').slice(0, 16)} · Resource: <b>{alert.resource_id}</b>
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="category-tag">{alert.category}</span>
                    <span className={`severity-tag sev-${alert.severity}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="alert-description">{alert.description}</p>

                <div className="alert-action-box">
                  <small>RECOMMENDED OPERATIONAL ACTION:</small>
                  <p>{alert.recommended_action}</p>
                </div>
              </div>

              <div className="alert-actions-col">
                {alert.is_resolved ? (
                  <span className="resolved-stamp">
                    <CheckCircle2 size={16} /> RESOLVED
                  </span>
                ) : (
                  <button
                    className="resolve-btn"
                    onClick={() => handleResolve(alert.id)}
                    disabled={resolving === alert.id}
                  >
                    <Sparkles size={14} />
                    {resolving === alert.id ? 'Resolving...' : 'Execute & Resolve'}
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
