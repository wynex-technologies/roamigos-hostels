/**
 * Team members, managed from the panel's Users screen: invite one, remove one,
 * reset one's password.
 *
 * Creating and deleting an auth user needs the service_role key, which is why
 * this is a function and not a table write - the panel never holds that key.
 * It proves who it is instead: the signed-in user's access token comes up with
 * the request, has to resolve to a real user, and that user has to be a row in
 * `admin_users` with role `owner`. An editor gets 403 even though the panel
 * does not draw them the screen.
 *
 * Every reply goes out through `json` / `text`, which put the CORS headers on
 * it. That matters more here than it looks: a cross-origin reply the browser
 * will not read is indistinguishable from the network being down, so a reply
 * without those headers reaches the panel as `Failed to fetch` - the created
 * user and the deleted one included, after the work was already done.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'
import { json, preflight, text } from '../_shared/http.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)

Deno.serve(async (request) => {
  const cors = preflight(request)
  if (cors) return cors

  if (!['POST', 'DELETE', 'PATCH'].includes(request.method)) {
    return text(request, 'Method not allowed', 405)
  }

  const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) {
    return text(request, 'Unauthorized', 401)
  }

  const { data: auth, error: authError } = await supabase.auth.getUser(token)
  if (authError || !auth.user) {
    return text(request, 'Unauthorized', 401)
  }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('id', auth.user.id)
    .single()

  if (!admin || admin.role !== 'owner') {
    return text(request, 'Forbidden: Only owners can manage users.', 403)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return text(request, 'Bad request', 400)
  }

  if (request.method === 'POST') {
    const { email, password, fullName, tabs } = body
    if (!email || !password) {
      return text(request, 'Email and password required', 400)
    }

    // 1. Create auth user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (createError) {
      return text(request, createError.message, 400)
    }

    // 2. Add to admin_users allowlist
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: newUser.user.id,
        email,
        full_name: fullName || null,
        role: 'editor',
        tabs: tabs || []
      })

    if (insertError) {
      // Attempt rollback
      await supabase.auth.admin.deleteUser(newUser.user.id)
      return text(request, 'Failed to add to allowlist: ' + insertError.message, 500)
    }

    return json(request, { success: true, user: newUser.user }, { status: 201 })
  }

  if (request.method === 'DELETE') {
    const { id } = body
    if (!id) return text(request, 'User ID required', 400)
    if (id === auth.user.id) return text(request, 'Cannot delete yourself', 400)

    // The `admin_users` row goes with it: its primary key references
    // `auth.users (id) on delete cascade`, so the allowlist cannot be left
    // holding a member who no longer has an account to sign in with.
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) return text(request, error.message, 400)

    return json(request, { success: true })
  }

  if (request.method === 'PATCH') {
    const { id, password, tabs } = body
    if (!id) return text(request, 'User ID required', 400)

    // Which tabs a member can see.
    //
    // This goes through the function rather than straight to the table, and it
    // has to: `admin_users` has a read policy and no write policy at all, by
    // design - the allowlist is the one table the panel cannot edit, so nobody
    // can promote themselves through the panel they are signed into. A write
    // from the browser is not refused loudly, it simply matches no rows and
    // reports success, which is what made the checkbox look like it saved and
    // come back unticked on the next load.
    //
    // Only `tabs` is written here. `role`, `id` and `email` are not touched, so
    // this cannot be turned into a way to make somebody an owner.
    if (tabs !== undefined) {
      if (!Array.isArray(tabs) || tabs.some((tab) => typeof tab !== 'string')) {
        return text(request, 'Tabs must be a list of names', 400)
      }
      // Cap it. The labels are short and there are fewer than a dozen of them,
      // so anything past this is not a tab list.
      const clean = [...new Set(tabs as string[])].slice(0, 30).map((tab) => tab.slice(0, 60))

      const { error } = await supabase.from('admin_users').update({ tabs: clean }).eq('id', id)
      if (error) return text(request, error.message, 400)

      return json(request, { success: true, tabs: clean })
    }

    if (!password) return text(request, 'A password or a tab list is required', 400)

    const { error } = await supabase.auth.admin.updateUserById(id, { password })
    if (error) return text(request, error.message, 400)

    return json(request, { success: true })
  }

  return text(request, 'Method not implemented', 501)
})
