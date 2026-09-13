import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'roamigos-theme'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null)

function readInitialTheme(): Theme {
  // The inline script in index.html has already resolved this before paint;
  // read back off the element so the two never disagree.
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

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Private mode / storage disabled - the theme still applies for this session.
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
