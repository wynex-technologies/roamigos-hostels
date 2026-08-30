/**
 * The shapes the panel reads and writes, and the column lists it reads them
 * with.
 *
 * Every query in the panel names its columns. `select('*')` is never used, and
 * that is a rule rather than a style preference: a rooms list that only prints
 * a name and a price has no reason to pull six paragraphs of description and
 * five image URLs per row across the wire every time somebody opens the page.
 * On a desk machine left open all day that difference is the whole egress
 * budget. Lists take the short column set; the full row is fetched once, when a
 * single record is actually opened for editing.
 */

export type Status = 'new' | 'confirmed' | 'cancelled' | 'stayed'
export type EnquiryStatus = 'new' | 'answered' | 'closed'

export interface RoomRow {
  id: number
  slug: string
  name: string
  categories: string[]
  badge: string | null
  capacity: number
  capacity_label: string
  bathroom: string
  short_description: string
  subtitle: string
  price_per_night: number
  rating: number
  review_count: number
  highlights: string[]
  about: string
  inclusions: string[]
  amenities: string[]
  images: string[]
  total_photos: number
  max_guests_note: string
  sort_order: number
  published: boolean
}

export interface BlogRow {
  id: number
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  published_on: string
  read_time: string
  image: string
  featured: boolean
  facts: { label: string; value: string }[]
  /** The article, in the site's markdown subset. Empty means card only. */
  body: string
  sort_order: number
  published: boolean
}

export interface OfferRow {
  id: number
  name: string
  active: boolean
  eyebrow: string
  headline: string
  headline_accent: string | null
  badge_value: string | null
  badge_label: string | null
  description: string
  code: string | null
  discount_percent: number
  image: string
  image_alt: string
  perks: string[]
  cta_label: string
  cta_href: string
  note: string | null
  expires_on: string | null
  delay_ms: number
}

/**
 * A discount code the booking form accepts, separate from the campaign's own.
 * The site never receives these as a list - see `Coupons.tsx`.
 */
export interface CouponRow {
  id: number
  code: string
  percent: number
  label: string | null
  active: boolean
  starts_on: string | null
  expires_on: string | null
}

export interface FaqRow {
  id: number
  question: string
  answer: string
  sort_order: number
  published: boolean
}

export interface SettingsRow {
  id: number
  whatsapp_number: string
  phone_display: string
  email: string
  address_line1: string
  address_line2: string
  address_line3: string
  coords: string
  map_url: string
  check_in: string
  check_out: string
  stat_guests: string
  stat_rating: number
  stat_reviews: number
  socials: { label: string; href: string; icon: string; handle: string }[]
}

export interface BookingRow {
  id: string
  room_slug: string | null
  room_name: string | null
  guest_name: string
  guest_phone: string
  guest_email: string
  check_in: string | null
  check_out: string | null
  nights: number
  guests: number
  coupon_code: string | null
  coupon_percent: number
  subtotal: number
  discount: number
  total: number
  note: string | null
  status: Status
  admin_note: string | null
  created_at: string
}

export interface EnquiryRow {
  id: string
  /** Null for a chat somebody opened from a WhatsApp button - the name and the
      number arrive in the chat itself. The contact form always has both. */
  name: string | null
  phone: string | null
  topic: string
  /** Which button and page a nameless row came from. Null for the form. */
  source: string | null
  check_in: string | null
  check_out: string | null
  guests: string | null
  message: string | null
  status: EnquiryStatus
  admin_note: string | null
  created_at: string
}

/** Short sets for lists, full sets for the one record being edited. */
export const COLUMNS = {
  roomsList: 'id,slug,name,price_per_night,capacity_label,categories,published,sort_order',
  room:
    'id,slug,name,categories,badge,capacity,capacity_label,bathroom,short_description,subtitle,' +
    'price_per_night,rating,review_count,highlights,about,inclusions,amenities,images,' +
    'total_photos,max_guests_note,sort_order,published',
  // `body` is a whole article per row, so it is deliberately not in the list
  // set - the list prints titles. `has_body` is not a column, so whether a post
  // has a page is answered when the row is opened, not on every list load.
  blogList: 'id,slug,title,category,author,published_on,featured,published,sort_order',
  blog:
    'id,slug,title,excerpt,category,author,published_on,read_time,image,featured,facts,body,' +
    'sort_order,published',
  offer:
    'id,name,active,eyebrow,headline,headline_accent,badge_value,badge_label,description,code,' +
    'discount_percent,image,image_alt,perks,cta_label,cta_href,note,expires_on,delay_ms',
  faq: 'id,question,answer,sort_order,published',
  coupon: 'id,code,percent,label,active,starts_on,expires_on',
  settings:
    'id,whatsapp_number,phone_display,email,address_line1,address_line2,address_line3,coords,' +
    'map_url,check_in,check_out,stat_guests,stat_rating,stat_reviews,socials',
  booking:
    'id,room_slug,room_name,guest_name,guest_phone,guest_email,check_in,check_out,nights,guests,' +
    'coupon_code,coupon_percent,subtotal,discount,total,note,status,admin_note,created_at',
  enquiry:
    'id,name,phone,topic,source,check_in,check_out,guests,message,status,admin_note,created_at',
} as const

/** How many rows a list asks for at a time. */
export const PAGE_SIZE = 25

export const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/**
 * Today, as `YYYY-MM-DD`, in the desk's own timezone.
 *
 * `new Date().toISOString()` is UTC, and India is five and a half hours ahead
 * of it - so between midnight and half past five in the morning that returns
 * yesterday. On a date input that is a `min` in the past and a default that is
 * off by a day, and on a coupon it is a code that quietly stops being valid
 * several hours early. Local parts, always.
 */
export function isoDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function formatDate(iso: string | null) {
  if (!iso) return '-'
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** `a, b , ,c` to `['a','b','c']`. What every list field in the panel takes. */
export const toList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)

export const fromList = (value: string[] | null) => (value ?? []).join('\n')
