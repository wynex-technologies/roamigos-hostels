import { useId } from 'react'
import { ArrowRight, MessageCircle, ShieldCheck, Timer, Wallet } from 'lucide-react'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { Container, Section } from '@/components/ui/primitives'
import { Slab } from '@/components/common/Slab'
import { enquiryUrl } from '@/lib/whatsapp'
import { useReveal } from '@/lib/useReveal'

interface CtaBandProps {
  eyebrow: string
  title: React.ReactNode
  copy: string
  /** Text prefilled into the WhatsApp draft, so the desk knows which page sent it. */
  chatPrompt: string
  primaryLabel?: string
  primaryTo?: string
}

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/** The three promises that make the booking a one-message decision. */
const promises = [
  { icon: ShieldCheck, label: 'Free cancellation', note: 'Right up to arrival day' },
  { icon: Timer, label: 'Confirmed in minutes', note: 'A real person, not a bot' },
  { icon: Wallet, label: 'Nothing upfront', note: 'You pay at the front desk' },
]

/**
 * Closing band shared by the journal, gallery and contact pages.
 *
 * The ask at the bottom of a page is the same every time, so the band cannot
 * lean on new copy to stay interesting — it has to be an object worth arriving
 * at. Hence the ticket: a real boarding pass with notches punched out of its
 * sides, a perforated tear line, and a seal that never stops turning. It says
 * the same three things the copy says (nothing upfront, confirmed in minutes,
 * cancel any time) in the one format every traveller already knows how to read.
 */
export function CtaBand({
  eyebrow,
  title,
  copy,
  chatPrompt,
  primaryLabel = 'Browse rooms & beds',
  primaryTo = '/rooms',
}: CtaBandProps) {
  const block = useReveal<HTMLDivElement>(0.15)

  return (
    <Section className="pb-0">
      <Container>
        <Slab className="px-6 py-14 sm:px-10 lg:px-14 lg:py-16">
          <div
            ref={block}
            className="grid items-center gap-12 lg:grid-cols-[1.05fr_auto] lg:gap-16"
          >
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
                  {eyebrow}
                </p>
                <span
                  aria-hidden
                  style={lag(0.1)}
                  className="reveal-rule h-px flex-1 origin-left bg-gradient-to-r from-mustard/45 to-transparent"
                />
              </div>

              <h2
                style={lag(0.08)}
                className="reveal-rise mt-5 font-display text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.06] font-semibold text-white text-balance"
              >
                {title}
              </h2>

              <p
                style={lag(0.16)}
                className="reveal-rise mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-gray-200 text-pretty"
              >
                {copy}
              </p>

              <div style={lag(0.24)} className="reveal-rise mt-9 flex flex-wrap gap-3">
                <ButtonLink
                  to={primaryTo}
                  variant="accent"
                  size="lg"
                  className="gloss-sweep group/pri hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-14px] hover:shadow-gold/70"
                >
                  {primaryLabel}
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/pri:translate-x-1" />
                </ButtonLink>
                <ButtonAnchor
                  href={enquiryUrl(chatPrompt)}
                  target="_blank"
                  rel="noreferrer"
                  size="lg"
                  className="gloss-sweep group/chat border border-cream/25 bg-cream/10 text-cream hover:-translate-y-0.5 hover:border-mustard/70 hover:bg-cream/15"
                >
                  <MessageCircle className="size-4 transition-transform duration-300 group-hover/chat:-rotate-12" />
                  Chat on WhatsApp
                </ButtonAnchor>
              </div>

              {/* -------- the three promises, as a rail under the buttons -------- */}
              <ul className="mt-10 grid gap-x-8 gap-y-4 border-t border-cream/10 pt-7 sm:grid-cols-3">
                {promises.map((promise, i) => (
                  <li
                    key={promise.label}
                    style={lag(0.34 + i * 0.08)}
                    className="reveal-rise group/promise flex items-start gap-3"
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl border border-cream/15 bg-cream/[0.07] text-mustard transition-all duration-500 group-hover/promise:-translate-y-0.5 group-hover/promise:border-mustard/50 group-hover/promise:bg-mustard group-hover/promise:text-ink">
                      <promise.icon className="size-[0.95rem]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.875rem] font-semibold text-gray-200">
                        {promise.label}
                      </span>
                      <span className="mt-0.5 block text-[0.78rem] leading-snug text-gray-200/55">
                        {promise.note}
                      </span>
                      <span
                        aria-hidden
                        className="mt-2 block h-px origin-left scale-x-0 bg-gradient-to-r from-mustard to-transparent transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover/promise:scale-x-100"
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ======================= the ticket ======================= */}
            <div style={lag(0.2)} className="reveal-rise lg:w-[21rem]">
              <BoardingPass />
            </div>
          </div>
        </Slab>
      </Container>
    </Section>
  )
}

/**
 * The boarding pass.
 *
 * The notches are punched with a mask rather than drawn with two circles, so
 * the slab's own gradient shows through the holes — which is the whole reason
 * it reads as a torn ticket instead of a card with dots on it.
 */
function BoardingPass() {
  // `useId` hands back colons, which are legal in a fragment but a nuisance
  // everywhere else — strip them so the seal's <textPath> reference is plain.
  const ring = `seal-${useId().replace(/:/g, '')}`

  return (
    <div className="group/ticket relative mx-auto max-w-sm [perspective:1200px]">
      {/* The second ticket in the stack, just far enough back to imply a pile. */}
      <div
        aria-hidden
        className="absolute inset-x-3 top-3 bottom-0 rounded-[1.4rem] border border-cream/10 bg-cream/[0.04] transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover/ticket:translate-y-2 group-hover/ticket:rotate-[1.6deg]"
      />

      <div
        className="relative rounded-[1.4rem] border border-cream/15 bg-cream/[0.07] p-5 backdrop-blur-md transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover/ticket:-translate-y-1.5 group-hover/ticket:-rotate-[1.2deg]"
        style={{
          maskImage:
            'radial-gradient(circle 0.7rem at 0% 54%, transparent 97%, #000 100%),' +
            'radial-gradient(circle 0.7rem at 100% 54%, transparent 97%, #000 100%)',
          WebkitMaskImage:
            'radial-gradient(circle 0.7rem at 0% 54%, transparent 97%, #000 100%),' +
            'radial-gradient(circle 0.7rem at 100% 54%, transparent 97%, #000 100%)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      >
        {/* ---------------- stub head ---------------- */}
        <div className="flex items-center justify-between text-[0.6rem] font-bold tracking-[0.24em] text-gray-200/55 uppercase">
          <span>Boarding pass</span>
          <span className="text-mustard">No. 01</span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <span>
            <span className="block text-[0.58rem] tracking-[0.2em] text-gray-200/45 uppercase">
              From
            </span>
            <span className="mt-1 block font-display text-2xl leading-none font-semibold text-white">
              You
            </span>
          </span>

          {/* The route. The dot runs the dashes on hover — one small reward for
              having touched the thing. */}
          <span aria-hidden className="relative mb-1.5 h-px flex-1 bg-cream/25">
            <span
              className="absolute -top-[3px] left-0 size-[7px] rounded-full bg-mustard transition-all duration-700 ease-[var(--ease-out-soft)] group-hover/ticket:left-[calc(100%-7px)]"
              style={{ boxShadow: '0 0 12px var(--color-mustard)' }}
            />
          </span>

          <span className="text-right">
            <span className="block text-[0.58rem] tracking-[0.2em] text-gray-200/45 uppercase">
              To
            </span>
            <span className="mt-1 block font-display text-2xl leading-none font-semibold text-mustard">
              GAU
            </span>
          </span>
        </div>

        {/* ---------------- the tear line ---------------- */}
        <div
          aria-hidden
          className="mt-5 h-px w-full"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgb(251 241 230 / 0.32) 0 6px, transparent 6px 12px)',
          }}
        />

        {/* ---------------- the counterfoil ---------------- */}
        <dl className="mt-5 grid grid-cols-3 gap-3">
          {[
            { k: 'Deposit', v: '₹0' },
            { k: 'Confirm', v: '~5 min' },
            { k: 'Check-in', v: 'Any hour' },
          ].map((cell) => (
            <div key={cell.k}>
              <dt className="text-[0.56rem] font-bold tracking-[0.18em] text-gray-200/45 uppercase">
                {cell.k}
              </dt>
              <dd className="mt-1 font-display text-[1.0625rem] leading-none font-semibold text-white">
                {cell.v}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex items-center gap-4">
          {/* -------- the seal -------- */}
          <svg
            viewBox="0 0 100 100"
            className="size-[4.25rem] shrink-0 transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover/ticket:scale-105"
            aria-hidden
          >
            <defs>
              <path
                id={ring}
                fill="none"
                d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
              />
            </defs>
            <circle cx="50" cy="50" r="27" className="fill-mustard/10 stroke-mustard/45" />
            <circle
              cx="50"
              cy="50"
              r="31"
              fill="none"
              className="stroke-cream/15"
              strokeDasharray="2 4"
            />
            <g className="animate-seal" style={{ transformOrigin: '50% 50%' }}>
              <text className="fill-mustard/85 text-[8.5px] font-semibold tracking-[0.14em]">
                <textPath href={`#${ring}`} startOffset="0">
                  ROAMIGOS HOSTEL · GUWAHATI · ASSAM ·
                </textPath>
              </text>
            </g>
            {/* Compass rose, drawn rather than imported: a lucide icon nested in
                an outer <svg> fights its own width/height utilities. */}
            <g className="fill-mustard">
              <path d="M50 37 L53.6 46.4 L63 50 L53.6 53.6 L50 63 L46.4 53.6 L37 50 L46.4 46.4 Z" />
            </g>
          </svg>

          <p className="text-[0.8125rem] leading-snug text-gray-200/70">
            Message the desk and this is the whole booking —
            <span className="text-gray-200"> no card, no forms, no deposit.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
