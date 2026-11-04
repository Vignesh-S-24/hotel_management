import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { applyTheme } from './theme'
import { STORAGE_KEYS } from './utils/constants'
import './styles/index.css'

// Apply the saved theme before first render to avoid a colour flash.
let savedMode = 'light'
try {
  savedMode = JSON.parse(localStorage.getItem(STORAGE_KEYS.theme)) || 'light'
} catch {
  /* ignore */
}
applyTheme(savedMode)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
