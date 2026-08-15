import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, MessageCircle, SlidersHorizontal, X } from 'lucide-react'
import { RoomCard } from '@/components/rooms/RoomCard'
import { RoomFilters } from '@/components/rooms/RoomFilters'
import {
  activeFilterCount,
  applyFilters,
  categoryOptions,
  emptyFilters,
  sortOptions,
  type FilterState,
  type SortKey,
} from '@/components/rooms/filters'
import { ButtonAnchor } from '@/components/ui/Button'
import { Container, Eyebrow, SectionTitle } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { roomsPageAmenities, roomsPageAssurances } from '@/data/content'
import { site } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { usePageMeta } from '@/lib/usePageMeta'
import { cn, formatDate } from '@/lib/utils'

export default function Rooms() {
  usePageMeta(
    `Rooms & Beds — ${site.legalName}`,
    'Cozy dorms, private rooms and deluxe stays at Roamigos. Compare beds, prices and amenities, then book on WhatsApp.',
  )

  const [params] = useSearchParams()
  const checkIn = params.get('checkIn') ?? ''
  const checkOut = params.get('checkOut') ?? ''
  const guests = Number(params.get('guests')) || undefined

  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const visible = useMemo(() => applyFilters(filters, guests), [filters, guests])
  const active = activeFilterCount(filters)

  /** Carry the hero's dates through to the room detail page. */
  const query = params.toString()

  return (
    <>
      {/* Page header */}
      <section className="border-b border-line bg-surface-2 pt-10 pb-12 sm:pt-12 sm:pb-16">
        <Container>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-wide text-muted uppercase">
            <Link to="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-heading">Rooms & Beds</span>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-xl">
              <Eyebrow>Find your bed</Eyebrow>
              <SectionTitle as="h1" className="mt-3" underline="Beds">
                Rooms &
              </SectionTitle>
              <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty">
                Choose from cozy dorms to private retreats. Find your perfect space to relax,
                connect &amp; unwind.
              </p>

              {(checkIn || checkOut) && (
                <p className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[0.8125rem]">
                  <span className="font-semibold text-heading">Your dates:</span>
                  <span className="text-muted">
                    {formatDate(checkIn) || 'Any'} → {formatDate(checkOut) || 'Any'}
                    {guests ? ` · ${guests} ${guests === 1 ? 'guest' : 'guests'}` : ''}
                  </span>
                  <Link to="/rooms" className="font-semibold text-primary underline-offset-4 hover:underline">
                    Clear
                  </Link>
                </p>
              )}
            </div>

            <ul className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-xl2 border border-line bg-surface p-6 sm:grid-cols-4 lg:w-auto">
              {roomsPageAssurances.map((item) => (
                <li key={item.title} className="text-center">
                  <span className="mx-auto grid size-9 place-items-center text-accent">
                    <Icon name={item.icon} className="size-5" />
                  </span>
                  <p className="mt-2 text-[0.8125rem] font-semibold text-heading">{item.title}</p>
                  <p className="text-[0.75rem] text-muted">{item.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Category chips + sort */}
      <Container className="py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
            {categoryOptions.map((option) => {
              const isActive = filters.category === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFilters({ ...filters, category: option.key })}
                  aria-pressed={isActive}
                  className={cn(
                    'shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-line bg-surface text-body hover:border-line-strong hover:text-heading',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-heading lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {active > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.6875rem] text-on-primary">
                  {active}
                </span>
              )}
            </button>

            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="hidden sm:inline">Sort by:</span>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortKey })}
                className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-heading focus:border-primary focus:outline-none"
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

      {/* Sidebar + grid */}
      <Container className="pb-20">
        <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="card-surface p-6">
                <h2 className="mb-6 font-display text-xl font-semibold">Filter Rooms</h2>
                <RoomFilters state={filters} onChange={setFilters} />
              </div>

              <div className="rounded-xl2 border border-line bg-surface-2 p-6">
                <h3 className="font-display text-lg font-semibold">Need help choosing?</h3>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-muted text-pretty">
                  Tell us your dates and we&apos;ll suggest the right bed for your trip.
                </p>
                <ButtonAnchor
                  href={enquiryUrl("Hi Roamigos! Help me pick the right room, please.")}
                  target="_blank"
                  rel="noreferrer"
                  variant="whatsapp"
                  size="sm"
                  className="mt-5 w-full"
                >
                  <MessageCircle className="size-4" />
                  Chat with us
                </ButtonAnchor>
              </div>
            </div>
          </aside>

          <div>
            <p className="mb-6 text-[0.9375rem] text-muted">
              Showing{' '}
              <span className="font-semibold text-heading">
                {visible.length} of {applyFilters(emptyFilters).length}
              </span>{' '}
              rooms
            </p>

            {visible.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((room) => (
                  <RoomCard key={room.id} room={room} search={query} />
                ))}
              </div>
            ) : (
              <div className="card-surface px-6 py-16 text-center">
                <p className="font-display text-xl font-semibold">No rooms match those filters</p>
                <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] text-muted text-pretty">
                  Try widening the price range or clearing a filter — or just message us and
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

            {/* Included with every stay */}
            <div className="mt-14 rounded-xl2 border border-line bg-surface p-6 sm:p-8">
              <h2 className="text-[0.6875rem] font-bold tracking-[0.22em] text-accent uppercase">
                Included with every stay
              </h2>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {roomsPageAmenities.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-accent">
                      <Icon name={item.icon} className="size-[1.05rem]" />
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
          </div>
        </div>
      </Container>

      {/* Mobile filter drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 overflow-hidden lg:hidden',
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
          <div className="sticky top-0 flex items-center justify-between border-b border-line bg-canvas px-6 py-5">
            <h2 className="font-display text-xl font-semibold">Filter Rooms</h2>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              className="grid size-10 place-items-center rounded-full border border-line text-heading"
            >
              <X className="size-[1.15rem]" />
            </button>
          </div>

          <div className="px-6 py-6">
            <RoomFilters state={filters} onChange={setFilters} />
          </div>

          <div className="sticky bottom-0 border-t border-line bg-canvas px-6 py-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="h-12 w-full rounded-full bg-primary font-semibold text-on-primary"
            >
              Show {visible.length} {visible.length === 1 ? 'room' : 'rooms'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
