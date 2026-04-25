import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/**
 * Theme values:
 * - 'light' → palette Milk bg + Plum fg
 * - 'dark'  → palette Plum bg + Milk fg
 *
 * Resolution order:
 * 1. User choice persisted in localStorage('fantabrain-theme')
 * 2. prefers-color-scheme (sistema operativo)
 * 3. Fallback: 'dark'
 */

const STORAGE_KEY = 'fantabrain-theme'
const ThemeContext = createContext(null)

function resolveInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

function applyThemeToHtml(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(resolveInitialTheme)

  // Applica il tema all'html al mount e a ogni cambio
  useEffect(() => {
    applyThemeToHtml(theme)
  }, [theme])

  // Reagisce al cambio del sistema operativo SOLO se l'utente
  // non ha ancora espresso una preferenza (nessun valore in localStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (e) => {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') return
      setThemeState(e.matches ? 'light' : 'dark')
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const setTheme = useCallback((next) => {
    if (next !== 'light' && next !== 'dark') return
    window.localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
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
