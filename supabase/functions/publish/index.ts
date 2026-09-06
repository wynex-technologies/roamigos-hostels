/**
 * Publish, on a platform that builds.
 *
 * On Hostinger there is nothing to rebuild: the panel shapes the content file
 * itself and `api/publish.php` writes it next to `index.html`. That is why
 * there was no publish function - and on that deployment there still is none.
 *
 * Vercel is the other kind of host. There is no PHP and no writable disk, so
 * the file cannot be written in place; what a publish means there is a fresh
 * build, because `prebuild` runs `sync-content.ts` and pulls the same rows into
 * the bundle. Triggering that needs a Vercel deploy hook.
 *
 * The hook is why this function exists rather than the panel calling Vercel
 * directly. A deploy hook URL is a bare secret - whoever has it can start a
 * build - and a `VITE_` variable is compiled into the bundle every visitor of
 * /admin can read. So the hook stays here, in the project's secrets, and the
 * panel has to prove it is an admin to reach it. That is the same shape as
 * `publish.php`: the caller proves who they are, the server does the
 * privileged part.
 *
 * Being an admin means the same thing it means everywhere else in the panel -
 * a row in `admin_users`. Signing in is not enough on its own.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'
import { empty, preflight } from '../_shared/http.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)

/** The Vercel deploy hook. Unset, this answers 501 and the panel says so. */
const HOOK = Deno.env.get('VERCEL_DEPLOY_HOOK')

Deno.serve(async (request) => {
  const cors = preflight(request)
  if (cors) return cors

  if (request.method !== 'POST') return empty(request, 405)

  // The panel sends the signed-in user's access token, the same one it uses to
  // read the rows. `getUser` validates the signature and expiry; a token that
  // is forged, expired or simply the anon key does not resolve to a user.
  const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) return empty(request, 401)

  const { data: auth, error: authError } = await supabase.auth.getUser(token)
  if (authError || !auth.user) return empty(request, 401)

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', auth.user.id)
    .limit(1)

  if (!admin?.length) return empty(request, 403)

  // Configured last, so a project without a hook says "not configured" to an
  // admin rather than "forbidden" to everybody.
  if (!HOOK) return empty(request, 501)

  const response = await fetch(HOOK, { method: 'POST' })

  // 202: accepted, the build is somebody else's problem now. The panel says a
  // rebuild is running rather than claiming the change is already live, because
  // it is not - it is live when the build finishes.
  return empty(request, response.ok ? 202 : 502)
})
