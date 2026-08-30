/**
 * Blog ("The Roamigos Journal") content. The page reads as an issue of a
 * magazine - a masthead, a lead story, then the contents - so the hero copy
 * and the chapter index live here alongside the posts themselves.
 */
import { content } from './generated'

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
  cta: 'Read the lead story',
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
  /**
   * The article itself, in the small markdown subset `lib/article.ts` parses.
   * Optional on purpose: a post without one still lists on the journal, it
   * simply has no page of its own, and every card checks before it links.
   */
  body?: string
}

/**
 * The copy the site ships with, before any database.
 *
 * Exported because the seed has to push *this* into a fresh project. Pushing
 * `blogPosts` instead would push whatever the last sync pulled down, which on
 * an already-populated project means seeding the database from itself.
 */
export const shippedPosts: BlogPost[] = [
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
    body: `Two days sounds thin for a city this size. It is not, as long as you stop trying
to see everything and simply put the right things in the right order. Guwahati
rewards early starts and punishes lie-ins, because almost everything worth doing
here happens either before nine in the morning or after five in the evening, and
the middle of the day belongs to the heat.

## Day one, before the city wakes

Kamakhya first, and early. The temple is eight kilometres from our door and the
hill is still cold at half past five, which matters more than it sounds: by nine
the queue is an hour long and the stone underfoot is too hot to stand on
barefoot. Take an auto rather than a shared sumo, agree the fare before you get
in, and ask to be dropped at the top gate rather than the base.

- Go on a weekday if you have the choice. Weekend mornings are twice the queue.
- Leave your shoes with the stall you buy the offering from, not at the gate.
- Phones are allowed on the grounds, not inside the sanctum.

Come back down by nine and eat. Anything with luchi and aloo on the counter is
the right answer at that hour.

## The ferry to Peacock Island

The Umananda ferry leaves from Kachari Ghat, runs from around seven in the
morning, and costs less than a bottle of water. The crossing takes ten minutes.
The island is small enough to walk in twenty, and the golden langurs living on
it are genuinely wild - keep food out of your hands and out of your pack.

> The last boat back is at four in the afternoon, and it does not wait. This is the single most common way a good day here turns into an expensive one.

## Day two, and the sunset nobody skips

Spend the morning at the Assam State Museum and the afternoon somewhere with a
fan. Then the river. The Brahmaputra cruise boards a little after five, and the
hour after that is what people actually remember about Guwahati - the water goes
flat and metallic, the far bank disappears entirely, and the light does
something no photograph has ever quite carried home.

Book the cruise the same morning at the ghat rather than online. It is cheaper,
and if the weather turns you have lost nothing.

## What it costs

Two days, done this way, comes in around eighteen hundred rupees a head
including every fare, every ticket and three meals a day. Ask at the desk before
you go out - if two other people are heading the same way that morning, the
autos become shared and the figure drops again.`,
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
    body: `A hundred kilometres, two and a half hours, and about four different ways to do
it - all of which somebody will tell you is the only sensible one. Here is what
they actually cost, and what the difference buys you.

## The options, honestly

- **Shared sumo.** Around three hundred rupees. Leaves when it fills, not when the board says. Ten people in a vehicle built for seven. Fastest, cheapest, least comfortable.
- **State bus.** Around two hundred and fifty. Every half hour from six in the morning. Slower by forty minutes because it stops, but the seat is yours.
- **Private cab.** Two to three thousand for the car. Worth splitting three or four ways, and the only option that will stop where you ask it to.
- **Shared cab through the desk.** Whatever the cab costs, divided by four. Ask us the night before.

## Where they actually leave from

This is the part the internet gets wrong. Shared sumos for Shillong go from
Paltan Bazaar, near the railway station - not from ISBT, which is where a lot of
booking sites send you and which is eight kilometres in the wrong direction.
Buses use both. If you have been told ISBT and you are carrying a pack, confirm
it with somebody before you pay for the ride out there.

## Leave before nine

NH-6 is a good road and a busy one. Leaving at seven puts you in Shillong before
eleven with the whole day in front of you. Leaving at ten puts you in traffic
through Khanapara, then behind trucks on the climb, and into Shillong at three
with the light already going.

> If you are carrying on to Dawki or Cherrapunji the same day, seven is not a suggestion. The last light matters more than the timetable.

## On the way up

The road climbs the whole way and the temperature drops with it - Shillong sits
at about fifteen hundred metres and is genuinely cold after dark in December and
January. Umiam Lake appears on your left about twenty minutes before the city.
Every vehicle stops there. Let it.`,
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
    body: `Three thousand steps down, three thousand steps back up, and a bridge that
nobody built. The double-decker root bridge at Nongriat is the most photographed
thing in Meghalaya and it is still worth the walk - as long as you understand
what the walk is.

## The shape of the day

It starts at Tyrna village, an hour or so from Cherrapunji by shared vehicle.
From there the stone staircase drops into the gorge - properly drops, in flights
with no flat sections to speak of - crosses two steel wire bridges over the
river, and climbs a short way back up to Nongriat itself.

- Down: about ninety minutes at a steady pace.
- At the bridge and the pools: however long you want, and take longer.
- Back up: two hours, and that is if you are fit.

Five to six hours return, in other words. The return half is the one everybody
underestimates.

## The part nobody warns you about

Going down destroys your knees. Coming back up destroys everything else. There
is no shortcut, no road and no vehicle - the only way out of the gorge is the
way you came in, on your own legs, in the afternoon, in the heat. People do get
stuck. If you are not confident about the climb, stay the night in one of the
guesthouses at Nongriat and walk out fresh the next morning. It costs almost
nothing and it turns a hard day into an easy two.

> Start walking by ten at the latest. The gorge loses its light early, and the steps are wet stone with a long drop beside them.

## What to carry

- More water than feels reasonable. Two litres a person, minimum.
- A dry bag or a plastic sleeve for your phone. You will swim, and it rains.
- Shoes with grip. Not sandals, whatever the person on the bus says.
- Cash. There is nothing electronic anywhere in the gorge.

## Leeches

In monsoon, yes. They are harmless and they are relentless. Salt in a twist of
paper in your pocket, socks pulled over your trouser legs, and do not panic -
pulling one off is worse than waiting the few seconds for the salt to do it.`,
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
    body: `Majuli is the largest river island on earth and it is quietly getting smaller
every year, which is a good enough reason to go now. Getting there is three legs
and one rule.

## The three legs

- **Guwahati to Jorhat.** Overnight bus, about seven hours, or an hour by air. Buses leave in the evening and arrive around dawn, which lines up well with the ferry.
- **Jorhat to Nimati Ghat.** Fourteen kilometres. Shared auto or a cab, twenty minutes, and no reason to arrange it in advance.
- **Nimati Ghat to Kamalabari.** The ferry. About an hour on a flat-bottomed boat that carries people, motorcycles, vegetables and occasionally a cow.

Aim for the ten o'clock government ferry. It is the most reliable of the day,
and it puts you on the island with the afternoon still intact.

## The one rule

> When the sun goes down, the boats stop. There is no late service, no exception, and no bridge.

Miss the last ferry off the island and you are staying the night - which is fine
if you planned for it and a problem if your bus out of Jorhat leaves at eight.
Check the day's last crossing when you arrive, not when you want to leave: the
timing moves with the water level, and in high monsoon it moves a lot.

## What the island is for

Satras, mostly - the Vaishnavite monasteries that have been here since the
sixteenth century, where the mask-making and the dance are still working
practice rather than performance. Auniati and Kamalabari are the two most
visitors see. Go in the late afternoon, when the prayers are on.

The rest of it is a bicycle and a flat road between paddy fields, which is
honestly the better half of the trip. Every guesthouse on the island rents
bicycles for a couple of hundred rupees a day.

## Stay at least one night

A day trip is possible and it is a waste. The island empties out after the last
ferry, and what is left - the light over the water, the drumming from the satra
after dark - is the entire reason people talk about this place the way they do.`,
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
    body: `Assamese food is not the food most people mean when they say Indian food. There
is very little oil in it, almost no chilli by the standards of the rest of the
country, and a sourness and a bitterness that other cuisines simply do not use.
Order these three, in this order, and you will understand the place better than
any guide can explain it.

## Start with masor tenga

Sour fish curry: thin, lemon-coloured, soured with tomato or elephant apple or
lemon depending on who is cooking. It is the dish an Assamese household eats
most often, and it is the right thing to eat on a hot afternoon - it does
something for the heat that a heavy curry cannot.

Eat it with plain rice, with your hands, and do not ask for it to be made
spicier.

## Then khar

Khar is alkaline. Raw papaya or pulses, cooked with a filtrate made from burnt
banana peel, and nothing else in Indian cooking tastes remotely like it. It is
traditionally the first thing served in a meal, and the first mouthful is
genuinely strange - faintly soapy, faintly bitter, clean in a way that is hard
to describe.

> Give it three mouthfuls before you decide. Almost nobody likes khar immediately, and almost everybody likes it by the end of the plate.

## Finish with pitha

Rice-flour cakes, made at Bihu, filled with sesame or coconut and jaggery. Til
pitha is the one to start with. Ghila pitha if somebody is frying them fresh in
front of you, in which case stop reading and go.

## Where

- **Fancy Bazaar** for thalis at lunch, which is when they are cooked.
- **Uzan Bazar** in the evening, for fish.
- Any place with a queue of people who are not carrying cameras.

Ask at the desk the night before and somebody will walk you to whichever of
these is doing it best that week. It changes, and we eat there too.

## If you eat no meat

You are fine. The vegetarian half of this cuisine is not an afterthought - khar,
aloo pitika, bhaji, dal and rice is a complete Assamese meal, and it is what
many households eat daily.`,
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
    body: `Meghalaya is one of the wettest places on the planet and Assam gets properly
cold in January. Most packing lists for India assume neither. This one is short,
unromantic, and written by the people who lend out the things guests forgot.

## Rain, and what actually works

An umbrella is useless in a Meghalaya monsoon, because the rain does not fall
straight down. What works is a cheap poncho over you and your pack together, and
a dry bag inside the pack for anything electronic.

- **Poncho, not a rain jacket.** It has to cover the bag.
- **A dry bag, or two heavy zip bags.** Phone, passport, cash, charger.
- **A second pair of shoes.** Nothing dries here. Nothing.
- **Quick-dry everything.** Cotton stays wet for two days.

## Leeches

Monsoon, forest, anywhere near Nongriat or Mawlynnong. Long socks pulled over
your trouser legs, and a twist of salt in your pocket. They are harmless. They
are also extremely difficult to be relaxed about the first time, so knowing the
salt trick in advance is worth more than any repellent.

## The winter nobody expects

Guwahati drops to around ten degrees in January and Shillong goes lower. Rooms
here are built for heat, not cold - there is no central heating anywhere in the
region. One warm layer that packs small earns its place in the bag for anything
between November and February.

> The commonest thing guests buy in their first week is a jumper. The second commonest is a second pair of shoes.

## The four things people always leave behind

- **A power bank.** Long bus days, no sockets.
- **A torch.** Power cuts are ordinary here, not an emergency.
- **Cash.** Outside the cities, cards and UPI both stop working.
- **A padlock.** For the locker by your bed.

## What you can leave at home

A sleeping bag, a mosquito net, a water filter and a towel. We have all four,
and so do the guesthouses you will stay in on the road.`,
  },
]

/** Sidebar list - ordered by what the front desk gets asked about most. */
/** The journal. Supabase owns it once the panel has posts; the array above
    is the shipped fallback, resolved at build like the rest of the content. */
export const blogPosts: BlogPost[] = content.blogPosts ?? shippedPosts

/** A post is only worth linking to if there is something behind the link. */
export const hasArticle = (post: BlogPost) => Boolean(post.body?.trim())

export const getPost = (slug: string) => blogPosts.find((post) => post.slug === slug)

/** Newest first, so "next in this issue" means what a reader expects. */
export const orderedPosts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date))

export const mostAsked = [
  { slug: 'guwahati-to-shillong', title: 'Guwahati to Shillong: buses, sumos and costs', note: 'Asked 3x a day' },
  { slug: 'majuli-ferry-guide', title: 'The Nimati Ghat ferry timings, honestly', note: 'Asked every ferry season' },
  { slug: 'nongriat-root-bridge-trek', title: 'Can I do Nongriat in one day?', note: 'Yes - leave before ten' },
  { slug: 'assamese-food-guide', title: 'What do I order on my first night?', note: 'Start with masor tenga' },
] as const
