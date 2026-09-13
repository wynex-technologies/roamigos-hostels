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
 * Realtime is used in exactly one place and nowhere else: `lib/notifications.tsx`
 * watches `bookings` and `enquiries` for inserts, so the desk is told when a
 * guest is waiting rather than having to remember to press Refresh. Two tables,
 * one event each, which is a handful of messages a day.
 *
 * Everything else here still fetches when a screen is opened and when you ask
 * it to, and that is the rule rather than an accident. An open socket streams
 * every change to every table it is watching for as long as a tab is left open,
 * which on a desk machine means all day, and that traffic is billed like any
 * other - so a second `.channel()` anywhere in the panel needs the same
 * argument this one has: that nobody can go and look for the thing in time.
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
