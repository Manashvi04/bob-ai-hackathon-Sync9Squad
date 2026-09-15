import { useEffect, useRef, useState } from 'react'
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  LogOut,
  Radio,
  Settings,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react'

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentSupervisor, setCurrentSupervisor] = useState({
    name: 'Alex Singh',
    role: 'Lead Shift Supervisor',
    id: 'SUP-804',
    shift: 'Shift B (14:00 – 22:00 UTC)',
    terminal: 'North Harbor · T1',
    status: 'On Active Duty',
  })
  const [showHandoverModal, setShowHandoverModal] = useState(false)
  const [handoverSuccess, setHandoverSuccess] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const supervisorsList = [
    { name: 'Alex Singh', role: 'Lead Shift Supervisor', shift: 'Shift B (14:00 – 22:00)' },
    { name: 'Elena Rostova', role: 'Quayside Operations Lead', shift: 'Shift A (06:00 – 14:00)' },
    { name: 'Marcus Vance', role: 'Yard & Intermodal Rail Lead', shift: 'Shift C (22:00 – 06:00)' },
    { name: 'David Chen', role: 'Harbour Master Liaison', shift: 'Shift B (14:00 – 22:00)' },
  ]

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  const handleSelectSupervisor = (sup: typeof supervisorsList[0]) => {
    setCurrentSupervisor((prev) => ({
      ...prev,
      name: sup.name,
      role: sup.role,
      shift: sup.shift,
    }))
    setIsOpen(false)
  }

  const handleCompleteHandover = () => {
    setHandoverSuccess(true)
    setTimeout(() => {
      setHandoverSuccess(false)
      setShowHandoverModal(false)
      setIsOpen(false)
    }, 1500)
  }

  return (
    <div className="profile-container" ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        className={`profile clickable ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Supervisor Profile & Shift Handover"
      >
        <span>
          {currentSupervisor.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </span>
        <div>
          <b>{currentSupervisor.name}</b>
          <small>{currentSupervisor.role}</small>
        </div>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </div>

      {/* Popover Flyout */}
      {isOpen && (
        <div className="profile-flyout">
          <div className="profile-flyout-header">
            <div className="profile-flyout-avatar">
              <span>
                {currentSupervisor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
            <div>
              <b>{currentSupervisor.name}</b>
              <small>{currentSupervisor.role}</small>
              <span className="duty-tag">
                <span className="live-dot" /> {currentSupervisor.status}
              </span>
            </div>
          </div>

          <div className="profile-flyout-body">
            <div className="profile-info-grid">
              <div>
                <small>SUPERVISOR ID</small>
                <span>{currentSupervisor.id}</span>
              </div>
              <div>
                <small>CURRENT SHIFT</small>
                <span style={{ color: '#19c3df' }}>{currentSupervisor.shift}</span>
              </div>
              <div>
                <small>ASSIGNED QUAYS</small>
                <span>Berths A1 – C3</span>
              </div>
              <div>
                <small>RADIO CHANNEL</small>
                <span>VHF Channel 12</span>
              </div>
            </div>

            <div className="profile-menu-section">
              <small>SHIFT ACTIONS</small>
              <button
                className="profile-menu-item"
                onClick={() => {
                  setIsOpen(false)
                  setShowHandoverModal(true)
                }}
              >
                <FileText size={15} color="#19c3df" />
                <span>Shift Handover Briefing</span>
              </button>

              <button
                className="profile-menu-item"
                onClick={() => {
                  alert(`Broadcast sent to all quayside and yard crane gangs on VHF 12.`)
                  setIsOpen(false)
                }}
              >
                <Radio size={15} color="#f59e0b" />
                <span>Broadcast All-Gangs Notice</span>
              </button>
            </div>

            <div className="profile-menu-section">
              <small>SWITCH OPERATOR</small>
              {supervisorsList.map((sup) => (
                <div
                  key={sup.name}
                  className={`supervisor-switch-item ${sup.name === currentSupervisor.name ? 'current' : ''}`}
                  onClick={() => handleSelectSupervisor(sup)}
                >
                  <div>
                    <b>{sup.name}</b>
                    <small>{sup.role} · {sup.shift}</small>
                  </div>
                  {sup.name === currentSupervisor.name && (
                    <CheckCircle2 size={15} color="#10b981" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="profile-flyout-footer">
            <button
              className="sign-out-btn"
              onClick={() => {
                alert('Operator session locked. Refresh to log back in.')
                setIsOpen(false)
              }}
            >
              <LogOut size={14} />
              <span>Lock Terminal Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Shift Handover Modal */}
      {showHandoverModal && (
        <div className="modal-backdrop" onClick={() => setShowHandoverModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#19c3df" />
                <h3>Shift Handover Protocol · Shift B to Shift C</h3>
              </div>
              <button className="close-btn" onClick={() => setShowHandoverModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {handoverSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <CheckCircle2 size={42} color="#10b981" />
                  <h3 style={{ marginTop: '10px' }}>Handover Protocol Completed</h3>
                  <p style={{ color: '#829db5' }}>
                    TOS verification logged. Shift C supervisor Marcus Vance notified.
                  </p>
                </div>
              ) : (
                <>
                  <div className="metric-row">
                    <div className="metric-box">
                      <small>OUTGOING LEAD</small>
                      <b>Alex Singh</b>
                    </div>
                    <div className="metric-box">
                      <small>INCOMING RELIEF</small>
                      <b>Marcus Vance</b>
                    </div>
                  </div>

                  <div className="spec-grid" style={{ margin: '14px 0', fontSize: '12px' }}>
                    <div><span>Berths Working:</span> <b>6 of 8 active</b></div>
                    <div><span>Quayside Moves:</span> <b>5,920 TEU completed</b></div>
                    <div><span>Yard Hotspots:</span> <b>Zone Y-04 rebalanced (81%)</b></div>
                    <div><span>Equipment Status:</span> <b>QC-07 in servicing</b></div>
                  </div>

                  <div className="recommendation-callout">
                    <small>HANDOVER BRIEFING MEMO</small>
                    <p>
                      - High tide at 23:40; deep-draft vessel <i>CMA CGM Palais Royal</i> scheduled for Berth B3.<br />
                      - Rail wagon intermodal block arrives at 01:00 on Tracks 3 & 4.<br />
                      - All 14 automated alerts reviewed and prioritized.
                    </p>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="secondary-button" onClick={() => setShowHandoverModal(false)}>
                      Cancel
                    </button>
                    <button className="primary-button" onClick={handleCompleteHandover}>
                      <CheckCircle2 size={16} /> Sign & Execute Handover
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
