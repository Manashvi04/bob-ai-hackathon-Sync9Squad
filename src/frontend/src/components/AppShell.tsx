import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Anchor,
  Bell,
  Bot,
  CalendarClock,
  ChartNoAxesCombined,
  ChevronDown,
  Container,
  LayoutDashboard,
  Menu,
  Moon,
  RadioTower,
  Route,
  Ship,
  Sparkles,
  Sun,
  Warehouse,
  X,
} from 'lucide-react'
import { BobAssistantModal } from './BobAssistantModal'
import { NotificationDropdown } from './NotificationDropdown'
import { ProfileDropdown } from './ProfileDropdown'
import { TerminalSelector } from './TerminalSelector'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Vessels', to: '/vessels', icon: Ship },
  { label: 'Congestion', to: '/congestion', icon: ChartNoAxesCombined },
  { label: 'Berths & Cranes', to: '/berths-cranes', icon: Container },
  { label: 'Yard', to: '/yard', icon: Warehouse },
  { label: 'Routing', to: '/routing', icon: Route },
  { label: '72-Hour Plan', to: '/72-hour-plan', icon: CalendarClock },
  { label: 'Alerts', to: '/alerts', icon: Bell, badge: '5' },
]

export function AppShell() {
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [bobOpen, setBobOpen] = useState(false)
  const [alertsCount, setAlertsCount] = useState(5)
  const location = useLocation()
  const current = navigation.find((item) => item.to === location.pathname)?.label ?? 'Dashboard'

  useEffect(() => {
    api.getSummary()
      .then((s) => setAlertsCount(s.active_alerts_count))
      .catch(() => {})
  }, [location.pathname])

  return (
    <div className="app-shell">
      {open && <button className="scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">
            <Anchor size={22} />
          </span>
          <div>
            <strong>
              PORT<span>FLOW</span>
            </strong>
            <small>AI OPERATIONS OPTIMISER</small>
          </div>
          <button className="mobile-close" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>

        <TerminalSelector />

        {/* AI Copilot Quick Launcher in Sidebar */}
        <div className="sidebar-copilot-card" onClick={() => setBobOpen(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="bob-glow-avatar">
              <Bot size={18} />
            </span>
            <div>
              <b>IBM Bob Copilot</b>
              <small>Port Operations AI</small>
            </div>
          </div>
          <Sparkles size={14} color="#19c3df" />
        </div>

        <nav aria-label="Primary navigation">
          <p>OPERATIONS COMMAND</p>
          {navigation.map(({ label, to, icon: Icon, badge }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>
              <Icon size={19} />
              <span>{label}</span>
              {badge && <em>{to === '/alerts' ? alertsCount : badge}</em>}
            </NavLink>
          ))}
        </nav>

        <div className="system-card">
          <div>
            <span className="pulse" />
            <small>SYSTEM STATUS</small>
          </div>
          <strong>Live Optimiser Active</strong>
          <p>229 vessels synchronized</p>
        </div>

        <ProfileDropdown />
      </aside>

      <main>
        <header className="topbar">
          <button className="menu-button" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <small>PORT OPERATIONS COMMAND /</small>
            <b>{current}</b>
          </div>
          <div className="top-actions">
            {/* Ask IBM Bob Button */}
            <button className="topbar-bob-btn" onClick={() => setBobOpen(true)}>
              <Bot size={17} />
              <span>Ask IBM Bob</span>
            </button>

            <span className="live">
              <i />
              LIVE
            </span>
            <div className="theme-toggle-group" role="group" aria-label="Appearance Mode">
              <button
                type="button"
                className={`theme-toggle-segment ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => theme !== 'dark' && toggleTheme()}
                title="Switch to Dark Mode"
              >
                <Moon size={14} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                className={`theme-toggle-segment ${theme === 'light' ? 'active' : ''}`}
                onClick={() => theme !== 'light' && toggleTheme()}
                title="Switch to Light Mode"
              >
                <Sun size={14} />
                <span>Light</span>
              </button>
            </div>

            <NotificationDropdown
              alertsCount={alertsCount}
              onAlertsChange={(count) => setAlertsCount(count)}
            />
          </div>
        </header>

        <Outlet />

        {/* Floating IBM Bob Trigger */}
        <button
          className="floating-bob-btn"
          onClick={() => setBobOpen(true)}
          title="Open IBM Bob Port AI Copilot"
        >
          <Bot size={22} />
          <span className="pulse-ping" />
        </button>

        {/* IBM Bob Copilot Modal */}
        <BobAssistantModal isOpen={bobOpen} onClose={() => setBobOpen(false)} />
      </main>
    </div>
  )
}
