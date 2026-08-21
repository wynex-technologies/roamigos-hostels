/**
 * The panel that opens the About page. Everything numeric here is derived from
 * `site` rather than typed out again, so the page cannot drift away from the
 * footer and the homepage.
 */

import { properties, site } from '@/data/site'

export const aboutIntro = {
  eyebrow: 'About the house',

  /** The plate beside the copy - a common room, not a bed; this is the house. */
  image: 'photo-1648960456182-00643d5d20eb',

  /** The opening clause is set in maroon; the rest carries in heading colour. */
  leadAccent: 'Roamigos is a hostel in Pan Bazar,',
  leadRest: ' ten minutes off the Brahmaputra, run on one idea: the room is the easy part.',

  body: [
    'Clean beds, hot water, a locker that actually locks and somebody awake at the desk at three in the morning - that is the floor, not the offer. What people come back for is the common room at ten, the trek somebody talked them into, and the fact that a solo check-in rarely stays solo past dinner.',
    'There is no booking engine here and no deposit. You message the desk, a person answers, and you pay when you walk in. That is how the price stays honest and the plans stay changeable, which on this kind of trip is most of what you need.',
  ],

  signoff: { by: 'The front desk', place: site.address.line2 },
}

/**
 * The colophon strip that closes the panel. Four segments, hairline-divided -
 * the same object the homepage value row is built from, so the About page reads
 * as part of the same house.
 */
export const aboutFacts = [
  // The flagship is held in `site.address`; `properties` lists the others.
  { label: 'Houses', value: String(properties.length + 1), icon: 'map-pin' },
  { label: 'Guests hosted', value: site.stats.guests, icon: 'users' },
  { label: 'Guest rating', value: `${site.stats.rating.toFixed(1)} / 5`, icon: 'star' },
  { label: 'Front desk', value: '24 hours', icon: 'clock' },
]
