import { iconFor } from '@shared/amenity-icons'
import {
  amenityLabel,
  amenityLabels,
  categoryLabel,
  categoryLabels,
  rooms,
  type AmenityKey,
  type Room,
  type RoomCategory,
} from '@/data/rooms'

/**
 * The filter lists are built from the rooms themselves, not from a hardcoded
 * set of keys.
 *
 * This is what makes an amenity added in the panel appear in the sidebar with
 * no code change: the moment a room carries it, it is an option. The curated
 * keys are seeded first so their order stays deliberate, and anything new is
 * appended in the order the rooms mention it.
 *
 * A key that no room carries is dropped - the sidebar has never advertised a
 * filter that returns nothing, and it should not start now that the set is
 * open.
 */
function keysInUse(curated: string[], pick: (room: Room) => string[]) {
  const used = new Set(rooms.flatMap(pick))
  const seen = new Set<string>()
  const out: string[] = []

  for (const key of [...curated, ...used]) {
    if (!used.has(key) || seen.has(key)) continue
    seen.add(key)
    out.push(key)
  }
  return out
}

export type SortKey = 'popularity' | 'price-asc' | 'price-desc' | 'rating'

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'popularity', label: 'Popularity' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Guest Rating' },
]

export const capacityBuckets = [
  { key: '1', label: '1 Guest', test: (room: Room) => room.capacity >= 1 },
  { key: '2', label: '2 Guests', test: (room: Room) => room.capacity >= 2 },
  { key: '4', label: '4+ Guests', test: (room: Room) => room.capacity >= 4 },
  { key: '6', label: '6+ Guests', test: (room: Room) => room.capacity >= 6 },
]

export const priceCeiling = 3000

export interface FilterState {
  category: RoomCategory | 'all'
  maxPrice: number
  amenities: AmenityKey[]
  capacities: string[]
  sort: SortKey
}

export const emptyFilters: FilterState = {
  category: 'all',
  maxPrice: priceCeiling,
  amenities: [],
  capacities: [],
  sort: 'popularity',
}

export const categoryOptions: { key: RoomCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Rooms' },
  ...keysInUse(Object.keys(categoryLabels), (room) => room.categories).map((key) => ({
    key,
    label: categoryLabel(key),
  })),
]

/** Each option carries the icon its own name resolved to, so the sidebar and
    the room page never disagree about what a thing looks like. */
export const amenityOptions = keysInUse(Object.keys(amenityLabels), (room) => room.amenities).map(
  (key) => ({
    key,
    label: amenityLabel(key),
    icon: iconFor(key),
  }),
)

/** Live counts, so the sidebar never advertises a filter that returns nothing. */
export const counts = {
  category: Object.fromEntries(
    categoryOptions.map(({ key }) => [
      key,
      key === 'all' ? rooms.length : rooms.filter((r) => r.categories.includes(key)).length,
    ]),
  ) as Record<RoomCategory | 'all', number>,
  amenity: Object.fromEntries(
    amenityOptions.map(({ key }) => [key, rooms.filter((r) => r.amenities.includes(key)).length]),
  ) as Record<AmenityKey, number>,
  capacity: Object.fromEntries(
    capacityBuckets.map((bucket) => [bucket.key, rooms.filter(bucket.test).length]),
  ) as Record<string, number>,
}

export function applyFilters(state: FilterState, guests?: number) {
  const filtered = rooms.filter((room) => {
    if (state.category !== 'all' && !room.categories.includes(state.category)) return false
    if (room.pricePerNight > state.maxPrice) return false
    if (state.amenities.some((key) => !room.amenities.includes(key))) return false
    if (
      state.capacities.length > 0 &&
      !state.capacities.some((key) => capacityBuckets.find((b) => b.key === key)?.test(room))
    )
      return false
    // A party of N can't book a room that sleeps fewer.
    if (guests && room.capacity < guests) return false
    return true
  })

  const sorted = [...filtered]
  switch (state.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.pricePerNight - b.pricePerNight)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.pricePerNight - a.pricePerNight)
      break
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      break
    default:
      sorted.sort((a, b) => b.reviewCount - a.reviewCount)
  }
  return sorted
}

export function activeFilterCount(state: FilterState) {
  return (
    (state.category !== 'all' ? 1 : 0) +
    (state.maxPrice < priceCeiling ? 1 : 0) +
    state.amenities.length +
    state.capacities.length
  )
}
