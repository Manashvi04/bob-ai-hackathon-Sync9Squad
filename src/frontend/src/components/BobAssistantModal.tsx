import { useState } from 'react'
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  MessageSquare,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { api, AssistantResponse } from '../services/api'
import { useSupervisor } from '../context/SupervisorContext'
import { useTerminal } from '../context/TerminalContext'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function BobAssistantModal({ isOpen, onClose }: Props) {
  const { supervisor } = useSupervisor()
  const { terminal } = useTerminal()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const firstName = supervisor.name.split(' ')[0]
  const [conversation, setConversation] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; metrics?: Record<string, string>; actions?: string[] }>
  >([
    {
      role: 'assistant',
      content:
        `Hello ${firstName}, I am **IBM Bob** — your Port Operations AI Copilot. I analyze real-time AIS vessel movements, quay crane assignments, and yard capacities at ${terminal.name} to recommend optimal decisions. How can I assist you on ${supervisor.shift}?`,
      actions: [
        'Which berths have conflicts tomorrow?',
        'How to relieve Yard Zone Y-04 pressure?',
        'Recommend crane allocation for MV Pacific Dawn',
        'Current port congestion summary',
      ],
    },
  ])

  if (!isOpen) return null

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || query).trim()
    if (!q) return

    setConversation((prev) => [...prev, { role: 'user', content: q }])
    setQuery('')
    setLoading(true)

    try {
      const res: AssistantResponse = await api.askAssistant(q)
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          metrics: res.related_metrics,
          actions: res.suggested_actions,
        },
      ])
    } catch (err) {
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to process query due to network issue. Please ensure the backend is running.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="assistant-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="assistant-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="assistant-avatar">
              <Bot size={20} color="#19c3df" />
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <b>IBM Bob</b>
                <span className="copilot-badge">PORT COPILOT</span>
              </div>
              <small style={{ color: '#8aa3b9' }}>Terminal 1 Intelligence Assistant · watsonx Powered</small>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Message Thread */}
        <div className="assistant-body">
          {conversation.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="msg-bubble">
                <div className="msg-text" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />

                {/* Related Metrics */}
                {msg.metrics && Object.keys(msg.metrics).length > 0 && (
                  <div className="assistant-metrics-grid">
                    {Object.entries(msg.metrics).map(([k, v]) => (
                      <div className="copilot-metric-box" key={k}>
                        <small>{k}</small>
                        <b>{v}</b>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actionable Prompt Chips */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="assistant-actions-chips">
                    {msg.actions.map((act, j) => (
                      <button
                        key={j}
                        className="prompt-chip"
                        onClick={() => handleSend(act)}
                      >
                        <Sparkles size={12} color="#19c3df" />
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              <div className="msg-bubble loading-bubble">
                <Sparkles size={16} className="spinning" color="#19c3df" />
                <span>IBM Bob is evaluating live port topology & simulation physics...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          className="assistant-input-bar"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <input
            type="text"
            placeholder="Ask IBM Bob anything about berths, yard dwell, cranes, or congestion..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={!query.trim() || loading} className="send-btn">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
