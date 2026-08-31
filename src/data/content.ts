/**
 * Marketing content for the rooms listing and the booking widget.
 *
 * What the home page prints is not here any more - it is editable copy now, so
 * it lives in the Home page document (`shared/page-content.ts`, rendered
 * through `@/data/pages`). What remains is the two rows the rooms page and the
 * booking widget set, which are not page copy in that sense.
 */

import { HOME_DEFAULTS } from '@shared/page-content'

export type { Banner, ShowcaseEntry as ShowcaseCard } from '@shared/page-content'

/**
 * The three photographs the rooms page crossfades behind its hero.
 *
 * The same set the home hero opens on, read off the Home document's shipped
 * defaults rather than copied - one list, so a slide swapped in one place is
 * not left stale in the other.
 */
export const heroSlides = HOME_DEFAULTS.hero.slides

export const roomsPageAssurances = [
  { title: 'Best Prices', note: 'Guaranteed', icon: 'award' },
  { title: 'Free Cancellation', note: 'Up to 24hrs', icon: 'calendar-check' },
  { title: 'Instant Booking', note: 'Confirmed on WhatsApp', icon: 'zap' },
  { title: 'Pay at Check-in', note: 'No prepayment', icon: 'credit-card' },
]

export const roomsPageAmenities = [
  { title: 'Clean & Hygienic', note: 'Regularly sanitized rooms & common areas', icon: 'sparkles' },
  { title: 'Secure Lockers', note: 'Lockers in every room & dorm', icon: 'lock' },
  { title: 'High-Speed WiFi', note: 'Stay connected always', icon: 'wifi' },
  { title: '24x7 Support', note: "We're here for you anytime", icon: 'headphones' },
  { title: 'Laundry Service', note: 'Clean clothes, happy travels', icon: 'washing' },
  { title: 'Daily Housekeeping', note: 'Because comfort matters', icon: 'clipboard' },
]

export const bookingAssurances = [
  { title: 'Best Price Guarantee', note: 'Get the best rates, always.', icon: 'star' },
  { title: 'Trusted by 25K+ Travellers', note: 'Rated 4.8/5 by happy guests.', icon: 'users' },
  { title: 'Secure & Easy Booking', note: 'Your safety and convenience are our priority.', icon: 'shield' },
]
