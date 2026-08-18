import { Photo } from '@/components/ui/Photo'
import { Container, Eyebrow, Flourish, SectionTitle } from '@/components/ui/primitives'
import { galleryDay } from '@/data/gallery'
import { useReveal } from '@/lib/useReveal'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/**
 * The wall answers "what does it look like"; this answers "what does a day
 * actually go like". Four moments on one timeline, dropped alternately above
 * and below the rule so the row reads as a strip of film rather than a grid.
 */
export function GalleryDay() {
  const section = useReveal<HTMLElement>(0.15)

  return (
    <section ref={section} className="py-16 sm:py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>06:40 to whenever</Eyebrow>
          <SectionTitle className="mt-3" underline="day">
            One completely
            <br />
            ordinary
          </SectionTitle>
          <Flourish className="mt-7" />
          <p className="mt-7 text-[1.0625rem] leading-relaxed text-pretty">
            Nothing here is scheduled and nothing is compulsory. This is just how the hours tend to
            fall once you have dropped your bag.
          </p>
        </div>

        {/* The rule the whole strip hangs from — drawn out from the middle. */}
        <div className="relative mt-16 lg:mt-20">
          <span
            aria-hidden
            style={lag(0.1)}
            className="reveal-rule absolute inset-x-0 top-[8.5rem] hidden h-px bg-gradient-to-r from-transparent via-line-strong to-transparent lg:block"
          />

          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {galleryDay.map((moment, i) => (
              <li
                key={moment.time}
                style={lag(0.2 + i * 0.12)}
                className="reveal-rise group relative lg:pt-0"
              >
                {/* Odd entries hang below the rule, so the row zig-zags. */}
                <div className={i % 2 === 1 ? 'lg:mt-[4.5rem]' : ''}>
                  <p className="font-display text-[2rem] leading-none font-semibold text-accent tabular-nums">
                    {moment.time}
                  </p>

                  <span
                    aria-hidden
                    className="mt-4 mb-5 hidden size-2.5 rotate-45 bg-mustard ring-4 ring-canvas lg:block"
                  />

                  <div className="relative mt-5 overflow-hidden rounded-xl2 border border-line shadow-warm lg:mt-0">
                    <Photo
                      id={moment.image}
                      width={640}
                      widths={[380, 640, 900]}
                      sizes="(min-width: 1024px) 18rem, (min-width: 640px) 45vw, 90vw"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="aspect-4/3 w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-105"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-ink/35 to-transparent"
                    />
                  </div>

                  <h3 className="mt-5 font-display text-xl font-semibold">{moment.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                    {moment.note}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
