import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { TerminalProvider } from './context/TerminalContext'
import { SupervisorProvider } from './context/SupervisorContext'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TerminalProvider>
        <SupervisorProvider>
          <App />
        </SupervisorProvider>
      </TerminalProvider>
    </BrowserRouter>
  </StrictMode>,
)
