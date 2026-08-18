import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { showcase } from '@/data/content'
import { useReveal } from '@/lib/useReveal'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/** Middle of the row — cards fan outwards from here. */
const CENTRE = (showcase.length - 1) / 2

/**
 * Holds the deck stacked until it comes into view, then flips `--deal` to 1 once.
 * The spread itself is a CSS transition, so it always plays out at its own pace
 * instead of being scrubbed by however fast the visitor happens to scroll.
 */
function useDealOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  // Layout effect, so the stacked state is in place before the first paint.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    // Reduced motion never sees the shuffle — `--deal` stays at its dealt default.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    el.style.setProperty('--deal', '0')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.style.setProperty('--deal', '1')
        observer.disconnect()
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

export function Destinations() {
  const deck = useDealOnce<HTMLUListElement>()
  const header = useReveal<HTMLDivElement>(0.4)

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

        {/* Two masked lines — the display type rises out from behind its own edge. */}
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
            centre — it reads as a spread, not a stack of three centred lines. */}
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

      {/* Wider than the rest of the page on purpose — the deck is the picture here,
          so the cards get the room rather than the margins. */}
      <div className="container-wide">
        <ul
          ref={deck}
          className="mt-14 grid grid-cols-2 gap-4 lg:mt-20 lg:grid-cols-5 lg:gap-6"
        >
          {showcase.map((item, i) => {
            const distance = Math.abs(i - CENTRE)
            return (
              <li
                key={item.key}
                style={
                  {
                    // Pull each card back towards the centre of the row, tilt it like a
                    // hand of cards, and drop the outer ones a little lower. The outer
                    // ones also trail the inner ones, so the row deals rather than snaps.
                    '--dx': `${(CENTRE - i) * 82}%`,
                    '--dy': `${distance * 1.1}rem`,
                    '--rot': `${(i - CENTRE) * 4.5}deg`,
                    '--lag': `${distance * 150}ms`,
                    zIndex: Math.round(10 - distance * 2),
                  } as React.CSSProperties
                }
                className="deck-card group h-full"
              >
                <Link
                  to="/rooms"
                  className="card-raised relative flex h-full flex-col overflow-hidden p-1.5 ring-1 ring-transparent transition-[box-shadow,transform,--tw-ring-color] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-2 hover:shadow-raised-lg hover:ring-accent-soft"
                >
                  <div className="relative overflow-hidden rounded-[1rem]">
                    <Photo
                      id={item.image}
                      width={720}
                      widths={[360, 560, 720, 1080]}
                      sizes="(max-width: 1024px) 46vw, 20rem"
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

                    {/* Index steps aside for the note. */}
                    <span className="absolute right-3 bottom-3 font-display text-[0.875rem] font-semibold text-cream/70 tabular-nums transition-opacity duration-300 group-hover:opacity-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* The line only exists on hover, so the picture owns the card at
                        rest and every card stays exactly the same height. */}
                    <p className="absolute inset-x-3 bottom-3 translate-y-3 text-[0.8125rem] leading-snug text-cream opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-soft)] group-hover:translate-y-0 group-hover:opacity-100">
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
    </section>
  )
}
