import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { applyTheme } from '../theme'
import { STORAGE_KEYS } from '../utils/constants'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [mode, setMode] = useLocalStorage(STORAGE_KEYS.theme, 'light')

  useEffect(() => {
    applyTheme(mode)
  }, [mode])

  const value = useMemo(
    () => ({ mode, setMode, toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')) }),
    [mode, setMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
