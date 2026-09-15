import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ExternalLink,
  Info,
  Sparkles,
  X,
} from 'lucide-react'
import { api, OperationalAlert } from '../services/api'

interface Props {
  alertsCount: number
  onAlertsChange?: (count: number) => void
}

export function NotificationDropdown({ alertsCount, onAlertsChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [alerts, setAlerts] = useState<OperationalAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const loadActiveAlerts = async () => {
    try {
      setLoading(true)
      const data = await api.getAlerts(true)
      setAlerts(data)
      if (onAlertsChange) onAlertsChange(data.length)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadActiveAlerts()
    }
  }, [isOpen])

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleResolve = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setResolvingId(id)
      await api.resolveAlert(id)
      const remaining = alerts.filter((a) => a.id !== id)
      setAlerts(remaining)
      if (onAlertsChange) onAlertsChange(remaining.length)
    } catch (err) {
      alert('Error resolving alert: ' + err)
    } finally {
      setResolvingId(null)
    }
  }

  const handleResolveAll = async () => {
    try {
      for (const a of alerts) {
        await api.resolveAlert(a.id)
      }
      setAlerts([])
      if (onAlertsChange) onAlertsChange(0)
    } catch (err) {
      alert('Error resolving all alerts: ' + err)
    }
  }

  return (
    <div className="notif-dropdown-container" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        className={`top-alert-btn ${isOpen ? 'active' : ''}`}
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        title="View Notifications"
      >
        <Bell size={19} />
        {alertsCount > 0 && <i>{alertsCount}</i>}
      </button>

      {/* Popover Flyout */}
      {isOpen && (
        <div className="notif-flyout">
          <div className="notif-flyout-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} color="#19c3df" />
              <b>Operational Notifications</b>
              <span className="notif-count-chip">{alerts.length} active</span>
            </div>
            {alerts.length > 0 && (
              <button className="mark-all-btn" onClick={handleResolveAll} title="Resolve all active alerts">
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-flyout-body">
            {loading ? (
              <div className="notif-empty-state">
                <small>Checking active alerts...</small>
              </div>
            ) : alerts.length === 0 ? (
              <div className="notif-empty-state">
                <CheckCircle2 size={24} color="#10b981" />
                <p>All operational alerts resolved!</p>
                <small>Terminal functioning within normal tolerances.</small>
              </div>
            ) : (
              alerts.map((a) => (
                <div className={`notif-item sev-${a.severity}`} key={a.id}>
                  <div className="notif-item-icon">
                    {a.severity === 'critical' ? (
                      <AlertOctagon size={16} color="#ef4444" />
                    ) : a.severity === 'high' ? (
                      <AlertTriangle size={16} color="#f59e0b" />
                    ) : (
                      <Info size={16} color="#38bdf8" />
                    )}
                  </div>
                  <div className="notif-item-content">
                    <div className="notif-item-title">
                      <b>{a.title}</b>
                      <span className={`severity-tag sev-${a.severity}`}>{a.severity.toUpperCase()}</span>
                    </div>
                    <p>{a.description}</p>
                    <div className="notif-item-footer">
                      <small>{a.timestamp.replace('T', ' ').slice(0, 16)} · {a.category}</small>
                      <button
                        className="notif-resolve-link"
                        onClick={(e) => handleResolve(a.id, e)}
                        disabled={resolvingId === a.id}
                      >
                        <CheckCircle2 size={12} />
                        {resolvingId === a.id ? 'Resolving...' : 'Resolve'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notif-flyout-footer">
            <Link to="/alerts" onClick={() => setIsOpen(false)}>
              <span>View Full Alerts Center</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
