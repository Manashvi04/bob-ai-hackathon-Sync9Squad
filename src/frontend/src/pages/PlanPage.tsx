import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Download,
  ListTodo,
  Printer,
  RefreshCw,
  Ship,
  UserCheck,
} from 'lucide-react'
import { api, Plan72Hour, ShiftPlan } from '../services/api'

export function PlanPage() {
  const [plan, setPlan] = useState<Plan72Hour | null>(null)
  const [activeDay, setActiveDay] = useState(0) // 0 for Day 1, 1 for Day 2, 2 for Day 3
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})

  const loadPlan = async () => {
    try {
      setLoading(true)
      const data = await api.get72HourPlan()
      setPlan(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlan()
  }, [])

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const days = [
    { label: 'Day 1 · Mon 15 Sep', shifts: plan?.shifts.slice(0, 3) || [] },
    { label: 'Day 2 · Tue 16 Sep', shifts: plan?.shifts.slice(3, 6) || [] },
    { label: 'Day 3 · Wed 17 Sep', shifts: plan?.shifts.slice(6, 9) || [] },
  ]

  const exportJSON = () => {
    if (!plan) return
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portflow_72h_plan_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <p>SHIFT SUPERVISOR DIRECTIVE · 72-HOUR OUTLOOK</p>
          <h1>Port Operations Execution Plan</h1>
          <span>
            {plan?.summary || 'Operational schedule across 9 shifts covering quayside cranes, berth windows, yard gates, and supervisor safety checklists.'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="secondary-button" onClick={() => window.print()}>
            <Printer size={16} /> Print Brief
          </button>
          <button className="secondary-button" onClick={exportJSON}>
            <Download size={16} /> Export JSON
          </button>
        </div>
      </section>

      {/* Overview KPI Strip */}
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon cyan">
            <Calendar size={22} />
          </div>
          <div>
            <p>PLANNED THROUGHPUT</p>
            <strong>{plan ? plan.total_planned_moves.toLocaleString() : '44,670'} TEU</strong>
            <span>Across 9 consecutive shifts</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p>HIGH-RISK SHIFTS</p>
            <strong style={{ color: '#ef4444' }}>{plan?.high_risk_shifts_count ?? 4} Shifts</strong>
            <span>Requiring senior oversight</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon blue">
            <UserCheck size={22} />
          </div>
          <div>
            <p>CURRENT SHIFT SUPERVISOR</p>
            <strong>Alex Singh</strong>
            <span>Shift B (14:00 – 22:00)</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p>PLAN STATUS</p>
            <strong style={{ color: '#10b981' }}>Active Directive</strong>
            <span>Verified draft clearances</span>
          </div>
        </article>
      </section>

      {/* Day Selector Tabs */}
      <div className="yard-tabs-bar">
        {days.map((d, index) => (
          <button
            key={index}
            className={`tab-btn ${activeDay === index ? 'active' : ''}`}
            onClick={() => setActiveDay(index)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Shifts List for Selected Day */}
      <div className="shifts-container">
        {days[activeDay].shifts.map((shift) => (
          <article className="shift-card" key={shift.shift_id}>
            <div className="shift-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3>{shift.shift_label}</h3>
                  <span className={`risk-tag tag-${shift.risk_level}`}>
                    {shift.risk_level.toUpperCase()}
                  </span>
                </div>
                <small style={{ color: '#8aa3b9' }}>
                  Supervisor in Charge: <b>{shift.supervisor}</b>
                </small>
              </div>

              <div className="shift-header-stats">
                <div>
                  <small>PLANNED MOVES</small>
                  <b>{shift.expected_moves_teu.toLocaleString()} TEU</b>
                </div>
                <div>
                  <small>BERTH OCCUPANCY</small>
                  <b style={{ color: shift.berth_occupancy_pct > 85 ? '#ef4444' : '#19c3df' }}>
                    {shift.berth_occupancy_pct}%
                  </b>
                </div>
                <div>
                  <small>GATE PRESSURE</small>
                  <b>{shift.yard_gate_capacity_pct}%</b>
                </div>
              </div>
            </div>

            <div className="shift-body">
              {/* Task list */}
              <div className="shift-tasks-section">
                <h4>
                  <Ship size={16} /> Operational Quayside Tasks
                </h4>
                <div className="shift-tasks-list">
                  {shift.tasks.map((task) => (
                    <div className="task-row" key={task.id}>
                      <span className="task-time">{task.time_window}</span>
                      <span className={`task-badge badge-${task.action_type.toLowerCase()}`}>
                        {task.action_type}
                      </span>
                      <div className="task-vessel-info">
                        <b>{task.vessel_name}</b>
                        <small>Berth {task.berth_id} · {task.crane_gangs.join(', ')}</small>
                      </div>
                      <span className="task-target">
                        {task.target_moves > 0 ? `${task.target_moves} TEU` : 'Mooring / Safe Line'}
                      </span>
                      <span className={`task-status-pill status-${task.status}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div className="shift-checklist-section">
                <h4>
                  <ListTodo size={16} /> Supervisor Action Checklist
                </h4>
                <div className="checklist-items">
                  {shift.critical_checklist.map((item, idx) => {
                    const checkKey = `${shift.shift_id}-${idx}`
                    const isDone = !!completedTasks[checkKey]
                    return (
                      <label
                        className={`checklist-item ${isDone ? 'done' : ''}`}
                        key={idx}
                        onClick={() => toggleTask(checkKey)}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {}}
                        />
                        <span>{item}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
