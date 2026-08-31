/**
 * The one description of how a database row becomes something the site can
 * render.
 *
 * Two very different callers need this and they must never disagree:
 *
 *   scripts/sync-content.ts   node, at build time, writes the baked fallback
 *   admin/src/lib/publish.ts  the browser, on Publish, writes the live file
 *
 * If the two ever drifted, pressing Publish would quietly reshape the site into
 * something the build had never produced - a class of bug that only shows up in
 * production and only after somebody edits a room. So there is one copy, here,
 * and both import it. Node runs TypeScript directly and Vite compiles it, so
 * the same file serves both without a build step of its own.
 *
 * Nothing here imports anything. Keep it that way.
 */

/* -------------------------------------------------------------- queries --- */

/**
 * PostgREST query strings, columns named explicitly.
 *
 * `select=*` is never used. These rows are pulled with a key that can see
 * everything, and dragging bookkeeping columns and timestamps across the wire
 * on every publish is exactly the habit this project avoids everywhere else.
 */
export const QUERIES = {
  rooms:
    'rooms?select=slug,name,categories,badge,capacity,capacity_label,bathroom,' +
    'short_description,subtitle,price_per_night,rating,review_count,highlights,about,' +
    'inclusions,amenities,images,total_photos,max_guests_note' +
    '&published=is.true&order=sort_order.asc',
  reviews:
    'reviews?select=name,date_label,rating,text' +
    '&published=is.true&room_id=is.null&order=sort_order.asc',
  blogPosts:
    'blog_posts?select=slug,title,excerpt,category,author,published_on,read_time,image,featured,facts,body' +
    '&published=is.true&order=published_on.desc',
  faqs: 'faqs?select=question,answer&published=is.true&order=sort_order.asc',
  pages: 'page_content?select=page,data&order=page.asc',
  settings:
    'site_settings?select=whatsapp_number,phone_display,email,address_line1,address_line2,' +
    'address_line3,coords,map_url,check_in,check_out,stat_guests,stat_rating,stat_reviews,socials' +
    '&id=eq.1',
} as const

export type ContentKey = keyof typeof QUERIES

/** In this order, so a log line reads the way somebody would list the site. */
export const CONTENT_KEYS = Object.keys(QUERIES) as ContentKey[]

/* --------------------------------------------------------------- shapes --- */

type Row = Record<string, any>

/**
 * Snake case to the shapes `src/data/*.ts` already declare.
 *
 * Doing this here rather than in the app is what lets every component stay
 * exactly as it was: `rooms` is still a `Room[]`, and nothing downstream has to
 * learn that the content came out of a database.
 */
export const shape: Record<ContentKey, (rows: Row[]) => unknown> = {
  rooms: (rows) =>
    rows.map((row, index) => ({
      id: index + 1,
      slug: row.slug,
      name: row.name,
      categories: row.categories ?? [],
      ...(row.badge ? { badge: row.badge } : {}),
      capacity: row.capacity,
      capacityLabel: row.capacity_label,
      bathroom: row.bathroom,
      shortDescription: row.short_description,
      subtitle: row.subtitle,
      pricePerNight: row.price_per_night,
      // Postgres `numeric` arrives as a string over PostgREST, and the site
      // prints this straight into a rating - `"4.7"` would render as text.
      rating: Number(row.rating),
      reviewCount: row.review_count,
      highlights: row.highlights ?? [],
      about: row.about,
      inclusions: row.inclusions ?? [],
      amenities: row.amenities ?? [],
      images: row.images ?? [],
      totalPhotos: row.total_photos,
      maxGuestsNote: row.max_guests_note,
    })),

  reviews: (rows) =>
    rows.map((row) => ({
      name: row.name,
      date: row.date_label,
      rating: row.rating,
      text: row.text,
    })),

  blogPosts: (rows) =>
    rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      category: row.category,
      author: row.author,
      date: row.published_on,
      readTime: row.read_time,
      image: row.image,
      ...(row.featured ? { featured: true } : {}),
      ...(Array.isArray(row.facts) && row.facts.length ? { facts: row.facts } : {}),
      // An empty body is a post with no article page, and the site checks for
      // exactly that - so it is left out rather than published as ''.
      ...(typeof row.body === 'string' && row.body.trim() ? { body: row.body } : {}),
    })),

  faqs: (rows) => rows.map((row) => ({ q: row.question, a: row.answer })),

  /**
   * `[{ page: 'home', data }, ...]` to `{ home: data, about: data }`.
   *
   * The documents are passed through exactly as stored. Nothing here knows
   * what a section is called, which is the point: `src/data/pages.ts` owns the
   * shape and deep-merges these over its own defaults, so a field added there
   * needs no change in this file and no migration behind it.
   */
  pages: (rows) =>
    Object.fromEntries(
      rows
        .filter((row) => row.data && typeof row.data === 'object')
        .map((row) => [row.page, row.data]),
    ),

  settings: (rows) => {
    const row = rows[0]
    if (!row) return null
    return {
      whatsappNumber: row.whatsapp_number,
      phoneDisplay: row.phone_display,
      email: row.email,
      address: {
        line1: row.address_line1,
        line2: row.address_line2,
        line3: row.address_line3,
        coords: row.coords,
        mapUrl: row.map_url,
      },
      checkIn: row.check_in,
      checkOut: row.check_out,
      stats: {
        guests: row.stat_guests,
        rating: Number(row.stat_rating),
        reviews: row.stat_reviews,
      },
      socials: row.socials ?? [],
    }
  },
}

/**
 * True when a slice came back with nothing in it.
 *
 * An empty table means "not filled in yet", not "the site has no rooms" - so
 * both callers keep whatever they had rather than writing the emptiness
 * through and blanking a page.
 */
export const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  (Array.isArray(value) && value.length === 0) ||
  // The page documents come back as an object rather than a list, and a
  // project whose `page_content` table has not been created yet answers with
  // nothing at all. `{}` means the same thing an empty table does.
  (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
