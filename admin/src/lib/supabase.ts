import { createClient } from '@supabase/supabase-js'

/**
 * The panel's connection.
 *
 * This bundle is public - anyone who opens the panel's URL can read it - so the
 * key in it is the anon key, which on this project can do nothing at all. Every
 * table is closed to `anon` by RLS, and each policy additionally requires the
 * caller to be a row in `admin_users`. Signing in is what grants access; the
 * key by itself grants none.
 *
 * Realtime is deliberately unused throughout the panel. An open socket streams
 * every change to every table it is watching for as long as a tab is left open,
 * which on a desk machine means all day, and that traffic is billed like any
 * other. The lists here fetch when they are opened and when you ask them to.
 */
export const url = import.meta.env.VITE_SUPABASE_URL as string
export const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const isConfigured = Boolean(url && anonKey)

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // The desk signs in once and stays signed in on its own machine.
    storageKey: 'roamigos-admin-auth',
  },
  global: { headers: { 'x-client-info': 'roamigos-admin' } },
})

/** Where the edge functions live, derived from the project URL. */
export const functionsBase = url ? url.replace('.supabase.co', '.functions.supabase.co') : ''
