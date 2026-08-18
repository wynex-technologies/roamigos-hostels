import { Plus } from 'lucide-react'
import { Container, Eyebrow, SectionTitle } from '@/components/ui/primitives'
import { contactFaqs } from '@/data/contact'
import { enquiryUrl } from '@/lib/whatsapp'
import { ButtonAnchor } from '@/components/ui/Button'

/**
 * Built on `<details>` rather than state, so every answer is present in the
 * document for search and for anyone printing the page — and so one can be
 * opened before React has hydrated anything.
 */
export function ContactFaq() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-line bg-surface-2 py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Before you ask</Eyebrow>
            <SectionTitle className="mt-3" underline="asked">
              The six we get
              <br />
              most
            </SectionTitle>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-pretty">
              If the answer is not here, it is a two-tap message away — and it will probably end up
              on this list next month.
            </p>

            <ButtonAnchor
              href={enquiryUrl("Hi Roamigos! I have a question that isn't in your FAQ.")}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              size="lg"
              className="mt-8"
            >
              Ask something else
            </ButtonAnchor>
          </div>

          <ul className="divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-surface">
            {contactFaqs.map((faq) => (
              <li key={faq.q}>
                <details className="group px-6 py-5 sm:px-7">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-5 font-display text-[1.0625rem] leading-snug font-semibold text-heading transition-colors marker:content-none hover:text-primary sm:text-lg">
                    {faq.q}
                    <span
                      aria-hidden
                      className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-line text-accent transition-[transform,background-color,border-color,color] duration-400 ease-[var(--ease-out-soft)] group-open:rotate-45 group-open:border-primary group-open:bg-primary group-open:text-on-primary"
                    >
                      <Plus className="size-3.5" />
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl pr-12 text-[0.9375rem] leading-relaxed text-pretty">
                    {faq.a}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
