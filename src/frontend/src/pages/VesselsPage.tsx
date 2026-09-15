import { useEffect, useState } from 'react'
import {
  Anchor,
  ArrowUpDown,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Ship,
  X,
} from 'lucide-react'
import { api, Vessel } from '../services/api'

export function VesselsPage() {
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const pageSize = 25
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newVessel, setNewVessel] = useState({
    name: '',
    imo: '',
    call_sign: '',
    carrier: 'Maersk Line',
    teu_capacity: 14000,
    draft_m: 14.5,
    length_overall_m: 366.0,
    inbound_teu: 1500,
    outbound_teu: 1200,
    eta: '2026-09-17T10:00',
    etd: '2026-09-18T14:00',
    status: 'scheduled' as const,
  })

  const loadVessels = async () => {
    try {
      setLoading(true)
      const res = await api.getVessels({
        search: search || undefined,
        status: statusFilter || undefined,
        risk_level: riskFilter || undefined,
        carrier: carrierFilter || undefined,
        limit: pageSize,
        offset: page * pageSize,
      })
      setVessels(res.vessels)
      setTotal(res.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVessels()
  }, [page, statusFilter, riskFilter, carrierFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    loadVessels()
  }

  const exportCSV = () => {
    const headers = 'ID,Name,IMO,Carrier,Type,TEU Capacity,Total Moves,Draft(m),Status,Berth,Delay(h),Risk,ETA,ETD\n'
    const rows = vessels
      .map(
        (v) =>
          `"${v.id}","${v.name}","${v.imo}","${v.carrier}","${v.vessel_type}",${v.teu_capacity},${v.total_moves},${v.draft_m},"${v.status}","${v.assigned_berth || 'N/A'}",${v.delay_hours},"${v.risk_level}","${v.eta}","${v.etd}"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portflow_vessels_200plus_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const handleCreateVessel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createVessel(newVessel as any)
      setShowAddModal(false)
      loadVessels()
    } catch (err) {
      alert('Error adding vessel: ' + err)
    }
  }

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p>FLEET & ARRIVAL LOGISTICS</p>
          <h1>Vessel Schedule Management</h1>
          <span>
            Tracking {total} container vessel calls spanning historical logs, active berths, anchorage queues, and the 14-day forward schedule.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary-button" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className="primary-button" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Vessel Call
          </button>
        </div>
      </section>

      {/* Summary KPI Strip */}
      <section className="vessel-kpi-strip">
        <div className="vessel-kpi-chip">
          <small>TOTAL SCHEDULED FLEET</small>
          <b>{total} Vessels</b>
        </div>
        <div className="vessel-kpi-chip">
          <small>CURRENTLY AT BERTH</small>
          <b style={{ color: '#19c3df' }}>6 Vessels</b>
        </div>
        <div className="vessel-kpi-chip">
          <small>OUTER ANCHORAGE QUEUE</small>
          <b style={{ color: '#f59e0b' }}>5 Vessels</b>
        </div>
        <div className="vessel-kpi-chip">
          <small>CRITICAL CONGESTION RISK</small>
          <b style={{ color: '#ef4444' }}>4 Vessels</b>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by vessel name, IMO, call sign, or carrier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="filter-group">
          <div className="select-wrapper">
            <Filter size={14} />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <option value="">All Statuses</option>
              <option value="at_berth">At Berth</option>
              <option value="anchored">Anchored / Queued</option>
              <option value="scheduled">Scheduled Inbound</option>
              <option value="departed">Departed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          <div className="select-wrapper">
            <select value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setPage(0); }}>
              <option value="">All Risk Levels</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>

          <div className="select-wrapper">
            <select value={carrierFilter} onChange={(e) => { setCarrierFilter(e.target.value); setPage(0); }}>
              <option value="">All Carriers</option>
              <option value="Maersk">Maersk Line</option>
              <option value="MSC">MSC</option>
              <option value="CMA CGM">CMA CGM</option>
              <option value="COSCO">COSCO Shipping</option>
              <option value="Hapag-Lloyd">Hapag-Lloyd</option>
              <option value="Evergreen">Evergreen Marine</option>
              <option value="ONE">ONE</option>
              <option value="HMM">HMM</option>
            </select>
          </div>

          <button className="icon-btn" onClick={loadVessels} title="Refresh Table">
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-container">
        <table className="vessel-table">
          <thead>
            <tr>
              <th>VESSEL NAME & IMO</th>
              <th>CARRIER</th>
              <th>TYPE & CAPACITY</th>
              <th>DRAFT / LOA</th>
              <th>SCHEDULE (ETA / ETD)</th>
              <th>BERTH / CRANES</th>
              <th>STATUS</th>
              <th>RISK INDEX</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#70869a' }}>
                  Loading vessels dataset (220+ records)...
                </td>
              </tr>
            ) : vessels.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#70869a' }}>
                  No vessels found matching your filter criteria.
                </td>
              </tr>
            ) : (
              vessels.map((v) => (
                <tr key={v.id} onClick={() => setSelectedVessel(v)} className="clickable-row">
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="ship-avatar">
                        <Ship size={15} />
                      </span>
                      <div>
                        <b>{v.name}</b>
                        <small>IMO {v.imo} · {v.call_sign}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="carrier-pill">{v.carrier}</span>
                  </td>
                  <td>
                    <b>{v.teu_capacity.toLocaleString()} TEU</b>
                    <small>{v.vessel_type}</small>
                  </td>
                  <td>
                    <span>{v.draft_m}m draft</span>
                    <small>{v.length_overall_m}m LOA</small>
                  </td>
                  <td>
                    <div>
                      <small>ETA:</small> <b>{v.eta.replace('T', ' ').slice(0, 16)}</b>
                    </div>
                    <div>
                      <small>ETD:</small> <span>{v.etd.replace('T', ' ').slice(0, 16)}</span>
                    </div>
                  </td>
                  <td>
                    {v.assigned_berth ? (
                      <span className="berth-badge">Berth {v.assigned_berth}</span>
                    ) : (
                      <span className="unassigned-badge">Anchorage</span>
                    )}
                    {v.assigned_cranes.length > 0 && (
                      <small style={{ display: 'block', color: '#70869a' }}>
                        {v.assigned_cranes.join(', ')}
                      </small>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill status-${v.status}`}>
                      {v.status === 'at_berth' ? 'At Berth' : v.status === 'anchored' ? 'Anchored' : v.status}
                    </span>
                    {v.delay_hours > 0 && (
                      <small style={{ display: 'block', color: '#ef4444' }}>+{v.delay_hours}h delay</small>
                    )}
                  </td>
                  <td>
                    <span className={`risk-pill risk-${v.risk_level}`}>
                      {v.risk_level.toUpperCase()} ({Math.round(v.congestion_score)})
                    </span>
                  </td>
                  <td>
                    <button
                      className="table-action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedVessel(v)
                      }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="table-pagination">
          <span>
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} vessel calls
          </span>
          <div className="page-buttons">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="page-btn"
            >
              Previous
            </button>
            <span className="page-indicator">
              Page {page + 1} of {Math.ceil(total / pageSize) || 1}
            </span>
            <button
              disabled={(page + 1) * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
              className="page-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Vessel Detail Drawer Modal */}
      {selectedVessel && (
        <div className="modal-backdrop" onClick={() => setSelectedVessel(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <small>VESSEL CALL INTELLIGENCE</small>
                <h2>{selectedVessel.name}</h2>
                <span>
                  {selectedVessel.carrier} · IMO {selectedVessel.imo} · Flag: {selectedVessel.flag}
                </span>
              </div>
              <button className="close-btn" onClick={() => setSelectedVessel(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="metric-row">
                <div className="metric-box">
                  <small>TEU CAPACITY</small>
                  <b>{selectedVessel.teu_capacity.toLocaleString()}</b>
                </div>
                <div className="metric-box">
                  <small>CARGO DISCHARGE / LOAD</small>
                  <b>{selectedVessel.inbound_teu} / {selectedVessel.outbound_teu}</b>
                </div>
                <div className="metric-box">
                  <small>TOTAL MOVES</small>
                  <b>{selectedVessel.total_moves} TEU</b>
                </div>
                <div className="metric-box">
                  <small>CONGESTION SCORE</small>
                  <b style={{ color: selectedVessel.congestion_score >= 70 ? '#ef4444' : '#10b981' }}>
                    {selectedVessel.congestion_score} / 100
                  </b>
                </div>
              </div>

              <div className="drawer-section">
                <h3>Vessel Specifications</h3>
                <div className="spec-grid">
                  <div>
                    <span>Length Overall (LOA):</span> <b>{selectedVessel.length_overall_m} meters</b>
                  </div>
                  <div>
                    <span>Maximum Draft:</span> <b>{selectedVessel.draft_m} meters</b>
                  </div>
                  <div>
                    <span>Beam:</span> <b>{selectedVessel.beam_m} meters</b>
                  </div>
                  <div>
                    <span>Vessel Type:</span> <b>{selectedVessel.vessel_type}</b>
                  </div>
                  <div>
                    <span>Origin Port:</span> <b>{selectedVessel.origin_port}</b>
                  </div>
                  <div>
                    <span>Destination Port:</span> <b>{selectedVessel.destination_port}</b>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <h3>Current Berthing & Crane Assignment</h3>
                <p>
                  <b>Berth:</b> {selectedVessel.assigned_berth ? `Berth ${selectedVessel.assigned_berth}` : 'Anchorage Queue'}
                </p>
                <p>
                  <b>Assigned Cranes:</b>{' '}
                  {selectedVessel.assigned_cranes.length > 0 ? selectedVessel.assigned_cranes.join(', ') : 'Pending allocation'}
                </p>
                <p>
                  <b>Dwell Time Estimate:</b> {selectedVessel.dwell_time_hours} hours quayside
                </p>
              </div>

              {selectedVessel.recommended_action && (
                <div className="recommendation-callout">
                  <small>AI OPERATIONAL RECOMMENDATION</small>
                  <p>{selectedVessel.recommended_action}</p>
                  {selectedVessel.suggested_speed_knots && (
                    <span>
                      Suggested Speed: <b>{selectedVessel.suggested_speed_knots} knots</b> (Virtual Arrival)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button className="secondary-button" onClick={() => setSelectedVessel(null)}>
                Close
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  alert(`Reschedule notification sent for ${selectedVessel.name}.`)
                }}
              >
                Apply Schedule Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vessel Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register Inbound Vessel Call</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateVessel}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Vessel Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. MV Pacific Voyager"
                    value={newVessel.name}
                    onChange={(e) => setNewVessel({ ...newVessel, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>IMO Number</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 9845123"
                    value={newVessel.imo}
                    onChange={(e) => setNewVessel({ ...newVessel, imo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Carrier</label>
                  <select
                    value={newVessel.carrier}
                    onChange={(e) => setNewVessel({ ...newVessel, carrier: e.target.value })}
                  >
                    <option value="Maersk Line">Maersk Line</option>
                    <option value="MSC">MSC</option>
                    <option value="CMA CGM">CMA CGM</option>
                    <option value="COSCO Shipping">COSCO Shipping</option>
                    <option value="Hapag-Lloyd">Hapag-Lloyd</option>
                    <option value="ONE">ONE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>TEU Capacity</label>
                  <input
                    type="number"
                    value={newVessel.teu_capacity}
                    onChange={(e) => setNewVessel({ ...newVessel, teu_capacity: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Draft (meters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVessel.draft_m}
                    onChange={(e) => setNewVessel({ ...newVessel, draft_m: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>LOA (meters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVessel.length_overall_m}
                    onChange={(e) => setNewVessel({ ...newVessel, length_overall_m: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Inbound TEU</label>
                  <input
                    type="number"
                    value={newVessel.inbound_teu}
                    onChange={(e) => setNewVessel({ ...newVessel, inbound_teu: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Outbound TEU</label>
                  <input
                    type="number"
                    value={newVessel.outbound_teu}
                    onChange={(e) => setNewVessel({ ...newVessel, outbound_teu: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>ETA Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={newVessel.eta}
                    onChange={(e) => setNewVessel({ ...newVessel, eta: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>ETD Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={newVessel.etd}
                    onChange={(e) => setNewVessel({ ...newVessel, etd: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Vessel Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
