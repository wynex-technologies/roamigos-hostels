import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { properties, site } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { Container, Section } from '@/components/ui/primitives'

export function ContactBand() {
  return (
    <Section id="contact" className="pb-0">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-line bg-ink px-6 py-14 text-cream sm:px-10 lg:px-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-24 size-[30rem] rounded-full bg-maroon/45 blur-[110px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-24 size-[26rem] rounded-full bg-gold/20 blur-[110px]"
          />

          <div className="relative grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            <div>
              <p className="text-[0.6875rem] font-bold tracking-[0.28em] text-mustard uppercase">
                Ready when you are
              </p>
              <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.06] font-semibold text-cream text-balance">
                Pick a bed. Send one message.
                <br />
                <span className="text-mustard">That&apos;s the whole booking.</span>
              </h2>
              <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-cream/75 text-pretty">
                No prepayment, no long forms. Choose your room, hit Book Now and your dates land
                straight in our WhatsApp — we confirm within minutes and you pay at check-in.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink to="/rooms" variant="accent" size="lg">
                  Browse Rooms & Beds
                </ButtonLink>
                <ButtonAnchor
                  href={enquiryUrl()}
                  target="_blank"
                  rel="noreferrer"
                  size="lg"
                  className="border border-cream/30 bg-cream/10 text-cream hover:bg-cream/20"
                >
                  <MessageCircle className="size-4" />
                  Chat on WhatsApp
                </ButtonAnchor>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <a
                  href={`tel:${site.phoneDisplay.replace(/\s/g, '')}`}
                  className="flex items-center gap-4 rounded-2xl border border-cream/15 bg-cream/5 px-5 py-4 transition-colors hover:border-mustard/60"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mustard text-ink">
                    <Phone className="size-[1.05rem]" />
                  </span>
                  <span>
                    <span className="block text-[0.6875rem] tracking-[0.18em] text-cream/50 uppercase">
                      Call us
                    </span>
                    <span className="font-display text-lg text-cream">{site.phoneDisplay}</span>
                  </span>
                </a>

                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-4 rounded-2xl border border-cream/15 bg-cream/5 px-5 py-4 transition-colors hover:border-mustard/60"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream/15 text-mustard">
                    <Mail className="size-[1.05rem]" />
                  </span>
                  <span>
                    <span className="block text-[0.6875rem] tracking-[0.18em] text-cream/50 uppercase">
                      Email
                    </span>
                    <span className="text-[0.9375rem] text-cream">{site.email}</span>
                  </span>
                </a>
              </div>

              <div>
                <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-mustard uppercase">
                  Find us in
                </p>
                <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {properties.map((property) => (
                    <li key={property.name} className="flex gap-2.5 text-[0.875rem]">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-mustard" />
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
        </div>
      </Container>
    </Section>
  )
}
