import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  BedDouble,
  CalendarCheck,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Newspaper,
  Settings,
  Sun,
  Tag,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react'
import { LogoMark } from './Logo'
import { useAuth } from '@/lib/auth'
import { usePublish } from '@/lib/publish'
import { useTheme } from '@/lib/theme'
import { Button, cn } from './ui'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/enquiries', label: 'Enquiries', icon: MessageSquare },
  { to: '/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/blog', label: 'Journal', icon: Newspaper },
  { to: '/offer', label: 'Offer', icon: Tag },
  { to: '/faqs', label: 'FAQs', icon: HelpCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
]

/**
 * The publish control.
 *
 * It sits in the header on every screen because of how the site works: the site
 * reads a file, not the database, which is what keeps a visitor's page view off
 * Supabase entirely. Pressing this rewrites that file, so a change saved a
 * moment ago is live on the next page load.
 *
 * The welcome offer is the one exception - it is read live and needs no publish
 * at all, which is deliberate, because a campaign is the thing most likely to
 * need pulling in a hurry.
 */
function PublishButton() {
  const { publish, state, message } = usePublish()

  return (
    <div className="flex items-center gap-3">
      {message && (
        <span
          className={cn(
            'hidden text-[0.75rem] font-medium sm:block',
            state === 'error' ? 'text-maroon' : 'text-green-deep dark:text-green',
          )}
        >
          {message}
        </span>
      )}
      <Button
        variant="accent"
        busy={state === 'working'}
        onClick={publish}
        title="Puts everything saved here onto the live site"
      >
        <UploadCloud className="size-4" />
        Publish
      </Button>
    </div>
  )
}

function ThemeButton() {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className="grid size-9 place-items-center rounded-full border border-line text-heading transition-colors hover:border-primary hover:text-primary"
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}

export function Shell() {
  const { admin, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const nav = (
    <nav className="flex flex-col gap-1">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-on-primary'
                : 'text-body hover:bg-surface-2 hover:text-heading',
            )
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* ------------------------------- rail -------------------------------- */}
      <aside className="hidden border-r border-line bg-surface p-5 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3 px-1">
          <LogoMark className="h-10 shrink-0" />
          <span>
            <span className="block font-display text-lg leading-tight font-semibold text-heading">
              Roamigos
            </span>
            <span className="block text-[0.6875rem] font-bold tracking-[0.18em] text-gold uppercase dark:text-mustard">
              Front desk
            </span>
          </span>
        </div>

        {nav}

        {/* Who is signed in, and the way to their own account. The identity
            block was already here saying the email; making it the link means
            the password lives where somebody would go looking for it rather
            than in the content nav above, which is about the hostel. */}
        <div className="mt-auto border-t border-line pt-4">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-2 py-2 transition-colors',
                isActive ? 'bg-surface-2' : 'hover:bg-surface-2',
              )
            }
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-heading">
                {admin?.fullName || 'Profile'}
              </span>
              <span className="block truncate text-[0.6875rem] text-muted">{admin?.email}</span>
            </span>
          </NavLink>
          <button
            type="button"
            onClick={signOut}
            className="mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-body transition-colors hover:text-maroon"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ------------------------------ content ------------------------------ */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-full border border-line text-heading lg:hidden"
          >
            <Menu className="size-4" />
          </button>

          <span className="flex items-center gap-2 lg:hidden">
            <LogoMark className="h-8 shrink-0" />
            <span className="font-display text-base font-semibold">Roamigos</span>
          </span>

          <div className="ml-auto flex items-center gap-3">
            <ThemeButton />
            <PublishButton />
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* ------------------------------ drawer ------------------------------- */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-surface p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <LogoMark className="h-9 shrink-0" />
                <span className="font-display text-lg font-semibold">Roamigos</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-8 place-items-center rounded-full border border-line"
              >
                <X className="size-4" />
              </button>
            </div>
            {nav}
            <div className="mt-auto border-t border-line pt-4">
              <NavLink
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-1 py-1.5 text-sm font-medium text-body"
              >
                <UserRound className="size-4" />
                <span className="min-w-0 truncate">{admin?.fullName || 'Profile'}</span>
              </NavLink>
              <button
                type="button"
                onClick={signOut}
                className="mt-1 flex items-center gap-2 px-1 py-1.5 text-sm text-body"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
