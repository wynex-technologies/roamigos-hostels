/**
 * The public endpoints are the only paths a visitor's browser is allowed to
 * touch, so what they share lives here: who may call them, and how the answer
 * is allowed to be cached.
 *
 * Every reply a browser is meant to read has to carry these headers - not just
 * the preflight. `json`, `empty` and `text` below exist so that no handler has
 * to remember it.
 */

/**
 * Origins allowed to call the functions. `ALLOWED_ORIGINS` is a comma separated
 * list set on the project (the live domain, plus any preview domain). Falling
 * back to `*` keeps a fresh project working before it is configured, but the
 * live one should always name its domains: an open list lets any page on the
 * internet post into the desk's inbox.
 */
const ALLOWED = (Deno.env.get('ALLOWED_ORIGINS') ?? '*')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') ?? ''
  const allow = ALLOWED.includes('*') ? '*' : ALLOWED.includes(origin) ? origin : ''

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey',
    // DELETE and PATCH are here for `admin-users`, which removes a member and
    // resets a password. A method missing from this list fails in the
    // preflight, before the function is ever reached - and a failed preflight
    // reaches the caller as `TypeError: Failed to fetch`, with no status and
    // no message, because there was no reply the browser was willing to read.
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function preflight(request: Request) {
  if (request.method !== 'OPTIONS') return null
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}

export function json(request: Request, body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers ?? {}),
    },
  })
}

export function empty(request: Request, status = 204) {
  return new Response(null, { status, headers: corsHeaders(request) })
}

/**
 * A plain-text reply, with the CORS headers on it.
 *
 * For a caller that reads the body with `res.text()` and shows it to somebody -
 * the panel's user management does exactly that. Answering with a bare
 * `new Response('Forbidden', { status: 403 })` looks right and is not: without
 * `Access-Control-Allow-Origin` the browser refuses the whole response, so the
 * caller sees `Failed to fetch` rather than the reason, on success as well as
 * on failure.
 */
export function text(request: Request, body: string, status = 200) {
  return new Response(body, {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

/** Trims, caps and rejects the empty string, so no unbounded text is stored. */
export function str(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

/** A whole number inside a range, or the floor when the input is nonsense. */
export function int(value: unknown, min: number, max: number): number {
  const parsed = Math.trunc(Number(value))
  if (!Number.isFinite(parsed)) return min
  return Math.min(Math.max(parsed, min), max)
}

/** `YYYY-MM-DD`, or null. Anything else would fail the column's date cast. */
export function date(value: unknown): string | null {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}
