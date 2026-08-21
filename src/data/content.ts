/** Marketing content for the homepage and the rooms listing. */

/**
 * The three photographs the hero crossfades between. Order matters - the first
 * one is the eager-loaded LCP image, so it is the one that must look best cold.
 */
export const heroSlides = [
  {
    key: 'explore',
    card: 'Explore Assam',
    place: 'Brahmaputra',
    note: 'Wake up minutes from the river, the ghats and the road out of Guwahati.',
    image: 'photo-1759738101670-7d50ae3f1bd2',
    /** Focal point for the full-bleed background crop - keeps the boatman and the
        far hills in frame while the sky takes the top of the section. */
    focus: 'object-[50%_58%]',
  },
  {
    key: 'private',
    card: 'Private Rooms',
    place: 'King suite',
    note: 'Hotel-grade privacy and linen, at a price a backpacker can carry.',
    image: 'photo-1734456416941-416c08f0778e',
    focus: 'object-[55%_center]',
  },
  {
    key: 'dorm',
    card: 'Dorm Beds',
    place: 'Pod bunk',
    note: 'Your own lamp, locker and curtain - the cheapest bed you will love.',
    image: 'photo-1721299417031-de890ff33b26',
    focus: 'object-[50%_center]',
  },
] as const

/**
 * The homepage deck - a deliberate mix of what Guwahati gives you and what the
 * house itself does, so the row reads as one trip rather than a list of sights.
 */
/**
 * One card in the homepage showcase carousel. Promotional cards are the same
 * shape as the place cards - they just carry an `offer` ribbon and their own
 * link, so a running deal slides through the same deck as everything else.
 */
export type ShowcaseCard = {
  key: string
  title: string
  tag: string
  note: string
  image: string
  /** Present only on promotional cards - renders the mustard offer ribbon. */
  offer?: string
  /** Where the card leads. Defaults to the rooms listing. */
  href?: string
}

export const showcase = [
  {
    key: 'brahmaputra',
    title: 'Brahmaputra',
    tag: 'Riverfront',
    note: 'Ten minutes to the ghat.',
    image: 'photo-1647142465378-5bf5e757f43b',
  },
  {
    key: 'common-room',
    title: 'Common Room',
    tag: 'Inside',
    note: 'Solo check-in, table of six by dinner.',
    image: 'photo-1648960456182-00643d5d20eb',
  },
  {
    key: 'tea-trails',
    title: 'Tea Trails',
    tag: 'Day trip',
    note: 'An hour out, green to the horizon.',
    image: 'photo-1758390285674-f1d55b9d1312',
  },
  {
    key: 'rooftop',
    title: 'Rooftop Cafe',
    tag: 'Inside',
    note: 'Filter coffee and slow mornings.',
    image: 'photo-1785567742040-dc6b37435d4d',
  },
  {
    key: 'bonfire',
    title: 'Bonfire Nights',
    tag: 'After dark',
    note: 'Guitars, bad jokes, real stars.',
    image: 'photo-1568785919846-27fd1c8f8982',
  },
] as const

export const valueProps = [
  { title: 'Affordable Stays', note: 'Best prices for backpackers', icon: 'wallet' },
  { title: 'Meet & Connect', note: 'Community spaces to vibe and connect', icon: 'users' },
  { title: 'Prime Locations', note: 'Explore the city with easy access', icon: 'map-pin' },
  { title: 'Safe & Secure', note: '24x7 security for a worry-free stay', icon: 'shield' },
  { title: 'Fast Wi-Fi', note: 'Stay connected, always', icon: 'wifi' },
]

export const roomPerks = [
  { title: 'Daily Housekeeping', icon: 'clipboard' },
  { title: 'Clean & Hygienic', icon: 'sparkles' },
  { title: 'Hot Showers', icon: 'shower' },
  { title: '24x7 Reception', icon: 'clock' },
  { title: 'Laundry Service', icon: 'washing' },
  { title: 'Luggage Storage', icon: 'luggage' },
]

export const experiences = [
  {
    title: 'Bonfire Nights',
    note: 'Unwind under the stars with music, stories and new friends.',
    image: 'photo-1784813489506-c1adf9df142f',
    icon: 'flame',
  },
  {
    title: 'Trekking Trips',
    note: 'Explore breathtaking trails and scenic beauty with our guided treks.',
    image: 'photo-1523341139367-9de570b874ed',
    icon: 'mountain',
  },
  {
    title: 'Bike Rentals',
    note: 'Rent a bike and ride at your own pace. Freedom to explore more.',
    image: 'photo-1687250278902-93fce7772f82',
    icon: 'bike',
  },
  {
    title: 'Open Mic Events',
    note: "Show your talent or enjoy others' in our lively open mic nights.",
    image: 'photo-1704479037176-cc805d02ba82',
    icon: 'mic',
  },
  {
    title: 'BBQ Nights',
    note: 'Delicious BBQs, great conversations and the perfect hostel vibes.',
    image: 'photo-1777962822460-dbe141c78921',
    icon: 'utensils',
  },
  {
    title: 'Weekend Adventures',
    note: 'From camping to river rafting, adventure is always around.',
    image: 'photo-1599443380179-33737c17ca81',
    icon: 'compass',
  },
]

export const commonSpaceImages = [
  'photo-1680965075873-64356db057fb',
  'photo-1569149805609-bccd9d04b9da',
  'photo-1556151223-13362ce19eff',
]

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

/**
 * The homepage's "Why Roamigos" ledger. These are deliberately not the value
 * props under the hero - that row answers "what do I get", this one answers
 * "why here and not the hostel down the road", so nothing may repeat between
 * them. Four is the count the ledger is laid out for.
 */
export const whyChooseUs = [
  {
    title: 'The desk price, direct',
    note: 'Book on WhatsApp and you pay what the front desk charges - no platform fee, no dynamic markup, nothing added at check-in.',
    proof: 'Up to 18% under listing sites',
    icon: 'wallet',
  },
  {
    title: 'A person, not a ticket queue',
    note: 'One number reaches the desk, day or night. No forms, no reference codes, no waiting on a reply from a call centre in another state.',
    proof: 'Most replies inside 10 minutes',
    icon: 'headphones',
  },
  {
    title: 'Routes we have actually walked',
    note: 'Every ferry timing, trail and tea shop we send you to has been done by somebody on this staff, this season - so the plan holds up.',
    proof: 'Rewritten every season',
    icon: 'compass',
  },
  {
    title: 'A calendar, not just a bed',
    note: 'Bonfires, open mics and weekend runs are on the board before you arrive, so a solo check-in almost never stays solo past dinner.',
    proof: 'Something on most nights',
    icon: 'flame',
  },
]

/**
 * The score breakdown beside the ledger. Values are the per-category averages
 * behind `site.stats.rating` - keep them consistent with it when they move.
 */
export const ratingBreakdown = [
  { label: 'Cleanliness', value: 4.9 },
  { label: 'Location', value: 4.8 },
  { label: 'Staff', value: 5.0 },
  { label: 'Value', value: 4.7 },
]

export const bookingAssurances = [
  { title: 'Best Price Guarantee', note: 'Get the best rates, always.', icon: 'star' },
  { title: 'Trusted by 25K+ Travellers', note: 'Rated 4.8/5 by happy guests.', icon: 'users' },
  { title: 'Secure & Easy Booking', note: 'Your safety and convenience are our priority.', icon: 'shield' },
]

/**
 * Running offers and promotions. These ride the same homepage carousel as the
 * `showcase` places - add, edit or empty this list and the deck adjusts itself;
 * nothing in the component needs touching.
 */
export const promos: ShowcaseCard[] = [
  {
    key: 'promo-long-stay',
    title: 'Stay 7, Pay 5',
    tag: 'Long stay',
    note: 'Two nights free on every weekly booking.',
    image: 'photo-1648960456182-00643d5d20eb',
    offer: '28% off',
    href: '/rooms',
  },
  {
    key: 'promo-monsoon',
    title: 'Monsoon Rates',
    tag: 'Seasonal',
    note: 'Green hills, empty trails, lower beds rates.',
    image: 'photo-1758390285674-f1d55b9d1312',
    offer: 'From ₹499',
    href: '/rooms',
  },
  {
    key: 'promo-group',
    title: 'Book the Dorm',
    tag: 'Groups',
    note: 'Six beds or more, one price, whole room yours.',
    image: 'photo-1568785919846-27fd1c8f8982',
    offer: 'Group deal',
    href: '/contact',
  },
]
