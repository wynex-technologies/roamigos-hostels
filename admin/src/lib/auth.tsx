import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface Admin {
  id: string
  email: string
  fullName: string | null
  /**
   * The person's designation, free text. `'owner'` is the one value that
   * grants anything - full access and the Users screen. Every other value is a
   * label, and what that person sees comes from `tabs`, so a job title nobody
   * has taught the panel about is the locked-down case rather than the open
   * one.
   */
  role: string
  tabs: string[]
}

interface AuthValue {
  session: Session | null
  admin: Admin | null
  /** True until the first session check finishes, so nothing flashes the login. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  /**
   * Changes the signed-in admin's own password. The current one is required and
   * checked first, so a walked-away-from desk cannot be locked by a passer-by.
   * Returns an error message, or null when the change went through.
   */
  changePassword: (current: string, next: string) => Promise<string | null>
}

const AuthContext = createContext<AuthValue | null>(null)

/**
 * Signed in, and allowed in.
 *
 * These are two different questions and the panel asks both. Supabase Auth
 * answers the first. The second is a row in `admin_users`, which is also what
 * every RLS policy checks - so a user who authenticates but is not on the
 * allowlist gets a clear "no access" screen rather than a working-looking panel
 * where every list is mysteriously empty.
 *
 * Rows are added to that table with the service_role key, never from here. An
 * admin cannot promote anyone, including themselves.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    /**
     * Stop waiting, whatever happened.
     *
     * `loading` is what holds the whole panel on its spinner, so the one thing
     * that must never happen is for it to stay true - and it could. The read
     * below had no failure path at all: no `catch`, and nothing to end the wait
     * if the promise simply never settled, which `getSession` can do when the
     * auth lock is held by another tab or when storage is unavailable. The
     * panel then showed "Loading" on every refresh, for good, with nothing on
     * screen to say why and no way out but clearing site data.
     *
     * Ending the wait is safe on its own. Nothing is being decided here except
     * whether to keep showing the spinner: with no session the panel shows its
     * sign-in screen, and if the session does turn up later - late, or restored
     * by another tab - `onAuthStateChange` below delivers it and the panel
     * carries on from there.
     */
    const settle = () => {
      if (alive) setLoading(false)
    }

    // Eight seconds is far longer than this takes when it works, so reaching it
    // means something is wrong rather than slow.
    const giveUp = window.setTimeout(settle, 8000)

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (alive) setSession(data.session)
      })
      .catch(() => {
        // Storage blocked, a corrupt stored session, no network. The sign-in
        // screen is the right answer to all three.
      })
      .finally(() => {
        window.clearTimeout(giveUp)
        settle()
      })

    // Fires INITIAL_SESSION on load as well as on every later change, so this
    // is also how a session that resolved after the timeout gets picked up.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      settle()
    })

    return () => {
      alive = false
      window.clearTimeout(giveUp)
      sub.subscription.unsubscribe()
    }
  }, [])

  // One narrow read per sign-in, not per page.
  useEffect(() => {
    if (!session?.user) {
      setAdmin(null)
      return
    }

    let alive = true
    supabase
      .from('admin_users')
      .select('id,email,full_name,role,tabs')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return
        setAdmin(
          data
            ? {
                id: data.id,
                email: data.email,
                fullName: data.full_name,
                role: data.role,
                tabs: data.tabs || [],
              }
            : null,
        )
      },
      // A failed read is not a membership: the allowlist screen is the honest
      // answer, rather than leaving the panel on a promise that never came
      // back. `then` here returns a PromiseLike, not a Promise, so the second
      // argument is the only way to catch it.
      () => {
        if (alive) setAdmin(null)
      },
    )

    return () => {
      alive = false
    }
  }, [session])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  // Supabase will happily change a password on the strength of the session
  // alone. That is fine for a reset link and wrong for a panel that stays
  // signed in on a desk, so the current password is re-checked here first -
  // a sign-in with the same credentials, which also refreshes the session.
  const changePassword = useCallback(
    async (current: string, next: string) => {
      const email = session?.user?.email
      if (!email) return 'You are not signed in.'

      const { error: wrongCurrent } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      })
      if (wrongCurrent) {
        return /invalid login credentials/i.test(wrongCurrent.message)
          ? 'That is not your current password.'
          : wrongCurrent.message
      }

      const { error: failed } = await supabase.auth.updateUser({ password: next })
      return failed?.message ?? null
    },
    [session],
  )

  return (
    <AuthContext.Provider
      value={{ session, admin, loading, signIn, signOut, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
