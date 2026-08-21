import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { OfferModal } from '@/components/offer/OfferModal'
import { useMediaQuery } from '@/lib/useMediaQuery'

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
  // Home and every room detail page open with a full-bleed photo hero, so the
  // header floats transparently over it. The rooms listing only has that hero
  // from md up - below that the bar would be laying cream type on white paper,
  // so the overlay has to follow the same breakpoint the hero does.
  const hasHero = useMediaQuery('(min-width: 48rem)')
  const overlayHeader =
    pathname === '/' || pathname.startsWith('/rooms/') || (pathname === '/rooms' && hasHero)

  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScrollManager />
      <Header overlay={overlayHeader} />

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
