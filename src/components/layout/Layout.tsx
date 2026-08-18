import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Header } from './Header'
import { Footer } from './Footer'
import { enquiryUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

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

      {/* Always-available WhatsApp shortcut — the one place green leads. */}
      <a
        href={enquiryUrl()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={cn(
          'fixed right-5 z-40 grid size-13 place-items-center rounded-full bg-green-deep text-cream',
          'shadow-lift transition-[transform,background-color] hover:scale-105 hover:bg-green sm:right-7 sm:bottom-7',
          hasMobileBookingBar ? 'bottom-24' : 'bottom-6',
        )}
      >
        <MessageCircle className="size-6" />
      </a>
    </div>
  )
}
