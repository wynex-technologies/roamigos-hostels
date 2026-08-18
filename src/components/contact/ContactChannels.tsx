import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Container, Eyebrow, SectionTitle } from '@/components/ui/primitives'
import { contactChannels } from '@/data/contact'
import { site } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { useReveal } from '@/lib/useReveal'
import { cn } from '@/lib/utils'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

const icons = {
  whatsapp: MessageCircle,
  phone: Phone,
  email: Mail,
  visit: MapPin,
}

export function ContactChannels() {
  const grid = useReveal<HTMLDivElement>(0.2)

  const hrefs: Record<string, string> = {
    whatsapp: enquiryUrl(),
    phone: `tel:${site.phoneDisplay.replace(/\s/g, '')}`,
    email: `mailto:${site.email}`,
    visit: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.mapQuery)}`,
  }

  const values: Record<string, string> = {
    whatsapp: site.phoneDisplay,
    phone: site.phoneDisplay,
    email: site.email,
    visit: site.address.line2,
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="max-w-xl">
          <Eyebrow>Four ways in</Eyebrow>
          <SectionTitle className="mt-3" underline="hour">
            Use whichever one
            <br />
            suits the
          </SectionTitle>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty">
            All four reach the same desk. WhatsApp is simply the one we answer fastest, at any
            time of night.
          </p>
        </div>

        <div ref={grid} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {contactChannels.map((channel, i) => {
            const Icon = icons[channel.key]
            // WhatsApp is the one place green is allowed to lead — it reads as the
            // product, not as brand colour.
            const isChat = channel.key === 'whatsapp'
            return (
              <a
                key={channel.key}
                href={hrefs[channel.key]}
                target={channel.key === 'phone' || channel.key === 'email' ? undefined : '_blank'}
                rel="noreferrer"
                style={lag(i * 0.08)}
                className="reveal-rise card-raised group flex flex-col p-6 transition-[transform,box-shadow] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:shadow-raised-lg"
              >
                <span
                  className={cn(
                    'grid size-11 place-items-center rounded-full transition-colors',
                    isChat
                      ? 'bg-green-deep text-cream group-hover:bg-green'
                      : 'bg-surface-2 text-accent group-hover:bg-maroon group-hover:text-cream',
                  )}
                >
                  <Icon className="size-[1.15rem]" />
                </span>

                <h3 className="mt-5 font-display text-xl font-semibold">{channel.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                  {channel.note}
                </p>

                <p className="mt-5 truncate text-[0.875rem] font-semibold text-heading">
                  {values[channel.key]}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-4">
                  <span className="text-[0.6875rem] tracking-[0.14em] text-muted uppercase">
                    {channel.meta}
                  </span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-accent transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
                <span className="sr-only">{channel.action}</span>
              </a>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
