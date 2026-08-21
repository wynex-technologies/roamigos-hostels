import { ArrowUpRight } from 'lucide-react'
import { experiences } from '@/data/content'
import { Photo } from '@/components/ui/Photo'
import { Container, Section } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { useReveal } from '@/lib/useReveal'
import { cn } from '@/lib/utils'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/**
 * Mosaic footprint, by position in the data. The opening tile takes a quarter of
 * the board and the rest fall in around it, so the row reads as a programme
 * rather than six equal thumbnails. Anything past the sixth item tiles normally.
 */
const spans = [
  'lg:col-span-2 lg:row-span-2',
  'lg:col-span-2',
  '',
  '',
  'lg:col-span-2',
  'lg:col-span-2',
]

export function Experiences() {
  const header = useReveal<HTMLDivElement>(0.3)

  return (
    <Section id="experiences" className="scroll-mt-24 border-y border-line bg-surface-2">
      <Container wide>
        <div ref={header} className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-4 sm:gap-5">
            <span
              aria-hidden
              style={lag(0)}
              className="reveal-rule h-px w-10 origin-right bg-gradient-to-l from-line-strong to-transparent sm:w-20"
            />
            <span
              style={lag(0.1)}
              className="reveal-rise eyebrow flex shrink-0 items-center gap-2.5 whitespace-nowrap"
            >
              <span aria-hidden className="size-1.5 rotate-45 bg-accent-soft" />
              More than a stay
              <span aria-hidden className="size-1.5 rotate-45 bg-accent-soft" />
            </span>
            <span
              aria-hidden
              style={lag(0)}
              className="reveal-rule h-px w-10 origin-left bg-gradient-to-r from-line-strong to-transparent sm:w-20"
            />
          </div>

          <h2 className="mt-7 font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08] font-semibold">
            <span style={lag(0.2)} className="reveal-line">
              <span>Nobody remembers</span>
            </span>
            <span style={lag(0.32)} className="reveal-line">
              <span>
                the <em className="font-normal text-accent-soft italic">bed</em>.
              </span>
            </span>
          </h2>

          <p
            style={lag(0.46)}
            className="reveal-rise mt-6 text-[1.0625rem] leading-relaxed text-muted text-pretty"
          >
            They remember the bonfire that ran past two, the trek somebody talked them into, and
            the six strangers at breakfast who are now the group chat.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:auto-rows-[13.5rem] lg:grid-cols-4">
          {experiences.map((item, i) => {
            const featured = i === 0
            return (
              <li key={item.title} className={cn('h-64 sm:h-72 lg:h-auto', spans[i])}>
                <article className="group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-xl2 border border-line shadow-warm transition-[box-shadow,transform] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-warm-lg">
                  <Photo
                    id={item.image}
                    width={featured ? 1200 : 800}
                    widths={[480, 800, 1200]}
                    sizes={
                      featured
                        ? '(min-width: 1024px) 40rem, (min-width: 640px) 45vw, 90vw'
                        : '(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 90vw'
                    }
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.08]"
                  />

                  {/* Resting scrim keeps the photograph; the second one deepens
                      under the caption once the tile is hovered. */}
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/5"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/95 via-ink/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  <span className="absolute top-4 left-4 grid size-10 place-items-center rounded-full border border-cream/20 bg-ink/40 text-mustard backdrop-blur-md transition-colors duration-400 group-hover:border-transparent group-hover:bg-mustard group-hover:text-ink sm:top-5 sm:left-5 sm:size-11">
                    <Icon name={item.icon} className="size-[1.1rem]" />
                  </span>

                  <span className="absolute top-5 right-5 font-display text-[0.8125rem] font-semibold text-gray-200/60 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="p-5 sm:p-6">
                    <span
                      aria-hidden
                      className="block h-px w-7 origin-left bg-mustard transition-transform duration-600 ease-[var(--ease-out-soft)] group-hover:scale-x-[3.5]"
                    />

                    <h3
                      className={cn(
                        'mt-4 font-display leading-tight font-semibold text-white text-balance',
                        featured ? 'text-[clamp(1.5rem,2.4vw,2rem)]' : 'text-[1.25rem]',
                      )}
                    >
                      {item.title}
                    </h3>

                    {/* Only the opening tile carries its description - the small
                        tiles run title and CTA alone, so the photograph keeps the
                        space instead of a caption nobody stops to read. */}
                    {featured && (
                      <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-gray-200 text-pretty">
                        {item.note}
                      </p>
                    )}

                    <span className="mt-4 inline-flex items-center gap-2 text-[0.75rem] font-bold tracking-[0.16em] text-mustard uppercase">
                      Ask us about it
                      <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </Container>
    </Section>
  )
}
