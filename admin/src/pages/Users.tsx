import { useEffect, useState } from 'react'
import { UserPlus, Shield, UserRound } from 'lucide-react'
import { Button, Field, Text } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: string
  tabs: string[]
}

const ALL_TABS = ['Bookings', 'Enquiries', 'Rooms', 'Journal', 'Offer', 'FAQs', 'Page settings']

export default function Users() {
  const { admin } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserFullName, setNewUserFullName] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserTabs, setNewUserTabs] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data, error: fetchErr } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchErr) console.error(fetchErr)
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
          tabs: newUserTabs
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
      setNewUserTabs([])
      
      // Refresh list
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateTabs(userId: string, currentTabs: string[], tab: string) {
    const nextTabs = currentTabs.includes(tab)
      ? currentTabs.filter((t) => t !== tab)
      : [...currentTabs, tab]
    
    setUsers(users.map(u => u.id === userId ? { ...u, tabs: nextTabs } : u))

    await supabase
      .from('admin_users')
      .update({ tabs: nextTabs })
      .eq('id', userId)
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
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-accent">{user.role}</p>
                    </div>
                  </div>

                  {user.role === 'editor' && (
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
                      <p className="mt-2 text-[0.6875rem] text-muted">Dashboard and Settings are always allowed.</p>
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
        <form onSubmit={handleCreateUser} className="max-w-xl space-y-6">
          {error && <p className="text-maroon text-sm font-medium">{error}</p>}
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <Text 
                value={newUserFullName} 
                onChange={e => setNewUserFullName(e.target.value)} 
                required 
                placeholder="Rahul Sharma" 
              />
            </Field>
            <Field label="Email Address">
              <Text 
                type="email" 
                value={newUserEmail} 
                onChange={e => setNewUserEmail(e.target.value)} 
                required 
                placeholder="rahul@roamigos.com" 
              />
            </Field>
          </div>

          <Field label="Temporary Password" hint="They can change this after signing in.">
            <Text 
              type="password" 
              value={newUserPassword} 
              onChange={e => setNewUserPassword(e.target.value)} 
              required 
              minLength={6} 
            />
          </Field>

          <Field label="Assign Tabs" hint="What sections of the panel should this user see? (Dashboard and Settings are always allowed)">
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
