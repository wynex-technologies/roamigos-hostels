import { site } from '@/data/site'
import type { Room } from '@/data/rooms'
import { formatDate, formatINR, nightsBetween } from './utils'

/**
 * A coupon the guest has applied. The percent is carried alongside the code so
 * the total never has to re-look-up the campaign - it is resolved once, against
 * the live offer, at the moment the guest applies it.
 */
export interface AppliedCoupon {
  code: string
  percent: number
}

export interface BookingDraft {
  room?: Room
  checkIn: string
  checkOut: string
  guests: number
  /** Collected by the confirm dialog before the chat opens - all three required. */
  guestName?: string
  guestPhone?: string
  guestEmail?: string
  note?: string
  coupon?: AppliedCoupon | null
}

export interface BookingTotals {
  nights: number
  subtotal: number
  /** Rupees taken off by the coupon - 0 when none is applied. */
  discount: number
  total: number
}

export function bookingTotals(draft: BookingDraft): BookingTotals {
  const nights = nightsBetween(draft.checkIn, draft.checkOut)
  const rate = draft.room?.pricePerNight ?? 0
  // Dorms are priced per bed, private rooms per room - guests only multiply dorms.
  const units = draft.room?.categories.includes('dorm') ? draft.guests : 1
  const subtotal = rate * Math.max(nights, 0) * units
  const percent = Math.min(Math.max(draft.coupon?.percent ?? 0, 0), 100)
  const discount = Math.round((subtotal * percent) / 100)
  return { nights, subtotal, discount, total: subtotal - discount }
}

/**
 * Builds the message the hostel owner receives. Everything the front desk needs
 * to confirm a booking has to be in here - there is no payment step and no
 * booking record on the site yet, this message *is* the booking request.
 */
export function bookingMessage(draft: BookingDraft) {
  const { nights, subtotal, discount, total } = bookingTotals(draft)
  const lines: string[] = ['*New Booking Request - Roamigos Hostel*', '']

  const isDorm = draft.room?.categories.includes('dorm')

  if (draft.room) {
    lines.push(`*Room:* ${draft.room.name}`)
    lines.push(`*Rate:* ${formatINR(draft.room.pricePerNight)} / ${isDorm ? 'bed / night' : 'night'}`)
  }

  lines.push(`*Check-in:* ${formatDate(draft.checkIn) || 'To be confirmed'}`)
  lines.push(`*Check-out:* ${formatDate(draft.checkOut) || 'To be confirmed'}`)
  if (nights > 0) lines.push(`*Nights:* ${nights}`)
  lines.push(`*${isDorm ? 'Beds' : 'Guests'}:* ${draft.guests}`)
  if (discount > 0 && draft.coupon) {
    lines.push(`*Subtotal:* ${formatINR(subtotal)}`)
    lines.push(`*Coupon:* ${draft.coupon.code} (-${draft.coupon.percent}%) -${formatINR(discount)}`)
  }
  if (total > 0) lines.push(`*Estimated total:* ${formatINR(total)}`)

  if (draft.guestName || draft.guestPhone || draft.guestEmail) {
    lines.push('')
    if (draft.guestName) lines.push(`*Name:* ${draft.guestName}`)
    if (draft.guestPhone) lines.push(`*Phone:* ${draft.guestPhone}`)
    if (draft.guestEmail) lines.push(`*Email:* ${draft.guestEmail}`)
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

export interface ContactDraft {
  name: string
  phone: string
  topic: string
  checkIn: string
  checkOut: string
  guests: string
  message: string
}

/**
 * The contact form's output. Same principle as `bookingMessage`: there is no
 * inbox and no ticket queue, so this message *is* the enquiry - and because the
 * page previews it verbatim before sending, what is composed here is exactly
 * what the visitor has already read.
 */
export function contactMessage(draft: ContactDraft) {
  const lines: string[] = ['*New Enquiry - Roamigos Hostel*', '']

  lines.push(`*Topic:* ${draft.topic}`)
  if (draft.name) lines.push(`*Name:* ${draft.name}`)
  if (draft.phone) lines.push(`*Phone:* ${draft.phone}`)

  const nights = nightsBetween(draft.checkIn, draft.checkOut)
  if (draft.checkIn) lines.push(`*Check-in:* ${formatDate(draft.checkIn)}`)
  if (draft.checkOut) lines.push(`*Check-out:* ${formatDate(draft.checkOut)}`)
  if (nights > 0) lines.push(`*Nights:* ${nights}`)
  if (draft.guests) lines.push(`*Guests:* ${draft.guests}`)

  if (draft.message) {
    lines.push('')
    lines.push(draft.message.trim())
  }

  lines.push('', 'Sent from the Roamigos website.')
  return lines.join('\n')
}

export function buildContactUrl(draft: ContactDraft) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(contactMessage(draft))}`
}
