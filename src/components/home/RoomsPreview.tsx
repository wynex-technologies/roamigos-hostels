import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Bath, BedDouble, Images, Star, Users } from 'lucide-react'
import { categoryLabels, rooms, type Room, type RoomCategory } from '@/data/rooms'
import { Photo } from '@/components/ui/Photo'
import { Badge, Container, Section } from '@/components/ui/primitives'
import { useReveal } from '@/lib/useReveal'
import { cn, formatINR } from '@/lib/utils'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

const filters: { key: RoomCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Rooms' },
  ...(Object.keys(categoryLabels) as RoomCategory[]).map((key) => ({
    key,
    label: categoryLabels[key],
  })),
]

const unit = (room: Room) => (room.categories.includes('dorm') ? 'bed' : 'night')
const capacityIcon = (room: Room) => (room.categories.includes('dorm') ? BedDouble : Users)

/** How long each room holds the stage before the next one takes it. */
const DWELL_MS = 2500

/**
 * Rooms, shown the way a hotel shows them: one photograph held at full height,
 * and a numbered index beside it. Running down the index - pointer or keyboard -
 * changes the plate; clicking a line opens the room. Below `lg` the same rooms
 * become a snap rail, because a stage needs width to be worth anything.
 */
export function RoomsPreview() {
  const [active, setActive] = useState<RoomCategory | 'all'>('all')
  const [current, setCurrent] = useState(0)
  /** The stage stops advancing while somebody is actually reading it. */
  const [held, setHeld] = useState(false)
  const header = useReveal<HTMLDivElement>(0.25)

  /** Printed on the chips, so the rail never promises more than it shows. */
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: rooms.length }
    for (const key of Object.keys(categoryLabels) as RoomCategory[]) {
      map[key] = rooms.filter((room) => room.categories.includes(key)).length
    }
    return map
  }, [])

  const visible = useMemo(
    () =>
      (active === 'all' ? rooms : rooms.filter((room) => room.categories.includes(active))).slice(
        0,
        4,
      ),
    [active],
  )

  // A filter can return a shorter list than the line being pointed at.
  const index = Math.min(current, visible.length - 1)
  const stage = visible[index]
  const StageCapacityIcon = stage ? capacityIcon(stage) : Users

  /**
   * Hands the stage to the next room on a timer. It is a chained timeout rather
   * than an interval, so pointing at a line restarts the dwell instead of the
   * stage jumping a beat later. Reduced motion never sees it move on its own.
   */
  useEffect(() => {
    if (held || visible.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timer = window.setTimeout(() => setCurrent((index + 1) % visible.length), DWELL_MS)
    return () => window.clearTimeout(timer)
  }, [held, index, visible.length])

  return (
    <Section id="rooms">
      <Container wide>
        <div ref={header}>
          <p style={lag(0)} className="reveal-rise eyebrow flex items-center gap-2.5">
            <span aria-hidden className="size-1.5 rotate-45 bg-accent-soft" />
            Rooms &amp; Beds
          </p>

          <div className="mt-6 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
            <h2 className="max-w-2xl font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08] font-semibold">
              <span style={lag(0.14)} className="reveal-line">
                <span>A bed for tonight,</span>
              </span>
              <span style={lag(0.26)} className="reveal-line">
                <span>
                  a <em className="font-normal text-accent-soft italic">room</em> for the week.
                </span>
              </span>
            </h2>

            <p
              style={lag(0.42)}
              className="reveal-rise max-w-sm text-[1.0625rem] leading-relaxed text-muted text-pretty lg:pb-2"
            >
              Curtained pod bunks, private doubles, a family room that takes four. Eight ways to
              stay - all of them on the same warm floor.
            </p>
          </div>

          <span
            aria-hidden
            style={lag(0.55)}
            className="reveal-rule mt-10 block h-px w-full origin-left bg-line"
          />
        </div>

        <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
            {filters.map((filter) => {
              const isActive = active === filter.key
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => {
                    setActive(filter.key)
                    setCurrent(0)
                  }}
                  aria-pressed={isActive}
                  className={cn(
                    'shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold',
                    'transition-[background-color,border-color,color,box-shadow] duration-300 ease-[var(--ease-out-soft)]',
                    isActive
                      ? 'border-transparent bg-primary text-on-primary shadow-[0_12px_26px_-14px] shadow-maroon/80'
                      : 'border-line bg-surface text-body hover:border-line-strong hover:text-heading',
                  )}
                >
                  {filter.label}
                  <span
                    className={cn(
                      'ml-2 text-[0.6875rem] tabular-nums',
                      isActive ? 'text-on-primary/70' : 'text-muted',
                    )}
                  >
                    {counts[filter.key]}
                  </span>
                </button>
              )
            })}
          </div>

          <Link
            to="/rooms"
            className="group inline-flex shrink-0 items-center gap-3 text-[0.9375rem] font-semibold text-heading"
          >
            <span className="relative">
              Browse all rooms
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-accent-soft transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-x-100"
              />
            </span>
            <span className="grid size-10 place-items-center rounded-full border border-line-strong text-accent transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary">
              <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </div>

        {visible.length === 0 ? (
          <p className="mt-14 text-center text-muted">No rooms in this category right now.</p>
        ) : (
          <>
            {/* --------------------------- the stage --------------------------- */}
            <div
              onMouseEnter={() => setHeld(true)}
              onMouseLeave={() => setHeld(false)}
              onFocusCapture={() => setHeld(true)}
              onBlurCapture={() => setHeld(false)}
              className="mt-9 hidden gap-10 lg:grid lg:grid-cols-[1.06fr_0.94fr] xl:gap-14"
            >
              <div className="relative h-[35rem] overflow-hidden rounded-xl2 border border-line shadow-raised xl:h-[38rem]">
                {visible.map((room, i) => (
                  <Photo
                    key={room.id}
                    id={room.images[0]}
                    width={1200}
                    widths={[700, 1000, 1400]}
                    sizes="(min-width: 1280px) 46rem, 42rem"
                    alt={room.name}
                    loading="lazy"
                    decoding="async"
                    aria-hidden={i !== index}
                    className={cn(
                      'absolute inset-0 size-full object-cover',
                      'transition-[opacity,transform] duration-[1100ms] ease-[var(--ease-out-soft)]',
                      i === index ? 'scale-100 opacity-100' : 'scale-105 opacity-0',
                    )}
                  />
                ))}

                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/45 via-40% to-ink/25"
                />

                {/* The dwell, drawn. Restarts with every hand-over, holds still
                    while the visitor is reading. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-0.5 bg-cream/15 motion-reduce:hidden"
                >
                  <span
                    key={index}
                    style={{ animationPlayState: held ? 'paused' : 'running' }}
                    className="block h-full w-full origin-left bg-mustard [animation:hero-progress_2500ms_linear_forwards]"
                  />
                </span>

                {stage.badge && (
                  <Badge tone="accent" className="absolute top-6 left-6 shadow-warm">
                    {stage.badge}
                  </Badge>
                )}

                <span className="absolute top-6 right-6 inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-ink/45 px-3 py-1 text-[0.6875rem] font-semibold text-cream backdrop-blur-md">
                  <Images className="size-3.5" />
                  {stage.totalPhotos} photos
                </span>

                {/* Everything that decides a booking, set straight on the picture -
                    no card behind it. The wash above and a soft text shadow do the
                    legibility work instead. */}
                <div className="absolute inset-x-7 bottom-7 [text-shadow:0_1px_18px_rgb(9_9_11/0.65)] xl:inset-x-9 xl:bottom-9">
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <p className="text-[0.625rem] font-bold tracking-[0.22em] text-mustard uppercase">
                        {String(index + 1).padStart(2, '0')} · Now viewing
                      </p>
                      <h3 className="mt-2.5 font-display text-[clamp(1.6rem,2.4vw,2.125rem)] leading-tight font-semibold text-white text-balance">
                        {stage.name}
                      </h3>
                    </div>

                    <p className="shrink-0 text-right">
                      <span className="block text-[0.625rem] font-bold tracking-[0.2em] text-gray-200/60 uppercase">
                        From
                      </span>
                      <span className="font-display text-[1.75rem] leading-none font-semibold text-white">
                        {formatINR(stage.pricePerNight)}
                      </span>
                      <span className="text-[0.8125rem] text-gray-200/70"> / {unit(stage)}</span>
                    </p>
                  </div>

                  <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-gray-200 text-pretty">
                    {stage.shortDescription}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-cream/25 pt-5">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem] text-gray-200/85">
                      <span className="inline-flex items-center gap-1.5">
                        <StageCapacityIcon className="size-4 text-mustard" />
                        {stage.capacityLabel}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Bath className="size-4 text-mustard" />
                        {stage.bathroom}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="size-4 fill-mustard text-mustard" aria-hidden />
                        <span className="font-semibold text-gray-200">
                          {stage.rating.toFixed(1)}
                        </span>
                        <span className="text-gray-200/60">({stage.reviewCount})</span>
                      </span>
                    </div>

                    <Link
                      to={`/rooms/${stage.slug}`}
                      className="group inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-[0.875rem] font-semibold text-ink [text-shadow:none] transition-[background-color,transform] duration-300 hover:bg-mustard active:scale-[0.98]"
                    >
                      View this room
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* --------------------------- the index -------------------------- */}
              <div className="flex flex-col">
                <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-accent uppercase">
                  The floor plan
                </p>

                <ul className="mt-3 flex flex-1 flex-col gap-3">
                  {visible.map((room, i) => {
                    const isOn = i === index
                    const CapacityIcon = capacityIcon(room)
                    return (
                      <li key={room.id} className="flex flex-1 items-stretch">
                        <Link
                          to={`/rooms/${room.slug}`}
                          onMouseEnter={() => setCurrent(i)}
                          onFocus={() => setCurrent(i)}
                          aria-current={isOn ? 'true' : undefined}
                          className={cn(
                            'group relative flex w-full items-center gap-5 overflow-hidden rounded-xl2 border px-5 py-4',
                            'transition-[background-color,border-color,box-shadow,transform] duration-400 ease-[var(--ease-out-soft)]',
                            isOn
                              ? 'border-line-strong bg-surface-2 shadow-raised'
                              : 'border-line bg-surface hover:border-line-strong',
                          )}
                        >
                          {/* Mustard edge down the box that currently holds the
                              stage - the boxes are otherwise identical, so this
                              is the only thing tying one to the photograph. */}
                          <span
                            aria-hidden
                            className={cn(
                              'absolute inset-y-0 left-0 w-[3px] origin-top bg-accent-soft transition-transform duration-600 ease-[var(--ease-out-soft)]',
                              isOn ? 'scale-y-100' : 'scale-y-0',
                            )}
                          />

                          <span
                            className={cn(
                              'font-display text-[0.8125rem] font-semibold tabular-nums transition-colors duration-400',
                              isOn ? 'text-accent' : 'text-line-strong',
                            )}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                'block truncate font-display text-[1.25rem] leading-snug font-semibold transition-[color,transform] duration-400 ease-[var(--ease-out-soft)]',
                                isOn ? 'text-primary' : 'text-heading',
                              )}
                            >
                              {room.name}
                            </span>
                            <span className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-muted">
                              <span className="inline-flex items-center gap-1.5">
                                <CapacityIcon className="size-3.5 text-accent" />
                                {room.capacityLabel}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Bath className="size-3.5 text-accent" />
                                {room.bathroom}
                              </span>
                            </span>
                          </span>

                          <span className="shrink-0 text-right">
                            <span className="block font-display text-[1.125rem] leading-tight font-semibold text-heading">
                              {formatINR(room.pricePerNight)}
                            </span>
                            <span className="text-[0.6875rem] text-muted">/ {unit(room)}</span>
                          </span>

                          <span
                            className={cn(
                              'grid size-9 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)]',
                              isOn
                                ? 'rotate-45 border-primary bg-primary text-on-primary'
                                : 'border-line text-muted',
                            )}
                          >
                            <ArrowUpRight className="size-4" />
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                <Link
                  to="/rooms"
                  className="group mt-6 inline-flex items-center gap-2 text-[0.875rem] font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  See all {rooms.length} rooms &amp; beds
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* --------------------------- the rail ---------------------------- */}
            <div className="no-scrollbar -mx-5 mt-9 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:hidden">
              {visible.map((room, i) => (
                <RoomPlate key={room.id} room={room} index={i + 1} />
              ))}
            </div>
          </>
        )}
      </Container>
    </Section>
  )
}

/** The rail card below `lg` - the stage, cut down to one portrait plate. */
function RoomPlate({ room, index }: { room: Room; index: number }) {
  const CapacityIcon = capacityIcon(room)

  return (
    <Link
      to={`/rooms/${room.slug}`}
      className="group relative isolate flex h-[27rem] w-[78vw] max-w-[21rem] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-xl2 border border-line shadow-warm"
    >
      <Photo
        id={room.images[0]}
        width={800}
        widths={[420, 700, 900]}
        sizes="78vw"
        alt={room.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/20"
      />

      {room.badge && (
        <Badge tone="accent" className="absolute top-4 left-4 shadow-warm">
          {room.badge}
        </Badge>
      )}

      <span className="absolute top-4 right-4 font-display text-[0.8125rem] font-semibold text-gray-200/70 tabular-nums">
        {String(index).padStart(2, '0')}
      </span>

      <div className="p-5">
        <h3 className="font-display text-[1.375rem] leading-tight font-semibold text-white text-balance">
          {room.name}
        </h3>

        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-gray-200/80">
          <span className="inline-flex items-center gap-1.5">
            <CapacityIcon className="size-3.5 text-mustard" />
            {room.capacityLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath className="size-3.5 text-mustard" />
            {room.bathroom}
          </span>
        </p>

        <p className="mt-3 line-clamp-2 text-[0.875rem] leading-relaxed text-gray-200 text-pretty">
          {room.shortDescription}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-cream/15 pt-4">
          <p>
            <span className="block text-[0.625rem] font-bold tracking-[0.2em] text-gray-200/60 uppercase">
              From
            </span>
            <span className="font-display text-[1.5rem] leading-none font-semibold text-white">
              {formatINR(room.pricePerNight)}
            </span>
            <span className="text-[0.75rem] text-gray-200/70"> / {unit(room)}</span>
          </p>

          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream/95 text-maroon">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
