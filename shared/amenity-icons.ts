import {
  AirVent,
  Baby,
  Bath,
  BedDouble,
  Bike,
  Blinds,
  BookOpen,
  Cctv,
  Check,
  CircleParking,
  Coffee,
  CookingPot,
  Dumbbell,
  Fan,
  Flame,
  Gamepad2,
  Lamp,
  Laptop,
  Leaf,
  Lock,
  Luggage,
  MapPinned,
  Mountain,
  Music,
  PawPrint,
  Plug,
  Refrigerator,
  ShieldCheck,
  ShowerHead,
  Sofa,
  Sparkles,
  Sun,
  Trees,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wind,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

/**
 * An icon for an amenity, worked out from what it is called.
 *
 * The panel lets the desk add an amenity nobody anticipated - "Rooftop
 * hammock", "Geyser in bathroom", "Bike on rent". There is no icon picker
 * because there should not be one: choosing an icon is a design decision, and
 * asking somebody checking guests in to make it is how a room page ends up
 * with a shopping trolley next to "Hot water".
 *
 * So the name picks the icon. The rules below are matched against the amenity's
 * own words, most specific first, and anything genuinely unrecognised gets a
 * plain tick - which is honest, and reads fine in a list where everything else
 * is a tick too.
 *
 * Both apps use this: the site draws the icon, and the panel shows the same one
 * beside the field as it is typed, so nobody discovers what they got after
 * publishing. One file, two callers, deliberately - the same arrangement as
 * `content-shape.ts`.
 */
const RULES: { icon: LucideIcon; words: string[] }[] = [
  // Order matters. "hot water" must be read before "water", and "work desk"
  // before "desk" would ever mean something else.
  { icon: Wifi, words: ['wifi', 'wi-fi', 'internet', 'broadband'] },
  { icon: AirVent, words: ['ac', 'a/c', 'air con', 'aircon', 'air-conditioning', 'conditioner'] },
  { icon: Fan, words: ['fan', 'ceiling fan'] },
  { icon: Wind, words: ['ventilation', 'airy', 'cross ventilation'] },
  { icon: Flame, words: ['hot water', 'geyser', 'heater', 'heating', 'warm water'] },
  { icon: ShowerHead, words: ['shower', 'rain shower'] },
  { icon: Bath, words: ['bath', 'bathroom', 'ensuite', 'en-suite', 'washroom', 'toilet'] },
  { icon: Lock, words: ['locker', 'safe', 'lock', 'storage box'] },
  { icon: Luggage, words: ['luggage', 'baggage', 'left luggage'] },
  { icon: Laptop, words: ['desk', 'work', 'workspace', 'study', 'coworking'] },
  { icon: Plug, words: ['socket', 'plug', 'charging', 'power point', 'usb'] },
  { icon: Lamp, words: ['light', 'lamp', 'reading light', 'bedside'] },
  { icon: Blinds, words: ['curtain', 'blackout', 'blind', 'window'] },
  { icon: BedDouble, words: ['bed', 'mattress', 'bunk', 'linen', 'bedding'] },
  { icon: Tv, words: ['tv', 'television', 'netflix', 'screen', 'projector'] },
  { icon: Refrigerator, words: ['fridge', 'refrigerator', 'mini bar', 'minibar'] },
  { icon: CookingPot, words: ['kitchen', 'kitchenette', 'cooking', 'stove'] },
  { icon: UtensilsCrossed, words: ['meal', 'dining', 'restaurant', 'food', 'dinner', 'lunch'] },
  { icon: Coffee, words: ['coffee', 'tea', 'breakfast', 'cafe', 'café', 'kettle'] },
  { icon: WashingMachine, words: ['laundry', 'washing', 'wash', 'dryer'] },
  { icon: CircleParking, words: ['parking', 'garage', 'car park'] },
  { icon: Bike, words: ['bike', 'bicycle', 'cycle', 'scooter'] },
  { icon: Mountain, words: ['mountain', 'hill', 'valley', 'view'] },
  { icon: Waves, words: ['river', 'sea', 'lake', 'water view', 'beach', 'pool', 'swim'] },
  { icon: Sun, words: ['rooftop', 'terrace', 'sunrise', 'sunset', 'roof'] },
  { icon: Trees, words: ['garden', 'lawn', 'courtyard', 'green', 'outdoor'] },
  { icon: Leaf, words: ['balcony', 'veranda', 'patio', 'porch'] },
  { icon: Sofa, words: ['common', 'lounge', 'living', 'seating', 'sofa'] },
  { icon: Gamepad2, words: ['game', 'gaming', 'pool table', 'foosball', 'console'] },
  { icon: Music, words: ['music', 'jam', 'speaker', 'guitar'] },
  { icon: BookOpen, words: ['book', 'library', 'reading'] },
  { icon: Dumbbell, words: ['gym', 'fitness', 'yoga', 'workout'] },
  { icon: Cctv, words: ['cctv', 'camera', 'surveillance'] },
  { icon: ShieldCheck, words: ['security', 'safety', 'guard', 'secure', '24x7', '24/7'] },
  { icon: MapPinned, words: ['travel desk', 'tour', 'trek', 'guide', 'excursion'] },
  { icon: PawPrint, words: ['pet', 'dog', 'cat', 'animal'] },
  { icon: Baby, words: ['child', 'kid', 'family', 'baby', 'cot'] },
  { icon: Sparkles, words: ['clean', 'housekeeping', 'daily service', 'fresh'] },
]

/** The tick is the honest default: it says "yes, this room has it" and nothing
    it does not know. */
export const FALLBACK_ICON = Check

/**
 * Hyphens are how the keys are stored (`mountain-view`), spaces are how people
 * type them ("Mountain view"), and the rules above are written both ways
 * because that is how the words look in English. So everything - the name being
 * matched and the rule being matched against - is flattened the same way first,
 * or a rule written as `wi-fi` could never match a key stored as `wi-fi`.
 */
const flatten = (value: string) =>
  value.toLowerCase().replace(/[-_/]+/g, ' ').replace(/\s+/g, ' ').trim()

const FLAT = RULES.map((rule) => ({ icon: rule.icon, words: rule.words.map(flatten) }))

export function iconFor(name: string): LucideIcon {
  const text = ` ${flatten(name)} `

  for (const rule of FLAT) {
    for (const word of rule.words) {
      // Whole words only, so "ac" does not match "terrace" and "tv" does not
      // match "tvs" in some future amenity nobody has thought of yet.
      if (text.includes(` ${word} `)) return rule.icon
    }
  }

  // Nothing matched a whole word - try again allowing a word to be part of a
  // longer one, which catches "bathroom" inside "shared-bathroom-block".
  for (const rule of FLAT) {
    for (const word of rule.words) {
      if (word.length >= 4 && text.includes(word)) return rule.icon
    }
  }

  return FALLBACK_ICON
}

/* ------------------------------------------------------------------ keys --- */

/** `Rooftop Hammock` becomes `rooftop-hammock`, which is what gets stored. */
export function toKey(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** `rooftop-hammock` becomes `Rooftop Hammock`, for anything with no curated
    label of its own. Small words stay small, the way a title is set. */
const SMALL = new Set(['a', 'an', 'and', 'in', 'of', 'on', 'or', 'the', 'to', 'with'])

export function toLabel(key: string) {
  const words = key.replace(/[-_]+/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ''

  return words
    .map((word, index) => {
      // Initialisms people write lowercase in a key but read as capitals.
      if (word === 'ac' || word === 'tv' || word === 'wifi') return word.toUpperCase()
      if (index > 0 && SMALL.has(word)) return word
      return word[0].toUpperCase() + word.slice(1)
    })
    .join(' ')
}
