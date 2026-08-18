/**
 * Gallery page content — the pinned postcard hero, the album wall and the
 * guest strip. Photographs are Unsplash ids, resolved by `@/lib/images`.
 */

/**
 * The hero is a corkboard: a handful of pinned pieces floating around a centred
 * core on desktop, and the same pieces in one snap-scrolling rail on mobile.
 * Each key below is one pinned piece — the component places them by hand, so
 * this object is deliberately shaped rather than a flat list.
 */
export const galleryHero = {
  watermark: 'Roamigos',
  chip: 'The house wall',
  script: 'Postcards from the front desk',
  heading: ['Two years of check-ins,', 'pinned to one wall'],
  copy:
    'Everything on this board was shot by someone who stayed here — the rooftop at six, the river at seven, and whatever the common room turned into by ten.',
  cta: 'Open the full wall',
  meta: '340 frames · added to every month',

  /** Bleeds off the left edge — no caption, it is the mood, not a picture of a thing. */
  traveller: {
    img: 'photo-1523341139367-9de570b874ed',
    alt: 'A traveller on a ridge trail outside Guwahati',
  },

  /** A proper polaroid, caption written on the white lip. */
  polaroid: {
    img: 'photo-1609770836167-7a74ed99bfad',
    alt: 'Temple steps at first light',
    name: 'Kamakhya, 5:40 am',
    line: 'Left before the chai stalls opened',
    tag: 'Nilachal Hill · Guwahati',
  },

  /** Stitched round shot next to the running check-in count. */
  round: {
    img: 'photo-1648960456182-00643d5d20eb',
    alt: 'The Roamigos common room, lamps on',
  },
  stat: {
    value: '25K+',
    label: 'Travellers checked in since day one',
  },

  /** A clipping torn out of somebody elses magazine. */
  clipping: {
    img: 'photo-1615472910606-9d4f7291944f',
    alt: 'Tea gardens an hour out of the city',
    name: 'Green to the horizon',
    line: 'An hour out, then nothing but rows',
    tag: 'Tea trails · Sonapur',
  },

  /** Stamp-sized, with coordinates printed along the foot. */
  stamp: {
    img: 'photo-1675296098616-53e3d4a1dd57',
    alt: 'A one-horned rhino grazing in tall grass',
    note: 'Day trip',
    place: 'Pobitora',
    coord: '26.23°N 91.98°E',
  },

  /** Boarding pass — the route most of our guests are actually on. */
  pass: {
    from: 'GAU',
    to: 'SHL',
    route: 'Guwahati → Shillong · 2h 30m',
    seat: '11A',
    gate: 'NH-6',
  },

  /** Wide film still, sitting bottom-right. */
  reel: {
    img: 'photo-1647142465378-5bf5e757f43b',
    alt: 'Sunset over the Brahmaputra',
    place: 'Brahmaputra, 5:52 pm',
    length: '2 min 14 s',
  },
} as const

export type AlbumKey = 'rooms' | 'common' | 'rooftop' | 'nights' | 'around'

export interface GalleryAlbum {
  key: AlbumKey | 'all'
  label: string
  note: string
}

export const galleryAlbums: GalleryAlbum[] = [
  { key: 'all', label: 'Everything', note: 'The whole board, newest first' },
  { key: 'rooms', label: 'Rooms & Beds', note: 'Dorms, privates and the good bunks' },
  { key: 'common', label: 'Common Spaces', note: 'Where the trip actually gets planned' },
  { key: 'rooftop', label: 'Rooftop & Kitchen', note: 'Chai at six, thali at eight' },
  { key: 'nights', label: 'Nights & Events', note: 'Bonfires, open mics, bad guitar' },
  { key: 'around', label: 'Around Guwahati', note: 'Everything within a day of the door' },
]

export interface GalleryShot {
  id: string
  album: AlbumKey
  caption: string
  place: string
  /** Drives the tile height in the wall — the mix is what stops it reading as a grid. */
  span: 'tall' | 'wide' | 'square'
}

export const galleryShots: GalleryShot[] = [
  // ---------------------------------------------------------------- rooms
  {
    id: 'photo-1709805619372-40de3f158e83',
    album: 'rooms',
    caption: 'Top bunk, window side — the one everyone asks for',
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
    caption: 'Private twin — a desk, a window, and a door that locks',
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

  // --------------------------------------------------------------- common
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
    caption: 'Work corner — fast wifi and a plug at every seat',
    place: 'Co-work nook',
    span: 'square',
  },

  // -------------------------------------------------------------- rooftop
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
    caption: 'Sunset shift — the best seats go to whoever gets up first',
    place: 'Rooftop terrace',
    span: 'wide',
  },
  {
    id: 'photo-1588644525273-f37b60d78512',
    album: 'rooftop',
    caption: 'Assamese thali night — khar, masor tenga, rice, repeat',
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

  // --------------------------------------------------------------- nights
  {
    id: 'photo-1568785919846-27fd1c8f8982',
    album: 'nights',
    caption: 'Bonfire night — guitars, bad jokes, real stars',
    place: 'Back courtyard',
    span: 'wide',
  },
  {
    id: 'photo-1629445039581-3b5fb6501e9a',
    album: 'nights',
    caption: 'Open mic Thursday — three songs each, no auditions',
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

  // --------------------------------------------------------------- around
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
    caption: 'Pobitora — rhino country, and only an hour out of town',
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
    caption: 'Kamakhya before the queues — go at dawn, thank us later',
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
]

/** The strip under the wall — the house across one ordinary day. */
export const galleryDay = [
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
] as const

/** Square crops for the guest marquee at the foot of the page. */
export const guestFrames = [
  { id: 'photo-1523341139367-9de570b874ed', handle: '@ridge.days' },
  { id: 'photo-1613066697301-d7dccfc86bb5', handle: '@nofixedplan' },
  { id: 'photo-1675296098616-53e3d4a1dd57', handle: '@sixamsafari' },
  { id: 'photo-1552978534-9d01e1f91517', handle: '@umngot.blue' },
  { id: 'photo-1568785919846-27fd1c8f8982', handle: '@lastonebythefire' },
  { id: 'photo-1615472910606-9d4f7291944f', handle: '@secondflush' },
  { id: 'photo-1648960456182-00643d5d20eb', handle: '@table.of.six' },
  { id: 'photo-1621789547000-b74d615ce6c5', handle: '@slowferry' },
] as const
