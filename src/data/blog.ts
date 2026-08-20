/**
 * Blog ("The Roamigos Journal") content. The page reads as an issue of a
 * magazine - a masthead, a lead story, then the contents - so the hero copy
 * and the chapter index live here alongside the posts themselves.
 */

/**
 * Masthead. `fill` is the photograph that shows through the two display words,
 * `cutout` is the figure standing in front of them, and `plates` are the two
 * framed shots flanking the stage.
 */
export const blogHero = {
  eyebrow: 'The Roamigos Journal',
  script: 'Notes from the front desk',
  /** Line one is set huge, line two rides under it wide-tracked. */
  words: ['NORTHEAST', 'FIELD NOTES'],
  fill: 'photo-1625826415766-001bd75aaf52',
  /**
   * A real cut-out: the background was matted off the original frame, so this
   * ships with an alpha channel and the letterforms read around the figure
   * instead of behind a rectangle. Served from `public/`, not the photo CDN.
   */
  cutout: {
    src: '/journal-traveller.webp',
    alt: 'A traveller shouldering a full pack, walking off into the hills',
  },
  plates: [
    { key: 'dawki', name: 'Dawki', img: 'photo-1552978534-9d01e1f91517' },
    { key: 'kamakhya', name: 'Kamakhya', img: 'photo-1609770836167-7a74ed99bfad' },
  ],
  copy:
    'Nobody writes this from an office. Every guide below was walked, eaten, missed-the-last-ferry-for and rewritten by someone working the desk downstairs - so the timings are the real ones and the shortcuts actually work.',
  tagline: 'Written where it happened',
  cta: 'Read the issue',
  indexTitle: 'In this issue',
  index: [
    { n: '01', name: 'The City', coord: '26.14°N 91.73°E', note: 'Guwahati in 48 hours' },
    { n: '02', name: 'The Hills', coord: '25.57°N 91.88°E', note: 'Shillong, Dawki, Nongriat' },
    { n: '03', name: 'The River', coord: '26.95°N 94.17°E', note: 'Ferries, islands, sunsets' },
    { n: '04', name: 'The Table', coord: '26.18°N 91.75°E', note: 'Khar, pitha, masor tenga' },
  ],
} as const

export type PostCategory = 'city' | 'hills' | 'river' | 'table' | 'kit'

export const blogCategories: { key: PostCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All stories' },
  { key: 'city', label: 'The City' },
  { key: 'hills', label: 'The Hills' },
  { key: 'river', label: 'The River' },
  { key: 'table', label: 'The Table' },
  { key: 'kit', label: 'Kit & Advice' },
]

export interface BlogPost {
  slug: string
  title: string
  /** Standfirst - the line that runs under the headline on the card. */
  excerpt: string
  category: PostCategory
  author: string
  /** ISO date; formatted for display by `formatDate`. */
  date: string
  readTime: string
  image: string
  /** Pulled out into the lead slot at the top of the page. */
  featured?: boolean
  /** Three hard facts printed under the lead story. */
  facts?: { label: string; value: string }[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'guwahati-in-48-hours',
    title: 'Guwahati in 48 Hours: Kamakhya, Umananda and a Sunset You Should Not Skip',
    excerpt:
      'Two days is enough for the city if you spend them in the right order. Kamakhya at dawn while the hill is still cold, the ferry across to Peacock Island before noon, and the Brahmaputra cruise for whatever the sky decides to do at six.',
    category: 'city',
    author: 'Ankita Baruah',
    date: '2026-08-04',
    readTime: '11 min read',
    image: 'photo-1552843849-b30b397e88c1',
    featured: true,
    facts: [
      { label: 'From the door', value: 'Kamakhya, 8 km' },
      { label: 'Best light', value: '5:30 am / 5:45 pm' },
      { label: 'Two-day budget', value: '₹1,800 all in' },
    ],
  },
  {
    slug: 'guwahati-to-shillong',
    title: 'Guwahati to Shillong: Buses, Shared Sumos, and What It Actually Costs',
    excerpt:
      'Roughly 100 km and about two and a half hours on NH-6, with buses leaving every half hour from six in the morning. Here is which one to take, where it really departs from, and why leaving before nine changes the whole day.',
    category: 'hills',
    author: 'Ankita Baruah',
    date: '2026-07-27',
    readTime: '8 min read',
    image: 'photo-1625826415766-001bd75aaf52',
  },
  {
    slug: 'nongriat-root-bridge-trek',
    title: 'The Nongriat Trek: 3,000 Steps Down to the Double-Decker Root Bridge',
    excerpt:
      'It starts at Tyrna village, drops through the gorge on stone steps, and ends at a bridge that people grew instead of building. Five to six hours return if you keep moving - and the walk back up is the part nobody warns you about.',
    category: 'hills',
    author: 'Rohit Deka',
    date: '2026-07-19',
    readTime: '14 min read',
    image: 'photo-1523341139367-9de570b874ed',
  },
  {
    slug: 'majuli-ferry-guide',
    title: 'Majuli: Catching the Nimati Ghat Ferry to the Largest River Island on Earth',
    excerpt:
      'Jorhat, then 14 km to Nimati Ghat, then a flat-bottomed boat across the Brahmaputra for about an hour. Aim for the 10 am government ferry, and understand this one rule - when the sun goes down, the boats stop.',
    category: 'river',
    author: 'Priyam Saikia',
    date: '2026-07-11',
    readTime: '13 min read',
    image: 'photo-1621789547000-b74d615ce6c5',
  },
  {
    slug: 'assamese-food-guide',
    title: 'Khar, Pitha and Masor Tenga: How to Eat Your Way Through Assam',
    excerpt:
      'Khar is alkaline and nothing else in Indian cooking tastes like it. Masor Tenga is sour fish curry that fixes a hot afternoon. Pitha is what a festival tastes like. Order them in that order, and here is where.',
    category: 'table',
    author: 'Priyam Saikia',
    date: '2026-06-30',
    readTime: '10 min read',
    image: 'photo-1588644525273-f37b60d78512',
  },
  {
    slug: 'packing-for-the-northeast',
    title: 'Packing for the Northeast: Monsoon, Leeches, and the Winter Nobody Expects',
    excerpt:
      'Meghalaya is one of the wettest places on the planet and Assam gets genuinely cold in January. A short, unromantic list of what earns its place in the bag - and the four things people always leave behind.',
    category: 'kit',
    author: 'Rohit Deka',
    date: '2026-05-14',
    readTime: '6 min read',
    image: 'photo-1501868984184-76121ed6a6e2',
  },
]

/** Sidebar list - ordered by what the front desk gets asked about most. */
export const mostAsked = [
  { slug: 'guwahati-to-shillong', title: 'Guwahati to Shillong: buses, sumos and costs', note: 'Asked 3x a day' },
  { slug: 'majuli-ferry-guide', title: 'The Nimati Ghat ferry timings, honestly', note: 'Asked every ferry season' },
  { slug: 'nongriat-root-bridge-trek', title: 'Can I do Nongriat in one day?', note: 'Yes - leave before ten' },
  { slug: 'assamese-food-guide', title: 'What do I order on my first night?', note: 'Start with masor tenga' },
] as const
