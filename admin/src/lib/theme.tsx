import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'roamigos-admin-theme'
const Ctx = createContext<{ theme: Theme; toggle: () => void } | null>(null)

/** The desk works in here all day, so it gets the same light/dark choice the
    site offers, remembered on this machine.

    Light is the default here for the same reason it is on the site: the
    machine's own setting does not decide what the panel opens as. Dark is a
    tap away and it sticks once asked for. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored === 'dark' || stored === 'light') return stored
    } catch {
      // Private mode. The default is fine for this session.
    }
    return 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  // Only a toggle writes to storage, never the first render - otherwise the
  // default is persisted on the first visit and stops being a default at all.
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(KEY, next)
      } catch {
        // As above.
      }
      return next
    })
  }, [])

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
