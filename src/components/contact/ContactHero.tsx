import { Link } from 'react-router-dom'
import { ChevronRight, MapPin, MessageCircle, Phone } from 'lucide-react'
import { ButtonAnchor } from '@/components/ui/Button'
import { Container, Eyebrow, SectionTitle } from '@/components/ui/primitives'
import { Photo } from '@/components/ui/Photo'
import { deskFacts } from '@/data/contact'
import { site } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'

/**
 * The page opens on the two things somebody looking for "contact" actually
 * wants: a way to start talking in one tap, and proof that a human is on the
 * other end. Everything else on the page is detail.
 */
export function ContactHero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface-2 pt-10 pb-16 sm:pt-12 sm:pb-20">
      {/* Warm ambient wash, kept subtle - this section is a workspace, not a poster. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 size-[36rem] rounded-full bg-mustard/6 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-32 size-[32rem] rounded-full bg-maroon/5 blur-[130px]"
      />

      <Container className="relative">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-wide text-muted uppercase"
        >
          <Link to="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-heading">Contact</span>
        </nav>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          {/* ---------------------------- the ask ---------------------------- */}
          <div>
            <Eyebrow>Say hello</Eyebrow>
            <SectionTitle as="h1" className="mt-3" underline="desk">
              There is always
              <br />
              someone on the
            </SectionTitle>

            <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-pretty">
              No ticket numbers, no hold music, no bot that asks for your booking reference three
              times. Message us and a person who has actually stood at the Nimati Ghat ferry queue
              will answer you.
            </p>

            {/* Live-ish signal - the one claim worth putting above the buttons. */}
            <p className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 text-[0.8125rem] font-medium text-heading">
              <span aria-hidden className="relative grid size-2.5 place-items-center">
                <span className="absolute size-2.5 animate-ping rounded-full bg-green/60 motion-reduce:animate-none" />
                <span className="size-2 rounded-full bg-green-deep dark:bg-green" />
              </span>
              Front desk online - usually replies in under 10 minutes
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {/* Mustard, not the green WhatsApp variant - this page keeps one
                  CTA colour, and green stays on the icons and the status dot. */}
              <ButtonAnchor
                href={enquiryUrl()}
                target="_blank"
                rel="noreferrer"
                variant="accent"
                size="lg"
              >
                <MessageCircle className="size-4" />
                Chat on WhatsApp
              </ButtonAnchor>
              <ButtonAnchor
                href={`tel:${site.phoneDisplay.replace(/\s/g, '')}`}
                variant="secondary"
                size="lg"
              >
                <Phone className="size-4" />
                {site.phoneDisplay}
              </ButtonAnchor>
            </div>
          </div>

          {/* --------------------------- the desk ---------------------------
              The card brings its own ground, so it takes `panel-slab` and flips
              with the theme like the closing slab does - off white in light,
              charcoal in dark. Everything inside asks for `cream` / `gray-200`
              and the class rebinds both to the panel's own ink, so no child has
              to know which ground it is sitting on. */}
          <div className="panel-slab relative isolate overflow-hidden rounded-[1.75rem] border border-line text-gray-200 shadow-lift">
            {/* Nothing is laid over the photograph - no scrim, no wash, in
                either theme. The caption it used to carry sits under it now,
                which is also the only way it stays readable on both grounds. */}
            <div className="h-40 sm:h-48">
              <Photo
                id="photo-1648960456182-00643d5d20eb"
                width={900}
                widths={[560, 900, 1200]}
                sizes="(min-width: 1024px) 32rem, 100vw"
                alt="The Roamigos common room, just past reception"
                className="size-full object-cover"
              />
            </div>

            <div className="p-6 sm:p-8">
              <p className="mb-5 text-[0.6875rem] font-bold tracking-[0.24em] text-mustard uppercase">
                Reception · Ground floor
              </p>

              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-mustard" />
                <address className="text-[0.9375rem] leading-relaxed text-gray-200 not-italic">
                  <a
                    href={site.address.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors duration-200 hover:text-mustard"
                  >
                    {site.address.line1}
                    <br />
                    {site.address.line2}
                    <br />
                    {site.address.line3}
                  </a>
                </address>
              </div>

              <dl className="mt-7 grid gap-x-6 gap-y-5 border-t border-cream/15 pt-6 sm:grid-cols-2">
                {deskFacts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-[0.625rem] font-bold tracking-[0.2em] text-gray-200/45 uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-[0.875rem] text-gray-200">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              {/* The same label-over-value pairs as the facts above, rather
                  than one wrapping line. Side by side these read as a pair; on
                  a phone the old row broke wherever it ran out of width and
                  left a stranded "/" between two half-lines. Each pair now
                  keeps its own label and the separator is gone - two columns
                  where there is room, stacked where there is not. */}
              <dl className="mt-7 grid gap-x-6 gap-y-4 border-t border-cream/15 pt-5 sm:grid-cols-2">
                {[
                  { label: 'Check-in', value: site.checkIn },
                  { label: 'Check-out', value: site.checkOut },
                ].map((time) => (
                  <div key={time.label}>
                    <dt className="text-[0.625rem] font-bold tracking-[0.2em] text-mustard uppercase">
                      {time.label}
                    </dt>
                    <dd className="mt-1 font-display text-lg text-cream">{time.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
