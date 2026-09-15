import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronDown, RadioTower } from 'lucide-react'

export function TerminalSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTerminal, setSelectedTerminal] = useState({
    id: 'T1',
    name: 'North Harbor · T1',
    type: 'Deepwater Container Hub',
    berths: '8 Berths · 12 Cranes',
    status: 'Operational',
  })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const terminals = [
    {
      id: 'T1',
      name: 'North Harbor · T1',
      type: 'Deepwater Container Hub',
      berths: '8 Berths · 12 Cranes',
      status: 'Operational',
    },
    {
      id: 'T2',
      name: 'South Basin · T2',
      type: 'Regional Feeder Dock',
      berths: '4 Berths · 6 Cranes',
      status: 'Connected',
    },
    {
      id: 'T3',
      name: 'East Gateway Intermodal',
      type: 'Automated Rail Terminal',
      berths: '6 Railhead Tracks',
      status: 'Standby',
    },
  ]

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

  const handleSelect = (t: typeof terminals[0]) => {
    setSelectedTerminal(t)
    setIsOpen(false)
  }

  return (
    <div className="terminal-selector-container" ref={dropdownRef}>
      <div
        className={`port-selector clickable ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Select Active Terminal"
      >
        <RadioTower size={17} />
        <div>
          <small>ACTIVE TERMINAL</small>
          <b>{selectedTerminal.name}</b>
        </div>
        <ChevronDown
          size={15}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </div>

      {isOpen && (
        <div className="terminal-flyout">
          <div className="terminal-flyout-header">
            <small>SELECT OPERATING TERMINAL</small>
            <b>Port Logistics Network</b>
          </div>

          <div className="terminal-flyout-list">
            {terminals.map((t) => (
              <div
                key={t.id}
                className={`terminal-option ${t.id === selectedTerminal.id ? 'current' : ''}`}
                onClick={() => handleSelect(t)}
              >
                <div className="terminal-option-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <b>{t.name}</b>
                    <span className="terminal-badge">{t.status}</span>
                  </div>
                  <small>{t.type} · {t.berths}</small>
                </div>
                {t.id === selectedTerminal.id && (
                  <CheckCircle2 size={15} color="#19c3df" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
