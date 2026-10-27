import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary title="Platform Initializing" message="The dashboard encountered an unexpected startup state. Click reload to refresh the active session.">
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
