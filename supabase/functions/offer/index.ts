/**
 * The live welcome campaign, as the shape `src/data/offer.ts` already expects.
 *
 * This is the one thing the site reads at runtime rather than at build, and it
 * is deliberate: a campaign can be started, edited or pulled from the panel and
 * be live on the next page load, without waiting for a deploy. Everything else
 * the site prints comes down with the bundle.
 *
 * Egress: the answer is roughly half a kilobyte and is cached for five minutes
 * by the browser and any CDN in front of it, so a returning visitor moving
 * between pages does not ask again. `src/lib/useOffer.ts` also shares one fetch
 * across the whole page. An empty campaign answers 204, which costs nothing at
 * all - and the site simply keeps the defaults compiled into it.
 *
 * It also answers one other question, on the same address:
 *
 *     GET ?code=ROAM20   ->   { "code": "ROAM20", "percent": 20 }
 *                             204 when it is not a code, or not valid today
 *
 * That is how the booking form checks a coupon. The alternative - sending the
 * whole `coupons` table down with the campaign and matching in the browser -
 * would put every code the hostel has ever issued, including the one given to a
 * single partner, in the network tab of every visitor. So the code goes up and
 * a number comes back. It costs one request, and only when somebody actually
 * types something into the coupon box.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'
import { empty, json, preflight } from '../_shared/http.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)

/** Only the columns the popup renders. `select *` would ship the timestamps too. */
const COLUMNS = [
  'active',
  'eyebrow',
  'headline',
  'headline_accent',
  'badge_value',
  'badge_label',
  'description',
  'code',
  'discount_percent',
  'image',
  'image_alt',
  'perks',
  'cta_label',
  'cta_href',
  'note',
  'expires_on',
  'delay_ms',
].join(',')

/**
 * Checking one code.
 *
 * Matched case-insensitively on the same expression the unique index uses, and
 * only ever answered for a coupon that is active and inside its dates - the
 * dates are compared here rather than in the browser, because a device clock
 * is not evidence of anything.
 *
 * A wrong code answers 204, exactly like an expired one and exactly like a
 * campaign that is not running. There is nothing to learn from the difference,
 * and no way to walk the table by trying.
 */
async function checkCode(request: Request, raw: string) {
  const code = raw.trim().toUpperCase()
  // Long enough to be a code, short enough that nobody is probing with essays.
  if (!code || code.length > 32) return empty(request, 204)

  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('coupons')
    .select('code,percent')
    .eq('active', true)
    .ilike('code', code)
    .or(`starts_on.is.null,starts_on.lte.${today}`)
    .or(`expires_on.is.null,expires_on.gte.${today}`)
    .maybeSingle()

  if (error || !data) return empty(request, 204)

  return json(request, { code: data.code, percent: data.percent }, {
    headers: {
      // A code is worth what it is worth for a while, and the same guest will
      // try it on two rooms before booking. Short, private - never s-maxage:
      // one visitor's coupon must not be cached by a CDN for the next one.
      'Cache-Control': 'private, max-age=60',
    },
  })
}

Deno.serve(async (request) => {
  const cors = preflight(request)
  if (cors) return cors

  if (request.method !== 'GET') return empty(request, 405)

  const asked = new URL(request.url).searchParams.get('code')
  if (asked !== null) return await checkCode(request, asked)

  const { data, error } = await supabase
    .from('offers')
    .select(COLUMNS)
    .eq('active', true)
    .maybeSingle()

  // A failure here must never take the popup down with it: the site falls back
  // to the campaign compiled into the bundle whenever this answers no content.
  if (error || !data) return empty(request, 204)

  const offer = {
    active: data.active,
    eyebrow: data.eyebrow,
    headline: data.headline,
    headlineAccent: data.headline_accent ?? undefined,
    badgeValue: data.badge_value ?? undefined,
    badgeLabel: data.badge_label ?? undefined,
    description: data.description,
    code: data.code ?? undefined,
    discountPercent: data.discount_percent,
    image: data.image,
    imageAlt: data.image_alt,
    perks: data.perks ?? [],
    ctaLabel: data.cta_label,
    ctaHref: data.cta_href,
    note: data.note ?? undefined,
    expiresOn: data.expires_on ?? undefined,
    delayMs: data.delay_ms,
  }

  return json(request, offer, {
    headers: {
      // Five minutes in the browser, an hour of stale-while-revalidate on any
      // CDN in front. A campaign change is live within the window; a visitor
      // clicking through four pages costs one request, not four.
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
    },
  })
})
