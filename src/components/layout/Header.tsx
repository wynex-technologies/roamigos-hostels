import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Moon, Phone, Sun, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { SocialMenu, SocialRow } from './SocialMenu'
import { nav, site } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

/** Frosted treatment for the round controls while the bar floats over the hero. */
const glassControl =
  'border-cream/30 bg-cream/10 text-cream backdrop-blur-sm hover:border-cream/60 hover:text-cream'

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

/**
 * `overlay` lets the bar sit transparently on top of a photographic hero until the
 * page scrolls. Only pages that open with a full-bleed hero should turn it on —
 * everywhere else the header keeps its normal cream surface.
 */
export function Header({ overlay = false }: { overlay?: boolean }) {
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

  // Transparent only while the hero is still behind the bar; once scrolled it
  // always falls back to the solid surface so links stay readable.
  const floating = overlay && !scrolled

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
          // Pull the page up under the bar so the hero starts at the very top.
          overlay && '-mb-18 sm:-mb-20',
          scrolled
            ? 'border-b border-line bg-header/85 shadow-warm backdrop-blur-xl'
            : overlay
              ? 'border-b border-transparent bg-transparent'
              : 'border-b border-transparent bg-header/60 backdrop-blur-sm',
        )}
      >
        <div className="container-page flex h-18 items-center justify-between gap-4 sm:h-20">
          <Logo tone={floating ? 'light' : 'default'} />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  floating
                    ? isActive(item.to)
                      ? 'text-mustard'
                      : 'text-white hover:text-mustard'
                    : isActive(item.to)
                      ? 'text-primary'
                      : 'text-body hover:text-heading dark:text-white',
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
              className={cn(
                'hidden xl:inline-flex',
                floating && glassControl,
              )}
            >
              <Phone className="size-4" />
              {site.phoneDisplay}
            </ButtonAnchor>

            <SocialMenu
              className="hidden sm:block"
              buttonClassName={cn(floating && glassControl)}
            />

            <ThemeToggle className={cn(floating && glassControl)} />

            <ButtonLink to="/rooms" size="sm" className="hidden sm:inline-flex">
              Book Now
            </ButtonLink>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={cn(
                'grid size-10 place-items-center rounded-full border border-line bg-surface text-heading lg:hidden',
                floating && glassControl,
              )}
            >
              <Menu className="size-[1.15rem]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer. It has to sit outside <header>: the bar carries a
          backdrop-filter, and that makes an element the containing block for its
          fixed descendants - inside it `inset-0` resolves to the 4.5rem bar and
          `overflow-hidden` clips the panel away. */}
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

            {/* The bar's social menu is hidden at this width, so the accounts
                ride the drawer instead. */}
            <div className="flex items-center justify-between gap-4 pt-3">
              <p className="text-[0.625rem] font-bold tracking-[0.22em] text-muted uppercase">
                Follow us
              </p>
              <SocialRow />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
