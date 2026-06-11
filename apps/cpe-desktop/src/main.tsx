import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@miuprep/ui'
import { TrackConfigProvider } from '@miuprep/exam-desktop'
import { TRACK_CONFIG } from './trackConfig'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <TrackConfigProvider config={TRACK_CONFIG}>
        <App />
      </TrackConfigProvider>
    </ErrorBoundary>
  </StrictMode>,
)
