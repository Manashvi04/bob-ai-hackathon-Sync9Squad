const API_BASE = 'http://localhost:8000/api/v1'

export interface Vessel {
  id: string
  name: string
  imo: string
  call_sign: string
  flag: string
  carrier: string
  vessel_type: string
  teu_capacity: number
  length_overall_m: number
  beam_m: number
  draft_m: number
  inbound_teu: number
  outbound_teu: number
  total_moves: number
  eta: string
  etd: string
  actual_arrival?: string | null
  actual_departure?: string | null
  status: 'at_berth' | 'anchored' | 'scheduled' | 'departed' | 'delayed'
  assigned_berth?: string | null
  assigned_cranes: string[]
  congestion_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  delay_hours: number
  origin_port: string
  destination_port: string
  priority: string
  dwell_time_hours: number
  recommended_action?: string | null
  suggested_speed_knots?: number | null
}

export interface Berth {
  id: string
  name: string
  length_m: number
  max_draft_m: number
  max_teu_capacity: number
  compatible_vessel_types: string[]
  assigned_crane_ids: string[]
  current_vessel_id?: string | null
  current_vessel_name?: string | null
  status: string
  utilization_pct: number
  queue_count: number
  bollard_count: number
  hourly_rate_usd: number
}

export interface QuayCrane {
  id: string
  name: string
  berth_id: string
  moves_per_hour: number
  status: string
  assigned_vessel_id?: string | null
  assigned_vessel_name?: string | null
  hours_operated: number
  next_maintenance: string
  efficiency_pct: number
  operator_gang?: string | null
}

export interface YardZone {
  id: string
  name: string
  zone_type: string
  capacity_teu: number
  current_occupancy_teu: number
  utilization_pct: number
  avg_dwell_days: number
  risk_level: string
  assigned_rtgs: number
  reefer_plugs_total: number
  reefer_plugs_used: number
  hazmat_count: number
}

export interface HourlyCongestion {
  time: string
  hour_offset: number
  utilisation: number
  threshold: number
  berth_congestion: number
  yard_pressure: number
  crane_demand: number
  risk_level: string
  vessels_at_berth: number
  vessels_waiting: number
}

export interface HotspotZone {
  id: string
  name: string
  type: string
  severity: string
  current_load_pct: number
  peak_time: string
  contributing_factors: string[]
  recommendation: string
}

export interface CongestionForecast {
  current_index: number
  status: string
  peak_forecast_time: string
  peak_forecast_index: number
  forecast_points: HourlyCongestion[]
  hotspots: HotspotZone[]
  contributing_factors_summary: Record<string, number>
}

export interface BerthAssignment {
  vessel_id: string
  vessel_name: string
  carrier: string
  original_berth?: string | null
  optimized_berth: string
  allocated_cranes: string[]
  start_time: string
  end_time: string
  turnaround_hours: number
  waiting_time_saved_hours: number
  conflict_resolved: boolean
  draft_clearance_m: number
}

export interface OptimizationResult {
  total_vessels_optimized: number
  average_waiting_time_reduction_pct: number
  total_delay_hours_prevented: number
  berth_utilization_improvement_pct: number
  assignments: BerthAssignment[]
  unresolved_conflicts: string[]
  summary_notes: string
}

export interface ShiftTask {
  id: string
  time_window: string
  vessel_name: string
  berth_id: string
  action_type: string
  crane_gangs: string[]
  target_moves: number
  status: string
}

export interface ShiftPlan {
  shift_id: string
  day_label: string
  shift_label: string
  supervisor: string
  expected_moves_teu: number
  risk_level: string
  berth_occupancy_pct: number
  yard_gate_capacity_pct: number
  tasks: ShiftTask[]
  critical_checklist: string[]
}

export interface Plan72Hour {
  generated_at: string
  terminal_name: string
  shifts: ShiftPlan[]
  total_planned_moves: number
  high_risk_shifts_count: number
  summary: string
}

export interface OperationalAlert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  resource_id?: string | null
  timestamp: string
  recommended_action: string
  is_actionable: boolean
  is_resolved: boolean
}

export interface RoutingRecommendation {
  id: string
  vessel_id: string
  vessel_name: string
  carrier: string
  strategy_type: string
  current_status: string
  original_eta: string
  recommended_eta: string
  fuel_saved_tons: number
  co2_reduction_tons: number
  cost_savings_usd: number
  delay_hours_mitigated: number
  berth_window: string
  rationale: string
  action_label: string
  status: string
}

export interface RoutingResponse {
  total_fuel_saved_tons: number
  total_co2_reduction_tons: number
  total_cost_savings_usd: number
  high_impact_vessels_count: number
  recommendations: RoutingRecommendation[]
}

export interface TerminalSummary {
  terminal_name: string
  total_tracked_vessels: number
  vessels_at_berth: number
  vessels_anchored: number
  critical_risk_vessels: number
  berth_utilization_pct: number
  occupied_berths: number
  total_berths: number
  active_cranes: number
  total_cranes: number
  yard_capacity_pct: number
  active_alerts_count: number
  system_status: string
}

export interface AssistantResponse {
  answer: string
  suggested_actions: string[]
  related_metrics: Record<string, string>
  confidence: number
  timestamp: string
}

// Resilient fetch helper
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${await res.text()}`)
  }
  return res.json()
}

export const api = {
  getSummary: () => apiFetch<TerminalSummary>('/analytics/summary'),
  getVessels: (params?: { search?: string; status?: string; risk_level?: string; carrier?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.status) q.set('status', params.status)
    if (params?.risk_level) q.set('risk_level', params.risk_level)
    if (params?.carrier) q.set('carrier', params.carrier)
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.offset) q.set('offset', String(params.offset))
    return apiFetch<{ total: number; limit: number; offset: number; vessels: Vessel[] }>(`/vessels?${q.toString()}`)
  },
  getVessel: (id: string) => apiFetch<Vessel>(`/vessels/${id}`),
  createVessel: (v: Partial<Vessel>) => apiFetch<Vessel>('/vessels', { method: 'POST', body: JSON.stringify(v) }),
  updateVessel: (id: string, updates: Partial<Vessel>) => apiFetch<Vessel>(`/vessels/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  getBerths: () => apiFetch<Berth[]>('/berths'),
  getCranes: () => apiFetch<QuayCrane[]>('/cranes'),
  runOptimization: (body?: { prioritize_express?: boolean; max_cranes_per_vessel?: number }) =>
    apiFetch<OptimizationResult>('/optimisation/run', { method: 'POST', body: JSON.stringify(body || {}) }),
  getCongestionForecast: () => apiFetch<CongestionForecast>('/congestion/forecast'),
  simulateCongestion: (body: { arrival_surge_pct: number; crane_efficiency_pct: number; adverse_weather: boolean; yard_dwell_multiplier: number }) =>
    apiFetch<any>('/congestion/simulate', { method: 'POST', body: JSON.stringify(body) }),
  getYardZones: () => apiFetch<YardZone[]>('/yard'),
  rebalanceYard: (source_id: string, target_id: string, teu_to_move: number) =>
    apiFetch<any>(`/yard/rebalance?source_id=${source_id}&target_id=${target_id}&teu_to_move=${teu_to_move}`, { method: 'POST' }),
  getRouting: () => apiFetch<RoutingResponse>('/routing'),
  applyRouting: (recId: string) => apiFetch<any>(`/routing/${recId}/apply`, { method: 'POST' }),
  get72HourPlan: () => apiFetch<Plan72Hour>('/plan/72-hour'),
  getAlerts: (activeOnly = false) => apiFetch<OperationalAlert[]>(`/alerts?active_only=${activeOnly}`),
  resolveAlert: (id: string) => apiFetch<OperationalAlert>(`/alerts/${id}/resolve`, { method: 'POST' }),
  askAssistant: (query: string, contextModule?: string) =>
    apiFetch<AssistantResponse>('/assistant/query', { method: 'POST', body: JSON.stringify({ query, context_module: contextModule }) }),
  resetData: () => apiFetch<any>('/data/reset', { method: 'POST' }),
}
