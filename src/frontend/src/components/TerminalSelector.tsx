import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronDown, RadioTower } from 'lucide-react'
import { useTerminal } from '../context/TerminalContext'

export function TerminalSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { terminal, setTerminal, terminalsList } = useTerminal()
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const handleSelect = (t: typeof terminalsList[0]) => {
    setTerminal(t)
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
          <b>{terminal.name}</b>
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
            {terminalsList.map((t) => (
              <div
                key={t.id}
                className={`terminal-option ${t.id === terminal.id ? 'current' : ''}`}
                onClick={() => handleSelect(t)}
              >
                <div className="terminal-option-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <b>{t.name}</b>
                    <span className="terminal-badge">{t.status}</span>
                  </div>
                  <small>{t.type} · {t.berths}</small>
                </div>
                {t.id === terminal.id && (
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
