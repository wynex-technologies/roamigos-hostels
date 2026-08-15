import { ArrowRight } from 'lucide-react'
import { experiences } from '@/data/content'
import { Photo } from '@/components/ui/Photo'
import { enquiryUrl } from '@/lib/whatsapp'
import { ButtonAnchor } from '@/components/ui/Button'
import { Container, Eyebrow, Flourish, Section, SectionTitle } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'

export function Experiences() {
  return (
    <Section id="experiences" className="bg-surface-2">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>More than a stay</Eyebrow>
          <SectionTitle className="mt-3" underline="Experiences">
            Activities &
          </SectionTitle>
          <Flourish className="mt-7" />
          <p className="mt-7 text-[1.0625rem] leading-relaxed text-pretty">
            At Roamigos, every stay comes with unforgettable experiences. Join activities, meet new
            people and create stories to remember.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((item) => (
            <li key={item.title}>
              <article className="group relative isolate flex h-72 flex-col justify-end overflow-hidden rounded-xl2 border border-line shadow-warm sm:h-80">
                <Photo
                  id={item.image}
                  width={800}
                  widths={[480, 800, 1200]}
                  sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 90vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-108"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/5"
                />

                <span className="absolute top-5 left-5 grid size-11 place-items-center rounded-full bg-cream/95 text-maroon shadow-warm">
                  <Icon name={item.icon} className="size-[1.15rem]" />
                </span>

                <div className="p-6">
                  <h3 className="font-display text-[1.375rem] font-semibold text-cream">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-cream/80 text-pretty">
                    {item.note}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold tracking-wide text-mustard uppercase">
                    Ask us about it
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <ButtonAnchor
            href={enquiryUrl("Hi Roamigos! I'd like to know about the activities and experiences.")}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            size="lg"
          >
            Plan an experience on WhatsApp
            <ArrowRight className="size-4" />
          </ButtonAnchor>
        </div>
      </Container>
    </Section>
  )
}
