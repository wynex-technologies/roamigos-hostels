/**
 * Guest submissions: a booking request, or a contact enquiry.
 *
 * The site still opens WhatsApp, and that chat is still the real conversation.
 * This only gives the desk its own copy, so a request is not lost when somebody
 * closes their phone half way through sending it, and so the panel has
 * something to show. The site calls it and does not wait for the answer - if
 * this endpoint is down, the guest never finds out and WhatsApp opens anyway.
 *
 * It writes with the service_role key rather than letting the browser insert,
 * because the anon key is in the bundle: with an insert policy, anyone could
 * fill the desk's inbox from a script. Here the payload has to get past the
 * validation below first.
 *
 * Egress: the request is about a kilobyte and the answer has no body at all.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'
import { date, empty, int, preflight, str } from '../_shared/http.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)

/** Two minutes. Long enough to swallow a double tap, short enough to allow a
    guest who really is booking a second room straight after the first. */
const DEDUPE_WINDOW_MS = 2 * 60 * 1000

Deno.serve(async (request) => {
  const cors = preflight(request)
  if (cors) return cors

  if (request.method !== 'POST') return empty(request, 405)

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return empty(request, 400)
  }

  const kind = payload.kind
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString()

  // ------------------------------------------------------------- booking ---
  if (kind === 'booking') {
    const guestName = str(payload.guestName, 120)
    const guestPhone = str(payload.guestPhone, 40)
    const guestEmail = str(payload.guestEmail, 160)

    // The same three the dialog will not send without. A row missing any of
    // them is not a booking the desk could act on.
    if (!guestName || !guestPhone || !guestEmail) return empty(request, 400)

    const roomSlug = str(payload.roomSlug, 120)

    // A guest who taps Send twice gets one row, not two. `is` rather than `eq`
    // for the slug, because `eq` against null matches nothing in PostgREST and
    // the guard would quietly stop working for a booking with no room on it.
    const query = supabase
      .from('bookings')
      .select('id')
      .eq('guest_email', guestEmail)
      .gte('created_at', since)
      .limit(1)

    const { data: recent } = await (roomSlug
      ? query.eq('room_slug', roomSlug)
      : query.is('room_slug', null))

    if (recent?.length) return empty(request, 202)

    const { error } = await supabase.from('bookings').insert({
      room_slug: roomSlug,
      room_name: str(payload.roomName, 160),
      guest_name: guestName,
      guest_phone: guestPhone,
      guest_email: guestEmail,
      check_in: date(payload.checkIn),
      check_out: date(payload.checkOut),
      nights: int(payload.nights, 0, 365),
      guests: int(payload.guests, 1, 64),
      coupon_code: str(payload.couponCode, 40),
      coupon_percent: int(payload.couponPercent, 0, 100),
      subtotal: int(payload.subtotal, 0, 10_000_000),
      discount: int(payload.discount, 0, 10_000_000),
      total: int(payload.total, 0, 10_000_000),
      note: str(payload.note, 2000),
    })

    return empty(request, error ? 500 : 204)
  }

  // ------------------------------------------------------------ enquiry ----
  if (kind === 'enquiry') {
    const name = str(payload.name, 120)
    const phone = str(payload.phone, 40)
    const topic = str(payload.topic, 120)

    if (!name || !phone || !topic) return empty(request, 400)

    const { data: recent } = await supabase
      .from('enquiries')
      .select('id')
      .eq('phone', phone)
      .gte('created_at', since)
      .limit(1)

    if (recent?.length) return empty(request, 202)

    const { error } = await supabase.from('enquiries').insert({
      name,
      phone,
      topic,
      check_in: date(payload.checkIn),
      check_out: date(payload.checkOut),
      guests: str(payload.guests, 20),
      message: str(payload.message, 4000),
    })

    return empty(request, error ? 500 : 204)
  }

  return empty(request, 400)
})
