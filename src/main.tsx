import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './lib/theme'
import { loadServerContent } from './data/generated/bootstrap'
import './index.css'

/**
 * The content file is fetched before `App` is imported, not after.
 *
 * Every data module in `src/data/` resolves its content the moment it is
 * imported, so the app has to be pulled in *behind* the fetch - hence the
 * dynamic import rather than a static one at the top of this file. That
 * ordering is what keeps the entire site synchronous: `rooms`, `site` and the
 * rest are still plain values, and no component on the site has a loading
 * state or a spinner because of any of this.
 *
 * The cost is one same-origin request for a small static file before first
 * paint, and it is capped at three seconds. If it fails, is slow, or is simply
 * not there - which is the case on every local `npm run dev` - the site renders
 * the copy compiled into the bundle and nobody is any the wiser.
 */
loadServerContent().then(async () => {
  const { default: App } = await import('./App')

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>,
  )
})
