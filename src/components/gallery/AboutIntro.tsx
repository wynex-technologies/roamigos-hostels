import { aboutFacts, aboutIntro as a } from '@/data/about'
import { site } from '@/data/site'
import { Photo } from '@/components/ui/Photo'
import { Wordmark } from '@/components/brand/Wordmark'
import { Container } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { useReveal } from '@/lib/useReveal'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/**
 * Who the house is, as a bento.
 *
 * Cells sized to what they hold rather than to fill the canvas: the statement
 * gets four columns because it is the argument, the photograph gets two and both
 * rows because it is the only picture, and the four facts get one column each
 * because a number and a label need nothing more. The desk cell is the one
 * filled block, so the eye lands on the thing that answers.
 *
 * Deliberately one grid deep. It opens the page, it does not become the page.
 */
export function AboutIntro() {
  const block = useReveal<HTMLDivElement>(0.15)

  // The last fact goes in the filled cell; the rest take a plain cell each.
  const desk = aboutFacts[aboutFacts.length - 1]
  const rest = aboutFacts.slice(0, -1)

  return (
    <section id="about" className="scroll-mt-24 bg-canvas py-14 sm:py-16 lg:py-20">
      <Container>
        <div ref={block} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {/* ------------------------- the statement ------------------------- */}
          <div
            style={lag(0)}
            className="reveal-rise card-raised flex flex-col p-7 sm:col-span-2 sm:p-8 lg:col-span-4"
          >
            <div className="flex items-center gap-4">
              <p className="eyebrow flex shrink-0 items-center gap-2.5">
                <span aria-hidden className="size-1.5 rotate-45 bg-accent-soft" />
                {a.eyebrow}
              </p>
              <span aria-hidden className="h-px flex-1 bg-line" />
            </div>

            <p className="mt-6 font-display text-[clamp(1.3125rem,2.2vw,1.75rem)] leading-[1.36] font-medium text-heading text-pretty">
              <span className="text-maroon">{a.leadAccent}</span>
              {a.leadRest}
            </p>

            <div className="mt-5 space-y-4 text-[0.9375rem] leading-relaxed text-muted text-pretty">
              {a.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-6 text-[0.6875rem] font-bold tracking-[0.18em] text-muted uppercase">
              <span aria-hidden className="size-1.5 rotate-45 bg-maroon" />
              {a.signoff.by}
              <span aria-hidden className="h-px w-7 bg-line-strong" />
              {a.signoff.place}
            </p>
          </div>

          {/* -------------------------- the plate -------------------------- */}
          <div
            style={lag(0.12)}
            className="reveal-rise card-raised relative overflow-hidden sm:col-span-2 lg:col-span-2 lg:row-span-2"
          >
            <Photo
              id={a.image}
              width={800}
              widths={[400, 600, 800]}
              sizes="(min-width: 1024px) 22rem, 100vw"
              alt="The Roamigos common room in Pan Bazar"
              loading="lazy"
              decoding="async"
              className="aspect-16/10 size-full object-cover lg:absolute lg:inset-0 lg:aspect-auto"
            />

            {/* The mark, as a plaque over the plate. Frosted ink rather than a
                solid fill: the lettering then reads against its own scrim
                instead of fighting whatever the photograph is doing under it. */}
            <div className="absolute right-4 bottom-4 left-4 rounded-2xl border border-cream/25 bg-ink/55 px-5 py-4 shadow-warm-lg backdrop-blur-md">
              <Wordmark className="h-7 w-auto text-cream" />
              <p className="mt-2.5 flex items-center gap-2 text-[0.5625rem] font-bold tracking-[0.2em] text-mustard uppercase">
                <span aria-hidden className="size-1 shrink-0 rotate-45 bg-mustard" />
                {site.motto}
              </p>
            </div>
          </div>

          {/* --------------------- the facts, one per cell --------------------- */}
          {rest.map((fact, i) => (
            <div
              key={fact.label}
              style={lag(0.2 + i * 0.06)}
              className="reveal-rise card-raised p-6"
            >
              <p className="flex items-center gap-2 text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase">
                <Icon name={fact.icon} className="size-3.5 shrink-0 text-accent" />
                {fact.label}
              </p>
              <p className="mt-2.5 font-display text-[1.5rem] leading-none font-semibold text-heading tabular-nums">
                {fact.value}
              </p>
            </div>
          ))}

          {/* The one filled cell, so the grid has somewhere to land. */}
          <div
            style={lag(0.38)}
            className="reveal-rise rounded-xl2 border border-cream/15 bg-maroon p-6 shadow-raised"
          >
            <p className="flex items-center gap-2 text-[0.625rem] font-bold tracking-[0.16em] text-mustard uppercase">
              <Icon name={desk.icon} className="size-3.5 shrink-0" />
              {desk.label}
            </p>
            <p className="mt-2.5 font-display text-[1.5rem] leading-none font-semibold text-white tabular-nums">
              {desk.value}
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
