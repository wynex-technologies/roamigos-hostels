/**
 * Sends the desk its own copy of a booking request or an enquiry.
 *
 * The WhatsApp message is still the booking. This is a carbon copy, and it is
 * built to be exactly that: it never blocks, never throws into the caller,
 * never shows the guest an error and never delays the chat opening. If the
 * endpoint is unset, slow or down, the guest is not affected in any way - they
 * still land in WhatsApp with the same message they always would have.
 *
 * Getting it *delivered*, though, turned out to be the hard part, and it is
 * worth writing down why - because it failed silently for a while and silence
 * is the whole design.
 *
 * `sendBeacon` was the only sender, with the body as a Blob typed
 * `application/json`. That content type is not CORS-safelisted, so a beacon
 * carrying it is no longer a simple request: the browser has to preflight it,
 * and a beacon is fire-and-forget - `sendBeacon` returns `true` for *queued*,
 * not for *delivered*. So every one of these was queued, refused at the CORS
 * check, and reported as a success. Nothing arrived and nothing said so.
 *
 * Two things fix it, and both are kept:
 *
 *   1. `fetch` with `keepalive` goes first. `keepalive` is the same survival
 *      guarantee a beacon has - the request outlives the page - and unlike a
 *      beacon it does proper CORS and reports what happened. It is also worth
 *      remembering that both callers open WhatsApp with `window.open` into a
 *      new tab, so this page is usually not going anywhere at all.
 *   2. The beacon, still there as the fallback, now sends `text/plain`, which
 *      is CORS-safelisted and needs no preflight. The endpoint reads the body
 *      with `request.json()` and does not care what the header claimed.
 *
 * A duplicate is not a risk worth avoiding here: the endpoint drops a repeat of
 * the same booking inside two minutes, so trying twice is safe and trying once
 * is not enough.
 *
 * Egress: about a kilobyte up, and the endpoint answers with no body at all.
 */
import type { Room } from '@/data/rooms'
import type { BookingDraft } from './whatsapp'
import { bookingTotals } from './whatsapp'
import type { ContactDraft } from './whatsapp'

/**
 * The `intake` edge function. Unset - a local checkout, a fork, a preview with
 * no backend - and nothing is recorded, silently and by design.
 */
const ENDPOINT = import.meta.env.VITE_INTAKE_ENDPOINT as string | undefined

/**
 * Says so in development, and only in development.
 *
 * A guest must never be told that the desk's carbon copy failed - it is not
 * their problem and there is nothing they could do. Whoever is building the
 * site, on the other hand, needs to know immediately, because the failure mode
 * is otherwise a form that looks like it worked and a panel that stays empty.
 */
function complain(what: string) {
  if (import.meta.env.DEV) console.warn(`[intake] not recorded: ${what}`)
}

/** CORS-safelisted, so the beacon is a simple request and needs no preflight.
    The endpoint parses the body regardless of what this claims it is. */
const BEACON_TYPE = 'text/plain;charset=UTF-8'

function send(payload: Record<string, unknown>) {
  if (!ENDPOINT) return complain('VITE_INTAKE_ENDPOINT is not set')

  let body: string
  try {
    body = JSON.stringify(payload)
  } catch {
    return complain('the payload could not be serialised')
  }

  try {
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      // Outlives the page, the way a beacon does.
      keepalive: true,
      mode: 'cors',
    })
      .then((response) => {
        // 202 is the endpoint saying it already has this one.
        if (!response.ok && response.status !== 202) {
          complain(`the endpoint answered ${response.status}`)
        }
      })
      .catch(() => {
        // Blocked, offline, or the tab went away mid-flight. The beacon is
        // queued by the browser itself and has a second chance at it; a repeat
        // is dropped by the endpoint, so trying twice costs nothing.
        beacon(body)
      })
  } catch {
    beacon(body)
  }
}

function beacon(body: string) {
  try {
    if (typeof navigator === 'undefined' || !navigator.sendBeacon) {
      return complain('there is no way left to send it')
    }
    if (!navigator.sendBeacon(ENDPOINT!, new Blob([body], { type: BEACON_TYPE }))) {
      complain('the browser refused to queue the beacon')
    }
  } catch {
    // An extension in the way, a blocked beacon. The booking is not ours to
    // hold up over any of it.
    complain('the beacon threw')
  }
}

export function recordBooking(room: Room, draft: BookingDraft) {
  const { nights, subtotal, discount, total } = bookingTotals(draft)

  send({
    kind: 'booking',
    roomSlug: room.slug,
    roomName: room.name,
    guestName: draft.guestName,
    guestPhone: draft.guestPhone,
    guestEmail: draft.guestEmail,
    checkIn: draft.checkIn,
    checkOut: draft.checkOut,
    nights,
    guests: draft.guests,
    couponCode: draft.coupon?.code,
    couponPercent: draft.coupon?.percent,
    subtotal,
    discount,
    total,
    note: draft.note,
  })
}

/**
 * A WhatsApp button, pressed.
 *
 * Not a booking and not a filled-in enquiry - just somebody leaving for the
 * chat. `topic` is the message the chat opens with, which is the best available
 * description of what they want, and `source` is the page they left from.
 *
 * This is fired by one delegated listener rather than by each button (see
 * `useChatIntake`), so a WhatsApp link added later is covered without anybody
 * remembering to wire it up.
 */
export function recordChat(topic: string, source: string) {
  send({ kind: 'chat', topic, source })
}

export function recordEnquiry(draft: ContactDraft) {
  send({
    kind: 'enquiry',
    name: draft.name,
    phone: draft.phone,
    topic: draft.topic,
    checkIn: draft.checkIn,
    checkOut: draft.checkOut,
    guests: draft.guests,
    message: draft.message,
  })
}
