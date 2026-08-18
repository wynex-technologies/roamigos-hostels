/**
 * Single source of truth for brand, contact and navigation copy.
 * Change content here — components read from it, they never hardcode strings.
 */

export const site = {
  name: 'Roamigos',
  legalName: 'Roamigos Hostel',
  tagline: 'Travellers Hostel',
  motto: 'Stay • Explore • Connect',
  description:
    "Roamigos is more than a hostel, it's a community of travellers. Explore more. Pay less. Make memories that last forever.",

  /**
   * Hostel owner's WhatsApp number in international format, digits only.
   * TODO: replace with the real business number before launch — every
   * "Book Now" on the site opens a chat with this number.
   */
  whatsappNumber: '919876543210',
  phoneDisplay: '+91 98765 43210',
  email: 'stay@roamigos.in',

  /**
   * Street address of the flagship property, used by the contact page and the
   * embedded map. TODO: replace with the real registered address before launch —
   * `mapQuery` is what gets handed to Google Maps, so it has to be searchable.
   */
  address: {
    line1: 'Roamigos Hostel, GS Road',
    line2: 'Christian Basti, Guwahati',
    line3: 'Assam 781005, India',
    mapQuery: 'Christian Basti, GS Road, Guwahati, Assam 781005',
  },

  checkIn: '1:00 PM',
  checkOut: '11:00 AM',

  stats: {
    guests: '25K+',
    rating: 4.8,
    reviews: 1487,
  },

  socials: [
    { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
    { label: 'YouTube', href: 'https://youtube.com/', icon: 'youtube' },
  ],
} as const

export const nav = [
  { label: 'Home', to: '/' },
  { label: 'Rooms & Beds', to: '/rooms' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export const properties = [
  { name: 'Roamigos, Goa', area: 'Calangute, North Goa' },
  { name: 'Roamigos, Jaipur', area: 'MI Road, Jaipur' },
  { name: 'Roamigos, Manali', area: 'Old Manali' },
  { name: 'Roamigos, Rishikesh', area: 'Laxman Jhula' },
]

export const footerLinks = {
  explore: [
    { label: 'Home', to: '/' },
    { label: 'Rooms & Beds', to: '/rooms' },
    { label: 'Gallery', to: '/gallery' },
    { label: 'Blog', to: '/blog' },
    { label: 'Amenities', to: '/#amenities' },
    { label: 'Experiences', to: '/#experiences' },
    { label: 'Contact Us', to: '/contact' },
  ],
  support: [
    { label: 'Help Center', to: '/contact' },
    { label: 'FAQs', to: '/contact#faq' },
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
