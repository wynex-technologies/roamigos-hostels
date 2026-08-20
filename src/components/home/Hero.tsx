import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Search, Sparkles, Users } from 'lucide-react'
import { Wordmark } from '@/components/brand/Wordmark'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { heroSlides } from '@/data/content'
import { site } from '@/data/site'
import { Photo } from '@/components/ui/Photo'
import { enquiryUrl } from '@/lib/whatsapp'
import { addDaysISO, todayISO } from '@/lib/utils'

function AvailabilityCard() {
  const navigate = useNavigate()
  const today = todayISO()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  // Check-out can never be on or before check-in.
  const minCheckOut = checkIn ? addDaysISO(checkIn, 1) : addDaysISO(today, 1)

  function search(event: React.FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    params.set('guests', String(guests))
    navigate(`/rooms?${params}`)
  }

  const field =
    'w-full rounded-xl border border-line bg-surface-2 px-4 pt-6 pb-2.5 text-[0.9375rem] font-medium text-heading ' +
    'transition-colors focus:border-primary focus:outline-none [color-scheme:light] dark:[color-scheme:dark]'
  const label =
    'pointer-events-none absolute top-2.5 left-4 text-[0.625rem] font-bold tracking-[0.14em] text-muted uppercase'

  return (
    <div className="relative">
      <span className="absolute -top-3.5 -left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-mustard px-3.5 py-1.5 text-[0.6875rem] font-bold tracking-wide text-ink uppercase shadow-warm sm:-left-4">
        <Sparkles className="size-3.5" />
        Best rates guaranteed
      </span>

      <form
        onSubmit={search}
        className="card-surface w-full max-w-lg space-y-3.5 p-7 shadow-lift sm:p-8"
      >
        <h2 className="font-display text-[1.75rem] leading-tight font-bold">Check Availability</h2>
        <p className="!mt-1.5 pb-2 text-[0.9375rem] text-muted">
          Pick your dates - we confirm on WhatsApp in minutes.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <span className={label}>Check-in</span>
            <input
              type="date"
              required
              min={today}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value)
                if (checkOut && e.target.value >= checkOut) setCheckOut(addDaysISO(e.target.value, 1))
              }}
              className={field}
              aria-label="Check-in date"
            />
            <CalendarDays className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-accent" />
          </div>

          <div className="relative">
            <span className={label}>Check-out</span>
            <input
              type="date"
              required
              min={minCheckOut}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={field}
              aria-label="Check-out date"
            />
            <CalendarDays className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-accent" />
          </div>
        </div>

        <div className="relative">
          <span className={label}>Guests</span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={`${field} appearance-none`}
            aria-label="Number of guests"
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
          <Users className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-accent" />
        </div>

        <button
          type="submit"
          className="mt-1 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-on-primary transition-[background-color,transform] hover:bg-primary-hover active:scale-[0.99]"
        >
          <Search className="size-4" />
          Search Availability
        </button>
      </form>
    </div>
  )
}

/** How long each hero photograph holds before the next one fades in. */
const SLIDE_MS = 5500

export function Hero() {
  const [active, setActive] = useState(0)

  // Auto-advance through the photographs; stays on the first frame for reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setTimeout(() => setActive((a) => (a + 1) % heroSlides.length), SLIDE_MS)
    return () => window.clearTimeout(id)
  }, [active])

  return (
    <section className="relative isolate overflow-hidden">
      {heroSlides.map((slide, i) => (
        <Photo
          key={slide.key}
          id={slide.image}
          width={1920}
          widths={[640, 960, 1400, 1920, 2400]}
          sizes="100vw"
          alt=""
          aria-hidden
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchPriority={i === 0 ? 'high' : 'low'}
          className={`absolute inset-0 -z-20 size-full object-cover ${slide.focus} contrast-105 saturate-105 transition-opacity duration-[1200ms] ease-out ${
            i === active ? 'animate-kenburns opacity-100' : 'scale-[1.06] opacity-0'
          }`}
        />
      ))}

      {/* A light, neutral black wash rather than a colour cast - the photographs keep
          their own palette, and the left side still carries contrast for cream copy. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/62 from-0% via-black/38 via-45% to-black/18"
      />
      {/* Vertical weighting: the transparent header floats over the top edge, and the
          value panel below overlaps the bottom one. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-transparent via-38% to-black/45"
      />

      {/* Top padding carries the header's own height (h-18 / sm:h-20) on top of the
          section's spacing, since the bar is overlaid rather than stacked above. */}
      <div className="container-wide grid items-center gap-10 pt-28 pb-16 sm:gap-12 sm:pt-40 sm:pb-20 lg:grid-cols-[1.15fr_auto] lg:items-start lg:gap-16 lg:pt-44 lg:pb-32">
        <div className="order-2 max-w-3xl animate-rise lg:order-1">
          <p className="text-[0.8125rem] font-bold tracking-[0.28em] text-mustard uppercase">
            {site.motto}
          </p>

          <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6rem)] leading-[0.95] font-bold text-white">
            Travel More.
            <br />
            Pay Less.
          </h1>

          {/* The third line is the real logo lettering, not a font imitation. */}
          <Wordmark className="mt-4 h-[clamp(3.25rem,7.5vw,5.25rem)] w-[clamp(10.5rem,24vw,16.5rem)] text-mustard" />

          <p className="mt-7 max-w-lg text-[1.1875rem] leading-relaxed text-gray-200 text-pretty">
            Comfortable stays, great vibes and new friends. Your journey begins here.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink to="/rooms" size="lg">
              Book Your Stay
            </ButtonLink>
            <ButtonAnchor
              href={enquiryUrl()}
              target="_blank"
              rel="noreferrer"
              size="lg"
              className="border border-cream/35 bg-cream/10 text-cream backdrop-blur-sm hover:bg-cream/20"
            >
              Chat with us
            </ButtonAnchor>
          </div>
        </div>

        {/* Card leads on mobile - copy and CTAs follow underneath. On desktop it moves
            back to the right, where `lg:mt-10` puts its top edge on the "Travel More"
            baseline-top. */}
        <div className="order-1 lg:order-2 lg:mt-10 lg:justify-self-end">
          <AvailabilityCard />
        </div>
      </div>
    </section>
  )
}
