import { ShieldAlert } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useAuth } from '@/lib/auth'

/**
 * Signed in, but not on the allowlist.
 *
 * This is its own screen rather than a silent empty panel, because the two
 * failures look identical from the inside: RLS simply returns no rows. Saying
 * it plainly is the difference between "I need to be added" and an hour spent
 * wondering why every list is blank.
 */
export default function NoAccess() {
  const { session, signOut } = useAuth()

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <Card className="w-full max-w-md text-center">
        <ShieldAlert className="mx-auto size-8 text-mustard" />
        <h1 className="mt-4 font-display text-xl font-semibold">This account has no access</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          <span className="font-medium text-heading">{session?.user.email}</span> signed in, but it
          is not on the admin list, so nothing here will load for it.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Whoever owns the Supabase project can add it by inserting a row into{' '}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.8125rem]">admin_users</code>.
          The runbook in <code className="text-[0.8125rem]">supabase/README.md</code> has the
          statement.
        </p>
        <Button variant="ghost" className="mt-6" onClick={signOut}>
          Sign out
        </Button>
      </Card>
    </div>
  )
}
