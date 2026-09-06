import { useCallback, useState } from 'react'
import { CONTENT_KEYS, QUERIES, isEmpty, shape } from '@shared/content-shape'
import { anonKey, functionsBase, supabase, url } from './supabase'

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

/**
 * What Publish means here, because it is not the same on every host.
 *
 * `file` - Hostinger, and the default. The panel posts the finished content
 * file to `api/publish.php`, which writes it beside `index.html`. The site
 * picks it up on its next boot, so an edit is live immediately and nothing is
 * rebuilt. This is what the panel was designed around.
 *
 * `redeploy` - Vercel, and anywhere else that builds. There is no PHP and no
 * writable disk, so the file cannot be written in place; a publish there is a
 * fresh build, whose `prebuild` pulls the same rows into the bundle. The panel
 * asks the `publish` edge function to trigger it, because the deploy hook is a
 * secret and must not be compiled into this bundle.
 *
 * The difference the desk sees is honest: one is live now, the other is live
 * when the build finishes.
 */
const MODE = (import.meta.env.VITE_PUBLISH_MODE as string) === 'redeploy' ? 'redeploy' : 'file'

/** Same origin in production, because the panel is served from /admin on the
    site's own domain. Set it in `.env` to develop against a live server. */
const ENDPOINT =
  (import.meta.env.VITE_PUBLISH_ENDPOINT as string) ||
  (MODE === 'redeploy' ? `${functionsBase}/publish` : '/api/publish.php')

/** What a failing publish means, in words the desk can act on. */
const REASONS: Record<number, string> = {
  401: 'Session expired. Sign in again.',
  403: 'This account is not an admin on this project.',
  501: 'No deploy hook is configured on the server, so there is nothing to rebuild.',
  502: 'The deploy hook refused the request. Check it is still valid in Vercel.',
}

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

      // The rows above are read in both modes, because reading them is what
      // catches "no published rooms" before anything is published. In redeploy
      // mode the payload itself is not sent - the build reads the same rows
      // again on the server - so there is nothing to put in the body.
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers:
          MODE === 'redeploy'
            ? { Authorization: `Bearer ${token}` }
            : { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(MODE === 'redeploy' ? {} : { body: JSON.stringify(payload) }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error ?? REASONS[response.status] ?? `Publish failed (${response.status}).`)
      }

      setState('done')
      setMessage(
        MODE === 'redeploy'
          ? 'Rebuilding the site. It goes live in a minute or two.'
          : 'Live now. Reload the site to see it.',
      )
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
