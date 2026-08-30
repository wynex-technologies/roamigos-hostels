/**
 * Share cards and canonical links.
 *
 * Two crawlers read this site and they do not read it the same way. Google
 * renders the page, so anything React writes into `<head>` reaches it. The
 * social crawlers - WhatsApp, Facebook, Instagram, X - do not run JavaScript
 * at all: they take whatever `index.html` shipped and stop. That file therefore
 * carries a full set of defaults, and everything below only refines them for a
 * search engine that got as far as running the app.
 */
import { site } from '@/data/site'
import { photo, isDirectSrc } from './images'

/** 1200x630 is the one crop every social card reader agrees on. */
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

/** A site path (`/rooms`) as the absolute URL a crawler has to be handed. */
export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * An Unsplash id, an uploaded file or a site-relative path, resolved to the
 * absolute 1200x630 URL a share card needs. Relative paths are made absolute
 * because a crawler resolves `og:image` against nothing.
 */
export function shareImage(id: string = site.ogImage) {
  if (isDirectSrc(id)) return id.startsWith('/') ? absoluteUrl(id) : id
  return photo(id, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT)
}

/** Upserts `<meta name="...">` or `<meta property="...">` in the head. */
export function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', value)
}

/** Upserts `<link rel="canonical">`. */
export function setCanonical(url: string) {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!tag) {
    tag = document.createElement('link')
    tag.rel = 'canonical'
    document.head.appendChild(tag)
  }
  tag.href = url
}
