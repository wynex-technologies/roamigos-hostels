import { useCallback, useState } from 'react'
import { CONTENT_KEYS, QUERIES, isEmpty, shape } from '@shared/content-shape'
import { anonKey, supabase, url } from './supabase'

type State = 'idle' | 'working' | 'done' | 'error'

/**
 * Publishing, without a build pipeline.
 *
 * The site is static files on Hostinger and there is nothing to trigger a
 * rebuild, so Publish does the job directly: the panel reads the content it is
 * allowed to read, shapes it exactly the way the build would have, and posts
 * the finished file to `api/publish.php`, which writes it next to `index.html`.
 * The site fetches that file when it boots, so an edit is live on the next page
 * load - nothing rebuilt, nothing re-uploaded.
 *
 * Two things about this are deliberate.
 *
 * The **panel** reads the rows, not the PHP. It is signed in and every read is
 * already governed by the same access rules as the rest of the panel, which
 * means the server needs no service_role key at all - there is no privileged
 * credential sitting in a PHP file on shared hosting. The PHP only checks that
 * whoever posted is an admin, and writes the bytes.
 *
 * The **shape** comes from `shared/content-shape.ts`, the same module
 * `scripts/sync-content.ts` uses. If the two ever disagreed, Publish would
 * quietly reshape the site into something no build had produced, and it would
 * only show up in production and only after somebody made an edit.
 */

/** Same origin in production, because the panel is served from /admin on the
    site's own domain. Set it in `.env` to develop against a live server. */
const ENDPOINT = (import.meta.env.VITE_PUBLISH_ENDPOINT as string) || '/api/publish.php'

export function usePublish() {
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')

  const publish = useCallback(async () => {
    setState('working')
    setMessage('')

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('Session expired. Sign in again.')

      // Read every slice, shaped the way the site expects it.
      //
      // These go straight to PostgREST with the query strings from
      // `content-shape.ts`, verbatim. Rebuilding them through the client's
      // query builder would mean re-expressing `published=is.true`,
      // `room_id=is.null` and every `order` by hand - and the first one of
      // those quietly dropped would publish hidden rooms to the live site.
      const rows = await Promise.all(
        CONTENT_KEYS.map(async (key) => {
          const response = await fetch(`${url}/rest/v1/${QUERIES[key]}`, {
            headers: { apikey: anonKey, Authorization: `Bearer ${token}`, Accept: 'application/json' },
          })

          if (!response.ok) {
            throw new Error(`${key}: ${response.status} ${await response.text()}`)
          }

          return [key, shape[key](await response.json())] as const
        }),
      )

      const payload: Record<string, unknown> = { syncedAt: new Date().toISOString() }
      for (const [key, value] of rows) {
        // An empty table means "not filled in yet". Publishing the emptiness
        // through would blank a page on the live site.
        if (!isEmpty(value)) payload[key] = value
      }

      if (!Array.isArray(payload.rooms) || payload.rooms.length === 0) {
        throw new Error('No published rooms to publish. Check the Rooms page.')
      }

      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error ?? `Publish failed (${response.status}).`)
      }

      setState('done')
      setMessage('Live now. Reload the site to see it.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Publish failed.')
    }

    // A status line, not a dialog - it clears itself.
    setTimeout(() => {
      setState('idle')
      setMessage('')
    }, 8000)
  }, [])

  return { publish, state, message }
}
