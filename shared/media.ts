/**
 * A picture, and the words that describe it.
 *
 * Every image on the site used to be a bare string - an Unsplash id or an
 * uploaded URL - and the description, where there was one, was either absent or
 * derived from something nearby (a room's name, a shot's caption). That is
 * fine until somebody wants to write a real one, and there is nowhere to put
 * it. So an image is a pair now, and the panel asks for both together.
 *
 * ## Old values keep working
 *
 * `picture()` and `pictures()` take either shape. That matters more than it
 * looks: the Home and About documents are jsonb that the site deep-merges over
 * its shipped defaults, so a document saved before this existed still holds
 * plain strings, and will until somebody edits that section. Normalising on
 * read means no backfill, no migration for those, and no half-updated document
 * rendering blank. Rooms are converted properly, because they are a column with
 * a type rather than a document.
 *
 * ## An empty alt is an answer
 *
 * `alt` is optional and empty is meaningful - a photograph that only sets a
 * mood should reach the browser as `alt=""`, not as a sentence a screen reader
 * has to read out before the content. So nothing here invents a description;
 * where the site wants a sensible default it passes its own, and where it
 * wants the image to be silent it passes nothing.
 */

export interface Picture {
  src: string
  /** Absent or empty means decorative - the image renders with `alt=""`. */
  alt?: string
}

/** Either shape, as it may arrive from a jsonb document or an older row. */
export type PictureLike = string | Picture | null | undefined

/** One picture, from whichever shape. A missing `src` yields an empty one. */
export function picture(value: PictureLike): Picture {
  if (typeof value === 'string') return { src: value }
  if (value && typeof value === 'object' && typeof value.src === 'string') {
    const alt = typeof value.alt === 'string' ? value.alt.trim() : ''
    return alt ? { src: value.src, alt } : { src: value.src }
  }
  return { src: '' }
}

/** A list of pictures, from whichever shape, with the empty ones dropped. */
export function pictures(value: readonly PictureLike[] | null | undefined): Picture[] {
  if (!Array.isArray(value)) return []
  return value.map(picture).filter((item) => item.src)
}

/**
 * The alt to render, given the desk's description and a fallback.
 *
 * Call it with a fallback only where one is genuinely better than silence - a
 * room's photograph in a listing, say, where the card's own heading is not
 * beside it. Called with nothing, an undescribed image stays decorative, which
 * is the correct default and the one this returns.
 */
export function altOf(value: Picture | undefined, fallback = ''): string {
  return value?.alt?.trim() || fallback
}
