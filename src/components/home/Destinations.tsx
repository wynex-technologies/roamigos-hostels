import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { promos, showcase, type ShowcaseCard } from '@/data/content'
import { useReveal } from '@/lib/useReveal'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/** Places first, then whatever offers are running - one deck, one rotation. */
const cards: ShowcaseCard[] = [...showcase, ...promos]

/** Only the first row's worth of cards fans out; the rest wait off-stage. */
const DEAL_COUNT = showcase.length
/** Middle of that row - cards fan outwards from here. */
const CENTRE = (DEAL_COUNT - 1) / 2

/** Longest deal transition (1.5s) plus the outermost card's lag and the caption's. */
const DEAL_SETTLE_MS = 2400
/** How long each frame holds before the deck slides on. */
const SLIDE_MS = 3800
/** Must match the track's transition duration below. */
const SLIDE_EASE_MS = 700
/**
 * The indicator is a fixed five dots however many cards are in rotation, so the
 * row keeps its rhythm as offers are added or dropped. With more cards than dots
 * it reads as position-in-cycle rather than one-dot-per-card.
 */
const DOT_COUNT = Math.min(5, cards.length)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Holds the deck stacked until it comes into view, then flips `--deal` to 1 once.
 * The spread itself is a CSS transition, so it always plays out at its own pace
 * instead of being scrubbed by however fast the visitor happens to scroll.
 *
 * `dealt` turns true once that spread has finished, which is the cue for the
 * carousel to take over - the two motions never run on top of each other.
 */
function useDealOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [dealt, setDealt] = useState(false)

  // Layout effect, so the stacked state is in place before the first paint.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    // Reduced motion never sees the shuffle - `--deal` stays at its dealt default.
    if (prefersReducedMotion()) {
      setDealt(true)
      return
    }

    el.style.setProperty('--deal', '0')

    let timer = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.style.setProperty('--deal', '1')
        observer.disconnect()
        timer = window.setTimeout(() => setDealt(true), DEAL_SETTLE_MS)
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [])

  return [ref, dealt] as const
}

/**
 * Steps the track one card at a time and loops without a rewind: the list is
 * rendered twice, so frame `count` is pixel-identical to frame 0 and we can cut
 * back there with the transition switched off.
 */
function useAutoSlide(count: number, enabled: boolean) {
  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)

  /** Manual moves wrap inside the real set - the seam is autoplay's business. */
  const go = useCallback(
    (next: number) => {
      setAnimate(true)
      setIndex(next < 0 ? count - 1 : next >= count ? 0 : next)
    },
    [count],
  )

  useEffect(() => {
    if (!enabled || paused) return
    const id = window.setTimeout(() => setIndex((i) => i + 1), SLIDE_MS)
    return () => window.clearTimeout(id)
  }, [enabled, paused, index])

  // Landed on the duplicate's first frame - cut back to the real one silently.
  useEffect(() => {
    if (index !== count) return
    const id = window.setTimeout(() => {
      setAnimate(false)
      setIndex(0)
    }, SLIDE_EASE_MS)
    return () => window.clearTimeout(id)
  }, [index, count])

  // Two frames: one to paint at 0 un-animated, the next to re-arm the transition.
  useEffect(() => {
    if (animate) return
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimate(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [animate])

  // Nothing should keep sliding in a tab nobody is looking at.
  useEffect(() => {
    const sync = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  return { index, animate, setPaused, go }
}

export function Destinations() {
  const [deck, dealt] = useDealOnce<HTMLUListElement>()
  const header = useReveal<HTMLDivElement>(0.4)
  const [reduced] = useState(prefersReducedMotion)
  const { index, animate, setPaused, go } = useAutoSlide(cards.length, dealt && !reduced)
  const current = index % cards.length

  return (
    <section id="destinations" className="bg-canvas py-20 lg:py-28">
      <div ref={header} className="container-wide">
        {/* Kicker, held between two hairlines that draw outwards from it. */}
        <div className="flex items-center justify-center gap-4 sm:gap-5">
          <span
            aria-hidden
            style={lag(0)}
            className="reveal-rule h-px w-10 origin-right bg-gradient-to-l from-line-strong to-transparent sm:w-24"
          />
          <span
            style={lag(0.1)}
            className="reveal-rise eyebrow flex shrink-0 items-center gap-2.5 whitespace-nowrap"
          >
            <span aria-hidden className="size-1.5 rotate-45 bg-accent-soft" />
            Guwahati &amp; the house
            <span aria-hidden className="size-1.5 rotate-45 bg-accent-soft" />
          </span>
          <span
            aria-hidden
            style={lag(0)}
            className="reveal-rule h-px w-10 origin-left bg-gradient-to-r from-line-strong to-transparent sm:w-24"
          />
        </div>

        {/* Two masked lines - the display type rises out from behind its own edge. */}
        <h2 className="mx-auto mt-7 max-w-4xl text-center font-display text-[clamp(2.1rem,5vw,4rem)] leading-[1.08] font-semibold">
          <span style={lag(0.18)} className="reveal-line">
            <span>Your whole trip starts</span>
          </span>
          <span style={lag(0.32)} className="reveal-line">
            <span>
              at the <em className="font-normal text-accent-soft italic">front door</em>.
            </span>
          </span>
        </h2>

        <span
          aria-hidden
          style={lag(0.55)}
          className="reveal-rule mt-12 block h-px w-full bg-line lg:mt-14"
        />

        {/* Detail and the way onward, set against each other rather than stacked
            centre - it reads as a spread, not a stack of three centred lines. */}
        <div
          style={lag(0.65)}
          className="reveal-rise mt-7 flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <p className="max-w-md text-center text-[1.0625rem] leading-relaxed text-muted text-pretty sm:text-left">
            The river at sunset, tea trails an hour out, and a common room that fills
            up by nine. Five reasons most people book a second night before the first
            one ends.
          </p>

          <Link
            to="/rooms"
            className="group inline-flex shrink-0 items-center gap-3 text-[0.9375rem] font-semibold text-heading"
          >
            <span className="relative">
              Browse rooms &amp; beds
              {/* Underline that runs out from the left on hover. */}
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
      </div>

      {/* Wider than the rest of the page on purpose - the deck is the picture here,
          so the cards get the room rather than the margins. */}
      <div className="container-wide">
        {/* Viewport. The vertical padding/negative-margin pair leaves room for the
            hover lift and its shadow, which `overflow-hidden` would otherwise clip. */}
        <div
          className="mt-6 -mb-8 overflow-hidden py-8 lg:mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <ul
            ref={deck}
            style={
              {
                '--i': index,
                // One step is a card plus a gap - matches the basis calc on the cards.
                transform:
                  'translate3d(calc(var(--i) * -1 * (100% + var(--gap)) / var(--per)), 0, 0)',
                transition: animate ? `transform ${SLIDE_EASE_MS}ms var(--ease-out-soft)` : 'none',
              } as React.CSSProperties
            }
            className="flex gap-[var(--gap)] [--gap:1rem] [--per:1.15] will-change-transform sm:[--per:2.25] lg:[--gap:1.5rem] lg:[--per:5]"
          >
            {/* Rendered twice so the loop has somewhere to run to. The second pass is
                a decorative repeat of content already listed above it. */}
            {[...cards, ...cards].map((item, i) => {
              const real = i % cards.length
              const copy = i >= cards.length
              const distance = Math.abs(real - CENTRE)
              // Only the first visible row fans; anything queued off-stage would
              // otherwise be dragged into view while the deck is still stacked.
              const fans = !copy && real < DEAL_COUNT
              return (
                <li
                  key={`${item.key}-${i}`}
                  aria-hidden={copy || undefined}
                  style={
                    {
                      // Pull each card back towards the centre of the row, tilt it like a
                      // hand of cards, and drop the outer ones a little lower. The outer
                      // ones also trail the inner ones, so the row deals rather than snaps.
                      '--dx': fans ? `${(CENTRE - real) * 82}%` : '0%',
                      '--dy': fans ? `${distance * 1.1}rem` : '0rem',
                      '--rot': fans ? `${(real - CENTRE) * 4.5}deg` : '0deg',
                      '--lag': fans ? `${distance * 150}ms` : '0ms',
                      flex: '0 0 calc((100% - (var(--per) - 1) * var(--gap)) / var(--per))',
                      zIndex: Math.round(10 - distance * 2),
                    } as React.CSSProperties
                  }
                  className="deck-card group"
                >
                  <Link
                    to={item.href ?? '/rooms'}
                    tabIndex={copy ? -1 : undefined}
                    className="card-raised relative flex h-full flex-col overflow-hidden p-1.5 ring-1 ring-transparent transition-[box-shadow,transform,--tw-ring-color] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-2 hover:shadow-raised-lg hover:ring-accent-soft"
                  >
                    <div className="relative overflow-hidden rounded-[1rem]">
                      <Photo
                        id={item.image}
                        width={720}
                        widths={[360, 560, 720, 1080]}
                        sizes="(max-width: 640px) 84vw, (max-width: 1024px) 42vw, 20rem"
                        alt={item.title}
                        className="aspect-[5/7] w-full object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.09]"
                      />

                      {/* Resting scrim: enough to float the chip, not enough to dull the
                          photograph. It deepens on hover to carry the caption panel. */}
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-ink/15 transition-opacity duration-500 group-hover:opacity-0"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />

                      <span className="absolute top-3 left-3 rounded-full border border-cream/20 bg-ink/45 px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.14em] text-cream uppercase backdrop-blur-md transition-colors duration-400 group-hover:border-transparent group-hover:bg-mustard group-hover:text-ink">
                        {item.tag}
                      </span>

                      {/* Offer ribbon - only promotional cards carry one, so a running
                          deal reads instantly against the plain place cards. */}
                      {item.offer && (
                        <span className="absolute top-3 right-3 rounded-full bg-mustard px-2.5 py-1 text-[0.6875rem] font-bold tracking-wide text-ink uppercase shadow-warm">
                          {item.offer}
                        </span>
                      )}

                      {/* Index steps aside for the note - and for an offer ribbon. */}
                      {!item.offer && (
                        <span className="absolute right-3 bottom-3 font-display text-[0.875rem] font-semibold text-gray-200/70 tabular-nums transition-opacity duration-300 group-hover:opacity-0">
                          {String(real + 1).padStart(2, '0')}
                        </span>
                      )}

                      {/* The line only exists on hover, so the picture owns the card at
                          rest and every card stays exactly the same height. */}
                      <p className="absolute inset-x-3 bottom-3 translate-y-3 text-[0.8125rem] leading-snug text-gray-200 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-soft)] group-hover:translate-y-0 group-hover:opacity-100">
                        {item.note}
                      </p>
                    </div>

                    {/* The caption only settles in once the cards have finished dealing. */}
                    <div className="deck-caption mt-auto flex items-center justify-between gap-2 px-2.5 pt-4 pb-2.5">
                      <div className="min-w-0">
                        <p className="truncate font-display text-[1.1875rem] leading-tight font-semibold text-heading">
                          {item.title}
                        </p>
                        {/* Mustard rule that draws itself under the name on hover. */}
                        <span
                          aria-hidden
                          className="mt-2 block h-px w-7 origin-left bg-accent-soft transition-transform duration-600 ease-[var(--ease-out-soft)] group-hover:scale-x-[4]"
                        />
                      </div>
                      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-line-strong text-accent transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary">
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Controls fade in with the carousel itself - before the deck has dealt
            there is nothing to steer. */}
        <div
          className={`mt-12 flex items-center justify-center gap-5 transition-opacity duration-700 ${
            dealt ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous card"
            className="grid size-10 place-items-center rounded-full border border-line-strong text-heading transition-[background-color,border-color,color] duration-300 hover:border-primary hover:bg-primary hover:text-on-primary"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: DOT_COUNT }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${cards[i].title}`}
                aria-current={i === current % DOT_COUNT || undefined}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-400 ease-[var(--ease-out-soft)] ${
                  i === current % DOT_COUNT
                    ? 'w-6 bg-primary'
                    : 'w-1.5 bg-line-strong hover:bg-accent-soft'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next card"
            className="grid size-10 place-items-center rounded-full border border-line-strong text-heading transition-[background-color,border-color,color] duration-300 hover:border-primary hover:bg-primary hover:text-on-primary"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
