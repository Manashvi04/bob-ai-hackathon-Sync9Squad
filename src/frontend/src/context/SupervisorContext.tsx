import { createContext, useContext, useEffect, useState } from 'react'

export interface Supervisor {
  id: string
  name: string
  role: string
  shift: string
  terminal: string
  status: string
  radioChannel: string
  badge: string
}

export const SUPERVISORS_LIST: Supervisor[] = [
  {
    id: 'SUP-804',
    name: 'Alex Singh',
    role: 'Lead Shift Supervisor',
    shift: 'Shift B (14:00 – 22:00)',
    terminal: 'North Harbor · T1',
    status: 'On Active Duty',
    radioChannel: 'VHF Channel 12',
    badge: 'Lead Ops',
  },
  {
    id: 'SUP-812',
    name: 'Elena Rostova',
    role: 'Quayside Operations Lead',
    shift: 'Shift A (06:00 – 14:00)',
    terminal: 'North Harbor · T1',
    status: 'On Active Duty',
    radioChannel: 'VHF Channel 14',
    badge: 'Quay Lead',
  },
  {
    id: 'SUP-795',
    name: 'Marcus Vance',
    role: 'Yard & Intermodal Rail Lead',
    shift: 'Shift C (22:00 – 06:00)',
    terminal: 'North Harbor · T1',
    status: 'On Active Duty',
    radioChannel: 'VHF Channel 08',
    badge: 'Yard Master',
  },
  {
    id: 'SUP-833',
    name: 'David Chen',
    role: 'Harbour Master Liaison',
    shift: 'Shift B (14:00 – 22:00)',
    terminal: 'North Harbor · T1',
    status: 'On Active Duty',
    radioChannel: 'VHF Channel 16',
    badge: 'Marine Traffic',
  },
]

interface SupervisorContextType {
  supervisor: Supervisor
  setSupervisor: (supervisor: Supervisor) => void
  selectSupervisorByName: (name: string) => void
  supervisorsList: Supervisor[]
}

const SupervisorContext = createContext<SupervisorContextType>({
  supervisor: SUPERVISORS_LIST[0],
  setSupervisor: () => {},
  selectSupervisorByName: () => {},
  supervisorsList: SUPERVISORS_LIST,
})

export function SupervisorProvider({ children }: { children: React.ReactNode }) {
  const [supervisor, setSupervisorState] = useState<Supervisor>(() => {
    try {
      const saved = localStorage.getItem('portflow_supervisor')
      if (saved) {
        const parsed = JSON.parse(saved)
        const match = SUPERVISORS_LIST.find((s) => s.name === parsed.name || s.id === parsed.id)
        if (match) return match
      }
    } catch {
      // ignore
    }
    return SUPERVISORS_LIST[0]
  })

  useEffect(() => {
    try {
      localStorage.setItem('portflow_supervisor', JSON.stringify(supervisor))
    } catch {
      // ignore
    }
  }, [supervisor])

  const setSupervisor = (sup: Supervisor) => {
    setSupervisorState(sup)
  }

  const selectSupervisorByName = (name: string) => {
    const found = SUPERVISORS_LIST.find((s) => s.name.toLowerCase() === name.toLowerCase())
    if (found) {
      setSupervisorState(found)
    }
  }

  return (
    <SupervisorContext.Provider
      value={{
        supervisor,
        setSupervisor,
        selectSupervisorByName,
        supervisorsList: SUPERVISORS_LIST,
      }}
    >
      {children}
    </SupervisorContext.Provider>
  )
}

export const useSupervisor = () => useContext(SupervisorContext)
