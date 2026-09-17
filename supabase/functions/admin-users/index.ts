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

  if (request.method !== 'POST') {
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
    return new Response('Forbidden: Only owners can create users.', { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

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
})
