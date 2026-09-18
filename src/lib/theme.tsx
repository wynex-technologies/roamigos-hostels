import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'roamigos-theme'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null)

function readInitialTheme(): Theme {
  // The inline script in index.html has already resolved this before paint;
  // read back off the element so the two never disagree. Light unless the
  // visitor has asked for dark before - that script is where the default lives.
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme

    // The strip a phone draws the URL in takes its colour from `theme-color`,
    // so it has to follow the theme the way everything else does - and it has
    // to be the header's ground, or the top of the screen is a band of colour
    // the page underneath never continues.
    //
    // Read off the stylesheet rather than written out here: `--header-ground`
    // is the one place that decides what the bar is sitting on, and a hex
    // copied into a component is exactly how the two drift apart. index.html
    // carries the first-paint value, which this then confirms or corrects.
    const ground = getComputedStyle(document.documentElement)
      .getPropertyValue('--header-ground')
      .trim()

    if (ground) {
      let bar = document.querySelector('meta[name="theme-color"]')
      if (!bar) {
        bar = document.createElement('meta')
        bar.setAttribute('name', 'theme-color')
        document.head.appendChild(bar)
      }
      bar.setAttribute('content', ground)
    }
  }, [theme])

  // Only a toggle writes to storage, never the first render.
  //
  // This used to run in the effect above, which meant the resolved theme was
  // persisted on the very first page view - so a default silently became a
  // stored preference and the site could never change its own default again.
  // Storage now holds one thing: a choice the visitor actually made.
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Private mode / storage disabled - the theme still applies for this session.
      }
      return next
    })
  }, [])

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
