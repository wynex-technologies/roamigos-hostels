import { useRef } from 'react'
import { ArrowUpRight, MapPin, Play, Sparkles, Users } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { aboutPage } from '@/data/pages'

/** Everything on this section that the front desk can edit from the panel. */
const g = aboutPage.hero

/* ------------------------------------------------------------------
   Layout notes
   - < xl : every pinned piece lines up in one snap-scrolling rail.
   - >= xl : the same pieces float free around the centred core, each
             one drifting a little against the pointer.
   ------------------------------------------------------------------ */

/** Shared rail sizing, plus the switch to free-floating at xl. */
const PIN = 'w-[15rem] shrink-0 snap-center xl:pointer-events-auto xl:absolute'

/**
 * The stock itself. A fixed white rather than a semantic surface on purpose -
 * these are physical prints pinned to a board, so they stay paper-coloured in
 * both themes and the dark canvas reads as the wall behind them.
 */
const paper =
  'group/card relative overflow-hidden rounded-[3px] bg-white shadow-warm-lg ring-1 ring-ink/10 ' +
  'transition-transform duration-500 ease-[var(--ease-out-soft)] xl:hover:rotate-0 xl:hover:scale-[1.03]'

/** Pointer drift, in px, applied to the outer node so the card keeps its own tilt. */
const drift = (x: number, y: number): React.CSSProperties => ({
  transform: `translate3d(calc(var(--mx, 0) * ${x}px), calc(var(--my, 0) * ${y}px), 0)`,
  transition: 'transform 0.5s var(--ease-out-soft)',
})

function Caption({ name, line, tag }: { name: string; line: string; tag: string }) {
  return (
    <div className="px-4 pt-3.5 pb-4 text-center">
      <p className="font-display text-xl text-maroon italic">{name}</p>
      <p className="mt-1.5 text-[0.7rem] leading-[1.5] font-bold tracking-[0.13em] text-ink uppercase">
        {line}
      </p>
      <p className="mt-2 text-[0.58rem] font-semibold tracking-[0.22em] text-ink/45 uppercase">
        {tag}
      </p>
    </div>
  )
}

export function GalleryHero() {
  const scene = useRef<HTMLElement>(null)

  const move = (event: React.MouseEvent) => {
    const el = scene.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3))
    el.style.setProperty('--my', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3))
  }

  const reset = () => {
    const el = scene.current
    if (!el) return
    el.style.setProperty('--mx', '0')
    el.style.setProperty('--my', '0')
  }

  return (
    <section
      ref={scene}
      onMouseMove={move}
      onMouseLeave={reset}
      className="relative overflow-hidden bg-canvas py-20 sm:py-24 xl:py-32"
    >
      {/* ---------- contour ground: a survey map read from far above ---------- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-radial-gradient(circle at 17% 28%, transparent 0 44px, color-mix(in oklab, var(--accent) 22%, transparent) 44px 45px),' +
            'repeating-radial-gradient(circle at 83% 74%, transparent 0 52px, color-mix(in oklab, var(--primary) 16%, transparent) 52px 53px)',
          maskImage: 'radial-gradient(88% 70% at 50% 48%, transparent 22%, #000 84%)',
          WebkitMaskImage: 'radial-gradient(88% 70% at 50% 48%, transparent 22%, #000 84%)',
        }}
      />
      {/* Latitude rules, held off the centre so the headline stays clean. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0 92px, color-mix(in oklab, var(--accent) 18%, transparent) 92px 93px)',
          maskImage: 'linear-gradient(90deg, #000, transparent 30%, transparent 70%, #000)',
          WebkitMaskImage: 'linear-gradient(90deg, #000, transparent 30%, transparent 70%, #000)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 size-[34rem] rounded-full bg-mustard/6 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 -bottom-48 size-[36rem] rounded-full bg-maroon/6 blur-[120px]"
      />

      {/* ---------- ghost wordmark behind everything ---------- */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[clamp(6rem,22vw,20rem)] leading-none text-primary/[0.055] italic select-none"
      >
        {g.watermark}
      </span>

      {/* ================= centred core ================= */}
      <div className="relative z-10 container-page flex flex-col items-center text-center xl:min-h-[36rem] xl:justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 py-1.5 pr-4 pl-2 text-sm font-medium text-heading shadow-warm backdrop-blur-sm">
          <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-maroon to-maroon-deep text-cream">
            <Sparkles className="size-3.5" />
          </span>
          {g.chip}
        </span>

        <p className="mt-7 font-display text-[clamp(1.75rem,3.6vw,2.6rem)] leading-none text-accent italic">
          {g.script}
        </p>

        <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.2rem,5vw,3.9rem)] leading-[1.04] font-semibold tracking-[-0.02em] text-balance">
          {g.heading[0]}{' '}
          <span className="bg-gradient-to-r from-maroon to-gold bg-clip-text text-transparent">
            {g.heading[1]}
          </span>
        </h1>

        <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-pretty">{g.copy}</p>

        <div className="mt-9 flex flex-col items-center gap-3.5">
          <a
            href="#wall"
            className="group inline-flex items-center gap-3 rounded-full bg-ink py-3 pr-3 pl-7 text-sm font-semibold text-cream transition-colors hover:bg-maroon"
          >
            {g.cta}
            <span className="grid size-9 place-items-center rounded-full bg-cream text-ink transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </a>
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">{g.meta}</p>
        </div>
      </div>

      {/* ================= the pinned wall ================= */}
      <div className="no-scrollbar mt-14 flex snap-x snap-mandatory items-center gap-5 overflow-x-auto px-[max(1.25rem,calc((100vw-1360px)/2))] pt-2 pb-6 xl:pointer-events-none xl:absolute xl:inset-0 xl:mt-0 xl:block xl:overflow-visible xl:p-0">
        {/* ---- the traveller, bleeding off the left edge ---- */}
        <div className={`${PIN} xl:-left-[1%] xl:top-[7%] xl:w-[13rem]`} style={drift(20, 14)}>
          <div className={`${paper} p-2.5 xl:-rotate-6`}>
            <Photo
              id={g.traveller.img}
              width={420}
              widths={[300, 420, 620]}
              sizes="15rem"
              alt={g.traveller.alt}
              loading="lazy"
              className="h-64 w-full rounded-[2px] object-cover xl:h-72"
            />
          </div>
        </div>

        {/* ---- polaroid ---- */}
        <div className={`${PIN} xl:left-[8%] xl:top-[25%] xl:w-[14.5rem]`} style={drift(-26, 18)}>
          <div className={`${paper} p-2.5 pb-0 xl:rotate-2`}>
            <Photo
              id={g.polaroid.img}
              width={420}
              widths={[300, 420, 620]}
              sizes="15rem"
              alt={g.polaroid.alt}
              loading="lazy"
              className="h-56 w-full rounded-[2px] object-cover"
            />
            <Caption name={g.polaroid.name} line={g.polaroid.line} tag={g.polaroid.tag} />
          </div>
        </div>

        {/* ---- stitched round shot + the running check-in count ---- */}
        <div className={`${PIN} xl:bottom-[7%] xl:left-[2%] xl:w-[15rem]`} style={drift(-18, -16)}>
          <div className={`${paper} flex items-center gap-3 py-2.5 pr-4 pl-2.5 xl:-rotate-3`}>
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-dashed border-maroon/40 p-1">
              <Photo
                id={g.round.img}
                width={160}
                alt={g.round.alt}
                loading="lazy"
                className="aspect-square w-full rounded-full object-cover"
              />
            </span>
            <span className="text-left">
              <span className="flex items-center gap-1.5 font-display text-xl leading-none font-semibold text-ink">
                <Users className="size-4 text-maroon" />
                {g.stat.value}
              </span>
              <span className="mt-1.5 block text-[0.62rem] leading-snug font-semibold tracking-[0.14em] text-ink/45 uppercase">
                {g.stat.label}
              </span>
            </span>
          </div>
        </div>

        {/* ---- clipping ---- */}
        <div className={`${PIN} xl:top-[5%] xl:right-[7%] xl:w-[14rem]`} style={drift(22, 16)}>
          <div className={`${paper} p-2.5 pb-0 xl:-rotate-3`}>
            <Photo
              id={g.clipping.img}
              width={420}
              widths={[300, 420, 620]}
              sizes="15rem"
              alt={g.clipping.alt}
              loading="lazy"
              className="h-44 w-full rounded-[2px] object-cover"
            />
            <Caption name={g.clipping.name} line={g.clipping.line} tag={g.clipping.tag} />
          </div>
        </div>

        {/* ---- stamp ---- */}
        <div className={`${PIN} xl:top-[46%] xl:right-[1.5%] xl:w-[11.5rem]`} style={drift(-20, -16)}>
          <div className={`${paper} p-2.5 xl:rotate-6`}>
            <div className="relative overflow-hidden rounded-[2px]">
              <Photo
                id={g.stamp.img}
                width={360}
                widths={[260, 360, 520]}
                sizes="12rem"
                alt={g.stamp.alt}
                loading="lazy"
                className="h-32 w-full object-cover"
              />
              <span className="absolute top-2 right-2 rounded-full bg-cream/85 px-2 py-1 text-[0.55rem] font-bold tracking-[0.16em] text-maroon-deep uppercase backdrop-blur-sm">
                {g.stamp.note}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-1 pt-3 pb-1">
              <MapPin className="size-3.5 shrink-0 text-maroon" />
              <span className="text-[0.68rem] font-bold tracking-[0.12em] text-ink uppercase">
                {g.stamp.place}
              </span>
              <span className="ml-auto text-[0.58rem] tracking-wide text-ink/45 tabular-nums">
                {g.stamp.coord}
              </span>
            </div>
          </div>
        </div>

        {/* ---- boarding pass ---- */}
        <div className={`${PIN} xl:bottom-[3%] xl:left-[22%] xl:w-[15rem]`} style={drift(24, -18)}>
          <div className={`${paper} flex items-stretch xl:rotate-1`}>
            <div className="flex-1 px-4 py-3.5">
              <p className="text-[0.55rem] font-bold tracking-[0.22em] text-maroon uppercase">
                Boarding pass
              </p>
              <p className="mt-2 flex items-baseline gap-2 font-display text-xl leading-none font-bold tracking-tight text-ink">
                {g.pass.from}
                <span className="text-gold">✈</span>
                {g.pass.to}
              </p>
              <p className="mt-1.5 text-[0.6rem] tracking-[0.14em] text-ink/45 uppercase">
                {g.pass.route}
              </p>
            </div>
            {/* perforation */}
            <div className="my-2 border-l border-dashed border-ink/20" />
            <div className="flex flex-col justify-center gap-2 px-3.5 py-3.5 text-center">
              <span className="block">
                <span className="block text-[0.5rem] font-bold tracking-[0.18em] text-ink/45 uppercase">
                  Seat
                </span>
                <span className="block font-display text-sm font-bold text-ink">{g.pass.seat}</span>
              </span>
              <span className="block">
                <span className="block text-[0.5rem] font-bold tracking-[0.18em] text-ink/45 uppercase">
                  Route
                </span>
                <span className="block font-display text-sm font-bold text-ink">{g.pass.gate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ---- wide film still ---- */}
        <div className={`${PIN} xl:right-[4%] xl:bottom-[4%] xl:w-[21rem]`} style={drift(-24, -12)}>
          <div className={`${paper} p-2.5 xl:-rotate-2`}>
            <div className="relative overflow-hidden rounded-[2px]">
              <Photo
                id={g.reel.img}
                width={640}
                widths={[420, 640, 900]}
                sizes="(min-width: 1280px) 21rem, 15rem"
                alt={g.reel.alt}
                loading="lazy"
                className="h-40 w-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover/card:scale-105 xl:h-44"
              />
              <span
                aria-hidden
                className="absolute inset-0 grid place-items-center transition-transform duration-300 group-hover/card:scale-110"
              >
                <span className="grid size-14 place-items-center rounded-full bg-cream/90 text-ink shadow-warm backdrop-blur-sm">
                  <Play className="size-5 fill-ink" />
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between px-1 pt-3 pb-1">
              <span className="text-[0.68rem] font-bold tracking-[0.12em] text-ink uppercase">
                {g.reel.place}
              </span>
              <span className="text-[0.58rem] tracking-[0.16em] text-ink/45 uppercase">
                {g.reel.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
