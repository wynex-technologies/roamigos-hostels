import { ArrowUpRight, Quote, ShieldCheck, Star } from 'lucide-react'
import { homePage } from '@/data/pages'
import { reviews } from '@/data/rooms'
import { site } from '@/data/site'
import { ButtonLink } from '@/components/ui/Button'
import { Container, Section } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'
import { useReveal } from '@/lib/useReveal'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/** Everything on this section that the front desk can edit from the panel. */
const section = homePage.why

/** The quote beside the score - the first full-marks review, never a written one. */
const verdict = reviews.find((review) => review.rating === 5) ?? reviews[0]

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')

/**
 * Why here and not the hostel down the road.
 *
 * Two halves arguing the same case from opposite ends: a numbered ledger of
 * claims on the left, and the guests' own scoring of them on the right. The
 * ledger is deliberately typographic - the page already carries three
 * photograph grids above it, and a fourth would read as more of the same rather
 * than as the moment the site stops showing and starts stating.
 *
 * Desktop and tablet only. The argument is built as two columns reading against
 * each other; stacked on a phone it becomes eight scroll-lengths of small print
 * between the programme and the contact band, which is not worth the thumb.
 */
export function WhyChooseUs() {
  const header = useReveal<HTMLDivElement>(0.25)
  const body = useReveal<HTMLDivElement>(0.12)

  return (
    <Section id="why-us" className="hidden scroll-mt-24 md:block">
      <Container wide>
        {/* ========================= the header ========================= */}
        <div ref={header}>
          <p style={lag(0)} className="reveal-rise eyebrow flex items-center gap-2.5">
            <span aria-hidden className="size-1.5 rotate-45 bg-accent-soft" />
            {section.eyebrow}
          </p>

          <div className="mt-6 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
            {/* The one heading on the page that is allowed to shout. Two lines
                pulling against each other - the concession said quietly in muted
                weight, the answer landing in heavy display type - so the size
                reads as emphasis rather than as type set too large. */}
            <h2 className="max-w-3xl font-display text-[clamp(2.4rem,5.4vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.02em]">
              <span style={lag(0.14)} className="reveal-line">
                <span className="text-[0.72em] font-medium text-muted">{section.titleQuiet}</span>
              </span>
              <span style={lag(0.26)} className="reveal-line">
                <span>
                  {section.heading.lead}
                  {/* Maroon word, mustard stroke - the two brand colours doing
                      the emphasis so the size does not have to do all of it. */}
                  <em className="font-semibold text-primary italic underline decoration-accent-soft decoration-[0.075em] underline-offset-[0.06em]">
                    {section.heading.accent}
                  </em>
                  {section.heading.tail}
                </span>
              </span>
            </h2>

            <p
              style={lag(0.42)}
              className="reveal-rise max-w-sm text-[1.0625rem] leading-relaxed text-muted text-pretty lg:pb-2"
            >
              {section.copy}
            </p>
          </div>

          <span
            aria-hidden
            style={lag(0.55)}
            className="reveal-rule mt-10 block h-px w-full origin-left bg-line"
          />
        </div>

        <div
          ref={body}
          className="mt-6 grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 xl:gap-24"
        >
          {/* ========================= the ledger ========================= */}
          <ol>
            {section.reasons.map((reason, i) => {
              const numeral = String(i + 1).padStart(2, '0')

              return (
                <li
                  key={reason.title}
                  style={lag(0.1 + i * 0.1)}
                  className="reveal-rise group relative border-b border-line py-9"
                >
                  {/* Warm wash across the row, and a mustard edge drawn down its
                      left side. Everything else here holds still - the ledger is
                      meant to read as a document, not a deck of cards. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-6 inset-y-0 -z-10 bg-gradient-to-r from-mustard/[0.09] via-mustard/[0.03] to-transparent opacity-0 transition-opacity duration-600 ease-[var(--ease-out-soft)] group-hover:opacity-100"
                  />
                  <span
                    aria-hidden
                    className="absolute top-0 -left-6 h-full w-[3px] origin-top scale-y-0 rounded-full bg-gradient-to-b from-mustard to-gold transition-transform duration-600 ease-[var(--ease-out-soft)] group-hover:scale-y-100"
                  />

                  <div className="grid grid-cols-[auto_1fr] gap-x-7 xl:gap-x-9">
                    {/* Two copies of the numeral, cross-faded: a gradient clipped
                        to text cannot be transitioned, so the mustard one simply
                        comes up over the grey. */}
                    <span
                      aria-hidden
                      className="relative font-display text-[2.25rem] leading-none font-extrabold tabular-nums xl:text-[2.75rem]"
                    >
                      <span className="bg-gradient-to-b from-line-strong to-line bg-clip-text text-transparent transition-opacity duration-500 ease-[var(--ease-out-soft)] group-hover:opacity-0">
                        {numeral}
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-b from-mustard to-gold bg-clip-text text-transparent opacity-0 transition-opacity duration-500 ease-[var(--ease-out-soft)] group-hover:opacity-100">
                        {numeral}
                      </span>
                    </span>

                    <div className="min-w-0">
                      <h3 className="font-display text-[1.375rem] leading-snug font-semibold text-balance transition-colors duration-300 group-hover:text-primary xl:text-[1.5rem]">
                        {reason.title}
                      </h3>

                      <p className="mt-3.5 max-w-prose text-[1rem] leading-relaxed text-muted text-pretty">
                        {reason.note}
                      </p>

                      <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-mustard/30 bg-mustard/[0.09] py-1.5 pr-3.5 pl-3 text-[0.75rem] font-semibold tracking-wide text-heading transition-colors duration-300 group-hover:border-mustard/60">
                        <Icon name={reason.icon} className="size-3.5 text-accent" />
                        {reason.proof}
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* ========================= the verdict ========================= */}
          <aside style={lag(0.24)} className="reveal-rise relative lg:sticky lg:top-28 lg:self-start">
            {/* A warm bloom under the panel, so it sits in its own light rather
                than flat on the canvas. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 blur-2xl"
              style={{
                backgroundImage:
                  'radial-gradient(58% 46% at 50% 4%, rgb(220 38 38 / 0.14), transparent 70%),' +
                  'radial-gradient(52% 44% at 76% 96%, rgb(255 179 0 / 0.16), transparent 72%)',
              }}
            />

            <div className="card-raised overflow-hidden shadow-raised-lg">
              {/* ---- the score, on lacquered maroon ---- */}
              <div className="relative isolate overflow-hidden bg-maroon px-7 pt-6 pb-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(72% 92% at 6% -12%, rgb(255 179 0 / 0.32), transparent 62%),' +
                      'radial-gradient(64% 84% at 110% 118%, rgb(185 28 28 / 0.9), transparent 68%)',
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      'linear-gradient(112deg, rgb(255 255 255 / 0.12) 0%, transparent 38%, transparent 66%, rgb(255 255 255 / 0.05) 100%)',
                  }}
                />
                {/* The hairline that keeps travelling the top edge of the slab
                    downstairs - the two dark objects on this page share it. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden"
                >
                  <span className="animate-edge-travel block h-px w-1/3 bg-gradient-to-r from-transparent via-mustard to-transparent" />
                </span>

                <div className="relative">
                  <p className="eyebrow flex items-center gap-2.5">
                    <span aria-hidden className="size-1.5 rotate-45 bg-mustard" />
                    {section.verdictEyebrow}
                  </p>

                  <div className="mt-5 flex items-end gap-5">
                    <span className="font-display text-[3.75rem] leading-[0.78] font-extrabold tracking-tight text-white tabular-nums">
                      {site.stats.rating.toFixed(1)}
                    </span>

                    <div className="pb-1.5">
                      <span className="flex gap-0.5" aria-hidden>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className="size-4 fill-mustard text-mustard" />
                        ))}
                      </span>
                      <p className="mt-2 text-[0.75rem] leading-tight text-cream/75">
                        {site.stats.reviews.toLocaleString('en-IN')} verified guest reviews
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ---- what the score is made of ----
                  The bars ride the same `--in` as the rest of the block, so they
                  fill as the panel arrives rather than on a timer of their own. */}
              <ul className="space-y-4 border-b border-line px-7 py-7">
                {section.breakdown.map((row, i) => (
                  <li key={row.label}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[0.8125rem] font-semibold text-heading">
                        {row.label}
                      </span>
                      <span className="text-[0.8125rem] font-semibold text-muted tabular-nums">
                        {row.value.toFixed(1)}
                      </span>
                    </div>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-line">
                      <span
                        aria-hidden
                        style={{ ...lag(0.35 + i * 0.09), width: `${(row.value / 5) * 100}%` }}
                        className="reveal-rule block h-full origin-left rounded-full bg-gradient-to-r from-gold to-mustard"
                      />
                    </span>
                  </li>
                ))}
              </ul>

              {/* ---- one guest, in their own words ---- */}
              <figure className="px-7 py-7">
                <Quote aria-hidden className="size-5 fill-accent-soft/25 text-accent-soft" />

                <blockquote className="mt-4 font-display text-[1.0625rem] leading-relaxed font-medium text-heading text-pretty">
                  {verdict.text}
                </blockquote>

                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-maroon font-display text-[0.75rem] font-semibold text-cream">
                    {initials(verdict.name)}
                  </span>
                  <span className="text-[0.8125rem] leading-tight">
                    <span className="block font-semibold text-heading">{verdict.name}</span>
                    <span className="text-muted">Stayed {verdict.date}</span>
                  </span>
                </figcaption>
              </figure>

              {/* ---- the closing assurance strip ---- */}
              <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-line bg-surface-2 px-7 py-4">
                <span className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-green-deep dark:text-green">
                  <ShieldCheck className="size-4" />
                  Free cancellation up to 24h
                </span>
                <span className="text-[0.8125rem] text-muted">
                  <span className="font-semibold text-heading">{site.stats.guests}</span> guests
                  hosted
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <ButtonLink to="/rooms">
                {section.ctaLabel}
                <ArrowUpRight className="size-4" />
              </ButtonLink>
              <span className="text-[0.8125rem] text-muted">No prepayment, pay at check-in.</span>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  )
}
