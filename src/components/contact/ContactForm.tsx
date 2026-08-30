import { useState } from 'react'
import { Check, MessageCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container, Eyebrow, SectionTitle } from '@/components/ui/primitives'
import { enquiryTopics } from '@/data/contact'
import { site } from '@/data/site'
import { buildContactUrl, contactMessage, type ContactDraft } from '@/lib/whatsapp'
import { recordEnquiry } from '@/lib/intake'
import { addDaysISO, todayISO } from '@/lib/utils'

/* The label sits inside the field, so the top padding is what makes room for
   it and the bottom padding is what the typed value gets. Both are generous
   here on purpose: this is the form a guest fills in on a phone, at a station,
   one-handed. */
const field =
  'w-full rounded-xl border border-line bg-surface-2 px-4 pt-7 pb-3.5 text-base font-medium text-heading ' +
  'transition-colors focus:border-primary focus:outline-none [color-scheme:light] dark:[color-scheme:dark]'

const label =
  'pointer-events-none absolute top-3 left-4 text-[0.6875rem] font-bold tracking-[0.14em] text-muted uppercase'

const steps = [
  { title: 'Fill in the short version', note: 'Only the name, number and question are required.' },
  { title: 'Read what we will receive', note: 'The exact message is written out below as you type.' },
  { title: 'Send it yourself', note: 'It opens in your own WhatsApp - nothing is sent behind your back.' },
]

/**
 * The enquiry composer. There is no inbox on the other side of this form, so
 * rather than pretending otherwise it builds the WhatsApp message in the open
 * and hands it to the visitor to send - which is also why the preview is not
 * decorative: it is the payload, character for character.
 */
export function ContactForm() {
  const today = todayISO()
  const [draft, setDraft] = useState<ContactDraft>({
    name: '',
    phone: '',
    topic: enquiryTopics[0],
    checkIn: '',
    checkOut: '',
    guests: '',
    message: '',
  })

  const set = <K extends keyof ContactDraft>(key: K, value: ContactDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  // Check-out can never fall on or before check-in.
  const minCheckOut = draft.checkIn ? addDaysISO(draft.checkIn, 1) : addDaysISO(today, 1)

  function send(event: React.FormEvent) {
    event.preventDefault()

    // Same carbon copy as a booking: recorded for the desk, never allowed to
    // get between the visitor and the WhatsApp thread they were promised.
    recordEnquiry(draft)

    window.open(buildContactUrl(draft), '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="enquiry" className="scroll-mt-24 border-y border-line bg-surface-2 py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.08fr] lg:gap-16">
          {/* ------------------------- the explanation ------------------------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Write to us</Eyebrow>
            <SectionTitle className="mt-3" underline="send">
              A form that does not
              <br />
              pretend to
            </SectionTitle>

            <p className="mt-6 text-[1.0625rem] leading-relaxed text-pretty">
              Most contact forms drop your message into an inbox nobody has opened since March. This
              one builds a WhatsApp message, shows it to you, and lets you press send - so you know
              exactly where it went and you have the thread on your own phone.
            </p>

            <ol className="mt-9 space-y-5">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-surface font-display text-sm font-semibold text-accent">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-heading">{step.title}</span>
                    <span className="mt-0.5 block text-[0.9375rem] text-muted text-pretty">
                      {step.note}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-9 flex gap-3 rounded-2xl border border-line bg-surface p-5 text-[0.875rem] leading-relaxed text-muted">
              <ShieldCheck className="mt-0.5 size-[1.15rem] shrink-0 text-green-deep dark:text-green" />
              <span>
                Nothing you type here is stored or sent anywhere until you press the button. There
                is no account, no tracking pixel and no third party in between.
              </span>
            </p>
          </div>

          {/* ---------------------------- the form ---------------------------- */}
          <div>
            <form onSubmit={send} className="card-raised space-y-3 p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <span className={label}>Your name</span>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={draft.name}
                    onChange={(event) => set('name', event.target.value)}
                    placeholder="Priya Sharma"
                    className={`${field} placeholder:font-normal placeholder:text-muted/60`}
                  />
                </div>
                <div className="relative">
                  <span className={label}>Phone or WhatsApp</span>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={draft.phone}
                    onChange={(event) => set('phone', event.target.value)}
                    placeholder="+91 90000 00000"
                    className={`${field} placeholder:font-normal placeholder:text-muted/60`}
                  />
                </div>
              </div>

              <div className="relative">
                <span className={label}>What is this about?</span>
                <select
                  value={draft.topic}
                  onChange={(event) => set('topic', event.target.value)}
                  className={`${field} appearance-none pr-10`}
                >
                  {enquiryTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-4 bottom-[1.35rem] size-2 rotate-135 border-t border-r border-muted"
                />
              </div>

              {/* The two dates read as a sequence, so they are stacked rather
                  than sat side by side - check-out is the answer to check-in,
                  and a date field squeezed into a third of a row is the one
                  control on this form that is genuinely awkward to tap. */}
              <div className="grid gap-3">
                <div className="relative">
                  <span className={label}>Check-in</span>
                  <input
                    type="date"
                    min={today}
                    value={draft.checkIn}
                    onChange={(event) => set('checkIn', event.target.value)}
                    className={field}
                  />
                </div>
                <div className="relative">
                  <span className={label}>Check-out</span>
                  <input
                    type="date"
                    min={minCheckOut}
                    value={draft.checkOut}
                    onChange={(event) => set('checkOut', event.target.value)}
                    className={field}
                  />
                </div>
                <div className="relative">
                  <span className={label}>Guests</span>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={draft.guests}
                    onChange={(event) => set('guests', event.target.value)}
                    placeholder="2"
                    className={`${field} placeholder:font-normal placeholder:text-muted/60`}
                  />
                </div>
              </div>

              <div className="relative">
                <span className={label}>Your message</span>
                <textarea
                  required
                  rows={4}
                  value={draft.message}
                  onChange={(event) => set('message', event.target.value)}
                  placeholder="Arriving on the night train from Jorhat - is a late check-in okay?"
                  className={`${field} resize-y placeholder:font-normal placeholder:text-muted/60`}
                />
              </div>

              {/* Mustard like the hero's - one CTA colour on this page. */}
              <Button type="submit" variant="accent" size="lg" className="!mt-5 w-full">
                <MessageCircle className="size-4" />
                Send on WhatsApp
              </Button>

              <p className="!mt-3 flex items-center justify-center gap-1.5 text-center text-[0.75rem] text-muted">
                <Check className="size-3.5 text-green-deep dark:text-green" />
                Opens your own WhatsApp with the message below, ready to send
              </p>
            </form>

            {/* ------------------------- live preview ------------------------- */}
            <div className="mt-6 overflow-hidden rounded-xl2 border border-line bg-surface">
              <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
                <span className="grid size-8 place-items-center rounded-full bg-green-deep text-cream">
                  <MessageCircle className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.875rem] font-semibold text-heading">
                    {site.legalName}
                  </span>
                  <span className="block text-[0.75rem] text-muted">{site.phoneDisplay}</span>
                </span>
                <span className="ml-auto text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase">
                  Preview
                </span>
              </div>

              <div className="bg-surface-2 p-5">
                <p className="max-w-[92%] rounded-2xl rounded-br-md bg-green-deep/10 px-4 py-3 text-[0.875rem] leading-relaxed whitespace-pre-line text-body dark:bg-green/15">
                  {contactMessage(draft)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
