import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Button, Card, Field, PageHeader, Text } from '@/components/ui'
import { useAuth } from '@/lib/auth'

/** Short enough that nobody writes it on a sticky note, long enough to matter. */
const MIN_LENGTH = 8

/**
 * The admin's own account.
 *
 * Two halves, and the split is deliberate. Who you are - email, name, role - is
 * read-only, because `admin_users` has a select policy and no update one: the
 * allowlist is edited with the service_role key so that nobody can rename or
 * promote themselves through the panel they are signed into. What you know -
 * the password - belongs to Supabase Auth rather than that table, so it is the
 * one thing an admin can change here on their own.
 *
 * The current password is asked for even though the session alone would be
 * enough for Supabase. A front desk panel sits signed in on a shared machine;
 * without that field, anyone walking past could take the account.
 */
export default function Profile() {
  const { admin, session, changePassword } = useAuth()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [reveal, setReveal] = useState(false)
  const [capsOn, setCapsOn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const tooShort = next.length > 0 && next.length < MIN_LENGTH
  const mismatch = confirm.length > 0 && next !== confirm
  const unchanged = next.length > 0 && next === current
  const ready = current.length > 0 && next.length >= MIN_LENGTH && next === confirm && !unchanged

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!ready) return

    setBusy(true)
    setError('')
    setDone(false)

    const failure = await changePassword(current, next)

    setBusy(false)
    if (failure) {
      setError(failure)
      return
    }

    setCurrent('')
    setNext('')
    setConfirm('')
    setDone(true)
    setTimeout(() => setDone(false), 6000)
  }

  const rows = [
    { label: 'Email', value: admin?.email ?? session?.user?.email ?? 'Unknown' },
    { label: 'Name', value: admin?.fullName || 'Not set' },
    { label: 'Role', value: admin?.role === 'owner' ? 'Owner' : 'Editor' },
  ]

  return (
    <>
      <PageHeader title="Profile" note="Your account for this panel." />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">You</h2>

          <dl className="divide-y divide-line">
            {rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-[0.6875rem] font-bold tracking-[0.12em] text-muted uppercase">
                  {row.label}
                </dt>
                <dd className="min-w-0 truncate text-sm font-medium text-heading">{row.value}</dd>
              </div>
            ))}
          </dl>

          <p className="text-[0.8125rem] leading-relaxed text-muted">
            The name and the role are set when the account is added and cannot be edited from here,
            which is what stops anyone promoting themselves. Ask whoever set the panel up if either
            needs changing.
          </p>
        </Card>

        <Card className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <KeyRound className="size-4 text-gold dark:text-mustard" />
            Change password
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Current password">
              <span className="relative block">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
                />
                <Text
                  type={reveal ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={current}
                  onChange={(event) => setCurrent(event.target.value)}
                  className="h-11 pl-11"
                />
              </span>
            </Field>

            <Field label="New password" hint={`At least ${MIN_LENGTH} characters.`}>
              <span className="relative block">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
                />
                <Text
                  type={reveal ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={next}
                  className="h-11 pr-11 pl-11"
                  onChange={(event) => setNext(event.target.value)}
                  // Caps lock is the commonest reason a password typed correctly
                  // does not work, and a masked field is the one place it hides.
                  onKeyUp={(event) => setCapsOn(event.getModifierState?.('CapsLock') ?? false)}
                  onBlur={() => setCapsOn(false)}
                />
                <button
                  type="button"
                  onClick={() => setReveal((on) => !on)}
                  aria-label={reveal ? 'Hide passwords' : 'Show passwords'}
                  className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:text-heading"
                >
                  {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </Field>

            <Field label="New password again">
              <span className="relative block">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
                />
                <Text
                  type={reveal ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="h-11 pl-11"
                />
              </span>
            </Field>

            {/* Said while it is being typed, not held back until the button. */}
            {capsOn && (
              <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-gold">
                <TriangleAlert className="size-3.5 shrink-0" />
                Caps lock is on.
              </p>
            )}
            {tooShort && (
              <p className="text-[0.8125rem] text-muted">
                {MIN_LENGTH - next.length} more character{MIN_LENGTH - next.length === 1 ? '' : 's'}{' '}
                to go.
              </p>
            )}
            {unchanged && (
              <p className="text-[0.8125rem] font-medium text-gold">
                That is the password you already have.
              </p>
            )}
            {mismatch && (
              <p className="text-[0.8125rem] font-medium text-gold">
                The two new passwords do not match.
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-maroon/30 bg-maroon/8 px-4 py-3 text-[0.875rem] leading-relaxed text-maroon dark:border-primary/40 dark:text-primary-hover"
              >
                {error}
              </p>
            )}

            {done && (
              <p className="flex items-center gap-2 rounded-xl border border-green/40 bg-green/10 px-4 py-3 text-[0.875rem] font-medium text-green-deep dark:text-green">
                <ShieldCheck className="size-4 shrink-0" />
                Password changed. Use the new one next time you sign in.
              </p>
            )}

            <Button type="submit" busy={busy} disabled={!ready} className="h-11 w-full">
              {busy ? 'Changing' : 'Change password'}
            </Button>
          </form>
        </Card>
      </div>
    </>
  )
}
