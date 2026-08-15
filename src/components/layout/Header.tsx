import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Moon, Phone, Sun, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { nav, site } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className={cn(
        'grid size-10 place-items-center rounded-full border border-line bg-surface text-heading',
        'transition-colors hover:border-primary hover:text-primary',
        className,
      )}
    >
      {theme === 'dark' ? <Sun className="size-[1.15rem]" /> : <Moon className="size-[1.15rem]" />}
    </button>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the drawer on navigation, and stop the page behind it from scrolling.
  useEffect(() => setOpen(false), [pathname, hash])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const isActive = (to: string) => {
    const [path, fragment] = to.split('#')
    // In-page links are only "current" when that section is actually in the URL.
    if (fragment) return pathname === (path || '/') && hash === `#${fragment}`
    if (to === '/') return pathname === '/'
    return pathname === to || pathname.startsWith(`${to}/`)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
        scrolled
          ? 'border-b border-line bg-canvas/85 shadow-warm backdrop-blur-xl'
          : 'border-b border-transparent bg-canvas/60 backdrop-blur-sm',
      )}
    >
      <div className="container-page flex h-18 items-center justify-between gap-4 sm:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                isActive(item.to) ? 'text-primary' : 'text-body hover:text-heading',
              )}
            >
              {item.label}
              {isActive(item.to) && (
                <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-mustard" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ButtonAnchor
            href={`tel:${site.phoneDisplay.replace(/\s/g, '')}`}
            variant="secondary"
            size="sm"
            className="hidden xl:inline-flex"
          >
            <Phone className="size-4" />
            {site.phoneDisplay}
          </ButtonAnchor>

          <ThemeToggle />

          <ButtonLink to="/rooms" size="sm" className="hidden sm:inline-flex">
            Book Now
          </ButtonLink>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid size-10 place-items-center rounded-full border border-line bg-surface text-heading lg:hidden"
          >
            <Menu className="size-[1.15rem]" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          // overflow-hidden matters: the closed panel is parked at translate-x-full,
          // which would otherwise widen the page and create a horizontal scrollbar.
          'fixed inset-0 z-50 overflow-hidden lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex w-[min(21rem,88vw)] flex-col bg-canvas shadow-lift',
            'transition-transform duration-400 ease-[var(--ease-out-soft)]',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex h-18 items-center justify-between border-b border-line px-5">
            <Logo compact />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid size-10 place-items-center rounded-full border border-line text-heading"
            >
              <X className="size-[1.15rem]" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
            <ul className="space-y-1">
              {nav.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-lg text-heading transition-colors hover:bg-surface-2"
                  >
                    {item.label}
                    <span className="size-1.5 rotate-45 bg-mustard opacity-0 transition-opacity [a:hover>&]:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 border-t border-line px-5 py-6">
            <ButtonLink to="/rooms" size="lg" className="w-full">
              Book Your Stay
            </ButtonLink>
            <ButtonAnchor
              href={enquiryUrl()}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              size="lg"
              className="w-full"
            >
              Chat on WhatsApp
            </ButtonAnchor>
          </div>
        </div>
      </div>
    </header>
  )
}
