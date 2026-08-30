import { useServerContent, type SyncedContent } from './index'

/**
 * Fetches the live content file the panel publishes, before the app is imported.
 *
 * The order matters and is the reason this is a separate module. Every data
 * module in `src/data/` reads its content at module scope:
 *
 *   export const rooms: Room[] = content.rooms ?? shippedRooms
 *
 * which runs the moment the module is imported. So `main.tsx` awaits this
 * first and only then imports `App`, which pulls the data modules in behind it.
 * Do it the other way round and the app would render the bundled copy and the
 * fetch would arrive too late to matter.
 *
 * Keeping that order is what lets the whole site stay synchronous. Not one
 * component knows any of this happened, and none of them has a loading state.
 *
 * Failure is expected and handled quietly: a local `npm run dev` has no file to
 * fetch, and the site simply uses the copy compiled into the bundle. Nothing is
 * logged as an error, because none of it is one.
 */

/** Same origin, so this is Apache reading a file off its own disk. Not Supabase. */
const CONTENT_URL = '/content.json'

/** The site should not sit on a blank screen because a static file is slow. */
const TIMEOUT_MS = 3000

export async function loadServerContent() {
  try {
    const response = await fetch(CONTENT_URL, {
      // The published file changes whenever the desk presses Publish, so it is
      // revalidated rather than trusted from cache. Apache answers 304 when it
      // has not moved, which costs a header and no body.
      cache: 'no-cache',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!response.ok) return

    const payload = (await response.json()) as SyncedContent

    // A file that is present but empty, truncated by a failed write, or simply
    // not this site's, must not be allowed to blank the page.
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.rooms)) return
    if (payload.rooms.length === 0) return

    useServerContent(payload)
  } catch {
    // No file, offline, a timeout, malformed JSON. The bundled copy stands.
  }
}
