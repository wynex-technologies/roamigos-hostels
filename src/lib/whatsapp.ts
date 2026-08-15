import { site } from '@/data/site'
import type { Room } from '@/data/rooms'
import { formatDate, formatINR, nightsBetween } from './utils'

export interface BookingDraft {
  room?: Room
  checkIn: string
  checkOut: string
  guests: number
  /** Filled in once the site has real accounts; today it stays undefined. */
  guestName?: string
  guestPhone?: string
  note?: string
}

export interface BookingTotals {
  nights: number
  subtotal: number
  total: number
}

export function bookingTotals(draft: BookingDraft): BookingTotals {
  const nights = nightsBetween(draft.checkIn, draft.checkOut)
  const rate = draft.room?.pricePerNight ?? 0
  // Dorms are priced per bed, private rooms per room — guests only multiply dorms.
  const units = draft.room?.categories.includes('dorm') ? draft.guests : 1
  const subtotal = rate * Math.max(nights, 0) * units
  return { nights, subtotal, total: subtotal }
}

/**
 * Builds the message the hostel owner receives. Everything the front desk needs
 * to confirm a booking has to be in here — there is no payment step and no
 * booking record on the site yet, this message *is* the booking request.
 */
export function bookingMessage(draft: BookingDraft) {
  const { nights, total } = bookingTotals(draft)
  const lines: string[] = ['*New Booking Request — Roamigos Hostel*', '']

  const isDorm = draft.room?.categories.includes('dorm')

  if (draft.room) {
    lines.push(`*Room:* ${draft.room.name}`)
    lines.push(`*Rate:* ${formatINR(draft.room.pricePerNight)} / ${isDorm ? 'bed / night' : 'night'}`)
  }

  lines.push(`*Check-in:* ${formatDate(draft.checkIn) || 'To be confirmed'}`)
  lines.push(`*Check-out:* ${formatDate(draft.checkOut) || 'To be confirmed'}`)
  if (nights > 0) lines.push(`*Nights:* ${nights}`)
  lines.push(`*${isDorm ? 'Beds' : 'Guests'}:* ${draft.guests}`)
  if (total > 0) lines.push(`*Estimated total:* ${formatINR(total)}`)

  if (draft.guestName || draft.guestPhone) {
    lines.push('')
    if (draft.guestName) lines.push(`*Name:* ${draft.guestName}`)
    if (draft.guestPhone) lines.push(`*Phone:* ${draft.guestPhone}`)
  }

  if (draft.note) {
    lines.push('')
    lines.push(`*Note:* ${draft.note}`)
  }

  lines.push('', 'Please confirm availability. Thank you!')
  return lines.join('\n')
}

export function buildWhatsAppUrl(draft: BookingDraft) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(bookingMessage(draft))}`
}

/** Plain "I have a question" link for the header, footer and help cards. */
export function enquiryUrl(text = `Hi Roamigos! I'd like to know more about staying with you.`) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`
}
