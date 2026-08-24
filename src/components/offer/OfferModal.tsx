import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, Copy, Sparkles, X } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { useOffer } from '@/lib/useOffer'
import { enquiryUrl } from '@/lib/whatsapp'
import { formatDate } from '@/lib/utils'

/**
 * The welcome offer popup - one photograph, one number, one thing to do.
 *
 * It opens on every fresh load of the site (not on route changes, since it is
 * mounted once in the layout), waits `delayMs` so it never fights the hero for
 * attention, and closes on the button, the backdrop or Escape. All of its
 * content comes from `src/data/offer.ts`, which the admin panel can override
 * over HTTP - nothing in here needs editing to run a new campaign.
 */
export function OfferModal() {
  const current = useOffer()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const copyTimer = useRef<number>(undefined)

  // Hold the modal back until the page has settled, then show it once.
  useEffect(() => {
    if (!current) return
    const id = window.setTimeout(() => setOpen(true), current.delayMs)
    return () => window.clearTimeout(id)
  }, [current])

  // While it is up: Escape closes, the page behind it stays put, and focus starts
  // on the close button so a keyboard is never stranded on the backdrop.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  if (!current || !open) return null

  const { code } = current
  const href =
    current.ctaHref ||
    enquiryUrl(
      code
        ? `Hi Roamigos! I'd like to book with the ${code} offer.`
        : `Hi Roamigos! I'd like to know more about your current offer.`,
    )
  const internal = href.startsWith('/')

  async function copyCode() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure origin, denied permission) - the code is on
      // screen either way, so there is nothing to recover from.
    }
  }

  const cta =
    'inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 ' +
    'text-[0.9375rem] font-semibold text-on-primary shadow-[0_12px_28px_-12px] shadow-maroon/70 ' +
    'transition-[background-color,box-shadow,transform] hover:bg-primary-hover ' +
    'hover:shadow-[0_18px_36px_-14px] active:scale-[0.98]'

  return (
    <div
      role="presentation"
      onClick={() => setOpen(false)}
      className="animate-backdrop-in fixed inset-0 z-100 flex items-end justify-center overflow-y-auto overscroll-contain bg-ink/70 p-4 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-headline"
        onClick={(event) => event.stopPropagation()}
        className="card-raised animate-modal-in relative my-auto w-full max-w-3xl overflow-hidden shadow-lift"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close offer"
          className="absolute top-3.5 right-3.5 z-20 grid size-9 place-items-center rounded-full border border-cream/25 bg-ink/45 text-cream backdrop-blur-md transition-colors hover:bg-ink/70 sm:top-4 sm:right-4"
        >
          <X className="size-4" />
        </button>

        <div className="grid sm:grid-cols-[0.85fr_1fr]">
          {/* Artwork - a banner above the copy on phones, a portrait plate beside
              it from `sm` up. The ribbon rides the same corner in both. */}
          <div className="relative isolate min-h-44 overflow-hidden bg-surface-2 sm:min-h-full">
            <Photo
              id={current.image}
              width={720}
              widths={[420, 720, 1040]}
              sizes="(min-width: 640px) 20rem, 100vw"
              alt={current.imageAlt}
              className="absolute inset-0 size-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-ink/5 sm:to-ink/25"
            />

            {current.badgeValue ? (
              <div className="absolute bottom-4 left-4 grid size-20 place-items-center rounded-full bg-mustard text-center text-ink shadow-warm-lg sm:bottom-5 sm:left-5 sm:size-24">
                <span>
                  <span className="block font-display text-2xl leading-none font-extrabold sm:text-[1.75rem]">
                    {current.badgeValue}
                  </span>
                  {current.badgeLabel ? (
                    <span className="mt-1.5 block text-[0.625rem] leading-none font-bold tracking-[0.16em]">
                      {current.badgeLabel}
                    </span>
                  ) : null}
                </span>
              </div>
            ) : null}
          </div>

          <div className="p-6 sm:p-8 lg:p-9">
            <p className="eyebrow flex items-center gap-2">
              <Sparkles className="size-3.5 text-accent" />
              {current.eyebrow}
            </p>

            <h2
              id="offer-headline"
              className="mt-3.5 font-display text-[clamp(1.5rem,4.5vw,2.125rem)] leading-[1.12] font-bold text-balance"
            >
              {current.headline}
              {current.headlineAccent ? (
                <>
                  {' '}
                  <span className="brush-underline text-primary">{current.headlineAccent}</span>
                </>
              ) : null}
            </h2>

            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted text-pretty">
              {current.description}
            </p>

            {code ? (
              <button
                type="button"
                onClick={copyCode}
                className="mt-5 flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-line-strong bg-surface-2/70 px-4 py-3 text-left transition-colors hover:border-primary"
              >
                <span className="min-w-0">
                  <span className="block text-[0.625rem] font-bold tracking-[0.14em] text-muted uppercase">
                    Use code
                  </span>
                  <span className="block font-display text-lg font-extrabold tracking-[0.12em] break-all text-heading">
                    {code}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.75rem] font-semibold text-primary">
                  {copied ? (
                    <Check className="size-4 text-green-deep" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </button>
            ) : null}

            {current.perks.length ? (
              <ul className="mt-5 space-y-2">
                {current.perks.slice(0, 3).map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-[0.8125rem] text-body">
                    <Check className="mt-px size-4 shrink-0 text-green-deep" />
                    <span className="text-pretty">{perk}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-7">
              {internal ? (
                <Link to={href} onClick={() => setOpen(false)} className={cta}>
                  {current.ctaLabel}
                  <ArrowUpRight className="size-4" />
                </Link>
              ) : (
                <a href={href} target="_blank" rel="noreferrer" className={cta}>
                  {current.ctaLabel}
                  <ArrowUpRight className="size-4" />
                </a>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-3 w-full text-[0.8125rem] font-medium text-muted transition-colors hover:text-heading"
              >
                No thanks, maybe later
              </button>
            </div>

            {current.note || current.expiresOn ? (
              <p className="mt-5 border-t border-line pt-4 text-[0.6875rem] leading-relaxed text-muted">
                {current.note}
                {current.note && current.expiresOn ? ' ' : null}
                {current.expiresOn ? `Offer ends ${formatDate(current.expiresOn)}.` : null}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
