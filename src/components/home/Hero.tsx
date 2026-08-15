import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Search, Sparkles, Users } from 'lucide-react'
import { Wordmark } from '@/components/brand/Wordmark'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { heroImage } from '@/data/content'
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
        className="card-surface w-full max-w-md space-y-3 p-6 shadow-lift sm:p-7"
      >
        <h2 className="font-display text-2xl font-semibold">Check Availability</h2>
        <p className="!mt-1 pb-2 text-[0.875rem] text-muted">
          Pick your dates — we confirm on WhatsApp in minutes.
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
          className="mt-1 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[0.9375rem] font-semibold text-on-primary transition-[background-color,transform] hover:bg-primary-hover active:scale-[0.99]"
        >
          <Search className="size-4" />
          Search Availability
        </button>
      </form>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Photo
        id={heroImage}
        width={1920}
        widths={[640, 960, 1400, 1920, 2400]}
        sizes="100vw"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 -z-20 size-full object-cover object-[60%_center] contrast-108 saturate-110"
      />
      {/* Maroon-weighted scrim: dark enough for AA text on the left, clear on the right
          so the photograph still reads as a photograph. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-maroon-deep/85 from-8% via-maroon-deep/28 via-52% to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-canvas from-2% via-transparent via-35% to-ink/35"
      />

      <div className="container-page grid items-center gap-12 pt-16 pb-20 sm:pt-20 lg:grid-cols-[1.15fr_auto] lg:gap-16 lg:pt-24 lg:pb-32">
        <div className="max-w-2xl animate-rise">
          <p className="text-[0.6875rem] font-bold tracking-[0.28em] text-mustard uppercase">
            {site.motto}
          </p>

          <h1 className="mt-5 font-display text-[clamp(2.75rem,7.5vw,5.25rem)] leading-[0.95] font-semibold text-cream">
            Travel More.
            <br />
            Pay Less.
          </h1>

          {/* The third line is the real logo lettering, not a font imitation. */}
          <Wordmark className="mt-4 h-[clamp(3rem,7vw,4.75rem)] w-[clamp(9.5rem,22vw,15rem)] text-mustard" />

          <p className="mt-7 max-w-md text-[1.0625rem] leading-relaxed text-cream/85 text-pretty">
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

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-cream/20 pt-7">
            {[
              [site.stats.guests, 'Happy guests'],
              [`${site.stats.rating}/5`, 'Average rating'],
              ['4', 'Locations in India'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl font-semibold text-cream">{value}</dt>
                <dd className="mt-0.5 text-[0.8125rem] text-cream/65">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:justify-self-end">
          <AvailabilityCard />
        </div>
      </div>
    </section>
  )
}
