/**
 * Pushes the content written in `src/data/` into a fresh Supabase project.
 *
 * Run this once, right after the migrations. It is the other half of the
 * fallback arrangement: the site ships with real rooms, real posts and real
 * copy compiled into it, and this puts that same content into the database so
 * the panel opens onto a working site rather than eight empty forms.
 *
 * It reads the TypeScript data modules directly rather than keeping a second
 * copy of everything in SQL, which would be stale the day it was written.
 * esbuild comes with Vite, so this needs no new dependency.
 *
 * Idempotent: every write is an upsert keyed on the natural key (a slug, or the
 * single settings row), so running it twice changes nothing. It will not
 * overwrite a room the panel has since edited unless that room still carries
 * the same slug, which is the point - re-running it repairs, it does not reset.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:supabase
 */
import { build } from 'esbuild'
import { rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const URL_BASE = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL_BASE || !KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.')
  process.exit(1)
}

/**
 * The data modules are TypeScript and one of them imports `lucide-react`, so
 * they cannot simply be `import`ed from node. Bundling them to a temp file is
 * the least fragile way in, and it means the seed always reflects exactly what
 * the site would have shipped.
 */
async function loadSiteData() {
  const outfile = resolve(root, 'node_modules/.tmp/seed-data.mjs')

  await build({
    entryPoints: [resolve(root, 'scripts/seed-entry.ts')],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    packages: 'external',
    // The data modules read `import.meta.env` for the offer endpoint, which
    // does not exist outside Vite.
    define: { 'import.meta.env': '{}' },
    logLevel: 'silent',
  })

  const loaded = await import(pathToFileURL(outfile).href)
  await rm(outfile, { force: true })
  return loaded
}

async function upsert(table, rows, onConflict) {
  if (!rows.length) return
  const response = await fetch(
    `${URL_BASE}/rest/v1/${table}?on_conflict=${onConflict}`,
    {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
    },
  )

  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`)
  console.log(`[seed] ${table}: ${rows.length} rows`)
}

const data = await loadSiteData()
const { site, rooms, reviews, blogPosts, contactFaqs, offer } = data

// ------------------------------------------------------------------ rooms ---
await upsert(
  'rooms',
  rooms.map((room, index) => ({
    slug: room.slug,
    name: room.name,
    categories: room.categories,
    badge: room.badge ?? null,
    capacity: room.capacity,
    capacity_label: room.capacityLabel,
    bathroom: room.bathroom,
    short_description: room.shortDescription,
    subtitle: room.subtitle,
    price_per_night: room.pricePerNight,
    rating: room.rating,
    review_count: room.reviewCount,
    highlights: room.highlights,
    about: room.about,
    inclusions: room.inclusions,
    amenities: room.amenities,
    images: room.images,
    total_photos: room.totalPhotos,
    max_guests_note: room.maxGuestsNote,
    sort_order: index,
    published: true,
  })),
  'slug',
)

// -------------------------------------------------------------- blog posts ---
await upsert(
  'blog_posts',
  blogPosts.map((post, index) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    published_on: post.date,
    read_time: post.readTime,
    image: post.image,
    featured: Boolean(post.featured),
    facts: post.facts ?? [],
    // The article. Empty for a post that was only ever a card.
    body: post.body ?? '',
    sort_order: index,
    published: true,
  })),
  'slug',
)

// --------------------------------------------------------------- settings ---
await upsert(
  'site_settings',
  [
    {
      id: 1,
      whatsapp_number: site.whatsappNumber,
      phone_display: site.phoneDisplay,
      email: site.email,
      address_line1: site.address.line1,
      address_line2: site.address.line2,
      address_line3: site.address.line3,
      coords: site.address.coords,
      map_url: site.address.mapUrl,
      check_in: site.checkIn,
      check_out: site.checkOut,
      stat_guests: site.stats.guests,
      stat_rating: site.stats.rating,
      stat_reviews: site.stats.reviews,
      socials: site.socials,
    },
  ],
  'id',
)

// ------------------------------------------------------------------ offer ---
await upsert(
  'offers',
  [
    {
      name: 'Direct booking offer',
      active: offer.active,
      eyebrow: offer.eyebrow,
      headline: offer.headline,
      headline_accent: offer.headlineAccent ?? null,
      badge_value: offer.badgeValue ?? null,
      badge_label: offer.badgeLabel ?? null,
      description: offer.description,
      code: offer.code ?? null,
      discount_percent: offer.discountPercent ?? 0,
      image: offer.image,
      image_alt: offer.imageAlt,
      perks: offer.perks,
      cta_label: offer.ctaLabel,
      cta_href: offer.ctaHref,
      note: offer.note ?? null,
      expires_on: offer.expiresOn ?? null,
      delay_ms: offer.delayMs,
    },
  ],
  'name',
)

// -------------------------------------------------------- faqs and reviews ---
// Neither has a natural key, so they are only written into an empty table.
// Re-running the seed must not duplicate the FAQ list.
for (const [table, rows] of [
  [
    'faqs',
    contactFaqs.map((faq, index) => ({
      question: faq.q,
      answer: faq.a,
      sort_order: index,
      published: true,
    })),
  ],
  [
    'reviews',
    reviews.map((review, index) => ({
      room_id: null,
      name: review.name,
      date_label: review.date,
      rating: review.rating,
      text: review.text,
      sort_order: index,
      published: true,
    })),
  ],
]) {
  const existing = await fetch(`${URL_BASE}/rest/v1/${table}?select=id&limit=1`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  }).then((response) => response.json())

  if (existing.length) {
    console.log(`[seed] ${table}: already has rows, left alone`)
    continue
  }

  const response = await fetch(`${URL_BASE}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  })

  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`)
  console.log(`[seed] ${table}: ${rows.length} rows`)
}

console.log('\n[seed] done. Run `npm run sync:content` to pull it straight back down.')
