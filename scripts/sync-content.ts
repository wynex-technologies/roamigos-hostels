/**
 * Pulls the site's content out of Supabase into `src/data/generated/content.json`
 * at build time.
 *
 * On Hostinger this file is the **fallback**, not the live copy. The live one is
 * `content.json` sitting next to `index.html` on the server, which the site
 * fetches when it boots and which `api/publish.php` rewrites every time somebody
 * presses Publish. This baked copy is what the site falls back to when that
 * fetch fails - a half-uploaded server, a file deleted by accident - so the site
 * renders real rooms rather than nothing.
 *
 * Either way, no visitor ever queries Supabase. The rows travel once per build
 * and once per publish, and that is the whole egress strategy.
 *
 * It never breaks a build:
 *
 *   - no credentials (a fresh clone, a fork) -> keeps what is already there
 *   - Supabase unreachable, or a table still empty -> that slice is left alone
 *
 * The mapping lives in `shared/content-shape.ts` because the Publish button
 * uses the same one. Do not copy it back in here.
 *
 * The keys it reads are deliberately NOT prefixed `VITE_`: a `VITE_` variable is
 * inlined into the browser bundle, and the service_role key must never be.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CONTENT_KEYS, QUERIES, isEmpty, shape } from '../shared/content-shape.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'src/data/generated/content.json')

const URL_BASE = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function query(path: string) {
  const response = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    headers: { apikey: KEY!, Authorization: `Bearer ${KEY}`, Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`${path.split('?')[0]}: ${response.status} ${await response.text()}`)
  }
  return response.json()
}

async function main() {
  if (!URL_BASE || !KEY) {
    console.log(
      '[content] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set - building with the content in src/data/.',
    )
    return
  }

  const previous = JSON.parse(await readFile(OUT, 'utf8').catch(() => '{}'))
  const next: Record<string, unknown> = { syncedAt: new Date().toISOString() }

  const results = await Promise.allSettled(
    CONTENT_KEYS.map(async (key) => shape[key](await query(QUERIES[key]))),
  )

  for (const [index, result] of results.entries()) {
    const key = CONTENT_KEYS[index]

    if (result.status === 'rejected') {
      console.warn(`[content] ${key} failed, keeping what was there: ${result.reason.message}`)
      if (previous[key] !== undefined) next[key] = previous[key]
      continue
    }

    if (isEmpty(result.value)) {
      console.log(`[content] ${key} is empty in Supabase - keeping the shipped defaults.`)
      if (previous[key] !== undefined) next[key] = previous[key]
      continue
    }

    next[key] = result.value
    const value = result.value
    console.log(`[content] ${key}: ${Array.isArray(value) ? `${value.length} rows` : 'ok'}`)
  }

  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(OUT, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  console.log(`[content] wrote ${OUT}`)
}

main().catch((error) => {
  // Still not fatal. A build that cannot reach Supabase should ship the site it
  // already has rather than fail and leave the old one up.
  console.warn(`[content] sync skipped: ${error.message}`)
})
