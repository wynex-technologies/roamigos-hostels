/** Marketing content for the homepage and the rooms listing. */

/**
 * The three photographs the hero crossfades between. Order matters — the first
 * one is the eager-loaded LCP image, so it is the one that must look best cold.
 */
export const heroSlides = [
  {
    key: 'explore',
    card: 'Explore Assam',
    place: 'Brahmaputra',
    note: 'Wake up minutes from the river, the ghats and the road out of Guwahati.',
    image: 'photo-1759738101670-7d50ae3f1bd2',
    /** Focal point for the full-bleed background crop — keeps the boatman and the
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
    note: 'Your own lamp, locker and curtain — the cheapest bed you will love.',
    image: 'photo-1721299417031-de890ff33b26',
    focus: 'object-[50%_center]',
  },
] as const

/**
 * The homepage deck — a deliberate mix of what Guwahati gives you and what the
 * house itself does, so the row reads as one trip rather than a list of sights.
 */
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

export const travelReads = [
  {
    title: 'A Travel Guide to Khajjiar: Mini Switzerland of India',
    author: 'Aayushi Goyal',
    readTime: '12 mins read',
    image: 'photo-1651317741360-42af8c912556',
  },
  {
    title: 'Dharamshala Tourist Places: Exploring McLeodganj & Dharamkot',
    author: 'Aayushi Goyal',
    readTime: '16 mins read',
    image: 'photo-1686851205339-96576bb72d6f',
  },
  {
    title: 'Things to Do in Varanasi: Ghats, Food & Complete Travel Guide',
    author: 'Aayushi Goyal',
    readTime: '15 mins read',
    image: 'photo-1751438308897-6e1780630408',
  },
  {
    title: 'The Ultimate Guide to Spiti: The Winter Wonderland',
    author: 'Aayushi Goyal',
    readTime: '12 mins read',
    image: 'photo-1651319484670-aaed6d6726cb',
  },
]

export const bookingAssurances = [
  { title: 'Best Price Guarantee', note: 'Get the best rates, always.', icon: 'star' },
  { title: 'Trusted by 25K+ Travellers', note: 'Rated 4.8/5 by happy guests.', icon: 'users' },
  { title: 'Secure & Easy Booking', note: 'Your safety and convenience are our priority.', icon: 'shield' },
]
