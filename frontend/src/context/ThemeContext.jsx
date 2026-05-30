import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

// Bump this version whenever the default theme changes, so old
// localStorage values from previous builds get discarded.
const THEME_VERSION = 'v2'

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const version = localStorage.getItem('zippi-theme-version')
    const saved   = version === THEME_VERSION
      ? localStorage.getItem('zippi-theme')
      : null  // ignore stale values from the old "always-dark" default

    if (saved !== null) return saved === 'dark'
    // First visit (or after a version reset): follow OS, fall back to light
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
    localStorage.setItem('zippi-theme', dark ? 'dark' : 'light')
    localStorage.setItem('zippi-theme-version', THEME_VERSION)
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
