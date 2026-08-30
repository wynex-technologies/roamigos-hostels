import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { OfferModal } from '@/components/offer/OfferModal'
import { useChatIntake } from '@/lib/useChatIntake'

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
  // Every WhatsApp link on the site, recorded for the desk from one listener.
  useChatIntake()

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScrollManager />
      <Header />

      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* The offer popup mounts here, not in a page - it belongs to the visit,
          and mounting it once means route changes never re-trigger it. */}
      <OfferModal />
    </div>
  )
}
