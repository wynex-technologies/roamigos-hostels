import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Star } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { blogHero as b } from '@/data/blog'
import { photo } from '@/lib/images'

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The landscape that shows through the letters. It is one photograph — each
 * word is cropped to its own horizontal band of it, so the two lines read as a
 * single continuous view rather than two separate pictures.
 *
 * Two details matter here. The crop is asked for landscape and modest: the type
 * is transparent until this file lands, so a tall 1800px original leaves the
 * masthead blank for seconds. And a brand gradient sits underneath as a second
 * background layer, so the words are legible from the very first paint and the
 * photograph simply arrives on top of them.
 */
const FILL_SRC = photo(b.fill, 1400, 640)

const fill = (band: string): React.CSSProperties =>
  ({
    backgroundImage: `url("${FILL_SRC}"), linear-gradient(120deg, var(--primary), var(--accent-soft))`,
    backgroundSize: 'cover',
    backgroundPosition: `50% ${band}`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    '--band': band,
  }) as React.CSSProperties

export function BlogHero() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  const [reduce] = useState(prefersReduced)

  // The masthead assembles itself once, on arrival — it is not scrubbable.
  useEffect(() => {
    const el = section.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Pointer parallax — the figure leads, the wordmark and plates lag behind it.
  const move = (event: React.MouseEvent) => {
    const el = stage.current
    if (!el || reduce) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--px', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3))
    el.style.setProperty('--py', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3))
  }
  const rest = () => {
    stage.current?.style.setProperty('--px', '0')
    stage.current?.style.setProperty('--py', '0')
  }

  const enter = (name: string, delay: number): React.CSSProperties =>
    shown
      ? { animation: `${name} 1.05s var(--ease-out-soft) both`, animationDelay: `${delay}s` }
      : { opacity: 0 }

  /** A word wipes up from its own baseline, then its photograph starts drifting. */
  const word = (delay: number): React.CSSProperties =>
    shown
      ? {
          animation:
            `word-rise 1.15s var(--ease-out-soft) ${delay}s both` +
            (reduce ? '' : `, fill-pan 24s ease-in-out ${delay + 1.2}s infinite`),
        }
      : { opacity: 0 }

  return (
    <section ref={section} className="relative overflow-hidden bg-canvas py-14 sm:py-20">
      {/* The masthead's photograph is a CSS background, which the preload scanner
          never sees. Fetching it as a real image gets it in flight immediately. */}
      <link rel="preload" as="image" href={FILL_SRC} />
      <link rel="preload" as="image" href={b.cutout.src} />
      {/* ============ ambient: contour map, latitude rules, warm light ============ */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 82% at 50% 14%, var(--surface) 0%, var(--canvas) 44%, var(--surface-2) 100%)',
          }}
        />
        {/* Contour rings — a topographic map read from far above. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-radial-gradient(circle at 18% 30%, transparent 0 46px, color-mix(in oklab, var(--accent) 20%, transparent) 46px 47px),' +
              'repeating-radial-gradient(circle at 84% 72%, transparent 0 54px, color-mix(in oklab, var(--primary) 16%, transparent) 54px 55px)',
            maskImage: 'radial-gradient(90% 70% at 50% 50%, transparent 26%, #000 82%)',
            WebkitMaskImage: 'radial-gradient(90% 70% at 50% 50%, transparent 26%, #000 82%)',
          }}
        />
        {/* Latitude rules, kept off the centre so the wordmark stays clean. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0 96px, color-mix(in oklab, var(--accent) 16%, transparent) 96px 97px)',
            maskImage: 'linear-gradient(90deg, #000, transparent 32%, transparent 68%, #000)',
            WebkitMaskImage: 'linear-gradient(90deg, #000, transparent 32%, transparent 68%, #000)',
          }}
        />
        <div className="absolute -top-10 -left-40 size-[34rem] rounded-full bg-mustard/7 blur-[120px]" />
        <div className="absolute -right-32 bottom-4 size-[36rem] rounded-full bg-maroon/7 blur-[120px]" />
      </div>

      {/* ---------------- vertical edge rails ---------------- */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-7 hidden text-[0.62rem] font-semibold tracking-[0.42em] whitespace-nowrap text-accent/55 [transform:translate(-50%,-50%)_rotate(-90deg)] xl:block"
      >
        Lat 26.14°N · Lon 91.73°E
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-7 hidden text-[0.62rem] font-semibold tracking-[0.42em] whitespace-nowrap text-accent/55 [transform:translate(50%,-50%)_rotate(90deg)] xl:block"
      >
        Volume 01 · Guwahati desk
      </span>

      <div className="relative container-page">
        {/* ==================== top rail ==================== */}
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-4"
          style={enter('fade-up', 0)}
        >
          <span className="-rotate-2 font-display text-2xl leading-none text-accent italic sm:text-[1.75rem]">
            {b.script}
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" />
          <span className="flex items-center gap-2 text-[0.68rem] font-bold tracking-[0.3em] text-accent uppercase">
            <Star className="size-3" />
            {b.eyebrow}
          </span>
        </div>

        {/* ==================== the wordmark stage ==================== */}
        <div
          ref={stage}
          onMouseMove={move}
          onMouseLeave={rest}
          className="group relative mt-8 sm:mt-10"
        >
          {/* Warm bloom behind the figure. */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-[52%] left-1/2 h-[44%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mustard/40 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
          />

          {/* ---------- flanking plates ---------- */}
          {b.plates.map((plate, i) => {
            const left = i === 0
            return (
              <div
                key={plate.key}
                className={`absolute bottom-[14%] hidden lg:block ${left ? 'left-0' : 'right-0'}`}
                style={enter(left ? 'plate-in-left' : 'plate-in-right', left ? 0.62 : 0.72)}
              >
                <a
                  href="#stories"
                  aria-label={`Read the ${plate.name} dispatch`}
                  className="group/plate block w-[clamp(7rem,10.5vw,11rem)] [transform:rotate(var(--r))_translate3d(calc(var(--px,0)*var(--drift)),calc(var(--py,0)*10px),0)] [transition:transform_.6s_ease-out] hover:[--r:0deg]"
                  style={
                    {
                      '--r': left ? '-5deg' : '5deg',
                      '--drift': left ? '-18px' : '18px',
                    } as React.CSSProperties
                  }
                >
                  <div className="card-raised p-2 transition-shadow duration-500 group-hover/plate:shadow-raised-lg">
                    <div className="relative aspect-3/4 overflow-hidden rounded-[1rem]">
                      <Photo
                        id={plate.img}
                        width={420}
                        widths={[280, 420, 620]}
                        sizes="11rem"
                        alt={plate.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover/plate:scale-[1.09]"
                      />
                      {/* Glass catch across the top-left corner. */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgb(255_255_255/0.34),transparent_44%)]"
                      />
                    </div>
                  </div>
                  {/* Engraved brass nameplate, hanging off the bottom of the frame.
                      The place name is the whole label — a coordinate under it
                      only ever read as clutter at this size. */}
                  <div className="relative z-10 mx-auto -mt-3 w-[80%] rounded-lg bg-gradient-to-b from-gold to-maroon-deep px-3 py-2 text-center text-cream shadow-warm transition-transform duration-500 group-hover/plate:-translate-y-0.5">
                    <p className="font-display text-[0.9rem] leading-none font-semibold tracking-[0.06em]">
                      {plate.name}
                    </p>
                  </div>
                </a>
              </div>
            )
          })}

          {/* ---------- the two words ---------- */}
          <div className="relative w-full pt-6 text-center [transform:translate3d(calc(var(--px,0)*-14px),calc(var(--py,0)*-8px),0)] [transition:transform_.5s_ease-out] sm:pt-10">
            <h1 className="sr-only">
              {b.words[0]} {b.words[1]} — the {b.eyebrow}
            </h1>

            {/* Sized so nine characters still clear the container at 1440 — the
                word is the widest thing on the page, so it sets the ceiling. */}
            <div className="overflow-hidden">
              <span
                aria-hidden
                className="block font-display text-[clamp(2.5rem,13.2vw,12.5rem)] leading-[0.84] font-bold tracking-[-0.045em] uppercase brightness-[1.14] saturate-[1.1] transition-[filter] duration-700 ease-out group-hover:brightness-[1.3] group-hover:saturate-[1.3]"
                style={{ ...fill('38%'), ...word(0.16) }}
              >
                {b.words[0]}
              </span>
            </div>

            <div className="overflow-hidden">
              <span
                aria-hidden
                className="mt-1 block font-display text-[clamp(1.05rem,5.4vw,5.2rem)] leading-[1.06] font-bold tracking-[0.08em] uppercase brightness-[1.14] saturate-[1.1] transition-[filter] duration-700 ease-out group-hover:brightness-[1.3] group-hover:saturate-[1.3]"
                style={{ ...fill('58%'), ...word(0.32) }}
              >
                {b.words[1]}
              </span>
            </div>
          </div>

          {/* ---------- the figure, standing in front of the type ----------
              A matted cut-out rather than a photograph in a frame: it carries its
              own alpha, so the letterforms read right around the pack and the
              boots instead of stopping at a rectangle. The offset keeps it off
              the exact centre, and the ellipse under it is the only thing that
              stops it floating. */}
          <div className="pointer-events-none absolute bottom-[9%] left-[46%] -translate-x-1/2">
            <div style={enter('figure-in', 0.5)}>
              <div className="relative [transform:translate3d(calc(var(--px,0)*26px),calc(var(--py,0)*12px),0)] [transition:transform_.55s_ease-out]">
                {/* Contact shadow. It sits behind the figure and squashes as the
                    stage is hovered, so the two read as one object. */}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-[9%] w-[128%] -translate-x-1/2 rounded-[50%] bg-ink/45 blur-md transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-x-90 dark:bg-black/60"
                />
                <img
                  src={b.cutout.src}
                  alt={b.cutout.alt}
                  width={479}
                  height={1200}
                  decoding="async"
                  className="relative h-[clamp(9rem,21vw,18.5rem)] w-auto origin-bottom drop-shadow-[0_22px_26px_rgb(37_37_34/0.3)] transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.035]"
                  style={{
                    // The original frame had snow under the boots; fading the last
                    // few percent lands the figure on the page instead of on a chip
                    // of someone else's ground.
                    maskImage: 'linear-gradient(to bottom, #000 92%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, #000 92%, transparent 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ==================== editorial footer row ==================== */}
        <div className="mt-10 grid items-center gap-8 border-t border-line pt-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
          <p
            className="max-w-sm text-[0.9375rem] leading-relaxed text-pretty lg:text-base"
            style={enter('fade-up', 0.8)}
          >
            {b.copy}
          </p>

          <p
            className="-rotate-2 text-center font-display text-[clamp(1.9rem,4.4vw,3.4rem)] leading-none text-accent italic"
            style={enter('fade-up', 0.86)}
          >
            {b.tagline}
          </p>

          <div className="flex lg:justify-end" style={enter('fade-up', 0.92)}>
            <a
              href="#stories"
              className="group/cta inline-flex items-center gap-3 rounded-full bg-primary py-2.5 pr-2.5 pl-7 text-sm font-semibold text-on-primary shadow-[0_18px_36px_-16px] shadow-maroon/70 transition-colors hover:bg-primary-hover"
            >
              {b.cta}
              <span className="grid size-9 place-items-center rounded-full bg-cream text-maroon transition-transform duration-300 group-hover/cta:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </div>
        </div>

        {/* ==================== the contents page ==================== */}
        <div className="mt-10 border-t border-line pt-6" style={enter('fade-up', 0.98)}>
          <p className="text-[0.66rem] font-bold tracking-[0.34em] text-accent/75 uppercase">
            {b.indexTitle}
          </p>

          <ul className="mt-4 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-4">
            {b.index.map((row) => (
              <li key={row.n}>
                <a
                  href="#stories"
                  className="group/row relative flex h-full items-baseline gap-3 bg-surface px-5 py-5 transition-colors duration-500 hover:bg-surface-2"
                >
                  <span className="font-display text-xs font-bold tracking-[0.16em] text-accent/50 transition-colors duration-500 group-hover/row:text-accent">
                    {row.n}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg leading-tight font-semibold text-heading transition-transform duration-500 group-hover/row:translate-x-1 sm:text-xl">
                      {row.name}
                    </span>
                    <span className="mt-1 block text-[0.6rem] tracking-[0.2em] text-muted uppercase">
                      {row.coord}
                    </span>
                    <span className="mt-2 block text-xs text-body">{row.note}</span>
                  </span>
                  <ArrowUpRight className="ml-auto size-3.5 shrink-0 self-center text-accent opacity-0 transition-all duration-500 group-hover/row:translate-x-0.5 group-hover/row:opacity-100" />
                  {/* A mustard rule draws itself along the foot of the cell. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-5 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-accent-soft to-transparent transition-transform duration-500 ease-out group-hover/row:scale-x-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
