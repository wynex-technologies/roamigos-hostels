import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface Admin {
  id: string
  email: string
  fullName: string | null
  role: 'owner' | 'editor'
}

interface AuthValue {
  session: Session | null
  admin: Admin | null
  /** True until the first session check finishes, so nothing flashes the login. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
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

    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSession(data.session)
      if (alive) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      alive = false
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
      .select('id,email,full_name,role')
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
                role: data.role as Admin['role'],
              }
            : null,
        )
      })

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

  return (
    <AuthContext.Provider value={{ session, admin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
