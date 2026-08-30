import { useState } from 'react'
import { ArrowUpRight, Eye, EyeOff, Lock, LogIn, Mail, Moon, Sun, TriangleAlert } from 'lucide-react'
import { Button, Field, Text } from '@/components/ui'
import { LogoStacked } from '@/components/Logo'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'

/**
 * The sign-in screen: one card, centred on the brand's own ground.
 *
 * This is the pattern the research keeps landing on for a tool rather than a
 * marketing page - a single focused container on a plain backdrop, because it
 * keeps attention on the task at hand. A split screen sells something to
 * somebody who is deciding; nobody arriving here is deciding. They are the
 * desk, they are signing in, and the card should be the only thing on the
 * screen with any weight.
 *
 * The backdrop carries the brand instead, so the page is unmistakably Roamigos
 * without a word of it competing with the two fields that matter.
 *
 * The rest is the boring, load-bearing part: real `<label>` elements rather
 * than placeholders, a show/hide toggle on the password, a caps lock warning,
 * one primary button and nothing else styled like one, an error that says what
 * actually went wrong, and typed input that is never cleared when a submission
 * fails.
 */
export default function Login() {
  const { signIn } = useAuth()
  const { theme, toggle } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [capsOn, setCapsOn] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')

    const failure = await signIn(email.trim(), password)

    // Supabase says "Invalid login credentials", which reads as though the
    // account is the problem. It usually is not - it is a typo in a password
    // nobody can see. Neither field is cleared: retyping a correct email
    // because the password was wrong is a small insult.
    if (failure) {
      setError(
        /invalid login credentials/i.test(failure)
          ? 'That email and password do not match. Check for a typo, then try again.'
          : failure,
      )
    }
    setBusy(false)
  }

  return (
    /* White, which is what the brand sheet has the canvas be - it is the one
       surface the palette does not govern, and it does not change. The gradient
       is barely there on purpose: white to off white down the page, with two
       soft brand washes in the corners. Enough that the ground is not flat,
       far too little to compete with the card sitting on it. */
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-white via-white to-cream px-5 py-6 sm:px-6 dark:from-canvas dark:via-canvas dark:to-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-64 -right-48 size-[46rem] rounded-full bg-mustard/18 blur-3xl dark:bg-mustard/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-72 -left-56 size-[50rem] rounded-full bg-maroon/10 blur-3xl dark:bg-maroon/25"
      />

      <div className="relative flex justify-end gap-2">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[0.8125rem] font-medium text-muted transition-colors hover:border-primary hover:text-primary"
        >
          View the site
          <ArrowUpRight className="size-3.5" />
        </a>
        <button
          type="button"
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-primary hover:text-primary"
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>

      <main className="relative flex min-h-[calc(100dvh-6rem)] items-center justify-center py-8">
        <div className="w-full max-w-[26rem]">
          <div className="rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgb(9_9_11/0.04),0_18px_40px_-16px_rgb(9_9_11/0.18)] sm:p-10 dark:shadow-[0_2px_4px_rgb(0_0_0/0.3),0_24px_50px_-18px_rgb(0_0_0/0.6)]">
            {/* The card is the panel's own surface, light or dark, so the
                lockup follows the theme rather than taking the dark cut. */}
            <LogoStacked className="mx-auto" />

            <div className="mt-7 text-center">
              <p className="text-[0.6875rem] font-bold tracking-[0.24em] text-gold uppercase dark:text-mustard">
                Front desk
              </p>
              <h1 className="mt-2.5 font-display text-[2rem] leading-none font-semibold">
                Sign in
              </h1>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-muted">
                Rooms, bookings and the welcome offer.
              </p>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <Field label="Email">
                <span className="relative block">
                  <Mail
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
                  />
                  <Text
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 pl-11"
                  />
                </span>
              </Field>

              <Field label="Password">
                <span className="relative block">
                  <Lock
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
                  />
                  <Text
                    type={reveal ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    className="h-11 pr-11 pl-11"
                    onChange={(event) => setPassword(event.target.value)}
                    // Caps lock is the commonest reason a password that is being
                    // typed correctly does not work, and it is the one thing a
                    // masked field hides.
                    onKeyUp={(event) => setCapsOn(event.getModifierState?.('CapsLock') ?? false)}
                    onBlur={() => setCapsOn(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((on) => !on)}
                    aria-label={reveal ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:text-heading"
                  >
                    {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </Field>

              {capsOn && (
                <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-gold">
                  <TriangleAlert className="size-3.5 shrink-0" />
                  Caps lock is on.
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

              {/* One primary action on this screen, and this is it. */}
              <Button type="submit" busy={busy} className="mt-2 h-11 w-full">
                <LogIn className="size-4" />
                {busy ? 'Signing in' : 'Sign in'}
              </Button>
            </form>
          </div>

          <p className="mt-7 text-center text-[0.75rem] tracking-wide text-muted">
            Roamigos Hostel &middot; Pan Bazar, Guwahati
          </p>
        </div>
      </main>
    </div>
  )
}
