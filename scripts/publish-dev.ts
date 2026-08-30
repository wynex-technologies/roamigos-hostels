import { copyFileSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Connect, Plugin } from 'vite'

/**
 * `/api/publish.php`, in development.
 *
 * Publish posts the finished content file to that path. Live, Apache runs the
 * PHP in `hostinger/api/publish.php` and it lands next to `index.html`. In
 * `npm run dev` there is no PHP and no such file, so the request fell through
 * to Vite's own 404 and the panel reported "Publish failed (404)" - a failure
 * of the setup rather than of the publish, which was impossible to tell apart
 * from the real thing.
 *
 * This answers that path with the same contract as the PHP: the same two auth
 * checks, the same refusal to publish a listing with no rooms, the same atomic
 * write with a `.bak` of what was live. It writes to `public/content.json`,
 * which Vite serves at `/content.json` - exactly where `bootstrap.ts` looks.
 *
 * So Publish works end to end locally and a broken token, a missing allowlist
 * row or an empty Rooms page shows up here rather than the first time somebody
 * presses the button on the live site.
 *
 * Development only (`apply: 'serve'`). It never reaches a build, and the file
 * it writes is gitignored.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = resolve(root, 'public/content.json')

/** The project's URL and anon key live in the panel's env, which is the app
    that talks to Supabase. Both are public; neither grants anything alone. */
function readAdminEnv() {
  const file = resolve(root, 'admin/.env')
  if (!existsSync(file)) return {}

  const out: Record<string, string> = {}
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (match) out[match[1]] = match[2].trim().replace(/^["']|["']$/g, '')
  }
  return out
}

/**
 * Starts reading the body immediately and hands back a promise for it.
 *
 * Called before the two auth round-trips rather than after, even though the
 * body is not wanted until they pass. A request stream that nothing is
 * listening to stays paused, so awaiting it later would normally be fine - but
 * it only takes one middleware upstream calling `resume()` for `end` to fire
 * into a listener that has not been attached yet, and a Publish that hangs
 * forever is a horrible way to find that out.
 */
function readBody(request: Connect.IncomingMessage) {
  return new Promise<string>((done, fail) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
      // Same ceiling as the PHP, so a payload that would be refused live is
      // refused here too rather than buffering without limit.
      if (body.length > 4 * 1024 * 1024) fail(new Error('Content is unexpectedly large.'))
    })
    request.on('end', () => done(body))
    request.on('error', fail)
  })
}

export function publishDev(): Plugin {
  return {
    name: 'roamigos-publish-dev',
    apply: 'serve',

    configureServer(server) {
      const env = readAdminEnv()
      const url = process.env.VITE_SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? ''
      const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY ?? ''

      server.middlewares.use('/api/publish.php', (request, response, next) => {
        const send = (status: number, body: unknown) => {
          response.statusCode = status
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify(body))
        }

        if (request.method === 'OPTIONS') {
          response.statusCode = 204
          response.end()
          return
        }
        if (request.method !== 'POST') return next()

        // Buffered from here, awaited after the checks below pass.
        const body = readBody(request)
        // Nothing else handles this rejection if auth refuses first.
        body.catch(() => {})

        void (async () => {
          try {
            if (!url || !anonKey) {
              return send(500, {
                error: 'admin/.env has no VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, so the dev publisher cannot check who you are.',
              })
            }

            const auth = /^Bearer\s+(.+)$/i.exec((request.headers.authorization ?? '').trim())
            if (!auth) return send(401, { error: 'Not signed in.' })
            const token = auth[1]

            const ask = (path: string) =>
              fetch(`${url}${path}`, {
                headers: {
                  apikey: anonKey,
                  Authorization: `Bearer ${token}`,
                  Accept: 'application/json',
                },
              })

            // 1. A real, unexpired session.
            const who = await ask('/auth/v1/user')
            if (!who.ok) return send(401, { error: 'Session expired. Sign in again.' })
            const user = (await who.json()) as { id?: string }
            if (!user.id) return send(401, { error: 'Session expired. Sign in again.' })

            // 2. On the allowlist - asked with the caller's own token, so the
            //    database answers under the same rules the panel runs under.
            const allowed = await ask(
              `/rest/v1/admin_users?select=id&id=eq.${encodeURIComponent(user.id)}`,
            )
            const rows = allowed.ok ? ((await allowed.json()) as unknown[]) : []
            if (!Array.isArray(rows) || rows.length === 0) {
              return send(403, { error: 'Not an admin.' })
            }

            const raw = await body
            if (!raw) return send(400, { error: 'Empty body.' })

            let payload: Record<string, unknown>
            try {
              payload = JSON.parse(raw)
            } catch {
              return send(400, { error: 'Body is not JSON.' })
            }

            if (!Array.isArray(payload.rooms) || payload.rooms.length === 0) {
              return send(400, { error: 'Refusing to publish content with no rooms.' })
            }

            // Temp file then rename, because rename is atomic on one filesystem:
            // a request mid-flight gets the whole old file or the whole new one.
            const temp = `${TARGET}.${randomBytes(4).toString('hex')}.tmp`
            const encoded = JSON.stringify(payload)
            writeFileSync(temp, encoded, 'utf8')
            if (existsSync(TARGET)) copyFileSync(TARGET, `${TARGET}.bak`)
            renameSync(temp, TARGET)

            server.config.logger.info(
              `  [publish] public/content.json written - ${payload.rooms.length} rooms, ${encoded.length} bytes`,
            )

            send(200, {
              ok: true,
              publishedAt: new Date().toISOString(),
              rooms: payload.rooms.length,
              bytes: encoded.length,
            })
          } catch (error) {
            send(500, { error: error instanceof Error ? error.message : 'Publish failed.' })
          }
        })()
      })
    },
  }
}
