import { useEffect, useState } from 'react'
import { UserPlus, Shield, UserRound } from 'lucide-react'
import { Button, Field, Text } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { MANAGED_TABS, OWNER } from '@/lib/tabs'

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: string
  tabs: string[]
}

/**
 * The tabs an owner can switch on and off, straight off the rail's own list -
 * spelled there once, so a checkbox cannot grant a tab the rail never draws.
 *
 * Dashboard is in here now. It used to be forced on for everybody, which meant
 * a member hired to answer enquiries still opened onto the night's takings.
 * Settings is not: everyone keeps their own account screen.
 */
const ALL_TABS = MANAGED_TABS.map((tab) => tab.label)

/** What a new member starts with, unless the owner says otherwise. */
const DEFAULT_TABS = ['Dashboard']

export default function Users() {
  const { admin } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserFullName, setNewUserFullName] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserTabs, setNewUserTabs] = useState<string[]>(DEFAULT_TABS)
  const [newUserRole, setNewUserRole] = useState('editor')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    // Named columns, like every other query in the panel - `select('*')` here
    // would also start shipping whatever column `admin_users` gains next.
    const { data, error: fetchErr } = await supabase
      .from('admin_users')
      .select('id,email,full_name,role,tabs')
      .order('created_at', { ascending: false })

    if (fetchErr) setError(fetchErr.message)
    if (data) setUsers(data)
    setLoading(false)
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setError('Not authenticated')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          fullName: newUserFullName,
          tabs: newUserTabs,
          role: newUserRole
        })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to create user')
      }

      // Reset form
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserFullName('')
      setNewUserTabs(DEFAULT_TABS)
      setNewUserRole('editor')
      
      // Refresh list
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Tick a tab on or off for one member.
   *
   * This goes through the edge function, not through the table. `admin_users`
   * has a read policy and no write policy - the allowlist is deliberately the
   * one thing the panel cannot edit directly, so that nobody can grant
   * themselves a role through the panel they are signed into. A direct
   * `update()` here matched no rows, returned no error, and left the checkbox
   * looking saved until the next reload put it back.
   *
   * The box moves first because it should feel immediate, and moves back if
   * the write does not land - a checkbox that lies about what somebody can see
   * is worse than a slow one.
   */
  async function handleUpdateTabs(userId: string, currentTabs: string[], tab: string) {
    const nextTabs = currentTabs.includes(tab)
      ? currentTabs.filter((t) => t !== tab)
      : [...currentTabs, tab]

    setUsers((list) => list.map((u) => (u.id === userId ? { ...u, tabs: nextTabs } : u)))
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setUsers((list) => list.map((u) => (u.id === userId ? { ...u, tabs: currentTabs } : u)))
      setError('Session expired. Sign in again.')
      return
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: userId, tabs: nextTabs })
      })

      if (!res.ok) throw new Error(await res.text())
    } catch (err: any) {
      setUsers((list) => list.map((u) => (u.id === userId ? { ...u, tabs: currentTabs } : u)))
      setError(err.message || 'Could not save that change.')
    }
  }

  /**
   * The designation, as the owner types it.
   *
   * Free text on purpose: a hostel has front desk, housekeeping and a night
   * manager, not two access levels. Only `owner` does anything - it is matched
   * case-insensitively by the function and grants full access. Anything else is
   * a label, and that person still sees exactly the tabs ticked beside them.
   *
   * Like the tab checkboxes, this cannot be a table write: `admin_users` has no
   * write policy, so it goes through the function, which also refuses to demote
   * the last owner and leave the Users screen unreachable.
   */
  async function handleUpdateRole(userId: string, currentRole: string, nextRole: string) {
    const clean = nextRole.trim()
    if (!clean || clean === currentRole) {
      // Nothing typed, or nothing changed. Put back what is stored so an
      // emptied box does not sit there looking like a saved blank.
      setUsers((list) => list.map((u) => (u.id === userId ? { ...u, role: currentRole } : u)))
      return
    }

    setUsers((list) => list.map((u) => (u.id === userId ? { ...u, role: clean } : u)))
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setUsers((list) => list.map((u) => (u.id === userId ? { ...u, role: currentRole } : u)))
      setError('Session expired. Sign in again.')
      return
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: userId, role: clean })
      })

      if (!res.ok) throw new Error(await res.text())

      // The function settles the spelling of the reserved word, so read it back
      // rather than trusting what was typed - 'Owner' is stored as 'owner'.
      const { role } = await res.json()
      setUsers((list) => list.map((u) => (u.id === userId ? { ...u, role } : u)))
    } catch (err: any) {
      setUsers((list) => list.map((u) => (u.id === userId ? { ...u, role: currentRole } : u)))
      setError(err.message || 'Could not save that designation.')
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: userId })
      })

      if (!res.ok) throw new Error(await res.text())
      
      setUsers(users.filter(u => u.id !== userId))
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleUpdatePassword(userId: string) {
    const newPassword = window.prompt('Enter new password for this user (min 6 characters):')
    if (!newPassword) return
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: userId, password: newPassword })
      })

      if (!res.ok) throw new Error(await res.text())
      
      alert('Password updated successfully.')
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (admin?.role !== 'owner') {
    return (
      <div className="p-8 text-center text-muted">You do not have permission to view this page.</div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <header>
        <h1 className="font-display text-3xl font-semibold text-heading">Users & Permissions</h1>
        <p className="mt-2 text-muted">Manage who can access the front desk and what tabs they can see.</p>
      </header>

      {/* A failed tab change happens up here, so it has to be able to say so
          up here - the only error line used to live inside the invite form. */}
      {error && <p className="text-sm font-medium text-maroon">{error}</p>}

      {/* List of existing users */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-heading">Team Members</h2>
        
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          <div className="divide-y divide-line rounded-xl border border-line bg-surface">
            {users.map((user) => (
              <div key={user.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
                      {user.role === 'owner' ? <Shield className="size-5" /> : <UserRound className="size-5" />}
                    </span>
                    <div>
                      <h3 className="font-medium text-heading">{user.full_name || 'No Name'}</h3>
                      <p className="text-sm text-muted">{user.email}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2">
                        {user.id === admin.id ? (
                          // Your own designation is not editable here, for the
                          // same reason Remove is not: typing anything but
                          // `owner` into your own row would take the Users
                          // screen away mid-edit.
                          <span className="text-xs font-semibold uppercase tracking-wider text-accent">{user.role}</span>
                        ) : (
                          <input
                            defaultValue={user.role}
                            aria-label={`Designation for ${user.full_name || user.email}`}
                            title="Type any designation. Only `owner` grants full access."
                            maxLength={40}
                            onBlur={(event) => handleUpdateRole(user.id, user.role, event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') event.currentTarget.blur()
                              if (event.key === 'Escape') {
                                event.currentTarget.value = user.role
                                event.currentTarget.blur()
                              }
                            }}
                            className="w-36 rounded-md border border-line bg-surface-2 px-2 py-0.5 text-xs font-semibold tracking-wider text-accent uppercase transition-colors hover:border-primary focus:border-primary focus:outline-none"
                          />
                        )}
                        {user.id !== admin.id && (
                          <>
                            <span className="text-muted/30">•</span>
                            <button onClick={() => handleUpdatePassword(user.id)} className="text-xs font-medium text-muted hover:text-primary transition-colors">
                              Change Password
                            </button>
                            <span className="text-muted/30">•</span>
                            <button onClick={() => handleDeleteUser(user.id)} className="text-xs font-medium text-maroon hover:text-maroon/80 transition-colors">
                              Remove
                            </button>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Anybody who is not an owner is tab-gated, whatever their
                      designation says. This used to read `=== 'editor'`, which
                      would have hidden the checkboxes the moment somebody was
                      called anything else. */}
                  {user.role !== OWNER && (
                    <div className="mt-4 max-w-xs sm:mt-0 sm:text-right">
                      <p className="text-sm font-medium text-heading mb-2">Allowed Tabs</p>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        {ALL_TABS.map(tab => (
                          <label key={tab} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs cursor-pointer hover:border-primary">
                            <input
                              type="checkbox"
                              checked={user.tabs?.includes(tab)}
                              onChange={() => handleUpdateTabs(user.id, user.tabs || [], tab)}
                              className="accent-primary"
                            />
                            {tab}
                          </label>
                        ))}
                      </div>
                      <p className="mt-2 text-[0.6875rem] text-muted">Settings and their own profile are always allowed. Unticking every box leaves them with just those.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card-raised p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-heading mb-6">Invite Member</h2>
        {/* `autoComplete` on all three of these, because without it the browser
            reads an email input followed by a password input inside a form as a
            sign-in form - and fills it with the credentials of whoever is
            signed in, with the saved-passwords dropdown parked on top. The
            fields look locked, and a submit that got through would try to
            create an account with the admin's own address.

            `new-password` is the documented way to say "this is a credential
            being created, not one being recalled", which is what Profile.tsx
            already does for the same reason. */}
        <form onSubmit={handleCreateUser} className="max-w-xl space-y-6" autoComplete="off">
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <Text 
                name="member-name"
                autoComplete="off"
                value={newUserFullName} 
                onChange={e => setNewUserFullName(e.target.value)} 
                required 
                placeholder="Rahul Sharma" 
              />
            </Field>
            <Field label="Email Address">
              <Text 
                type="email" 
                // Not `email`: the browser matches on the name as well as the
                // type, so a field called `email` is filled whatever the
                // autocomplete attribute says.
                name="member-email"
                autoComplete="off"
                value={newUserEmail} 
                onChange={e => setNewUserEmail(e.target.value)} 
                required 
                placeholder="rahul@roamigoshostel.com" 
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Temporary Password" hint="They can change this after signing in.">
              <Text 
                type="password" 
                name="member-password"
                autoComplete="new-password"
                value={newUserPassword} 
                onChange={e => setNewUserPassword(e.target.value)} 
                required 
                minLength={6} 
              />
            </Field>
            <Field
              label="Designation"
              hint="Anything you like - front desk, housekeeping. Only `owner` grants full access."
            >
              <Text
                name="member-role"
                autoComplete="off"
                value={newUserRole}
                onChange={e => setNewUserRole(e.target.value)}
                required
                maxLength={40}
                placeholder="editor"
              />
            </Field>
          </div>

          <Field label="Assign Tabs" hint="What sections of the panel should this user see? Settings and their own profile are always allowed.">
            <div className="flex flex-wrap gap-2 mt-2">
              {ALL_TABS.map(tab => (
                <label key={tab} className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm cursor-pointer hover:border-primary">
                  <input
                    type="checkbox"
                    checked={newUserTabs.includes(tab)}
                    onChange={() => {
                      setNewUserTabs(prev => 
                        prev.includes(tab) ? prev.filter(t => t !== tab) : [...prev, tab]
                      )
                    }}
                    className="accent-primary"
                  />
                  {tab}
                </label>
              ))}
            </div>
          </Field>

          <Button type="submit" variant="primary" busy={isSubmitting}>
            <UserPlus className="size-4" />
            Create Member
          </Button>
        </form>
      </section>
    </div>
  )
}
