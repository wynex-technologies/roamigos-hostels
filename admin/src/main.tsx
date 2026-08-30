import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './lib/auth'
import { ThemeProvider } from './lib/theme'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        {/* The panel lives at /admin on the site's own domain, so the router
            has to be told where its own root is - otherwise every NavLink
            resolves against / and lands on the marketing site. Vite is told
            the same thing separately, as `base` in vite.config.ts. */}
        <BrowserRouter basename="/admin">
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
