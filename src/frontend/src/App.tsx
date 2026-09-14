import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Dashboard } from './pages/Dashboard'
import { PlaceholderPage } from './pages/PlaceholderPage'

const pages = [
  ['vessels', 'Vessel Schedule Management', 'Coordinate arrivals, departures and service windows.'],
  ['congestion', 'Congestion Intelligence', 'Forecast terminal pressure and emerging operational hotspots.'],
  ['berths-cranes', 'Berths & Cranes', 'Optimise assignments across berths, cranes and vessel calls.'],
  ['yard', 'Yard Capacity', 'Monitor yard zones, dwell time and resource utilisation.'],
  ['routing', 'Alternate Routing', 'Review resilient routing recommendations and trade-offs.'],
  ['72-hour-plan', '72-Hour Operations Plan', 'Build a shift-ready execution plan for the next 72 hours.'],
  ['alerts', 'Operational Alerts', 'Triage active risks and time-sensitive interventions.'],
] as const

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        {pages.map(([path, title, description]) => (
          <Route key={path} path={path} element={<PlaceholderPage title={title} description={description} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
