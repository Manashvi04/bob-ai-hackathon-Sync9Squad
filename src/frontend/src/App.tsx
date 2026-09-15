import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Dashboard } from './pages/Dashboard'
import { VesselsPage } from './pages/VesselsPage'
import { CongestionPage } from './pages/CongestionPage'
import { BerthsCranesPage } from './pages/BerthsCranesPage'
import { YardPage } from './pages/YardPage'
import { RoutingPage } from './pages/RoutingPage'
import { PlanPage } from './pages/PlanPage'
import { AlertsPage } from './pages/AlertsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="vessels" element={<VesselsPage />} />
        <Route path="congestion" element={<CongestionPage />} />
        <Route path="berths-cranes" element={<BerthsCranesPage />} />
        <Route path="yard" element={<YardPage />} />
        <Route path="routing" element={<RoutingPage />} />
        <Route path="72-hour-plan" element={<PlanPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
