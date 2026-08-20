/**
 * All photography is served straight from Unsplash's CDN, which resizes and
 * re-encodes on the fly - so we ask for exactly the width each slot renders at
 * instead of shipping one oversized file everywhere.
 */
const BASE = 'https://images.unsplash.com/'

/**
 * Anything the admin panel uploads arrives as a finished URL (or a site-relative
 * path) rather than an Unsplash id, and must be handed to the browser untouched -
 * there is no resizer in front of it.
 */
export const isDirectSrc = (id: string) => /^(https?:)?\/\//.test(id) || id.startsWith('/')

export function photo(id: string, width = 1200, height?: number) {
  if (isDirectSrc(id)) return id
  const params = new URLSearchParams({
    auto: 'format',
    fit: 'crop',
    w: String(width),
    q: '80',
  })
  if (height) params.set('h', String(height))
  return `${BASE}${id}?${params}`
}

/** `srcset` for a slot, so phones don't download the desktop-sized file. */
export function photoSet(id: string, widths: number[] = [640, 960, 1400, 1920]) {
  if (isDirectSrc(id)) return undefined
  return widths.map((w) => `${photo(id, w)} ${w}w`).join(', ')
}
