/**
 * The colophon strip that closes the About panel.
 *
 * Everything numeric here is derived from `rooms` and `site` rather than typed
 * out again, so the page cannot drift away from the footer and the homepage -
 * which is why this is the one part of the About page the panel does not offer
 * as editable copy. The prose beside it lives in `shared/page-content.ts` and
 * is edited under Page settings.
 *
 * Four segments, hairline-divided - the same object the homepage value row is
 * built from, so the About page reads as part of the same house.
 */

import { rooms } from '@/data/rooms'
import { site } from '@/data/site'

export const aboutFacts = [
  // One house - so the segment counts what is actually in it.
  { label: 'Rooms & dorms', value: String(rooms.length), icon: 'map-pin' },
  { label: 'Guests hosted', value: site.stats.guests, icon: 'users' },
  { label: 'Guest rating', value: `${site.stats.rating.toFixed(1)} / 5`, icon: 'star' },
  { label: 'Front desk', value: '24 hours', icon: 'clock' },
]
