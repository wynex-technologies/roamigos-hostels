/**
 * Sends the desk its own copy of a booking request or an enquiry.
 *
 * The WhatsApp message is still the booking. This is a carbon copy, and it is
 * built to be exactly that: it never blocks, never throws into the caller,
 * never shows the guest an error and never delays the chat opening. If the
 * endpoint is unset, slow or down, the guest is not affected in any way - they
 * still land in WhatsApp with the same message they always would have.
 *
 * That is why `sendBeacon` is the first choice. Both callers open WhatsApp in
 * the same gesture, which on a phone hands the tab straight to another app - a
 * plain `fetch` in flight at that moment is often cancelled. A beacon is queued
 * by the browser and delivered regardless of what happens to the page.
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

function send(payload: Record<string, unknown>) {
  if (!ENDPOINT) return

  try {
    const body = JSON.stringify(payload)

    // Queued by the browser, so it survives the tab handing off to WhatsApp.
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      if (navigator.sendBeacon(ENDPOINT, blob)) return
    }

    // `keepalive` asks for the same survival guarantee from fetch. The rejection
    // is swallowed: there is no version of this failing that the guest should
    // ever be told about.
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      mode: 'cors',
    }).catch(() => {})
  } catch {
    // A blocked beacon, a serialisation problem, an extension in the way. The
    // booking is not ours to hold up over any of it.
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
