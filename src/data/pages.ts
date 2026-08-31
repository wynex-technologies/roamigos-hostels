/**
 * The Home and About pages, as the site renders them.
 *
 * Every other data module here describes a list of things - rooms, posts,
 * reviews. This one describes two *pages*: the eyebrow over a section, the two
 * lines of its heading, the paragraph beside it and the photographs in it. The
 * front desk can change all of that from the panel without a deploy, and none
 * of it touches how a page is laid out.
 *
 * The shape and the shipped copy live in `shared/page-content.ts`, because the
 * panel edits the same document and the two must never disagree - the same
 * reason `shared/content-shape.ts` exists. This file is only the last step: it
 * puts whatever was published over those defaults and hands the result to the
 * components.
 *
 * Which arrives the way all the site's content does - through `content.json`,
 * baked into the bundle at build and refreshed on Publish. A visitor never
 * queries Supabase for any of it, and nothing here is async, so no component on
 * these two pages gained a loading state.
 */

import {
  ABOUT_DEFAULTS,
  HOME_DEFAULTS,
  mergePage,
  type AboutContent,
  type HomeContent,
  type ShowcaseEntry,
} from '@shared/page-content'
import { content } from '@/data/generated'
import { aboutFacts } from '@/data/about'

export type {
  AboutContent,
  Banner,
  GalleryAlbum,
  GalleryShot,
  HomeContent,
  ShowcaseEntry,
  SplitHeading,
} from '@shared/page-content'

const publishedPages = (content.pages ?? {}) as Record<string, unknown>

export const homePage: HomeContent = mergePage(HOME_DEFAULTS, publishedPages.home)
export const aboutPage: AboutContent = mergePage(ABOUT_DEFAULTS, publishedPages.about)

/** The full deck the destinations carousel rotates: places first, then offers. */
export const showcaseDeck: ShowcaseEntry[] = [
  ...homePage.destinations.cards,
  ...homePage.destinations.promos,
]

/**
 * The colophon strip closing the About panel.
 *
 * Deliberately *not* part of the editable document: every figure in it is
 * derived from the room list and the settings row, so the page cannot drift
 * away from the footer and the homepage. A room added in the panel changes the
 * count here without anybody having to remember to.
 */
export { aboutFacts as aboutPageFacts }
