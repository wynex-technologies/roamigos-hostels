import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import {
  ArrowUpRight,
  Bath,
  BedDouble,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Quote,
  ShieldCheck,
  Star,
  Users,
  Wallet,
} from 'lucide-react'
import { categoryLabels, getRoom, hostelAmenities, reviews, rooms } from '@/data/rooms'
import { site } from '@/data/site'
import { Gallery } from '@/components/room/Gallery'
import { BookingWidget, toDraft, useBookingState } from '@/components/room/BookingWidget'
import { GuestDetailsModal } from '@/components/room/GuestDetailsModal'
import { Photo } from '@/components/ui/Photo'
import { Container } from '@/components/ui/primitives'
import { bookingTotals } from '@/lib/whatsapp'
import { usePageMeta } from '@/lib/usePageMeta'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { useReveal } from '@/lib/useReveal'
import { cn, formatINR } from '@/lib/utils'

/** The jump links across the top of the page body. */
const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'book', label: 'Book' },
]

/** Kicker, display heading and the mustard rule - repeated down the page. */
function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-accent uppercase">{kicker}</p>
      <h2 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2.125rem)] leading-tight font-semibold">
        {title}
      </h2>
      <span aria-hidden className="mt-4 block h-px w-10 bg-accent-soft" />
    </div>
  )
}

/**
 * One block of the page.
 *
 * Below lg it is a disclosure: the kicker and the heading stay, the body folds
 * away. Four of these open at once is roughly six phone screens of reading, and
 * folded they let a visitor see what the page holds in one thumb-length.
 * From lg up the section is exactly what it always was - no button, no wrapper
 * around the children, so nothing clips the cards lifting on hover.
 */
function Block({
  id,
  kicker,
  title,
  children,
  collapsible,
  first,
}: {
  id?: string
  kicker: string
  title: string
  children: ReactNode
  /** True below lg, where the section folds. */
  collapsible: boolean
  /** The first block carries the list's opening rule instead of top margin. */
  first?: boolean
}) {
  const ref = useReveal<HTMLElement>(0.1)
  const { hash } = useLocation()
  const [open, setOpen] = useState(false)

  // A jump link has to land on an open section, not on a closed heading.
  useEffect(() => {
    if (id && hash === `#${id}`) setOpen(true)
  }, [hash, id])

  const panelId = `${id ?? kicker}-panel`.toLowerCase().replace(/\W+/g, '-')

  const head = (
    <>
      <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-accent uppercase">{kicker}</p>
      <h2 className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2.125rem)] leading-tight font-semibold">
        {title}
      </h2>
    </>
  )

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        'reveal-rise scroll-mt-36',
        collapsible ? cn('border-b border-line', first && 'border-t') : !first && 'mt-16',
      )}
    >
      {collapsible ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((was) => !was)}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex w-full items-start justify-between gap-5 py-6 text-left"
          >
            <span className="min-w-0">{head}</span>
            <span
              className={cn(
                'mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-line text-accent',
                'transition-[transform,background-color,border-color,color] duration-400 ease-[var(--ease-out-soft)]',
                open && 'rotate-180 border-transparent bg-mustard text-ink',
              )}
            >
              <ChevronDown className="size-4" aria-hidden />
            </span>
          </button>

          {/* `0fr` to `1fr` so the panel wipes open rather than snapping. `inert`
              keeps the folded copy out of the tab order and off the reader. */}
          <div
            id={panelId}
            className={cn(
              'grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-soft)]',
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div inert={!open} className="min-h-0 overflow-hidden">
              {/* The closing space lives inside the clipped box - padding on the
                  box itself survives `0fr` and leaves a gap under every folded
                  heading. */}
              <div className="pb-8">{children}</div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            {head}
            <span aria-hidden className="mt-4 block h-px w-10 bg-accent-soft" />
          </div>
          {children}
        </>
      )}
    </section>
  )
}

export default function RoomDetail() {
  const { slug = '' } = useParams()
  const room = getRoom(slug)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  if (!room) return <Navigate to="/rooms" replace />

  return <RoomDetailView key={room.slug} room={room} />
}

function RoomDetailView({ room }: { room: NonNullable<ReturnType<typeof getRoom>> }) {
  usePageMeta(
    `${room.name} - ${site.legalName}`,
    `${room.shortDescription} From ${formatINR(room.pricePerNight)} per night at ${site.legalName}.`,
  )

  const [booking, setBooking] = useBookingState(room)
  // Both Book Now buttons - the widget's and the sticky bar's - land here first.
  const [confirmOpen, setConfirmOpen] = useState(false)
  // The body sections fold below lg, which is also where the page drops to one
  // column and the sticky booking bar appears.
  const folds = !useMediaQuery('(min-width: 64rem)')
  const isDorm = room.categories.includes('dorm')
  const CapacityIcon = isDorm ? BedDouble : Users
  const unit = isDorm ? 'bed' : 'night'

  const { nights } = bookingTotals(toDraft(room, booking))
  const ready = Boolean(booking.checkIn && booking.checkOut && nights > 0)

  const similar = rooms
    .filter((r) => r.id !== room.id && r.categories.some((c) => room.categories.includes(c)))
    .slice(0, 3)

  /** The spec sheet - one fact per line, the way a rate card prints it. */
  const specs = [
    { label: isDorm ? 'Beds' : 'Sleeps', value: room.capacityLabel, icon: CapacityIcon },
    { label: 'Bathroom', value: room.bathroom, icon: Bath },
    { label: 'Max guests', value: room.maxGuestsNote, icon: Users },
    { label: 'Check-in / out', value: `${site.checkIn} / ${site.checkOut}`, icon: CalendarClock },
    { label: 'Cancellation', value: 'Free up to 24 hrs before', icon: ShieldCheck },
    { label: 'Payment', value: 'Pay at check-in, no prepayment', icon: Wallet },
  ]

  return (
    <>
      {/* ============================ cinematic frame =========================== */}
      <Gallery
        images={room.images}
        name={room.name}
        badge={room.badge}
        totalPhotos={room.totalPhotos}
        topSlot={
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[0.75rem] font-semibold tracking-wide text-gray-200/60 uppercase"
          >
            <Link to="/" className="transition-colors hover:text-mustard">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link to="/rooms" className="transition-colors hover:text-mustard">
              Rooms &amp; Beds
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-gray-200">{room.name}</span>
          </nav>
        }
      >
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-7">
          <div className="max-w-2xl">
            <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-mustard uppercase">
              {categoryLabels[room.categories[0]]}
            </p>

            <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-semibold text-white text-balance">
              {room.name}
            </h1>

            <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.9375rem] text-gray-200/80">
              <span className="inline-flex items-center gap-2">
                <CapacityIcon className="size-4 text-mustard" />
                {room.capacityLabel}
              </span>
              <span aria-hidden className="size-1 rotate-45 bg-cream/40" />
              <span className="inline-flex items-center gap-2">
                <Bath className="size-4 text-mustard" />
                {room.bathroom}
              </span>
              <span aria-hidden className="size-1 rotate-45 bg-cream/40" />
              <span className="inline-flex items-center gap-2">
                <Star className="size-4 fill-mustard text-mustard" aria-hidden />
                <span className="font-semibold text-gray-200">{room.rating.toFixed(1)}</span>
                <span className="text-gray-200/60">({room.reviewCount})</span>
              </span>
            </p>
          </div>

          {/* The rate, on glass - the one thing that should never need scrolling
              for. Off on phones: the sticky bar at the foot of the page already
              pins the same rate and the same way in, so up here it would only be
              covering the photograph twice over. */}
          <div className="hidden rounded-2xl border border-cream/15 bg-ink/45 p-5 backdrop-blur-lg md:block sm:p-6">
            <p className="text-[0.625rem] font-bold tracking-[0.2em] text-gray-200/60 uppercase">
              From
            </p>
            <p className="mt-2">
              <span className="font-display text-[2.25rem] leading-none font-semibold text-white">
                {formatINR(room.pricePerNight)}
              </span>
              <span className="text-[0.875rem] text-gray-200/70"> / {unit}</span>
            </p>
            <a
              href="#book"
              className="gloss-sweep mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cream px-7 text-[0.875rem] font-semibold text-ink transition-[background-color,transform] duration-300 hover:bg-mustard active:scale-[0.98]"
            >
              Check dates
              <ArrowUpRight className="size-4" />
            </a>
            <p className="mt-3 text-center text-[0.75rem] text-gray-200/60">
              Confirmed on WhatsApp in minutes
            </p>
          </div>
        </div>
      </Gallery>

      {/* ============================== jump links ============================= */}
      <div className="sticky top-18 z-30 border-b border-line bg-canvas/90 backdrop-blur-xl sm:top-20">
        <Container>
          <div className="no-scrollbar -mx-5 flex items-center gap-1 overflow-x-auto px-5 py-3 sm:mx-0 sm:px-0">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="shrink-0 rounded-full px-4 py-2 text-[0.875rem] font-semibold text-body transition-colors duration-300 hover:bg-surface-2 hover:text-heading"
              >
                {section.label}
              </a>
            ))}

            <span className="ml-auto hidden items-center gap-3 pl-4 sm:flex">
              <span className="text-[0.8125rem] text-muted">
                <span className="font-display text-lg font-semibold text-heading">
                  {formatINR(room.pricePerNight)}
                </span>{' '}
                / {unit}
              </span>
              <a
                href="#book"
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-[0.8125rem] font-semibold text-on-primary shadow-[0_12px_26px_-14px] shadow-maroon/80 transition-transform duration-200 active:scale-[0.98]"
              >
                Book now
              </a>
            </span>
          </div>
        </Container>
      </div>

      {/* ================================ body ================================ */}
      <Container className="py-12 pb-24 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_23rem] lg:gap-14 xl:grid-cols-[1fr_25rem]">
          <div className="min-w-0">
            {/* Overview - the lead, then the spec sheet beside it. */}
            <Block id="overview" kicker="The room" title="What you are booking" collapsible={folds} first>

              <p className="mt-6 max-w-2xl font-display text-[clamp(1.125rem,1.9vw,1.375rem)] leading-relaxed text-heading text-pretty">
                {room.subtitle}
              </p>

              <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-muted text-pretty">
                {room.about}
              </p>

              <dl className="mt-9 grid gap-x-10 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="group flex items-center gap-4 border-b border-line py-4"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-accent transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:-translate-y-0.5 group-hover:border-transparent group-hover:bg-mustard group-hover:text-ink">
                      <spec.icon className="size-[1.05rem]" />
                    </span>
                    <span className="min-w-0">
                      <dt className="text-[0.75rem] tracking-[0.14em] text-muted uppercase">
                        {spec.label}
                      </dt>
                      <dd className="mt-1 text-[0.9375rem] font-semibold text-heading text-pretty">
                        {spec.value}
                      </dd>
                    </span>
                  </div>
                ))}
              </dl>
            </Block>

            {/* What is in the room */}
            <Block
              id="inclusions"
              kicker="In the room"
              title="Everything that comes with it"
              collapsible={folds}
            >

              <ul className="mt-7 grid gap-x-8 gap-y-1 sm:grid-cols-2">
                {room.inclusions.map((item) => (
                  <li
                    key={item}
                    className="group flex gap-3 rounded-xl px-3 py-3 text-[0.9375rem] leading-relaxed transition-colors duration-300 hover:bg-surface-2"
                  >
                    <CheckCircle2 className="mt-0.5 size-[1.15rem] shrink-0 text-green-deep transition-transform duration-400 ease-[var(--ease-out-soft)] group-hover:scale-110 dark:text-green" />
                    <span className="text-pretty">{item}</span>
                  </li>
                ))}
              </ul>

              {/* The highlights, as a printed strip under the list. */}
              <ul className="mt-8 flex flex-wrap gap-2.5 border-t border-line pt-7">
                {room.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="group inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 text-[0.875rem] font-semibold text-heading transition-[border-color,background-color,transform] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-2"
                  >
                    <span
                      aria-hidden
                      className="size-1.5 rotate-45 bg-mustard transition-transform duration-400 group-hover:rotate-[135deg]"
                    />
                    {highlight}
                  </li>
                ))}
              </ul>
            </Block>

            {/* House amenities - a spec table, not tiles. */}
            <Block
              id="amenities"
              kicker="The house"
              title="Included with every stay"
              collapsible={folds}
            >

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {hostelAmenities.map((amenity) => (
                  <li key={amenity.label}>
                    <div className="group relative flex items-center gap-4 overflow-hidden rounded-xl2 border border-line bg-surface px-5 py-4 transition-[transform,border-color,box-shadow] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-line-strong hover:shadow-warm">
                      {/* A slow mustard wash that crosses the card on hover. */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-mustard/12 to-transparent transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:translate-x-full"
                      />

                      <span className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-line text-accent transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:scale-105 group-hover:border-transparent group-hover:bg-mustard group-hover:text-ink">
                        <amenity.icon className="size-[1.15rem]" />
                      </span>

                      <span className="relative min-w-0 text-[0.9375rem] font-semibold text-heading text-pretty">
                        {amenity.label}
                      </span>

                      <Check
                        aria-hidden
                        className="relative ml-auto size-4 shrink-0 translate-x-1 text-accent opacity-0 transition-[opacity,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Block>

            {/* Reviews - the score, then the words. */}
            <Block
              id="reviews"
              kicker="From the guest book"
              title="What guests are saying"
              collapsible={folds}
            >

              <div className="mt-7 grid gap-6 lg:grid-cols-[15rem_1fr] lg:gap-8">
                <div className="card-raised flex flex-col items-center justify-center p-7 text-center">
                  <p className="font-display text-[3.5rem] leading-none font-semibold text-heading">
                    {room.rating.toFixed(1)}
                  </p>
                  <div className="mt-3 flex gap-1" aria-hidden>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'size-4',
                          i < Math.round(room.rating)
                            ? 'fill-mustard text-mustard'
                            : 'text-line-strong',
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-[0.8125rem] text-muted">
                    {room.reviewCount} verified reviews
                  </p>
                </div>

                <ul className="grid gap-5 sm:grid-cols-2">
                  {reviews.slice(0, 4).map((review) => (
                    <li
                      key={review.name}
                      className="group card-raised relative overflow-hidden p-6 transition-[transform,box-shadow] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-raised-lg"
                    >
                      <Quote
                        aria-hidden
                        className="absolute -top-2 right-4 size-16 text-accent-soft/12 transition-transform duration-600 ease-[var(--ease-out-soft)] group-hover:scale-110"
                      />

                      <div className="relative flex items-center gap-3.5">
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-maroon font-display text-lg font-semibold text-cream">
                          {review.name[0]}
                        </span>
                        <span>
                          <span className="block font-semibold text-heading">{review.name}</span>
                          <span className="text-[0.8125rem] text-muted">{review.date}</span>
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-heading">
                          <Star className="size-3.5 fill-mustard text-mustard" aria-hidden />
                          {review.rating}/5
                        </span>
                      </div>

                      <p className="relative mt-4 text-[0.9375rem] leading-relaxed text-pretty">
                        {review.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Block>
          </div>

          {/* --------------------------- booking sidebar ---------------------------
              From lg up it is the sticky column beside the body. Below that the
              grid stacks, and the widget is ordered ahead of the sections: on a
              phone the dates are the first thing asked for after the photographs,
              not something to be found under four folded blocks. */}
          <aside className="order-first lg:order-none lg:sticky lg:top-36 lg:self-start">
            <BookingWidget
              id="book"
              room={room}
              state={booking}
              setState={setBooking}
              onBook={() => setConfirmOpen(true)}
            />
          </aside>
        </div>
      </Container>

      {/* ============================= similar rooms ========================== */}
      {similar.length > 0 && (
        <section className="border-t border-line bg-surface-2 py-14 lg:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHead kicker="Still deciding?" title="Other beds in the house" />
              <Link
                to="/rooms"
                className="group inline-flex items-center gap-2 pb-1 text-[0.875rem] font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                See all rooms
                <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <ul className="mt-8 grid gap-5 sm:grid-cols-3">
              {similar.map((item) => {
                const otherUnit = item.categories.includes('dorm') ? 'bed' : 'night'
                return (
                  <li key={item.id}>
                    <Link
                      to={`/rooms/${item.slug}`}
                      className="group relative isolate flex h-72 flex-col justify-end overflow-hidden rounded-xl2 border border-line shadow-warm transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:shadow-warm-lg"
                    >
                      <Photo
                        id={item.images[0]}
                        width={700}
                        widths={[400, 700, 900]}
                        sizes="(min-width: 640px) 22rem, 90vw"
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.08]"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/10"
                      />

                      <div className="p-5">
                        <span
                          aria-hidden
                          className="block h-px w-7 origin-left bg-mustard transition-transform duration-600 ease-[var(--ease-out-soft)] group-hover:scale-x-[3.5]"
                        />
                        <h3 className="mt-4 font-display text-[1.25rem] leading-tight font-semibold text-white text-balance">
                          {item.name}
                        </h3>
                        <p className="mt-2 text-[0.8125rem] text-gray-200">{item.capacityLabel}</p>

                        <p className="mt-4 flex items-end justify-between gap-3 border-t border-cream/15 pt-4">
                          <span>
                            <span className="font-display text-[1.5rem] leading-none font-semibold text-white">
                              {formatINR(item.pricePerNight)}
                            </span>
                            <span className="text-[0.75rem] text-gray-200/70"> / {otherUnit}</span>
                          </span>
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cream/95 text-maroon transition-transform duration-400 ease-[var(--ease-out-soft)] group-hover:rotate-45">
                            <ArrowUpRight className="size-4" />
                          </span>
                        </p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      )}

      {/* ---------------------------- mobile booking bar ---------------------------- */}
      <div className="sticky bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur-xl lg:hidden">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-soft to-transparent"
        />
        <div className="container-page flex items-center justify-between gap-4 py-3.5">
          <div>
            <p className="font-display text-xl font-semibold text-heading">
              {formatINR(room.pricePerNight)}
              <span className="text-[0.8125rem] font-normal text-muted"> / {unit}</span>
            </p>
            <p className="text-[0.75rem] text-muted">
              {ready
                ? `${nights} ${nights === 1 ? 'night' : 'nights'} selected`
                : 'Pay at check-in'}
            </p>
          </div>

          {ready ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="gloss-sweep inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-on-primary shadow-[0_14px_30px_-16px] shadow-maroon/80 transition-transform duration-200 active:scale-[0.98]"
            >
              Book Now
            </button>
          ) : (
            <a
              href="#book"
              className="gloss-sweep inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-on-primary shadow-[0_14px_30px_-16px] shadow-maroon/80 transition-transform duration-200 active:scale-[0.98]"
            >
              Select dates
            </a>
          )}
        </div>
      </div>

      <GuestDetailsModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        room={room}
        state={booking}
        setState={setBooking}
      />
    </>
  )
}
