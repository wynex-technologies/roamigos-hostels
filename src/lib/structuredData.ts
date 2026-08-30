/**
 * Per-route structured data.
 *
 * The hostel itself is described once, statically, in `index.html` (built by
 * `src/lib/seoStatic.ts`). Everything here describes one page and points back at
 * that entity by `@id` rather than repeating the business on every route.
 */
import { site } from '@/data/site'
import type { Room } from '@/data/rooms'
import { blogPosts, hasArticle, type BlogPost } from '@/data/blog'
import { contactFaqs } from '@/data/contact'
import { absoluteUrl, shareImage } from './seo'

const HOSTEL = { '@id': `${site.url}/#hostel` }

/** The trail printed above a search result, so a room does not look orphaned. */
export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

/**
 * One room, as both the thing being sold and the room it is.
 *
 * The double type is the point: `HotelRoom` is what it actually is, and
 * `Product` is what carries an `offers` block and a star rating into a search
 * result. Only the rating is self-reported here, and that is allowed - these are
 * reviews of a specific thing being sold, printed on the same page, rather than
 * a business rating itself.
 */
export function roomSchema(room: Room) {
  const isDorm = room.categories.includes('dorm')

  return {
    '@context': 'https://schema.org',
    '@type': ['Product', 'HotelRoom'],
    '@id': absoluteUrl(`/rooms/${room.slug}#room`),
    name: room.name,
    description: room.about,
    url: absoluteUrl(`/rooms/${room.slug}`),
    image: room.images.slice(0, 4).map((id) => shareImage(id)),
    brand: { '@type': 'Brand', name: site.legalName },
    containedInPlace: HOSTEL,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: room.capacity,
      unitText: isDorm ? 'beds' : 'guests',
    },
    bed: { '@type': 'BedDetails', numberOfBeds: isDorm ? room.capacity : 1 },
    amenityFeature: room.highlights.map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: room.rating,
      reviewCount: room.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      '@type': 'Offer',
      price: room.pricePerNight,
      priceCurrency: 'INR',
      // Nothing is prepaid and nothing is held, so the offer is simply live.
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(`/rooms/${room.slug}`),
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: room.pricePerNight,
        priceCurrency: 'INR',
        unitText: isDorm ? 'per bed per night' : 'per room per night',
      },
      seller: HOSTEL,
    },
  }
}

/** The rooms listing, as the ordered set of rooms it prints. */
export function roomListSchema(rooms: Room[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Rooms and beds at ${site.legalName}`,
    numberOfItems: rooms.length,
    itemListElement: rooms.map((room, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: room.name,
      url: absoluteUrl(`/rooms/${room.slug}`),
    })),
  }
}

/**
 * The journal.
 *
 * A post points at its own article page when it has one. A post with no body
 * has no page, so it stays pointed at `/blog`, which is where it is published
 * and the only address that will actually answer for it.
 */
export function blogSchema() {
  const url = absoluteUrl('/blog')

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${url}#blog`,
    name: `The Journal - ${site.legalName}`,
    url,
    publisher: HOSTEL,
    blogPost: blogPosts.map((post) => {
      const postUrl = hasArticle(post) ? absoluteUrl(`/blog/${post.slug}`) : url

      return {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        author: { '@type': 'Person', name: post.author },
        image: shareImage(post.image),
        url: postUrl,
        mainEntityOfPage: postUrl,
        publisher: HOSTEL,
      }
    }),
  }
}

/**
 * One article, on its own page.
 *
 * `wordCount` and `articleBody` are what separate a BlogPosting that Google
 * treats as an article from one it treats as a link, so the body goes in as
 * written rather than being summarised down to the standfirst.
 */
export function articleSchema(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`)
  const body = post.body ?? ''

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    image: shareImage(post.image),
    url,
    mainEntityOfPage: url,
    articleSection: post.category,
    wordCount: body.trim().split(/\s+/).filter(Boolean).length,
    articleBody: body,
    isPartOf: { '@id': `${absoluteUrl('/blog')}#blog` },
    publisher: HOSTEL,
  }
}

/**
 * The contact page's questions, verbatim.
 *
 * Google only shows an FAQ result when the question and the answer are both on
 * the page as written, so this reads the same array `ContactFaq` renders rather
 * than a shortened copy of it.
 */
export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: contactFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }
}
