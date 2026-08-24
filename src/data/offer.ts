/**
 * The welcome offer popup.
 *
 * Everything the modal renders lives in this one object, and every field is a
 * plain string/boolean - so the admin panel can serve the exact same shape as
 * JSON and change the campaign (copy, artwork, coupon, dates) without a deploy.
 * `fetchOffer()` asks the backend first and falls back to `offer` below, which
 * is what ships when the endpoint is unset, offline or still empty.
 */
export interface Offer {
  /** Master switch - turn the popup off from the panel without a code change. */
  active: boolean
  /** Small kicker above the headline. */
  eyebrow: string
  headline: string
  /** Word or two set in the accent, appended to the headline. */
  headlineAccent?: string
  /** The number on the artwork ribbon, e.g. `25%`. */
  badgeValue?: string
  /** Line under the ribbon number, e.g. `OFF` or `FREE NIGHT`. */
  badgeLabel?: string
  description: string
  /** Coupon the guest quotes when booking. Omit to hide the code chip. */
  code?: string
  /**
   * What the coupon is actually worth, as a whole percent. This is the number
   * the booking form subtracts - the `%` inside the copy below is only text.
   * Omit (or `0`) and the code still shows but applies nothing.
   */
  discountPercent?: number
  /** Unsplash photo id, or a full URL / `/uploads/...` path from the panel. */
  image: string
  imageAlt: string
  /** Up to three short proof points listed beside the button. */
  perks: string[]
  ctaLabel: string
  /**
   * Where the button goes. A path (`/rooms`) routes inside the site, anything
   * else opens in a new tab; leave it empty and the button starts a WhatsApp
   * chat that already quotes the coupon.
   */
  ctaHref: string
  /** Small print under the button. */
  note?: string
  /** `YYYY-MM-DD` - the popup stops appearing the day after this. */
  expiresOn?: string
  /** How long after the page settles before the modal opens. */
  delayMs: number
}

/**
 * The two things a campaign is actually made of. Change them here and the
 * popup, the booking form, the price breakdown and the WhatsApp message all
 * follow - the copy below interpolates the percent rather than repeating it.
 */
const CODE = 'ROAM10'
const DISCOUNT_PERCENT = 10

export const offer: Offer = {
  active: true,
  eyebrow: 'Direct booking offer',
  headline: 'Book direct and',
  headlineAccent: `save ${DISCOUNT_PERCENT}%.`,
  badgeValue: `${DISCOUNT_PERCENT}%`,
  badgeLabel: 'OFF',
  description:
    `Skip the booking sites. Reserve any dorm bed or private room straight with us and take ${DISCOUNT_PERCENT}% off your stay - plus early check-in whenever the room is ready.`,
  code: CODE,
  discountPercent: DISCOUNT_PERCENT,
  image: 'photo-1648960456182-00643d5d20eb',
  imageAlt: 'The Roamigos common room, lamps on',
  perks: ['Free cancellation up to 24h', 'Best rate, guaranteed', 'Confirmed on WhatsApp in minutes'],
  ctaLabel: `Claim ${DISCOUNT_PERCENT}% off`,
  ctaHref: '/rooms',
  note: 'Valid on direct bookings only. Subject to availability.',
  expiresOn: '2026-12-31',
  delayMs: 1200,
}

/**
 * Where the admin panel publishes the live campaign. Point `VITE_OFFER_ENDPOINT`
 * at it (see `.env.example`); unset, the site simply renders the object above.
 */
export const OFFER_ENDPOINT = import.meta.env.VITE_OFFER_ENDPOINT as string | undefined

/** True while today is on or before `expiresOn` (no date = runs forever). */
export function offerIsLive(current: Offer) {
  if (!current.active) return false
  if (!current.expiresOn) return true
  const end = new Date(`${current.expiresOn}T23:59:59`).getTime()
  return Number.isNaN(end) || Date.now() <= end
}

/**
 * Reads the campaign from the panel, merged over the local defaults so a partial
 * payload (only `image` and `code`, say) is still renderable. Any failure - no
 * endpoint, network down, malformed JSON - quietly keeps the shipped offer.
 */
export async function fetchOffer(signal?: AbortSignal): Promise<Offer> {
  if (!OFFER_ENDPOINT) return offer
  try {
    const response = await fetch(OFFER_ENDPOINT, { signal, headers: { Accept: 'application/json' } })
    if (!response.ok) return offer
    const payload = (await response.json()) as Partial<Offer> | null
    if (!payload || typeof payload !== 'object') return offer
    return { ...offer, ...payload }
  } catch {
    return offer
  }
}

/**
 * One fetch per page load, shared by everything that shows the campaign - the
 * popup and the booking form must never disagree about the code or the percent.
 */
let inFlight: Promise<Offer> | null = null

export function loadOffer(): Promise<Offer> {
  inFlight ??= fetchOffer()
  return inFlight
}

/** The discount a code is worth on this campaign, or 0 if it is not the code. */
export function couponValue(current: Offer | null, input: string): number {
  if (!current?.code || !offerIsLive(current)) return 0
  if (input.trim().toUpperCase() !== current.code.trim().toUpperCase()) return 0
  return Math.min(Math.max(current.discountPercent ?? 0, 0), 100)
}
