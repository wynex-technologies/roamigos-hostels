/**
 * Single source of truth for brand, contact and navigation copy.
 * Change content here - components read from it, they never hardcode strings.
 *
 * The desk-editable half of this - the number, the address, the advertised
 * figures, the social accounts - is also a row in Supabase, and the admin panel
 * writes it there. `scripts/sync-content.mjs` pulls that row down at build time
 * and it is merged over the defaults below, so what is written here is what
 * ships whenever the panel has not been used, the database is empty, or a build
 * runs without credentials. It is the fallback, not dead code.
 *
 * Brand identity - name, tagline, domain, share image - stays in code. It is
 * not something a front desk changes on a Tuesday, and `site.url` in particular
 * is copied into static files at build.
 */
import { content } from './generated'

/** The half the admin panel owns. Mirrored by `site_settings` in Supabase. */
export interface SiteSettings {
  whatsappNumber: string
  phoneDisplay: string
  email: string
  address: {
    line1: string
    line2: string
    line3: string
    coords: string
    mapUrl: string
  }
  checkIn: string
  checkOut: string
  stats: {
    guests: string
    rating: number
    reviews: number
  }
  socials: { label: string; href: string; icon: string; handle: string }[]
}

const defaults: {
  name: string
  legalName: string
  tagline: string
  motto: string
  url: string
  ogImage: string
  description: string
} & SiteSettings = {
  name: 'Roamigos',
  legalName: 'Roamigos Hostel',
  tagline: 'Travellers Hostel',
  motto: 'Stay • Explore • Connect',

  /**
   * The canonical origin, no trailing slash. Every share card, canonical link
   * and schema `@id` is built off this, so a wrong value here silently points
   * the whole site at another domain.
   * TODO: confirm the live domain before launch - `index.html`, `robots.txt`
   * and `sitemap.xml` are static files and carry their own copy of it.
   */
  url: 'https://roamigos.in',

  /**
   * The picture that shows up when the site is pasted into WhatsApp, Instagram
   * or a search result. An Unsplash id, resolved to a 1200x630 crop by
   * `@/lib/seo` - the one aspect ratio every social crawler reads.
   */
  ogImage: 'photo-1759738101670-7d50ae3f1bd2',
  description:
    "Roamigos is more than a hostel, it's a community of travellers. Explore more. Pay less. Make memories that last forever.",

  /**
   * Hostel owner's WhatsApp number in international format, digits only.
   * TODO: replace with the real business number before launch - every
   * "Book Now" on the site opens a chat with this number.
   */
  whatsappNumber: '919876543210',
  phoneDisplay: '+91 98765 43210',
  email: 'stay@roamigos.in',

  /**
   * The flagship property, as Google Maps has it listed. `mapUrl` is the share
   * link off the listing - use it for anything a visitor taps. `coords` is the
   * pin itself, which is what the embed and the directions link take, so they
   * land on the door rather than on a search result.
   */
  address: {
    line1: 'Roamigos Guwahati',
    line2: 'Pan Bazar, Guwahati',
    line3: 'Assam, India',
    coords: '26.1788782,91.7455179',
    mapUrl: 'https://maps.app.goo.gl/sDFw2wXe223EitR16',
  },

  checkIn: '1:00 PM',
  checkOut: '11:00 AM',

  stats: {
    guests: '25K+',
    rating: 4.8,
    reviews: 1487,
  },

  // `handle` is what the header's social menu prints under each name - the
  // account as a guest would type it, not a second description.
  socials: [
    {
      label: 'Instagram',
      href: 'https://instagram.com/',
      icon: 'instagram',
      handle: '@roamigoshostel',
    },
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'facebook', handle: '/roamigos' },
    {
      label: 'YouTube',
      href: 'https://youtube.com/',
      icon: 'youtube',
      handle: 'Roamigos Travellers',
    },
  ],
}

/**
 * What the site actually reads. One spread, resolved at build: no component
 * knows whether the number it prints came from Supabase or from the object
 * above, and none of them pays a request to find out.
 */
export const site = { ...defaults, ...(content.settings ?? {}) }

export const nav = [
  { label: 'Home', to: '/' },
  { label: 'Rooms & Beds', to: '/rooms' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export const footerLinks = {
  explore: [
    { label: 'Home', to: '/' },
    { label: 'Rooms & Beds', to: '/rooms' },
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact Us', to: '/contact' },
  ],
  support: [
    { label: 'Cancellation Policy', to: '/contact#faq' },
    { label: 'Terms & Conditions', to: '/#terms' },
    { label: 'Privacy Policy', to: '/#privacy' },
  ],
}

export const trustBar = [
  { title: 'Safe & Secure', note: '24x7 security & CCTV' },
  { title: 'Best Price Guarantee', note: 'Get the best deals online' },
  { title: 'Easy Booking', note: 'Book in just 2 minutes' },
  { title: '24/7 Support', note: 'We are always here to help' },
]
