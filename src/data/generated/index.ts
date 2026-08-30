/**
 * The content the site renders, and where it came from.
 *
 * There are two copies and the site prefers the fresher one:
 *
 *   1. `content.json` compiled into the bundle. Written at build time by
 *      `scripts/sync-content.ts`, committed empty so a fresh clone builds with
 *      no database, no credentials and no network.
 *   2. `/content.json` sitting on the server next to `index.html`. Rewritten by
 *      `api/publish.php` every time somebody presses Publish in the panel, and
 *      fetched once when the site boots.
 *
 * The second is what makes the panel useful without a deploy pipeline: an edit
 * is live as soon as Publish is pressed, with nothing rebuilt and nothing
 * re-uploaded. The first is what makes that safe - if the file is missing,
 * half-written or unreachable, the site renders the content it shipped with
 * rather than an empty page.
 *
 * Neither copy costs Supabase anything. The bundled one travelled at build
 * time; the server one is a static file served by Apache off the same disk as
 * the rest of the site. A visitor never queries the database.
 *
 * The store is filled by `bootstrap.ts` *before* the app is imported, which is
 * the whole trick: every data module still reads `content` synchronously at
 * module scope, so `rooms` is a plain `Room[]` and not one component on the
 * site gained a loading state.
 */
import baked from './content.json'
import type { Review, Room } from '../rooms'
import type { BlogPost } from '../blog'
import type { SiteSettings } from '../site'

export interface SyncedContent {
  /** When this copy was made. Absent in the committed placeholder. */
  syncedAt?: string
  rooms?: Room[]
  reviews?: Review[]
  blogPosts?: BlogPost[]
  faqs?: { q: string; a: string }[]
  settings?: SiteSettings
}

/**
 * Live if the boot fetch found one, baked otherwise.
 *
 * `let` rather than `const` because `bootstrap.ts` replaces it before the data
 * modules are ever imported. Nothing else may reassign it.
 */
let current = baked as SyncedContent

/** Called only by `bootstrap.ts`, only once, only before the app is imported. */
export function useServerContent(next: SyncedContent) {
  current = next
}

/**
 * The accessor every data module goes through.
 *
 * A getter rather than the object itself, so the modules read whatever the
 * bootstrap settled on rather than capturing the baked copy at import time.
 */
export const content = {
  get rooms() {
    return current.rooms
  },
  get reviews() {
    return current.reviews
  },
  get blogPosts() {
    return current.blogPosts
  },
  get faqs() {
    return current.faqs
  },
  get settings() {
    return current.settings
  },
  get syncedAt() {
    return current.syncedAt
  },
}
