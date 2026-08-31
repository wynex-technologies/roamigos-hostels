/**
 * The icon names a data row is allowed to carry.
 *
 * Data files reference icons by name so they stay free of JSX, and the panel
 * now writes some of those rows itself - a value prop, a perk, a reason on the
 * "why us" ledger. So the list has to be somewhere both apps can see it: the
 * site's `Icon` component maps every one of these to a Lucide component and is
 * typed against this list, and the panel offers exactly these in a menu rather
 * than a free text box that silently draws nothing.
 *
 * Add a name here and the site will fail to compile until `Icon.tsx` maps it,
 * which is the right way round.
 *
 * This is not the amenity list - that is `amenity-icons.ts`, a much larger set
 * resolved from the words a room's amenities are written in.
 *
 * Nothing here imports anything. Keep it that way.
 */

export const ICON_NAMES = [
  'award',
  'bike',
  'calendar-check',
  'clipboard',
  'clock',
  'compass',
  'credit-card',
  'flame',
  'headphones',
  'lock',
  'luggage',
  'map-pin',
  'mic',
  'mountain',
  'shield',
  'shower',
  'sparkles',
  'star',
  'users',
  'utensils',
  'wallet',
  'washing',
  'wifi',
  'zap',
] as const

export type IconName = (typeof ICON_NAMES)[number]
