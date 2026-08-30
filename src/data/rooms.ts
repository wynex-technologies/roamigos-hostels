import {
  Coffee,
  Luggage,
  MapPinned,
  ShieldCheck,
  ShowerHead,
  Sofa,
  WashingMachine,
  Wifi,
} from 'lucide-react'

import { content } from './generated'

export type RoomCategory = 'dorm' | 'private' | 'deluxe' | 'long-stay'

export type AmenityKey = 'ac' | 'ensuite' | 'locker' | 'balcony' | 'desk' | 'mountain-view'

export interface Review {
  name: string
  date: string
  rating: number
  text: string
}

export interface Room {
  id: number
  slug: string
  name: string
  categories: RoomCategory[]
  badge?: string
  /** Sleeping capacity - beds for dorms, guests for private rooms. */
  capacity: number
  capacityLabel: string
  bathroom: string
  /** One-liner used on cards. */
  shortDescription: string
  /** Longer positioning line used on the detail page header. */
  subtitle: string
  pricePerNight: number
  rating: number
  reviewCount: number
  /** Icon chips shown under the detail-page title. */
  highlights: string[]
  about: string
  inclusions: string[]
  amenities: AmenityKey[]
  /** At least 5 - the detail gallery shows one main image plus a 2x2 thumbnail block. */
  images: string[]
  totalPhotos: number
  maxGuestsNote: string
}

export const categoryLabels: Record<RoomCategory, string> = {
  dorm: 'Dorms',
  private: 'Private Rooms',
  deluxe: 'Deluxe Rooms',
  'long-stay': 'Long Stay',
}

export const amenityLabels: Record<AmenityKey, string> = {
  ac: 'AC',
  ensuite: 'Ensuite Bathroom',
  locker: 'Locker',
  balcony: 'Balcony',
  desk: 'Work Desk',
  'mountain-view': 'Mountain View',
}

/**
 * Perks that apply to every booking, listed on each room's detail page. Each one
 * carries its own lucide icon so the card grid stays a single source of truth.
 */
export const hostelAmenities = [
  { label: 'Free Wi-Fi', icon: Wifi },
  { label: '24x7 Security', icon: ShieldCheck },
  { label: 'Hot Showers', icon: ShowerHead },
  { label: 'Common Area', icon: Sofa },
  { label: 'Travel Desk', icon: MapPinned },
  { label: 'Laundry Service', icon: WashingMachine },
  { label: 'Luggage Storage', icon: Luggage },
  { label: 'Rooftop Café', icon: Coffee },
]

const shippedRooms: Room[] = [
  {
    id: 1,
    slug: '8-bed-mixed-dorm',
    name: '8-Bed Mixed Dorm',
    categories: ['dorm'],
    badge: 'Most Popular',
    capacity: 8,
    capacityLabel: '8 Beds',
    bathroom: 'Shared Bathroom',
    shortDescription: 'Perfect for solo travellers. Meet new people & share stories.',
    subtitle: 'Curated for budget travellers, ideal for solo explorers & backpackers.',
    pricePerNight: 499,
    rating: 4.7,
    reviewCount: 312,
    highlights: ['8 Beds', 'Shared Bathroom', 'Locker', 'Reading Light', 'Power Plug', 'Air Circulation'],
    about:
      'Our 8-bed mixed dorm is perfect for solo travellers looking to meet new people and share unforgettable moments. Comfortable bunk beds with privacy curtains, personal lockers, and all essential amenities.',
    inclusions: [
      'Sturdy wooden bunk beds with privacy curtains',
      'Personal locker for your belongings',
      'Shared bathroom, clean & sanitized regularly',
      'Reading light, power socket & fan for each bed',
      'Fresh linen, blanket & pillow included',
      'Daily housekeeping & 24x7 security',
    ],
    amenities: ['locker'],
    images: [
      'photo-1709805619372-40de3f158e83',
      'photo-1718711621245-9c18514277cc',
      'photo-1555854877-bab0e564b8d5',
      'photo-1781415980730-bfcf192e38bc',
      'photo-1680965075873-64356db057fb',
      'photo-1569149805609-bccd9d04b9da',
    ],
    totalPhotos: 18,
    maxGuestsNote: '1 Guest per bed',
  },
  {
    id: 2,
    slug: '4-bed-female-dorm',
    name: '4-Bed Female Dorm',
    categories: ['dorm'],
    capacity: 4,
    capacityLabel: '4 Beds',
    bathroom: 'Ensuite Bathroom',
    shortDescription: 'Comfortable & safe space for female travellers.',
    subtitle: 'A quieter, female-only dorm with an ensuite bathroom and its own vanity area.',
    pricePerNight: 599,
    rating: 4.8,
    reviewCount: 278,
    highlights: ['4 Beds', 'Ensuite Bathroom', 'Locker', 'Vanity Area', 'Reading Light', 'Power Plug'],
    about:
      'A female-only dorm designed for solo women travellers who want the social side of a hostel without giving up privacy. Four beds only, an ensuite bathroom, and a dedicated vanity corner.',
    inclusions: [
      'Four bunk beds with full-length privacy curtains',
      'Ensuite bathroom shared by the room only',
      'Vanity area with mirror, shelf & hair-dryer point',
      'Personal locker large enough for a 60L backpack',
      'Fresh linen, blanket & pillow included',
      'Keycard access & 24x7 security on the floor',
    ],
    amenities: ['ensuite', 'locker'],
    images: [
      'photo-1781415980730-bfcf192e38bc',
      'photo-1555854877-bab0e564b8d5',
      'photo-1549881567-c622c1080d78',
      'photo-1718711621245-9c18514277cc',
      'photo-1578112010316-b44c50d27b2b',
    ],
    totalPhotos: 14,
    maxGuestsNote: '1 Guest per bed',
  },
  {
    id: 3,
    slug: 'standard-private',
    name: 'Standard Private',
    categories: ['private'],
    capacity: 2,
    capacityLabel: '2 Guests',
    bathroom: 'Private Bathroom',
    shortDescription: 'Cozy private room with all essential amenities.',
    subtitle: 'Your own door, your own bathroom - with the hostel common room still a floor away.',
    pricePerNight: 1499,
    rating: 4.8,
    reviewCount: 195,
    highlights: ['2 Guests', 'Private Bathroom', 'AC', 'Work Desk', 'Wardrobe', 'Queen Bed'],
    about:
      'A compact private room for couples and travellers who want their own space without moving to a hotel. Queen bed, air conditioning, a proper desk and a private bathroom.',
    inclusions: [
      'Queen bed with fresh linen & two pillows each',
      'Private bathroom with hot shower',
      'Air conditioning & ceiling fan',
      'Work desk, chair & reading lamp',
      'Wardrobe with hangers and a lockable drawer',
      'Daily housekeeping & 24x7 security',
    ],
    amenities: ['ac', 'ensuite', 'desk'],
    images: [
      'photo-1635321349359-333da6bb6da9',
      'photo-1731336478850-6bce7235e320',
      'photo-1552858725-693709cc17c7',
      'photo-1629140727571-9b5c6f6267b4',
      'photo-1635321349302-f91724057317',
    ],
    totalPhotos: 12,
    maxGuestsNote: 'Up to 2 Guests',
  },
  {
    id: 4,
    slug: 'deluxe-private',
    name: 'Deluxe Private',
    categories: ['private', 'deluxe'],
    badge: 'Best View',
    capacity: 2,
    capacityLabel: '2 Guests',
    bathroom: 'Private Bathroom',
    shortDescription: 'Spacious room with mountain view & balcony.',
    subtitle: 'Our best room in the house - king bed, private balcony and the mountain right there.',
    pricePerNight: 1999,
    rating: 4.9,
    reviewCount: 233,
    highlights: ['2 Guests', 'Private Bathroom', 'Balcony', 'Mountain View', 'AC', 'King Bed'],
    about:
      'The Deluxe Private is the room guests come back for. A king bed, a private balcony facing the valley, and enough space to actually unpack. Wake up to the mountains, have your coffee outside.',
    inclusions: [
      'King bed with premium mattress & linen',
      'Private balcony with two chairs and a low table',
      'Unobstructed mountain view',
      'Private bathroom with rain shower & hot water',
      'Air conditioning, work desk & wardrobe',
      'Daily housekeeping, room service & 24x7 security',
    ],
    amenities: ['ac', 'ensuite', 'balcony', 'desk', 'mountain-view'],
    images: [
      'photo-1766928210443-0be92ed5884a',
      'photo-1778205015308-1ed324aea202',
      'photo-1769123300291-81262063e667',
      'photo-1718894071053-c50d033c3449',
      'photo-1761344788378-8e51e4735352',
    ],
    totalPhotos: 16,
    maxGuestsNote: 'Up to 2 Guests',
  },
  {
    id: 5,
    slug: '6-bed-mixed-dorm',
    name: '6-Bed Mixed Dorm',
    categories: ['dorm'],
    capacity: 6,
    capacityLabel: '6 Beds',
    bathroom: 'Shared Bathroom',
    shortDescription: 'Affordable stays with great vibes.',
    subtitle: 'Two beds fewer than the big dorm, and the cheapest bed in the house.',
    pricePerNight: 449,
    rating: 4.6,
    reviewCount: 178,
    highlights: ['6 Beds', 'Shared Bathroom', 'Locker', 'Reading Light', 'Power Plug', 'Air Circulation'],
    about:
      'Our smallest-priced bed and still the same everything else - sturdy bunks, a locker each, and a common room downstairs that never really empties out.',
    inclusions: [
      'Six bunk beds with privacy curtains',
      'Personal locker for your belongings',
      'Shared bathroom, clean & sanitized regularly',
      'Reading light and power socket at every bed',
      'Fresh linen, blanket & pillow included',
      'Daily housekeeping & 24x7 security',
    ],
    amenities: ['locker'],
    images: [
      'photo-1555854877-bab0e564b8d5',
      'photo-1781415980730-bfcf192e38bc',
      'photo-1709805619372-40de3f158e83',
      'photo-1680965075898-39e6c2db33a8',
      'photo-1556151223-13362ce19eff',
    ],
    totalPhotos: 11,
    maxGuestsNote: '1 Guest per bed',
  },
  {
    id: 6,
    slug: '4-bed-deluxe-dorm',
    name: '4-Bed Deluxe Dorm',
    categories: ['dorm', 'deluxe'],
    capacity: 4,
    capacityLabel: '4 Beds',
    bathroom: 'Ensuite Bathroom',
    shortDescription: 'More privacy with curtains, lights & lockers.',
    subtitle: 'A dorm bed that feels like a pod - blackout curtain, own light, own plug, own shelf.',
    pricePerNight: 649,
    rating: 4.7,
    reviewCount: 143,
    highlights: ['4 Beds', 'Ensuite Bathroom', 'AC', 'Locker', 'Reading Light', 'Bedside Shelf'],
    about:
      'Built for light sleepers. Each bed is a pod with a blackout curtain, its own dimmable light, two plug points and a bedside shelf - plus an ensuite bathroom shared by four people, not the floor.',
    inclusions: [
      'Pod-style bunks with blackout privacy curtains',
      'Dimmable reading light & two power sockets per bed',
      'Bedside shelf and hook inside every pod',
      'Ensuite bathroom with hot shower',
      'Air conditioning & large personal locker',
      'Fresh linen, blanket & pillow included',
    ],
    amenities: ['ac', 'ensuite', 'locker'],
    images: [
      'photo-1549881567-c622c1080d78',
      'photo-1555854877-bab0e564b8d5',
      'photo-1718711621245-9c18514277cc',
      'photo-1781415980730-bfcf192e38bc',
      'photo-1680965075873-64356db057fb',
    ],
    totalPhotos: 13,
    maxGuestsNote: '1 Guest per bed',
  },
  {
    id: 7,
    slug: 'premium-private',
    name: 'Premium Private',
    categories: ['private', 'deluxe', 'long-stay'],
    capacity: 2,
    capacityLabel: '2 Guests',
    bathroom: 'Private Bathroom',
    shortDescription: 'Premium comfort with AC, work desk & more.',
    subtitle: 'Set up for people who stay a while - a real desk, fast Wi-Fi and monthly rates.',
    pricePerNight: 1799,
    rating: 4.9,
    reviewCount: 167,
    highlights: ['2 Guests', 'Private Bathroom', 'AC', 'Work Desk', 'Fast Wi-Fi', 'Long Stay'],
    about:
      'The room our long-stay guests book. A full-size desk with an ergonomic chair, the strongest Wi-Fi in the building, blackout curtains and a private bathroom. Weekly and monthly rates available on request.',
    inclusions: [
      'Queen bed with premium mattress & blackout curtains',
      'Full-size work desk with ergonomic chair',
      'Priority Wi-Fi access point in the room',
      'Private bathroom with hot shower',
      'Air conditioning, wardrobe & luggage rack',
      'Weekly & monthly rates - ask us on WhatsApp',
    ],
    amenities: ['ac', 'ensuite', 'desk'],
    images: [
      'photo-1718894071053-c50d033c3449',
      'photo-1635321349302-f91724057317',
      'photo-1552858725-a19e7fcd3ac4',
      'photo-1663811397242-2a321535ddf6',
      'photo-1744807588726-33205da0b26b',
    ],
    totalPhotos: 15,
    maxGuestsNote: 'Up to 2 Guests',
  },
  {
    id: 8,
    slug: 'family-room',
    name: 'Family Room',
    categories: ['private', 'long-stay'],
    capacity: 4,
    capacityLabel: '4 Guests',
    bathroom: 'Private Bathroom',
    shortDescription: 'Spacious room for families or groups.',
    subtitle: 'One big room for four - a double bed, two singles and a bathroom of your own.',
    pricePerNight: 2499,
    rating: 4.8,
    reviewCount: 121,
    highlights: ['4 Guests', 'Private Bathroom', 'AC', 'Balcony', 'Wardrobe', 'Extra Bedding'],
    about:
      'Our largest room, built for families and groups travelling together. A double bed and two single beds, a private bathroom, a balcony, and enough storage that nobody lives out of a bag.',
    inclusions: [
      'One double bed and two single beds',
      'Private bathroom with hot shower',
      'Balcony overlooking the courtyard',
      'Air conditioning & ceiling fan',
      'Two wardrobes and a luggage bench',
      'Extra mattress available on request',
    ],
    amenities: ['ac', 'ensuite', 'balcony'],
    images: [
      'photo-1572177215152-32f247303126',
      'photo-1731336478850-6bce7235e320',
      'photo-1766928210443-0be92ed5884a',
      'photo-1716407830582-4571ce70316a',
      'photo-1629140727571-9b5c6f6267b4',
    ],
    totalPhotos: 12,
    maxGuestsNote: 'Up to 4 Guests',
  },
]

/**
 * Every room the site sells.
 *
 * Supabase owns this list once the panel has rooms in it; the array above is
 * what ships when it does not - no credentials, an empty table, a build with no
 * network. The swap happens at build time, so this stays a plain synchronous
 * import either way and nothing downstream - the listing, the filters, the
 * detail page, the sitemap - has to know the difference.
 */
export const rooms: Room[] = content.rooms ?? shippedRooms

const shippedReviews: Review[] = [
  {
    name: 'Rohit Sharma',
    date: 'March 2024',
    rating: 5,
    text: 'Amazing vibe, super comfortable beds and the staff is really friendly. Met some great people!',
  },
  {
    name: 'Ananya Iyer',
    date: 'February 2024',
    rating: 5,
    text: 'Clean hostel, great location and value for money. Will definitely come back.',
  },
  {
    name: 'Lucas Fernandez',
    date: 'February 2024',
    rating: 5,
    text: 'Perfect place for backpackers. The common area is so lively!',
  },
  {
    name: 'Megha Patel',
    date: 'January 2024',
    rating: 4,
    text: 'Loved the stay! Everything was well-managed and very clean.',
  },
]

/** The guest wall. Same arrangement as `rooms` above. */
export const reviews: Review[] = content.reviews ?? shippedReviews

export function getRoomBySlug(slug: string) {
  return rooms.find((room) => room.slug === slug)
}

/** Detail pages are linked by slug, but old numeric ids still resolve. */
export function getRoom(param: string) {
  return getRoomBySlug(param) ?? rooms.find((room) => String(room.id) === param)
}
