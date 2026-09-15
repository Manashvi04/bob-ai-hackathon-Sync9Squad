import { createContext, useContext, useEffect, useState } from 'react'

export interface Terminal {
  id: string
  name: string
  type: string
  berths: string
  status: string
}

export const TERMINALS_LIST: Terminal[] = [
  {
    id: 'T1',
    name: 'North Harbor · T1',
    type: 'Deepwater Container Hub',
    berths: '8 Berths · 12 Cranes',
    status: 'Operational',
  },
  {
    id: 'T2',
    name: 'South Basin · T2',
    type: 'Regional Feeder Dock',
    berths: '4 Berths · 6 Cranes',
    status: 'Connected',
  },
  {
    id: 'T3',
    name: 'East Gateway Intermodal',
    type: 'Automated Rail Terminal',
    berths: '6 Railhead Tracks',
    status: 'Standby',
  },
]

interface TerminalContextType {
  terminal: Terminal
  setTerminal: (terminal: Terminal) => void
  terminalsList: Terminal[]
}

const TerminalContext = createContext<TerminalContextType>({
  terminal: TERMINALS_LIST[0],
  setTerminal: () => {},
  terminalsList: TERMINALS_LIST,
})

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [terminal, setTerminalState] = useState<Terminal>(() => {
    try {
      const saved = localStorage.getItem('portflow_terminal')
      if (saved) {
        const parsed = JSON.parse(saved)
        const match = TERMINALS_LIST.find((t) => t.id === parsed.id)
        if (match) return match
      }
    } catch {}
    return TERMINALS_LIST[0]
  })

  useEffect(() => {
    try {
      localStorage.setItem('portflow_terminal', JSON.stringify(terminal))
    } catch {}
  }, [terminal])

  return (
    <TerminalContext.Provider
      value={{
        terminal,
        setTerminal: setTerminalState,
        terminalsList: TERMINALS_LIST,
      }}
    >
      {children}
    </TerminalContext.Provider>
  )
}

export const useTerminal = () => useContext(TerminalContext)
