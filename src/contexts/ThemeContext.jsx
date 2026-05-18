import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/**
 * Theme values:
 * - 'light' -> legacy Milk bg + Plum fg
 * - 'dark'  -> noir/luxury app default
 *
 * Resolution order:
 * 1. User choice persisted in localStorage('fantabrain-theme')
 * 2. Fallback: 'dark'
 */

const STORAGE_KEY = 'fantabrain-theme'
const ThemeContext = createContext(null)

function resolveInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored !== 'dark') {
    window.localStorage.setItem(STORAGE_KEY, 'dark')
  }
  return 'dark'
}

function applyThemeToHtml(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(resolveInitialTheme)

  useEffect(() => {
    applyThemeToHtml(theme)
  }, [theme])

  const setTheme = useCallback((next) => {
    if (next !== 'dark') return
    window.localStorage.setItem(STORAGE_KEY, 'dark')
    setThemeState('dark')
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme deve essere chiamato dentro <ThemeProvider>')
  }
  return ctx
}
