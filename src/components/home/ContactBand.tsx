import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { properties, site } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { Container, Section } from '@/components/ui/primitives'
import { Slab } from '@/components/common/Slab'
import { useReveal } from '@/lib/useReveal'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/**
 * The homepage's closing band. Same slab, same light and same micro-interactions
 * as the one the inner pages end on — but this one still carries the actual
 * contact details, because the homepage is where people look for them.
 */
export function ContactBand() {
  const block = useReveal<HTMLDivElement>(0.12)

  return (
    <Section id="contact" className="pb-0">
      <Container wide>
        <Slab className="px-6 py-14 sm:px-10 lg:px-14 lg:py-18">
          <div ref={block} className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            {/* ======================= the ask ======================= */}
            <div>
              <div style={lag(0)} className="reveal-rise flex items-center gap-3">
                <span className="relative grid size-2 place-items-center">
                  <span className="absolute size-2 rounded-full bg-mustard" />
                  <span
                    aria-hidden
                    className="animate-dot-halo absolute size-2 rounded-full bg-mustard"
                  />
                </span>
                <p className="text-[0.6875rem] font-bold tracking-[0.28em] text-mustard uppercase">
                  Ready when you are
                </p>
                <span
                  aria-hidden
                  style={lag(0.1)}
                  className="reveal-rule h-px flex-1 origin-left bg-gradient-to-r from-mustard/45 to-transparent"
                />
              </div>

              <h2
                style={lag(0.08)}
                className="reveal-rise mt-5 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.06] font-semibold text-cream text-balance"
              >
                Pick a bed. Send one message.
                <br />
                <span className="text-sheen">That&apos;s the whole booking.</span>
              </h2>

              <p
                style={lag(0.16)}
                className="reveal-rise mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-cream/75 text-pretty"
              >
                No prepayment, no long forms. Choose your room, hit Book Now and your dates land
                straight in our WhatsApp — we confirm within minutes and you pay at check-in.
              </p>

              <div style={lag(0.24)} className="reveal-rise mt-9 flex flex-wrap gap-3">
                <ButtonLink
                  to="/rooms"
                  variant="accent"
                  size="lg"
                  className="gloss-sweep group/pri hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-14px] hover:shadow-gold/70"
                >
                  Browse Rooms &amp; Beds
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/pri:translate-x-1" />
                </ButtonLink>
                <ButtonAnchor
                  href={enquiryUrl()}
                  target="_blank"
                  rel="noreferrer"
                  size="lg"
                  className="gloss-sweep group/chat border border-cream/25 bg-cream/10 text-cream hover:-translate-y-0.5 hover:border-mustard/70 hover:bg-cream/15"
                >
                  <MessageCircle className="size-4 transition-transform duration-300 group-hover/chat:-rotate-12" />
                  Chat on WhatsApp
                </ButtonAnchor>
              </div>
            </div>

            {/* ======================= the details ======================= */}
            <div className="space-y-8">
              <div className="space-y-3">
                {[
                  {
                    href: `tel:${site.phoneDisplay.replace(/\s/g, '')}`,
                    icon: Phone,
                    label: 'Call us',
                    value: site.phoneDisplay,
                    display: true,
                  },
                  {
                    href: `mailto:${site.email}`,
                    icon: Mail,
                    label: 'Email',
                    value: site.email,
                    display: false,
                  },
                ].map((channel, i) => (
                  <a
                    key={channel.label}
                    href={channel.href}
                    style={lag(0.2 + i * 0.08)}
                    className="reveal-rise group/row relative flex items-center gap-4 overflow-hidden rounded-2xl border border-cream/15 bg-cream/5 px-5 py-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-mustard/55 hover:bg-cream/10"
                  >
                    {/* Warm wash that fills in from the left on hover. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-mustard/16 to-transparent transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover/row:scale-x-100"
                    />
                    <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-mustard/40 bg-mustard/15 text-mustard transition-colors duration-500 group-hover/row:bg-mustard group-hover/row:text-ink">
                      <channel.icon className="size-[1.05rem]" />
                    </span>
                    <span className="relative min-w-0">
                      <span className="block text-[0.6875rem] tracking-[0.18em] text-cream/50 uppercase">
                        {channel.label}
                      </span>
                      <span
                        className={
                          channel.display
                            ? 'font-display text-lg text-cream'
                            : 'block truncate text-[0.9375rem] text-cream'
                        }
                      >
                        {channel.value}
                      </span>
                    </span>
                    <ArrowRight className="relative ml-auto size-4 shrink-0 text-mustard opacity-0 transition-all duration-500 group-hover/row:translate-x-0.5 group-hover/row:opacity-100" />
                  </a>
                ))}
              </div>

              <div style={lag(0.38)} className="reveal-rise">
                <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-mustard uppercase">
                  Find us in
                </p>
                <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {properties.map((property) => (
                    <li
                      key={property.name}
                      className="group/pin flex gap-2.5 text-[0.875rem] transition-transform duration-500 hover:translate-x-1"
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-mustard transition-transform duration-500 group-hover/pin:-translate-y-0.5" />
                      <span>
                        <span className="block text-cream">{property.name}</span>
                        <span className="text-cream/55">{property.area}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Slab>
      </Container>
    </Section>
  )
}
