import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Anchor, Bell, Boxes, CalendarClock, ChartNoAxesCombined, ChevronDown, Container, LayoutDashboard, Menu, RadioTower, Route, Ship, Warehouse, X } from 'lucide-react'

const navigation = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Vessels', to: '/vessels', icon: Ship },
  { label: 'Congestion', to: '/congestion', icon: ChartNoAxesCombined },
  { label: 'Berths & Cranes', to: '/berths-cranes', icon: Container },
  { label: 'Yard', to: '/yard', icon: Warehouse },
  { label: 'Routing', to: '/routing', icon: Route },
  { label: '72-Hour Plan', to: '/72-hour-plan', icon: CalendarClock },
  { label: 'Alerts', to: '/alerts', icon: Bell, badge: '3' },
]

export function AppShell() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const current = navigation.find((item) => item.to === location.pathname)?.label ?? 'Dashboard'

  return <div className="app-shell">
    {open && <button className="scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Anchor size={22} /></span><div><strong>PORT<span>OPS</span></strong><small>COMMAND CENTER</small></div><button className="mobile-close" onClick={() => setOpen(false)}><X /></button></div>
      <div className="port-selector"><RadioTower size={17}/><div><small>ACTIVE TERMINAL</small><b>North Harbor · T1</b></div><ChevronDown size={15}/></div>
      <nav aria-label="Primary navigation"><p>OPERATIONS</p>{navigation.map(({ label, to, icon: Icon, badge }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}><Icon size={19}/><span>{label}</span>{badge && <em>{badge}</em>}</NavLink>)}</nav>
      <div className="system-card"><div><span className="pulse"/><small>SYSTEM STATUS</small></div><strong>All systems operational</strong><p>Last sync · 2 min ago</p></div>
      <div className="profile"><span>AS</span><div><b>Alex Singh</b><small>Shift Supervisor</small></div><ChevronDown size={16}/></div>
    </aside>
    <main>
      <header className="topbar"><button className="menu-button" onClick={() => setOpen(true)}><Menu/></button><div><small>PORT OPERATIONS /</small><b>{current}</b></div><div className="top-actions"><span className="live"><i/>LIVE</span><span className="clock">MON, 14 SEP · 14:32 UTC</span><button aria-label="Notifications"><Bell size={19}/><i>3</i></button></div></header>
      <Outlet />
    </main>
  </div>
}
