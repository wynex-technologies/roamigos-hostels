import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ContactDock } from './ContactDock'

/** Scrolls to the top on route change, or to the anchor when the URL has a hash. */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return null
}

export function Layout() {
  const { pathname } = useLocation()
  // Room detail pages carry a sticky booking bar on mobile — lift the button clear of it.
  const hasMobileBookingBar = /^\/rooms\/.+/.test(pathname)
  // Home, the rooms listing and every room page open with a full-bleed photo
  // hero, so the header floats transparently over it.
  const overlayHeader = pathname === '/' || pathname.startsWith('/rooms')

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScrollManager />
      <Header overlay={overlayHeader} />

      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Contact dock — collapsed it is the WhatsApp shortcut, tapped it unfurls
          the rest of the channels. */}
      <ContactDock lifted={hasMobileBookingBar} />
    </div>
  )
}
