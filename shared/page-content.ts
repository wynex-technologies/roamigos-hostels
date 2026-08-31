/**
 * The Home and About pages: their shape, their shipped copy, and the merge
 * that puts an edited document on top of it.
 *
 * This sits beside `content-shape.ts` and for the same reason. Two apps need
 * it and they must never disagree:
 *
 *   src/data/pages.ts            the site, rendering whatever was published
 *   admin/src/pages/PageSettings the panel, editing it
 *
 * The panel fills its form from these defaults deep-merged with the row it
 * loaded, and saves the merged document back whole. If it read a different set
 * of defaults from the one the site renders, pressing Save would write copy
 * nobody had typed - so there is one copy, here, and both import it.
 *
 * ## The one rule
 *
 * **Copy and image references only. No design.** Not a class name, not a
 * colour, not a size. A heading is stored as the pieces the markup already sets
 * differently - the plain line, the italic accent word, the rest - so the desk
 * can change the words without being able to change the type. Anything a
 * component decides and that still has to travel with a row (a crop hint, a
 * card key, a tile footprint) lives in a field the panel round-trips without
 * drawing an input for it.
 *
 * Nothing here imports anything. Keep it that way - `scripts/` runs it through
 * node and both apps compile it through Vite.
 */

/* ---------------------------------------------------------------- shapes --- */

/**
 * A two-line display heading, in the pieces the markup sets differently.
 *
 * Every section heading on the home page is built the same way: a first line,
 * then a second line with one word in the italic accent face. Splitting it here
 * is what lets the panel offer plain text boxes while the component keeps
 * deciding entirely on its own what each piece looks like.
 */
export interface SplitHeading {
  /** The first line, set plain. */
  line1: string
  /** What runs before the accent word on the second line. Often empty. */
  lead: string
  /** The one word in the italic accent face. */
  accent: string
  /** What closes the second line - usually the full stop. */
  tail: string
}

/** One card in the homepage showcase carousel. */
export interface ShowcaseEntry {
  /** Stable identity for the carousel. Round-tripped, never edited. */
  key: string
  title: string
  tag: string
  note: string
  image: string
  /** Mustard ribbon. Present only on a promotional card. */
  offer?: string
  /** Where the card leads. Defaults to the rooms listing. */
  href?: string
}

/**
 * The promo band under the hero - one piece of finished artwork.
 *
 * Whatever the offer is, it is painted into the image, so nothing here needs a
 * headline, a button or a colour.
 */
export interface Banner {
  /** Switch the banner off without deleting the artwork. */
  active: boolean
  /**
   * Wide artwork, used from `sm` up. A file in `public/` (`/banners/diwali.jpg`),
   * a full URL, or an Unsplash id - all three work.
   */
  image: string
  /**
   * A separate crop for phones. A 3:1 desktop banner shrinks to unreadable at
   * 375px, so give the phone its own artwork whenever the banner carries type.
   * Falls back to `image` when unset.
   */
  imageMobile?: string
  /** What the banner says, for anyone who cannot see it. Never leave this empty. */
  alt: string
  /**
   * Where it leads. A path (`/rooms`) routes inside the site, anything else opens
   * in a new tab. Omit it and the banner is not clickable.
   */
  href?: string
  /** Proportions of `image`. Space is reserved from this, so the page never jumps. */
  ratio?: string
  /** Proportions of `imageMobile`. */
  ratioMobile?: string
}

export type AlbumKey = 'rooms' | 'common' | 'rooftop' | 'nights' | 'around'

export interface GalleryAlbum {
  key: AlbumKey | 'all'
  label: string
  note: string
}

export interface GalleryShot {
  id: string
  album: AlbumKey
  caption: string
  place: string
  /** Drives the tile height in the wall - the mix is what stops it reading as a grid. */
  span: 'tall' | 'wide' | 'square'
}

export interface HomeContent {
  hero: {
    /** The letter-spaced line over the headline. */
    eyebrow: string
    titleLine1: string
    titleLine2: string
    lead: string
    primaryCta: string
    secondaryCta: string
    /** The availability card sitting beside the headline. */
    searchBadge: string
    searchTitle: string
    searchNote: string
    searchCta: string
    slides: {
      key: string
      card: string
      place: string
      note: string
      image: string
      /** Crop focus for the full-bleed background. A component decision - the
          panel round-trips it rather than offering it. */
      focus: string
    }[]
  }
  valueProps: { title: string; note: string; icon: string }[]
  offers: {
    eyebrow: string
    heading: SplitHeading
    copy: string
    linkLabel: string
    banner: Banner
  }
  rooms: {
    eyebrow: string
    heading: SplitHeading
    copy: string
    browseLabel: string
  }
  destinations: {
    eyebrow: string
    heading: SplitHeading
    copy: string
    linkLabel: string
    cards: ShowcaseEntry[]
    promos: ShowcaseEntry[]
  }
  stay: {
    eyebrow: string
    heading: SplitHeading
    copy: string
    /** Three plates - one lead and two stacked beside it. */
    images: string[]
    perks: { title: string; icon: string }[]
    askLabel: string
    ctaLabel: string
    footNote: { before: string; link: string; after: string }
  }
  experiences: {
    eyebrow: string
    heading: SplitHeading
    copy: string
    items: { title: string; note: string; image: string; icon: string }[]
  }
  why: {
    eyebrow: string
    /** The concession, set quiet and small above the answer. */
    titleQuiet: string
    heading: Omit<SplitHeading, 'line1'>
    copy: string
    reasons: { title: string; note: string; proof: string; icon: string }[]
    verdictEyebrow: string
    breakdown: { label: string; value: number }[]
    ctaLabel: string
  }
  contact: {
    eyebrow: string
    /** Three pieces, because the markup gives each its own colour. */
    titleAccent: string
    titleRest: string
    titleSheen: string
    copy: string
    primaryCta: string
    secondaryCta: string
  }
}

export interface AboutContent {
  /**
   * The pinned corkboard. Each key is one pinned piece - the component places
   * them by hand, so this object is deliberately shaped rather than a list.
   */
  hero: {
    watermark: string
    chip: string
    script: string
    heading: [string, string]
    copy: string
    cta: string
    meta: string
    /** Bleeds off the left edge - no caption, it is the mood, not a thing. */
    traveller: { img: string; alt: string }
    /** A proper polaroid, caption written on the white lip. */
    polaroid: { img: string; alt: string; name: string; line: string; tag: string }
    /** Stitched round shot next to the running check-in count. */
    round: { img: string; alt: string }
    stat: { value: string; label: string }
    /** A clipping torn out of somebody else's magazine. */
    clipping: { img: string; alt: string; name: string; line: string; tag: string }
    /** Stamp-sized, with coordinates printed along the foot. */
    stamp: { img: string; alt: string; note: string; place: string; coord: string }
    /** Boarding pass - the route most of our guests are actually on. */
    pass: { from: string; to: string; route: string; seat: string; gate: string }
    /** Wide film still, sitting bottom-right. */
    reel: { img: string; alt: string; place: string; length: string }
  }
  intro: {
    eyebrow: string
    image: string
    imageAlt: string
    /** The opening clause, set in maroon. */
    leadAccent: string
    /** The rest of the lead, carrying in heading colour. */
    leadRest: string
    body: string[]
    signoffBy: string
    signoffPlace: string
  }
  wall: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    /** The word carrying the brush stroke. */
    underline: string
    albums: GalleryAlbum[]
    shots: GalleryShot[]
  }
  day: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    underline: string
    copy: string
    moments: { time: string; title: string; note: string; image: string }[]
  }
  guests: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    underline: string
    /** Split around the handle, which the markup sets in heading colour. */
    copyBefore: string
    handle: string
    copyAfter: string
    ctaLabel: string
    frames: { id: string; handle: string }[]
  }
  cta: {
    eyebrow: string
    titleLine1: string
    /** The closing clause, set in the mustard sheen. */
    titleSheen: string
    copy: string
    /** Prefilled into the WhatsApp draft, so the desk knows which page sent it. */
    chatPrompt: string
  }
}

export interface PageContent {
  home: HomeContent
  about: AboutContent
}

export type PageKey = keyof PageContent

/* -------------------------------------------------------------- defaults --- */

/**
 * What the site ships with.
 *
 * This is the fallback, not dead code: it is what renders with no database, no
 * credentials and no network, and it is what the panel shows the first time
 * somebody opens a page that has never been edited. Keep it real and current.
 */
export const HOME_DEFAULTS: HomeContent = {
  hero: {
    eyebrow: 'Stay • Explore • Connect',
    titleLine1: 'Travel More.',
    titleLine2: 'Pay Less.',
    lead: 'Comfortable stays, great vibes and new friends. Your journey begins here.',
    primaryCta: 'Book Your Stay',
    secondaryCta: 'Chat with us',
    searchBadge: 'Best rates guaranteed',
    searchTitle: 'Check Availability',
    searchNote: 'Pick your dates - we confirm on WhatsApp in minutes.',
    searchCta: 'Search Availability',

    // Order matters - the first one is the eager-loaded LCP image, so it is the
    // one that must look best cold.
    slides: [
      {
        key: 'explore',
        card: 'Explore Assam',
        place: 'Brahmaputra',
        note: 'Wake up minutes from the river, the ghats and the road out of Guwahati.',
        image: 'photo-1759738101670-7d50ae3f1bd2',
        // Keeps the boatman and the far hills in frame while the sky takes the
        // top of the section.
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
    ],
  },

  valueProps: [
    { title: 'Affordable Stays', note: 'Best prices for backpackers', icon: 'wallet' },
    { title: 'Meet & Connect', note: 'Community spaces to vibe and connect', icon: 'users' },
    { title: 'Prime Location', note: 'Explore the city with easy access', icon: 'map-pin' },
    { title: 'Safe & Secure', note: '24x7 security for a worry-free stay', icon: 'shield' },
    { title: 'Fast Wi-Fi', note: 'Stay connected, always', icon: 'wifi' },
  ],

  offers: {
    eyebrow: 'Offers & promotions',
    heading: { line1: 'Deals worth', lead: '', accent: 'packing', tail: ' for.' },
    copy: 'Book with us and not a listing site - what is running this month is below, and the desk applies it on WhatsApp before you pay a rupee.',
    linkLabel: 'Browse rooms & beds',
    banner: {
      active: true,
      // Placeholder artwork - replace both with the real banner files.
      image: 'photo-1648960456182-00643d5d20eb',
      imageMobile: 'photo-1648960456182-00643d5d20eb',
      alt: 'Book direct and save 10% on every dorm bed and private room',
      href: '/rooms',
      ratio: '1600 / 500',
      ratioMobile: '4 / 3',
    },
  },

  rooms: {
    eyebrow: 'Rooms & Beds',
    heading: { line1: 'A bed for tonight,', lead: 'a ', accent: 'room', tail: ' for the week.' },
    copy: 'Curtained pod bunks, private doubles, a family room that takes four. Eight ways to stay - all of them on the same warm floor.',
    browseLabel: 'Browse all rooms',
  },

  destinations: {
    eyebrow: 'Guwahati & the house',
    heading: { line1: 'Your whole trip starts', lead: 'at the ', accent: 'front door', tail: '.' },
    copy: 'The river at sunset, tea trails an hour out, and a common room that fills up by nine. Five reasons most people book a second night before the first one ends.',
    linkLabel: 'Browse rooms & beds',

    // A deliberate mix of what Guwahati gives you and what the house itself
    // does, so the row reads as one trip rather than a list of sights.
    cards: [
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
    ],

    // Running offers, riding the same deck as the places above. Empty this list
    // and the carousel simply adjusts itself.
    promos: [
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
    ],
  },

  stay: {
    eyebrow: 'What every stay includes',
    heading: { line1: 'More than', lead: 'just a ', accent: 'room', tail: '.' },
    copy: 'Hot water at six in the morning, a desk that answers at two in the night, and a common room that fills up before dinner. The small things, handled - so the trip gets your whole attention.',
    images: [
      'photo-1680965075873-64356db057fb',
      'photo-1569149805609-bccd9d04b9da',
      'photo-1556151223-13362ce19eff',
    ],
    perks: [
      { title: 'Daily Housekeeping', icon: 'clipboard' },
      { title: 'Clean & Hygienic', icon: 'sparkles' },
      { title: 'Hot Showers', icon: 'shower' },
      { title: '24x7 Reception', icon: 'clock' },
      { title: 'Laundry Service', icon: 'washing' },
      { title: 'Luggage Storage', icon: 'luggage' },
    ],
    askLabel: 'Ask us anything',
    ctaLabel: 'View all rooms',
    footNote: { before: 'Staying a while?', link: 'Long-stay rates', after: 'start at a week.' },
  },

  experiences: {
    eyebrow: 'More than a stay',
    heading: { line1: 'Nobody remembers', lead: 'the ', accent: 'bed', tail: '.' },
    copy: 'They remember the bonfire that ran past two, the trek somebody talked them into, and the six strangers at breakfast who are now the group chat.',
    items: [
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
    ],
  },

  why: {
    eyebrow: 'Why Roamigos',
    titleQuiet: 'Plenty of beds in town.',
    heading: { lead: 'Here is why ', accent: 'this', tail: ' one.' },
    copy: 'We are not the only hostel near the Brahmaputra. So here is the difference in plain terms - and the scores our guests put against it.',

    // Deliberately not the value props under the hero: that row answers "what
    // do I get", this one answers "why here and not the hostel down the road",
    // so nothing may repeat between them. Four is the count the ledger is laid
    // out for.
    reasons: [
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
    ],

    verdictEyebrow: 'The guest verdict',

    // The per-category averages behind the headline rating in Settings - keep
    // them consistent with it when they move.
    breakdown: [
      { label: 'Cleanliness', value: 4.9 },
      { label: 'Location', value: 4.8 },
      { label: 'Staff', value: 5.0 },
      { label: 'Value', value: 4.7 },
    ],

    ctaLabel: 'See rooms and rates',
  },

  contact: {
    eyebrow: 'Ready when you are',
    titleAccent: 'Pick a bed.',
    titleRest: ' Send one message.',
    titleSheen: "That's the whole booking.",
    copy: 'No prepayment, no long forms. Choose your room, hit Book Now and your dates land straight in our WhatsApp - we confirm within minutes and you pay at check-in.',
    primaryCta: 'Browse Rooms & Beds',
    secondaryCta: 'Chat on WhatsApp',
  },
}

export const ABOUT_DEFAULTS: AboutContent = {
  hero: {
    watermark: 'Roamigos',
    chip: 'The house wall',
    script: 'Postcards from the front desk',
    heading: ['Two years of check-ins,', 'pinned to one wall'],
    copy: 'Everything on this board was shot by someone who stayed here - the rooftop at six, the river at seven, and whatever the common room turned into by ten.',
    cta: 'Open the full wall',
    meta: '340 frames · added to every month',

    traveller: {
      img: 'photo-1523341139367-9de570b874ed',
      alt: 'A traveller on a ridge trail outside Guwahati',
    },
    polaroid: {
      img: 'photo-1609770836167-7a74ed99bfad',
      alt: 'Temple steps at first light',
      name: 'Kamakhya, 5:40 am',
      line: 'Left before the chai stalls opened',
      tag: 'Nilachal Hill · Guwahati',
    },
    round: {
      img: 'photo-1648960456182-00643d5d20eb',
      alt: 'The Roamigos common room, lamps on',
    },
    stat: {
      value: '25K+',
      label: 'Travellers checked in since day one',
    },
    clipping: {
      img: 'photo-1615472910606-9d4f7291944f',
      alt: 'Tea gardens an hour out of the city',
      name: 'Green to the horizon',
      line: 'An hour out, then nothing but rows',
      tag: 'Tea trails · Sonapur',
    },
    stamp: {
      img: 'photo-1675296098616-53e3d4a1dd57',
      alt: 'A one-horned rhino grazing in tall grass',
      note: 'Day trip',
      place: 'Pobitora',
      coord: '26.23°N 91.98°E',
    },
    pass: {
      from: 'GAU',
      to: 'SHL',
      route: 'Guwahati → Shillong · 2h 30m',
      seat: '11A',
      gate: 'NH-6',
    },
    reel: {
      img: 'photo-1647142465378-5bf5e757f43b',
      alt: 'Sunset over the Brahmaputra',
      place: 'Brahmaputra, 5:52 pm',
      length: '2 min 14 s',
    },
  },

  intro: {
    eyebrow: 'About the house',
    // The plate beside the copy - a common room, not a bed; this is the house.
    image: 'photo-1648960456182-00643d5d20eb',
    imageAlt: 'The Roamigos common room in Pan Bazar',
    leadAccent: 'Roamigos is a hostel in Pan Bazar,',
    leadRest:
      ' ten minutes off the Brahmaputra, run on one idea: the room is the easy part.',
    body: [
      'Clean beds, hot water, a locker that actually locks and somebody awake at the desk at three in the morning - that is the floor, not the offer. What people come back for is the common room at ten, the trek somebody talked them into, and the fact that a solo check-in rarely stays solo past dinner.',
      'There is no booking engine here and no deposit. You message the desk, a person answers, and you pay when you walk in. That is how the price stays honest and the plans stay changeable, which on this kind of trip is most of what you need.',
    ],
    signoffBy: 'The front desk',
    signoffPlace: 'Pan Bazar, Guwahati',
  },

  wall: {
    eyebrow: 'The wall',
    titleLine1: 'Pick an album,',
    titleLine2: 'then pick a',
    underline: 'frame',

    albums: [
      { key: 'all', label: 'Everything', note: 'The whole board, newest first' },
      { key: 'rooms', label: 'Rooms & Beds', note: 'Dorms, privates and the good bunks' },
      { key: 'common', label: 'Common Spaces', note: 'Where the trip actually gets planned' },
      { key: 'rooftop', label: 'Rooftop & Kitchen', note: 'Chai at six, thali at eight' },
      { key: 'nights', label: 'Nights & Events', note: 'Bonfires, open mics, bad guitar' },
      { key: 'around', label: 'Around Guwahati', note: 'Everything within a day of the door' },
    ],

    shots: [
      // -------------------------------------------------------------- rooms
      {
        id: 'photo-1709805619372-40de3f158e83',
        album: 'rooms',
        caption: 'Top bunk, window side - the one everyone asks for',
        place: 'Six-bed mixed dorm',
        span: 'tall',
      },
      {
        id: 'photo-1731336478850-6bce7235e320',
        album: 'rooms',
        caption: 'Private king, made up well before the 1 pm check-in',
        place: 'Deluxe private',
        span: 'wide',
      },
      {
        id: 'photo-1552858725-693709cc17c7',
        album: 'rooms',
        caption: 'Your own lamp, your own socket, your own curtain',
        place: 'Pod bunk',
        span: 'square',
      },
      {
        id: 'photo-1635321349302-f91724057317',
        album: 'rooms',
        caption: 'Private twin - a desk, a window, and a door that locks',
        place: 'Private room',
        span: 'square',
      },
      {
        id: 'photo-1766928210443-0be92ed5884a',
        album: 'rooms',
        caption: 'Long-stay room: desk, fast wifi and a month of quiet',
        place: 'Long stay',
        span: 'tall',
      },
      {
        id: 'photo-1680965075898-39e6c2db33a8',
        album: 'rooms',
        caption: 'Wood-lined and warm, which January makes you grateful for',
        place: 'Private double',
        span: 'wide',
      },

      // ------------------------------------------------------------- common
      {
        id: 'photo-1648960456182-00643d5d20eb',
        album: 'common',
        caption: 'Nine pm, and nobody has gone up to bed yet',
        place: 'Common room',
        span: 'wide',
      },
      {
        id: 'photo-1578112010316-b44c50d27b2b',
        album: 'common',
        caption: 'The corner sofa, permanently occupied since 2024',
        place: 'Lounge',
        span: 'tall',
      },
      {
        id: 'photo-1556151223-13362ce19eff',
        album: 'common',
        caption: 'Three floors of stairwell, painted by guests over one summer',
        place: 'The stairwell',
        span: 'square',
      },
      {
        id: 'photo-1680965075873-64356db057fb',
        album: 'common',
        caption: 'Work corner - fast wifi and a plug at every seat',
        place: 'Co-work nook',
        span: 'square',
      },

      // ------------------------------------------------------------ rooftop
      {
        id: 'photo-1785567742040-dc6b37435d4d',
        album: 'rooftop',
        caption: 'The terrace, and the reason nobody eats indoors',
        place: 'Rooftop',
        span: 'tall',
      },
      {
        id: 'photo-1569149805609-bccd9d04b9da',
        album: 'rooftop',
        caption: 'Sunset shift - the best seats go to whoever gets up first',
        place: 'Rooftop terrace',
        span: 'wide',
      },
      {
        id: 'photo-1588644525273-f37b60d78512',
        album: 'rooftop',
        caption: 'Assamese thali night - khar, masor tenga, rice, repeat',
        place: 'Kitchen',
        span: 'square',
      },
      {
        id: 'photo-1613066697301-d7dccfc86bb5',
        album: 'rooftop',
        caption: 'String lights up, laptops away',
        place: 'Rooftop, after dark',
        span: 'square',
      },
      {
        id: 'photo-1546833999-b9f581a1996d',
        album: 'rooftop',
        caption: 'Somebody always ends up cooking for everybody',
        place: 'Shared kitchen',
        span: 'wide',
      },
      {
        id: 'photo-1621275471769-e6aa344546d5',
        album: 'rooftop',
        caption: 'Nine pm on the roof, in no particular hurry',
        place: 'Rooftop cafe',
        span: 'tall',
      },

      // ------------------------------------------------------------- nights
      {
        id: 'photo-1568785919846-27fd1c8f8982',
        album: 'nights',
        caption: 'Bonfire night - guitars, bad jokes, real stars',
        place: 'Back courtyard',
        span: 'wide',
      },
      {
        id: 'photo-1629445039581-3b5fb6501e9a',
        album: 'nights',
        caption: 'Open mic Thursday - three songs each, no auditions',
        place: 'Common room',
        span: 'tall',
      },
      {
        id: 'photo-1777962822460-dbe141c78921',
        album: 'nights',
        caption: 'The fire outlasts everyone except the last two',
        place: 'Back courtyard',
        span: 'square',
      },
      {
        id: 'photo-1533088339408-74fcf62b8e6a',
        album: 'nights',
        caption: 'Late enough that the tea has gone cold',
        place: 'Courtyard',
        span: 'square',
      },
      {
        id: 'photo-1583366936387-8a955167767c',
        album: 'nights',
        caption: 'Somebody knows three chords, and that is plenty',
        place: 'Open mic',
        span: 'wide',
      },
      {
        id: 'photo-1784813489506-c1adf9df142f',
        album: 'nights',
        caption: 'Whoever is still up at midnight decides what happens next',
        place: 'After hours',
        span: 'tall',
      },

      // ------------------------------------------------------------- around
      {
        id: 'photo-1647142465378-5bf5e757f43b',
        album: 'around',
        caption: 'Ten minutes to the ghat, and the whole river turns orange',
        place: 'Brahmaputra riverfront',
        span: 'wide',
      },
      {
        id: 'photo-1675296098616-53e3d4a1dd57',
        album: 'around',
        caption: 'Pobitora - rhino country, and only an hour out of town',
        place: 'Pobitora Wildlife Sanctuary',
        span: 'tall',
      },
      {
        id: 'photo-1758390285674-f1d55b9d1312',
        album: 'around',
        caption: 'Tea trails: an hour of city, then rows to the horizon',
        place: 'Sonapur',
        span: 'square',
      },
      {
        id: 'photo-1758390287060-aed62e4144f6',
        album: 'around',
        caption: 'Second flush, picked by hand, still done exactly that way',
        place: 'Assam tea garden',
        span: 'square',
      },
      {
        id: 'photo-1625826415766-001bd75aaf52',
        album: 'around',
        caption: 'Two and a half hours south, and the air changes completely',
        place: 'Meghalaya',
        span: 'wide',
      },
      {
        id: 'photo-1552978534-9d01e1f91517',
        album: 'around',
        caption: 'Water clear enough that the boats look like they are flying',
        place: 'Dawki · Umngot river',
        span: 'tall',
      },
      {
        id: 'photo-1609770836167-7a74ed99bfad',
        album: 'around',
        caption: 'Kamakhya before the queues - go at dawn, thank us later',
        place: 'Nilachal Hill',
        span: 'square',
      },
      {
        id: 'photo-1611336814186-914161b9bdb6',
        album: 'around',
        caption: 'The whole city, from the hill that sits behind it',
        place: 'Guwahati',
        span: 'square',
      },
      {
        id: 'photo-1621789547000-b74d615ce6c5',
        album: 'around',
        caption: 'The bridge out of town, and a river that does not end',
        place: 'Saraighat',
        span: 'wide',
      },
    ],
  },

  day: {
    eyebrow: '06:40 to whenever',
    titleLine1: 'One completely',
    titleLine2: 'ordinary',
    underline: 'day',
    copy: 'Nothing here is scheduled and nothing is compulsory. This is just how the hours tend to fall once you have dropped your bag.',
    moments: [
      {
        time: '06:40',
        title: 'Rooftop, first light',
        note: 'Chai, the Nilachal ridge, and about four people awake.',
        image: 'photo-1785567742040-dc6b37435d4d',
      },
      {
        time: '09:15',
        title: 'Out the front door',
        note: 'Kamakhya, the ghats, or a scooter and no fixed plan.',
        image: 'photo-1609770836167-7a74ed99bfad',
      },
      {
        time: '17:52',
        title: 'River, every evening',
        note: 'Ten minutes on foot to the best sunset in the city.',
        image: 'photo-1647142465378-5bf5e757f43b',
      },
      {
        time: '21:30',
        title: 'Whatever tonight turns into',
        note: 'Bonfire, open mic, or six people arguing about Majuli.',
        image: 'photo-1568785919846-27fd1c8f8982',
      },
    ],
  },

  guests: {
    eyebrow: 'Tagged by our guests',
    titleLine1: 'The half of the wall',
    titleLine2: 'that is not',
    underline: 'us',
    copyBefore: 'Tag ',
    handle: '@roamigos',
    copyAfter:
      ' and your frame goes up on the board by the stairs - the physical one, with actual pins.',
    ctaLabel: 'Follow on Instagram',
    frames: [
      { id: 'photo-1523341139367-9de570b874ed', handle: '@ridge.days' },
      { id: 'photo-1613066697301-d7dccfc86bb5', handle: '@nofixedplan' },
      { id: 'photo-1675296098616-53e3d4a1dd57', handle: '@sixamsafari' },
      { id: 'photo-1552978534-9d01e1f91517', handle: '@umngot.blue' },
      { id: 'photo-1568785919846-27fd1c8f8982', handle: '@lastonebythefire' },
      { id: 'photo-1615472910606-9d4f7291944f', handle: '@secondflush' },
      { id: 'photo-1648960456182-00643d5d20eb', handle: '@table.of.six' },
      { id: 'photo-1621789547000-b74d615ce6c5', handle: '@slowferry' },
    ],
  },

  cta: {
    eyebrow: 'Seen enough?',
    titleLine1: 'The next photograph on this wall',
    titleSheen: 'could be yours.',
    copy: 'Pick a bed, send one message, and the desk confirms within minutes. No prepayment, no forms - you pay when you walk in.',
    chatPrompt: "Hi Roamigos! I was reading about the hostel and I'd like to check availability.",
  },
}

export const PAGE_DEFAULTS: PageContent = { home: HOME_DEFAULTS, about: ABOUT_DEFAULTS }

/** In the order the panel lists them. */
export const PAGE_KEYS: PageKey[] = ['home', 'about']

/* ----------------------------------------------------------------- merge --- */

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Defaults underneath, the stored document on top.
 *
 * Objects merge key by key, so a document written before a field existed still
 * renders - the default answers for the missing key, and adding a field needs
 * no migration and no backfill. Arrays replace wholesale, because the panel
 * always saves a complete list and a merged-by-index one would make deleting
 * the last card impossible.
 *
 * A stored value of the wrong type is ignored rather than rendered. This is
 * JSON arriving over HTTP; the shape declared above is the one that has to
 * hold, on both sides.
 */
export function mergePage<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base

  if (Array.isArray(base)) return (Array.isArray(override) ? override : base) as T

  if (isPlainObject(base)) {
    if (!isPlainObject(override)) return base
    const out: Record<string, unknown> = { ...base }
    for (const key of Object.keys(base)) {
      out[key] = mergePage((base as Record<string, unknown>)[key], override[key])
    }
    return out as T
  }

  return (typeof override === typeof base ? override : base) as T
}
