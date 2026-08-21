/**
 * Single source of truth for brand, contact and navigation copy.
 * Change content here - components read from it, they never hardcode strings.
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

  socials: [
    { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
    { label: 'YouTube', href: 'https://youtube.com/', icon: 'youtube' },
  ],
} as const

export const nav = [
  { label: 'Home', to: '/' },
  { label: 'Rooms & Beds', to: '/rooms' },
  { label: 'About', to: '/about' },
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
