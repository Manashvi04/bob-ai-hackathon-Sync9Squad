import { AlertTriangle, ArrowRight, Boxes, CheckCircle2, Clock3, Container, Ship, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const forecast = [
  { time: '00:00', utilisation: 58, threshold: 85 }, { time: '06:00', utilisation: 68, threshold: 85 },
  { time: '12:00', utilisation: 77, threshold: 85 }, { time: '18:00', utilisation: 91, threshold: 85 },
  { time: '00:00', utilisation: 87, threshold: 85 }, { time: '06:00', utilisation: 74, threshold: 85 },
  { time: '12:00', utilisation: 66, threshold: 85 },
]

const stats = [
  { label: 'VESSELS IN PORT', value: '12', note: '+3 arriving today', icon: Ship, tone: 'blue' },
  { label: 'BERTH UTILISATION', value: '78%', note: '6 of 8 occupied', icon: Container, tone: 'cyan' },
  { label: 'YARD CAPACITY', value: '71%', note: '2 zones near limit', icon: Boxes, tone: 'amber' },
  { label: 'ACTIVE ALERTS', value: '3', note: '1 requires action', icon: AlertTriangle, tone: 'red' },
]

export function Dashboard() {
  return <div className="page">
    <section className="page-heading"><div><p>MONDAY, 14 SEPTEMBER 2026</p><h1>Good afternoon, Alex.</h1><span>Here is the current operational picture for North Harbor Terminal 1.</span></div><button className="primary-button"><Clock3 size={17}/>View 72-Hour Plan<ArrowRight size={17}/></button></section>
    <section className="stats-grid">{stats.map(({ label, value, note, icon: Icon, tone }) => <article className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={22}/></div><div><p>{label}</p><strong>{value}</strong><span>{note}</span></div></article>)}</section>
    <section className="dashboard-grid">
      <article className="panel congestion-panel"><div className="panel-title"><div><small>72-HOUR OUTLOOK</small><h2>Congestion forecast</h2></div><span className="risk"><AlertTriangle size={14}/>Elevated risk · 18:00</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={forecast} margin={{ top: 18, right: 8, left: -28, bottom: 0 }}><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#19c3df" stopOpacity={0.4}/><stop offset="100%" stopColor="#19c3df" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1c3447"/><XAxis dataKey="time" stroke="#70869a" fontSize={11}/><YAxis stroke="#70869a" fontSize={11}/><Tooltip contentStyle={{background:'#0d2233',border:'1px solid #254157'}}/><Area type="monotone" dataKey="threshold" stroke="#f7a62f" strokeDasharray="5 5" fill="none"/><Area type="monotone" dataKey="utilisation" stroke="#21c5df" strokeWidth={3} fill="url(#fill)"/></AreaChart></ResponsiveContainer></div><div className="legend"><span><i className="cyan-dot"/>Predicted utilisation</span><span><i className="amber-line"/>Critical threshold</span><button>View congestion details <ArrowRight size={14}/></button></div></article>
      <article className="panel movements"><div className="panel-title"><div><small>LIVE SCHEDULE</small><h2>Upcoming movements</h2></div><button>View all</button></div>{[['14:45','MV Pacific Dawn','Arrival · Berth B3','On time'],['16:10','Ocean Meridian','Departure · Berth A1','Ready'],['17:30','Nordic Star','Arrival · Berth C2','+25 min']].map((row, i)=><div className="movement" key={row[1]}><time>{row[0]}</time><span className="vessel-mark"><Ship size={17}/></span><div><b>{row[1]}</b><small>{row[2]}</small></div><em className={i===2?'delay':''}>{row[3]}</em></div>)}</article>
      <article className="panel resource-panel"><div className="panel-title"><div><small>RESOURCE PULSE</small><h2>Terminal utilisation</h2></div><span className="healthy"><CheckCircle2 size={14}/>Stable</span></div>{[['Berths','6 / 8','78'],['Quay cranes','9 / 12','75'],['Yard zones','14 / 18','71'],['Gate lanes','7 / 10','68']].map(([name,count,value])=><div className="resource" key={name}><div><span>{name}</span><b>{count}</b></div><div className="progress"><i style={{width:`${value}%`}}/></div><small>{value}% utilised</small></div>)}</article>
      <article className="panel attention"><div className="panel-title"><div><small>DECISION QUEUE</small><h2>Needs attention</h2></div><span>3 items</span></div><div className="attention-item"><span className="warn"><TrendingUp/></span><div><b>Yard Zone Y-04 nearing capacity</b><p>Projected to reach 88% by 19:00. Consider rebalancing inbound containers.</p><button>Review recommendation <ArrowRight size={14}/></button></div></div><div className="attention-item"><span className="info"><Clock3/></span><div><b>Berth conflict predicted tomorrow</b><p>Two deep-draft arrivals overlap at Berth B3.</p></div></div></article>
    </section>
  </div>
}
