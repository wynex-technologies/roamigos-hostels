import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowUpRight,
  Bath,
  BedDouble,
  ChevronRight,
  Images,
  MessageCircle,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Users,
  X,
} from 'lucide-react'
import { RoomFilters } from '@/components/rooms/RoomFilters'
import {
  activeFilterCount,
  applyFilters,
  categoryOptions,
  counts,
  emptyFilters,
  sortOptions,
  type FilterState,
  type SortKey,
} from '@/components/rooms/filters'
import { categoryLabels, rooms as allRooms, type Room } from '@/data/rooms'
import { Photo } from '@/components/ui/Photo'
import { ButtonAnchor } from '@/components/ui/Button'
import { Badge, Container } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { heroSlides, roomsPageAmenities, roomsPageAssurances } from '@/data/content'
import { site } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { usePageMeta } from '@/lib/usePageMeta'
import { useReveal } from '@/lib/useReveal'
import { cn, formatDate, formatINR } from '@/lib/utils'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

const cheapest = Math.min(...allRooms.map((room) => room.pricePerNight))

/** Both selects in the quick bar - room type on mobile, sort everywhere. */
const selectClass =
  'w-full cursor-pointer truncate rounded-full border border-line bg-surface px-3 py-2.5 ' +
  'text-[0.8125rem] font-semibold text-heading transition-colors hover:border-line-strong ' +
  'focus:border-primary focus:outline-none sm:w-auto sm:px-4 sm:text-sm'

/** The four numbers worth printing under the masthead. */
const marquee = [
  { value: String(allRooms.length), label: 'Rooms & dorms' },
  { value: formatINR(cheapest), label: 'Cheapest bed' },
  {
    value: `${site.stats.rating}/5`,
    label: `${site.stats.reviews.toLocaleString('en-IN')} reviews`,
  },
  { value: 'On arrival', label: 'Pay at check-in' },
]

/**
 * Reset, printed beside the Refine heading in both the rail and the drawer -
 * the full-width Reset still closes the panel, but this one saves the scroll.
 */
function ResetButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.75rem] font-semibold text-body transition-colors duration-300 hover:border-primary hover:text-primary"
    >
      <RotateCcw className="size-3.5 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-rotate-180" />
      Reset ({count})
    </button>
  )
}

export default function Rooms() {
  usePageMeta(
    `Rooms & Beds - ${site.legalName}`,
    'Cozy dorms, private rooms and deluxe stays at Roamigos. Compare beds, prices and amenities, then book on WhatsApp.',
  )

  const [params] = useSearchParams()
  const checkIn = params.get('checkIn') ?? ''
  const checkOut = params.get('checkOut') ?? ''
  const guests = Number(params.get('guests')) || undefined

  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const masthead = useReveal<HTMLDivElement>(0.15)

  const visible = useMemo(() => applyFilters(filters, guests), [filters, guests])
  const active = activeFilterCount(filters)
  const total = applyFilters(emptyFilters).length

  /** Carry the hero's dates through to the room detail page. */
  const query = params.toString()

  return (
    <>
      {/* The masthead is hidden on phones, so this carries the page's heading
          for screen readers and search engines when it is not on screen. */}
      <h1 className="sr-only md:hidden">Rooms &amp; beds at {site.legalName}, Guwahati</h1>

      {/* ============================== masthead ============================== */}
      <section className="relative isolate hidden min-h-[38rem] flex-col justify-end overflow-hidden pt-14 pb-12 sm:min-h-[46rem] sm:pt-16 md:flex lg:min-h-[calc(100svh-5rem)] lg:pb-20">
        <Photo
          id={heroSlides[1].image}
          width={2000}
          widths={[900, 1400, 2000]}
          sizes="100vw"
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[55%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/75 to-ink/45"
        />

        <Container>
          <div ref={masthead}>
            <nav
              aria-label="Breadcrumb"
              style={lag(0)}
              className="reveal-rise flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-wide text-gray-200/60 uppercase"
            >
              <Link to="/" className="transition-colors hover:text-mustard">
                Home
              </Link>
              <ChevronRight className="size-3.5" />
              <span className="text-gray-200">Rooms &amp; Beds</span>
            </nav>

            <h1 className="mt-8 max-w-3xl font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] font-semibold text-white">
              <span style={lag(0.12)} className="reveal-line">
                <span>Eight ways to sleep</span>
              </span>
              <span style={lag(0.24)} className="reveal-line">
                <span>
                  in <em className="font-normal text-mustard italic">Guwahati</em>.
                </span>
              </span>
            </h1>

            <p
              style={lag(0.4)}
              className="reveal-rise mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-gray-200 text-pretty"
            >
              From a curtained pod bunk at {formatINR(cheapest)} to a family room that takes four.
              Same warm floor, same front desk, same hot showers at six in the morning.
            </p>

            {(checkIn || checkOut) && (
              <p
                style={lag(0.48)}
                className="reveal-rise mt-7 inline-flex flex-wrap items-center gap-2 rounded-full border border-cream/20 bg-ink/45 px-4 py-2 text-[0.8125rem] text-cream backdrop-blur-md"
              >
                <span className="font-semibold">Your dates:</span>
                <span className="text-gray-200/75">
                  {formatDate(checkIn) || 'Any'} → {formatDate(checkOut) || 'Any'}
                  {guests ? ` · ${guests} ${guests === 1 ? 'guest' : 'guests'}` : ''}
                </span>
                <Link
                  to="/rooms"
                  className="font-semibold text-mustard underline-offset-4 hover:underline"
                >
                  Clear
                </Link>
              </p>
            )}

            {/* The numbers, on the hairline that closes the masthead. */}
            <ul
              style={lag(0.56)}
              className="reveal-rise mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-cream/15 pt-8 sm:grid-cols-4"
            >
              {marquee.map((item) => (
                <li key={item.label}>
                  <p className="font-display text-[1.625rem] leading-none font-semibold text-white">
                    {item.value}
                  </p>
                  <p className="mt-2 text-[0.75rem] tracking-[0.14em] text-gray-200/60 uppercase">
                    {item.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ============================== quick bar ============================= */}
      <div className="sticky top-18 z-30 border-b border-line bg-canvas/90 backdrop-blur-xl sm:top-20">
        <Container>
          <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Chips from lg up, where the row has the width for eight of them.
                Below that the same choice is a select in the control row. */}
            <div className="hidden gap-2.5 lg:flex lg:flex-wrap">
              {categoryOptions.map((option) => {
                const isActive = filters.category === option.key
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFilters({ ...filters, category: option.key })}
                    aria-pressed={isActive}
                    className={cn(
                      'shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold',
                      'transition-[background-color,border-color,color,box-shadow] duration-300 ease-[var(--ease-out-soft)]',
                      isActive
                        ? 'border-transparent bg-primary text-on-primary shadow-[0_12px_26px_-14px] shadow-maroon/80'
                        : 'border-line bg-surface text-body hover:border-line-strong hover:text-heading',
                    )}
                  >
                    {option.label}
                    <span
                      className={cn(
                        'ml-2 text-[0.6875rem] tabular-nums',
                        isActive ? 'text-on-primary/70' : 'text-muted',
                      )}
                    >
                      {counts.category[option.key]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Room type, filters and sort share one line on a phone: each
                control takes an equal third of the row and stops shrinking once
                there is width for all three to sit at their natural size. */}
            <div className="flex items-center gap-2 sm:gap-3">
              <label className="min-w-0 flex-1 sm:flex-none lg:hidden">
                <span className="sr-only">Room type</span>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value as FilterState['category'] })
                  }
                  className={selectClass}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Icon alone on the narrowest phones - three labelled controls do
                  not fit one line at 340px, and the two selects need their words
                  more than this button does. It picks the word back up at sm. */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Filters"
                className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-heading transition-colors hover:border-line-strong sm:px-4 lg:hidden"
              >
                <SlidersHorizontal className="size-4 shrink-0" />
                <span className="hidden sm:inline">Filters</span>
                {active > 0 && (
                  <span className="absolute -top-1 -right-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[0.6875rem] text-on-primary sm:static sm:size-5">
                    {active}
                  </span>
                )}
              </button>

              <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted sm:flex-none">
                <span className="hidden sm:inline">Sort by:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortKey })}
                  className={selectClass}
                >
                  {sortOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </Container>
      </div>

      {/* =========================== rail + the rooms ========================= */}
      <Container className="py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-12">
          {/* The refine rail. */}
          <aside className="hidden lg:block">
            <div className="sticky top-40 space-y-6">
              <div className="card-raised p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[0.6875rem] font-bold tracking-[0.22em] text-accent uppercase">
                    Refine
                  </h2>
                  {active > 0 && (
                    <ResetButton
                      count={active}
                      onClick={() => setFilters({ ...emptyFilters, sort: filters.sort })}
                    />
                  )}
                </div>
                <span aria-hidden className="mt-4 mb-6 block h-px w-full bg-line" />

                <RoomFilters
                  state={filters}
                  onChange={setFilters}
                  resultCount={visible.length}
                  total={total}
                />
              </div>

              {/* The desk, one tap away - the only green on the page. */}
              <div className="card-raised relative overflow-hidden p-6">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-soft to-transparent"
                />
                <h3 className="font-display text-lg font-semibold">Still not sure?</h3>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-muted text-pretty">
                  Tell us your dates and how you travel. We reply with one honest suggestion.
                </p>
                <ButtonAnchor
                  href={enquiryUrl('Hi Roamigos! Help me pick the right room, please.')}
                  target="_blank"
                  rel="noreferrer"
                  variant="whatsapp"
                  size="sm"
                  className="mt-5 w-full"
                >
                  <MessageCircle className="size-4" />
                  Ask the desk
                </ButtonAnchor>
              </div>
            </div>
          </aside>

          {/* The rooms. */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <p className="text-[0.9375rem] text-muted">
                Showing{' '}
                <span className="font-semibold text-heading tabular-nums">
                  {visible.length} of {total}
                </span>{' '}
                rooms
              </p>

              {active > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters({ ...emptyFilters, sort: filters.sort })}
                  className="group inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  Clear {active} {active === 1 ? 'filter' : 'filters'}
                  <X className="size-3.5 transition-transform duration-300 group-hover:rotate-90" />
                </button>
              )}
            </div>

            {visible.length > 0 ? (
              <ul className="mt-7 grid gap-6 xl:grid-cols-2">
                {visible.map((room, i) => (
                  <li key={room.id}>
                    <RoomRow
                      room={room}
                      index={i + 1}
                      search={query}
                      style={{ animationDelay: `${Math.min(i, 6) * 70}ms` }}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="card-raised mt-7 px-6 py-20 text-center">
                <p className="font-display text-xl font-semibold">No rooms match those filters</p>
                <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] text-muted text-pretty">
                  Try widening the price range or clearing a filter - or just message us and
                  we&apos;ll sort it out.
                </p>
                <button
                  type="button"
                  onClick={() => setFilters({ ...emptyFilters, sort: filters.sort })}
                  className="mt-6 rounded-full border border-line-strong px-6 py-2.5 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* ========================= included with every stay ==================== */}
      <section className="border-y border-line bg-surface-2 py-14 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-16">
            <div>
              <p className="eyebrow flex items-center gap-2.5">
                <span aria-hidden className="size-1.5 rotate-45 bg-accent-soft" />
                No small print
              </p>
              <h2 className="mt-5 font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-tight font-semibold">
                Every bed comes with the same house.
              </h2>
              <ul className="mt-7 flex flex-wrap gap-2.5">
                {roomsPageAssurances.map((item) => (
                  <li
                    key={item.title}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[0.8125rem] font-semibold text-heading"
                  >
                    <Icon name={item.icon} className="size-4 text-accent" />
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>

            <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
              {roomsPageAmenities.map((item) => (
                <li key={item.title} className="group flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-accent transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:-translate-y-0.5 group-hover:border-transparent group-hover:bg-mustard group-hover:text-ink">
                    <Icon name={item.icon} className="size-[1.15rem]" />
                  </span>
                  <span>
                    <span className="block text-[0.9375rem] font-semibold text-heading">
                      {item.title}
                    </span>
                    <span className="text-[0.8125rem] text-muted">{item.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ========================== mobile filter drawer ======================
          Portalled to the body: `<main>` carries `relative z-10`, so a sheet
          rendered in place would sit under the sticky header. */}
      {createPortal(
        <div
          className={cn(
            'fixed inset-0 z-100 overflow-hidden lg:hidden',
            drawerOpen ? '' : 'pointer-events-none',
          )}
          aria-hidden={!drawerOpen}
        >
          <div
            onClick={() => setDrawerOpen(false)}
            className={cn(
              'absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300',
              drawerOpen ? 'opacity-100' : 'opacity-0',
            )}
          />
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[1.75rem] bg-canvas shadow-lift',
              'transition-transform duration-400 ease-[var(--ease-out-soft)]',
              drawerOpen ? 'translate-y-0' : 'translate-y-full',
            )}
          >
            <div className="sticky top-0 z-10 border-b border-line bg-canvas px-6 pt-3 pb-5">
              <span
                aria-hidden
                className="mx-auto mb-4 block h-1 w-10 rounded-full bg-line-strong"
              />
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold">Refine</h2>
                <div className="flex items-center gap-2">
                  {active > 0 && (
                    <ResetButton
                      count={active}
                      onClick={() => setFilters({ ...emptyFilters, sort: filters.sort })}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close filters"
                    className="grid size-10 place-items-center rounded-full border border-line text-heading transition-colors hover:border-primary hover:text-primary"
                  >
                    <X className="size-[1.15rem]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <RoomFilters
                state={filters}
                onChange={setFilters}
                resultCount={visible.length}
                total={total}
              />
            </div>

            <div className="sticky bottom-0 border-t border-line bg-canvas px-6 py-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-12 w-full rounded-full bg-primary font-semibold text-on-primary shadow-[0_14px_30px_-16px] shadow-maroon/80 transition-transform duration-200 active:scale-[0.98]"
              >
                Show {visible.length} {visible.length === 1 ? 'room' : 'rooms'}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

/**
 * One room, printed straight onto its photograph. At rest the picture is left
 * almost alone: the name, the rate and the way in, and nothing else. Everything
 * that helps you compare - what it sleeps, the bathroom, the rating, the first
 * two inclusions - rides up on hover, and the wash deepens to carry it. Below lg
 * there is no hover to speak of, so the card stays at two columns: name, rate.
 */
function RoomRow({
  room,
  index,
  search,
  style,
}: {
  room: Room
  index: number
  search?: string
  style?: React.CSSProperties
}) {
  const CapacityIcon = room.categories.includes('dorm') ? BedDouble : Users
  const unit = room.categories.includes('dorm') ? 'bed' : 'night'

  return (
    <Link
      to={{ pathname: `/rooms/${room.slug}`, search }}
      style={style}
      className="group relative isolate block h-[19rem] animate-rise overflow-hidden rounded-xl2 border border-line shadow-warm transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:shadow-warm-lg sm:h-[22rem] lg:h-[27rem]"
    >
      <Photo
        id={room.images[0]}
        width={1400}
        widths={[700, 1000, 1400]}
        sizes="(min-width: 1024px) 46rem, 100vw"
        alt={room.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
      />

      {/* Two shallow scrims - one under the eyebrow, one under the type. Neither
          reaches the middle of the frame, so the room itself stays visible. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-ink/55 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent"
      />
      {/* Hover brings more words, so it brings more shade with it. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/92 via-ink/55 to-ink/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Index and category, printed straight on the picture. */}
      <p className="absolute top-5 left-5 flex items-center gap-3 sm:top-6 sm:left-6">
        <span className="font-display text-[0.8125rem] font-semibold text-gray-200/70 tabular-nums">
          {String(index).padStart(2, '0')}
        </span>
        {/* The rule grows by width, not by transform - a scaled rule keeps its
            layout box and would run straight through the category label. */}
        <span
          aria-hidden
          className="h-px w-7 shrink-0 bg-mustard transition-[width] duration-600 ease-[var(--ease-out-soft)] group-hover:w-16"
        />
        <span className="text-[0.6875rem] font-bold tracking-[0.16em] text-mustard uppercase">
          {categoryLabels[room.categories[0]]}
        </span>
      </p>

      <div className="absolute top-5 right-5 flex flex-col items-end gap-2.5 sm:top-6 sm:right-6">
        {room.badge && (
          <Badge tone="accent" className="shadow-warm">
            {room.badge}
          </Badge>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-ink/45 px-2.5 py-1 text-[0.6875rem] font-semibold text-cream backdrop-blur-md transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100">
          <Images className="size-3" />
          {room.totalPhotos} photos
        </span>
      </div>

      {/* The type, straight on the photograph - no plate under it. Name against
          rate on one line, so a narrow card in the two-up grid still reads. */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-7">
        <div className="flex items-end justify-between gap-4 lg:items-baseline">
          <h2 className="min-w-0 font-display text-[1.125rem] leading-tight font-semibold text-white sm:text-[1.375rem] lg:text-[1.5rem]">
            {room.name}
          </h2>

          {/* Below lg this is the rate. At lg it only holds the column open - the
              pinned copy further down is the one that shows. */}
          <div className="shrink-0 lg:invisible">
            <Rate price={room.pricePerNight} unit={unit} />
          </div>
        </div>

        {/* The amenities, desktop only. `0fr` to `1fr` so the strip opens between
            the name and the button, lifting the name with it. It is capped short
            of the rate column, so the two never crowd each other. */}
        <div className="hidden transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-soft)] lg:grid lg:grid-rows-[0fr] lg:opacity-0 lg:group-hover:grid-rows-[1fr] lg:group-hover:opacity-100">
          <div className="overflow-hidden">
            <p className="mt-3 flex max-w-[70%] flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem] text-gray-200/80">
              <span className="inline-flex items-center gap-1.5">
                <CapacityIcon className="size-4 text-mustard" />
                {room.capacityLabel}
              </span>
              <span aria-hidden className="size-1 rotate-45 bg-cream/40" />
              <span className="inline-flex items-center gap-1.5">
                <Bath className="size-4 text-mustard" />
                {room.bathroom}
              </span>
              <span aria-hidden className="size-1 rotate-45 bg-cream/40" />
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-3.5 fill-mustard text-mustard" aria-hidden />
                <span className="font-semibold text-gray-200">{room.rating.toFixed(1)}</span>
                <span className="text-gray-200/60">({room.reviewCount})</span>
              </span>
            </p>
          </div>
        </div>

        {/* The way in, held at the bottom edge while the strip opens above it. Its
            height is fixed, because the pinned rate is measured against it. */}
        <span className="mt-4 hidden h-11 w-full items-center justify-center gap-2 rounded-full bg-cream px-6 text-[0.875rem] font-semibold text-ink transition-colors duration-300 group-hover:bg-mustard lg:inline-flex">
          View room
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
        </span>

        {/* The rate stays still while the amenities open above it: pinned at the
            height the name rests at - 1.75rem of padding, the 2.75rem button and
            the 1rem gap over it. */}
        <div className="absolute right-7 bottom-22 hidden lg:block">
          <Rate price={room.pricePerNight} unit={unit} />
        </div>
      </div>
    </Link>
  )
}

/** The rate, printed the same way in both copies a card carries. */
function Rate({ price, unit }: { price: number; unit: string }) {
  return (
    <p className="relative font-display text-[1.5rem] leading-tight whitespace-nowrap text-right">
      <span className="absolute -top-3 right-0 text-[0.625rem] leading-none font-bold tracking-[0.2em] text-gray-200/60 uppercase">
        From
      </span>
      <span className="font-semibold text-white">{formatINR(price)}</span>
      <span className="text-[0.8125rem] text-gray-200/70"> / {unit}</span>
    </p>
  )
}
