import { ArrowUpRight, MessageCircle, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homePage } from '@/data/pages'
import { site } from '@/data/site'
import { Photo } from '@/components/ui/Photo'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { enquiryUrl } from '@/lib/whatsapp'
import { useReveal } from '@/lib/useReveal'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/** Everything on this section that the front desk can edit from the panel. */
const section = homePage.stay

/**
 * The house itself, on one raised panel: a photograph mosaic with the guest
 * ticket floating over the seam on the left, and everything a room comes with
 * - as chips, not a bare icon row - on the right.
 */
export function MoreThanARoom() {
  const [lead, ...rest] = section.images
  const block = useReveal<HTMLDivElement>(0.15)

  return (
    <section id="amenities" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <Container wide>
        <div ref={block} className="card-raised overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="grid gap-9 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-12">
            {/* Photo mosaic - one tall plate, two stacked beside it. */}
            <div style={lag(0)} className="reveal-rise relative">
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 overflow-hidden rounded-xl2 bg-surface-2">
                  <Photo
                    id={lead}
                    width={720}
                    widths={[360, 560, 720]}
                    sizes="(min-width: 1024px) 20rem, 55vw"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-4/5 size-full object-cover"
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-3">
                  {rest.map((id) => (
                    <div key={id} className="flex-1 overflow-hidden rounded-xl2 bg-surface-2">
                      <Photo
                        id={id}
                        width={480}
                        widths={[280, 480]}
                        sizes="(min-width: 1024px) 13rem, 36vw"
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* The ticket sits over the seam between the plates. */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3.5 rounded-2xl border border-line bg-canvas/92 px-4 py-3 shadow-warm-lg backdrop-blur-md sm:bottom-5 sm:left-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-maroon text-cream">
                  <Star className="size-4 fill-mustard text-mustard" />
                </span>
                <span className="leading-tight">
                  <span className="block font-display text-lg font-semibold text-heading">
                    {site.stats.rating.toFixed(1)} / 5
                  </span>
                  <span className="text-[0.75rem] text-muted">
                    {site.stats.reviews.toLocaleString('en-IN')} guest reviews
                  </span>
                </span>
              </div>
            </div>

            <div>
              <p style={lag(0.08)} className="reveal-rise eyebrow flex items-center gap-2.5">
                <span aria-hidden className="size-1.5 rotate-45 bg-accent-soft" />
                {section.eyebrow}
              </p>

              <h2 className="mt-5 font-display text-[clamp(1.85rem,3.6vw,2.75rem)] leading-[1.1] font-semibold">
                <span style={lag(0.18)} className="reveal-line">
                  <span>{section.heading.line1}</span>
                </span>
                <span style={lag(0.28)} className="reveal-line">
                  <span>
                    {section.heading.lead}
                    <em className="font-normal text-accent-soft italic">{section.heading.accent}</em>
                    {section.heading.tail}
                  </span>
                </span>
              </h2>

              <p
                style={lag(0.4)}
                className="reveal-rise mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-muted text-pretty"
              >
                {section.copy}
              </p>

              <ul style={lag(0.5)} className="reveal-rise mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {section.perks.map((perk) => (
                  <li
                    key={perk.title}
                    className="flex flex-col items-start gap-2 rounded-xl border border-line bg-surface-2/70 px-3 py-3 transition-[border-color,background-color] duration-300 hover:border-line-strong hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-3 sm:px-3.5"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong text-accent">
                      <Icon name={perk.icon} className="size-4" />
                    </span>
                    <span className="min-w-0 hyphens-auto text-[0.8125rem] leading-snug font-semibold break-words text-heading text-pretty">
                      {perk.title}
                    </span>
                  </li>
                ))}
              </ul>

              <div
                style={lag(0.6)}
                className="reveal-rise mt-9 flex flex-col gap-5 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem] text-muted">
                  <span>
                    Trusted by{' '}
                    <span className="font-semibold text-heading">{site.stats.guests} guests</span>
                  </span>
                  <span aria-hidden className="size-1 rotate-45 bg-line-strong" />
                  <a
                    href={enquiryUrl("Hi Roamigos! I'd like to know more about the hostel.")}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-green-deep transition-colors hover:text-green dark:text-cream"
                  >
                    <MessageCircle className="size-4" />
                    {section.askLabel}
                  </a>
                </div>

                <ButtonLink to="/rooms" className="self-start sm:self-auto">
                  {section.ctaLabel}
                  <ArrowUpRight className="size-4" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>

        {/* A quiet way onward, so the panel does not dead-end the page. */}
        <p className="mt-6 text-center text-[0.8125rem] text-muted">
          {section.footNote.before}{' '}
          <Link
            to="/rooms"
            className="font-semibold text-heading underline decoration-accent-soft decoration-2 underline-offset-4 transition-colors hover:text-primary"
          >
            {section.footNote.link}
          </Link>{' '}
          {section.footNote.after}
        </p>
      </Container>
    </section>
  )
}
