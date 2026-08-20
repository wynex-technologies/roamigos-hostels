import { ArrowUpRight, Bus, Plane, Route, Train } from 'lucide-react'
import { Container, Eyebrow, SectionTitle } from '@/components/ui/primitives'
import { reachRoutes } from '@/data/contact'
import { site } from '@/data/site'
import { useReveal } from '@/lib/useReveal'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

const icons = { air: Plane, rail: Train, bus: Bus, onward: Route }

export function ContactVisit() {
  const list = useReveal<HTMLUListElement>(0.15)

  /** The pin, not a search - both the embed and the directions link use it. */
  const pin = encodeURIComponent(site.address.coords)

  return (
    <section id="visit" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="max-w-xl">
          <Eyebrow>Getting here</Eyebrow>
          <SectionTitle className="mt-3" underline="door">
            Airport, station, ISBT -
            <br />
            then our
          </SectionTitle>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty">
            Guwahati is the gateway to the whole Northeast, which means almost everyone arrives from
            one of three places. Here is what each one costs you in time.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* ------------------------------ the map ------------------------------ */}
          <div className="overflow-hidden rounded-xl2 border border-line shadow-warm">
            <iframe
              title={`Map showing ${site.legalName}`}
              src={`https://www.google.com/maps?q=${pin}&z=16&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full border-0 lg:h-full lg:min-h-[28rem]"
            />
          </div>

          {/* ---------------------------- the routes ---------------------------- */}
          <div>
            <ul ref={list} className="space-y-4">
              {reachRoutes.map((route, i) => {
                const Icon = icons[route.key]
                return (
                  <li
                    key={route.key}
                    style={lag(i * 0.08)}
                    className="reveal-rise card-surface group p-5 transition-[border-color,box-shadow] duration-400 hover:border-line-strong hover:shadow-warm-lg sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-accent transition-colors group-hover:bg-maroon group-hover:text-cream">
                        <Icon className="size-[1.05rem]" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-semibold">{route.title}</h3>
                        <p className="mt-1.5 text-[0.9375rem] font-medium text-heading text-pretty">
                          {route.place}
                        </p>
                        {/* Distance and time get their own row: set in tracked caps they
                            are wide enough to push past the card on a narrow column. */}
                        <p className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.6875rem] font-bold tracking-[0.14em] text-accent uppercase tabular-nums">
                          <span>{route.distance}</span>
                          <span aria-hidden className="size-1 rotate-45 bg-line-strong" />
                          <span>{route.time}</span>
                        </p>
                        <p className="mt-3 text-[0.875rem] leading-relaxed text-muted text-pretty">
                          {route.note}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pin}`}
              target="_blank"
              rel="noreferrer"
              className="group mt-6 inline-flex items-center gap-3 text-[0.9375rem] font-semibold text-heading"
            >
              <span className="relative">
                Open directions in Google Maps
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-accent-soft transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-x-100"
                />
              </span>
              <span className="grid size-10 place-items-center rounded-full border border-line-strong text-accent transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}
