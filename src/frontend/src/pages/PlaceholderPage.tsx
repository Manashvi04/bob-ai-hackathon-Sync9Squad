import { ArrowRight, Construction, Database, Sparkles } from 'lucide-react'

export function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return <div className="page placeholder"><section className="page-heading"><div><p>OPERATIONS MODULE</p><h1>{title}</h1><span>{description}</span></div></section><article className="empty-state"><span><Construction size={30}/></span><small>FOUNDATION READY</small><h2>{title} workspace</h2><p>This module is prepared for the next implementation phase. The shared navigation, responsive layout and API boundary are already in place.</p><div><b><Database size={16}/>Data integration</b><b><Sparkles size={16}/>Intelligence layer</b></div><button className="secondary-button">View module roadmap <ArrowRight size={16}/></button></article></div>
}
