/**
 * The two public endpoints are the only paths a visitor's browser is allowed to
 * touch, so what they share lives here: who may call them, and how the answer
 * is allowed to be cached.
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
