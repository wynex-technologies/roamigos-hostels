/**
 * The head tags that have to be in the HTML file itself.
 *
 * WhatsApp, Facebook, Instagram and X never run the app - they read the shipped
 * `index.html` and stop. Anything React writes into `<head>` is invisible to
 * them, and the whole booking funnel here runs through a shared WhatsApp link,
 * so the share card has to be static.
 *
 * Keeping it hand-written in `index.html` would mean a second copy of the brand
 * name, description, address and phone number drifting away from
 * `src/data/site.ts`, so the tags are built from that file and injected at build
 * time by the plugin in `vite.config.ts`. Imports here stay relative and
 * dependency-free: this module is loaded by the Vite config, outside the app.
 */
import { site } from '../data/site'
import { photo } from './images'

const OG_IMAGE = photo(site.ogImage, 1200, 630)
const TITLE = `${site.legalName} - Stay. Explore. Connect.`
const DESCRIPTION =
  "Roamigos is more than a hostel - it's a community of travellers. Comfortable dorms and private rooms, great vibes and new friends. Explore more, pay less."

const [latitude, longitude] = site.address.coords.split(',')

/**
 * Kept in step with `hostelAmenities` in `src/data/rooms.ts`, which pairs the
 * same names with their lucide icons. The list is duplicated rather than
 * imported because that file pulls in `lucide-react`, and this module is
 * evaluated by the Vite config before any of that exists.
 */
const AMENITIES = [
  'Free Wi-Fi',
  '24x7 Security',
  'Hot Showers',
  'Common Area',
  'Travel Desk',
  'Laundry Service',
  'Luggage Storage',
  'Rooftop Cafe',
]

/**
 * The hostel itself, as one entity the whole site can point at.
 *
 * `@id` is stable so the per-page schemas in `src/lib/structuredData.ts` can
 * reference this rather than describing the business again on every route.
 *
 * There is deliberately no `aggregateRating` here. Google does not use review
 * markup a business writes about itself on a `LocalBusiness`, and marking it up
 * anyway risks a structured-data penalty - the room ratings, which are reviews
 * of a specific thing being sold and are printed on the page, are the ones that
 * carry it.
 */
export function hostelSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Hostel', 'LodgingBusiness'],
    '@id': `${site.url}/#hostel`,
    name: site.legalName,
    alternateName: site.name,
    description: site.description,
    url: site.url,
    image: OG_IMAGE,
    logo: `${site.url}/logo-1024.png`,
    telephone: site.phoneDisplay,
    email: site.email,
    priceRange: 'INR 499 - 2499',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI, Credit Card, Debit Card',
    checkinTime: site.checkIn,
    checkoutTime: site.checkOut,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.line1,
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
      addressCountry: 'IN',
    },
    geo: { '@type': 'GeoCoordinates', latitude, longitude },
    hasMap: site.address.mapUrl,
    amenityFeature: AMENITIES.map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    })),
    petsAllowed: false,
    smokingAllowed: false,
    sameAs: site.socials.map((social) => social.href),
  }
}

/** The site as a searchable whole, so Google can show a sitelinks name. */
function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.legalName,
    url: site.url,
    inLanguage: 'en-IN',
    publisher: { '@id': `${site.url}/#hostel` },
  }
}

/**
 * The block that replaces the `<!--seo-->` marker in `index.html`. Titles and
 * descriptions here are the defaults every share of a deep link falls back to,
 * because the crawler that reads them cannot see which route it asked for.
 */
export function headTags() {
  const meta: [string, string, string][] = [
    ['name', 'description', DESCRIPTION],
    ['name', 'author', site.legalName],
    ['name', 'robots', 'index, follow, max-image-preview:large'],
    ['property', 'og:type', 'website'],
    ['property', 'og:site_name', site.legalName],
    ['property', 'og:locale', 'en_IN'],
    ['property', 'og:title', TITLE],
    ['property', 'og:description', DESCRIPTION],
    ['property', 'og:url', `${site.url}/`],
    ['property', 'og:image', OG_IMAGE],
    ['property', 'og:image:width', '1200'],
    ['property', 'og:image:height', '630'],
    ['property', 'og:image:alt', `The Brahmaputra from ${site.legalName}, Guwahati`],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', TITLE],
    ['name', 'twitter:description', DESCRIPTION],
    ['name', 'twitter:image', OG_IMAGE],
  ]

  const tags = meta.map(([attr, key, value]) => `<meta ${attr}="${key}" content="${esc(value)}" />`)
  tags.push(`<link rel="canonical" href="${site.url}/" />`)

  for (const schema of [hostelSchema(), websiteSchema()]) {
    tags.push(`<script type="application/ld+json">${json(schema)}</script>`)
  }

  return tags.join('\n    ')
}

/** Every route the sitemap lists - room pages and journal articles included. */
export function sitemap(roomSlugs: string[], postSlugs: string[] = []) {
  const urls = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/rooms', priority: '0.9', changefreq: 'weekly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/blog', priority: '0.7', changefreq: 'weekly' },
    { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    ...roomSlugs.map((slug) => ({
      path: `/rooms/${slug}`,
      priority: '0.8',
      changefreq: 'monthly',
    })),
    // Only posts with a body are listed: the rest have no page to crawl.
    ...postSlugs.map((slug) => ({
      path: `/blog/${slug}`,
      priority: '0.6',
      changefreq: 'monthly',
    })),
  ]

  const body = urls
    .map(
      ({ path, priority, changefreq }) =>
        `  <url>\n    <loc>${site.url}${path}</loc>\n` +
        `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

/** Crawl rules. `/gallery` only ever redirects, so it is kept out of the index. */
export function robots() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /gallery',
    '',
    `Sitemap: ${site.url}/sitemap.xml`,
    '',
  ].join('\n')
}

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** `</script>` inside a JSON string would close the tag it is sitting in. */
const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\u003c')
