import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'
import { preflight } from '../_shared/http.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)

Deno.serve(async (request) => {
  const cors = preflight(request)
  if (cors) return cors

  if (!['POST', 'DELETE', 'PATCH'].includes(request.method)) {
    return new Response('Method not allowed', { status: 405 })
  }

  const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: auth, error: authError } = await supabase.auth.getUser(token)
  if (authError || !auth.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('id', auth.user.id)
    .single()

  if (!admin || admin.role !== 'owner') {
    return new Response('Forbidden: Only owners can manage users.', { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  if (request.method === 'POST') {
    const { email, password, fullName, tabs } = body
    if (!email || !password) {
      return new Response('Email and password required', { status: 400 })
    }

    // 1. Create auth user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (createError) {
      return new Response(createError.message, { status: 400 })
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
      return new Response('Failed to add to allowlist: ' + insertError.message, { status: 500 })
    }

    return new Response(JSON.stringify({ success: true, user: newUser.user }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (request.method === 'DELETE') {
    const { id } = body
    if (!id) return new Response('User ID required', { status: 400 })
    if (id === auth.user.id) return new Response('Cannot delete yourself', { status: 400 })

    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) return new Response(error.message, { status: 400 })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (request.method === 'PATCH') {
    const { id, password } = body
    if (!id || !password) return new Response('User ID and password required', { status: 400 })

    const { error } = await supabase.auth.admin.updateUserById(id, { password })
    if (error) return new Response(error.message, { status: 400 })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response('Method not implemented', { status: 501 })
})
