/**
 * The panel's screens, declared once.
 *
 * Three places need to agree about this list and they used to each keep their
 * own copy: the rail draws it, `App` decides which routes exist, and the Users
 * screen offers the owner a checkbox per tab. A label spelled one way in the
 * rail and another way in the checkbox list is a tab that can be granted and
 * never appears, with nothing to show for it - so the labels, the paths and the
 * icons live here and those three read them.
 *
 * `label` is also what is stored in `admin_users.tabs`, which is why it is the
 * identity of a tab rather than the path. Renaming one means migrating the
 * rows that grant it.
 */
import {
  BedDouble,
  CalendarCheck,
  HelpCircle,
  LayoutDashboard,
  LayoutTemplate,
  Newspaper,
  Settings,
  Tag,
  UserRound,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'
import { PAGE_SETTINGS_LOCKED } from './flags'

export type Watch = 'booking' | 'enquiry'

export interface Tab {
  /** What the rail prints, and what `admin_users.tabs` stores. */
  label: string
  path: string
  icon: LucideIcon
  /** For the index route, so `/` is not active on every other screen. */
  end?: boolean
  /** The arrivals counter this tab carries, if any. */
  watch?: Watch
  /** Built but not open yet - see `flags.ts`. */
  locked?: boolean
  /** Owners only. Never grantable, never offered as a checkbox. */
  ownerOnly?: boolean
  /** Everybody gets it, so the owner is not asked about it. */
  always?: boolean
}

export const TABS: Tab[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { label: 'Bookings', path: '/bookings', icon: CalendarCheck, watch: 'booking' },
  { label: 'Enquiries', path: '/enquiries', icon: MessageSquare, watch: 'enquiry' },
  { label: 'Rooms', path: '/rooms', icon: BedDouble },
  { label: 'Journal', path: '/blog', icon: Newspaper },
  { label: 'Offer', path: '/offer', icon: Tag },
  { label: 'FAQs', path: '/faqs', icon: HelpCircle },
  { label: 'Page settings', path: '/pages', icon: LayoutTemplate, locked: PAGE_SETTINGS_LOCKED },
  { label: 'Settings', path: '/settings', icon: Settings, always: true },
  { label: 'Users', path: '/users', icon: UserRound, ownerOnly: true },
]

/** The tabs the Users screen draws a checkbox for. */
export const MANAGED_TABS = TABS.filter((tab) => !tab.ownerOnly && !tab.always)

/** Who a visibility question is being asked about. `admin` may still be loading. */
interface Grantee {
  role: 'owner' | 'editor'
  tabs?: string[]
}

/** An owner sees everything; an editor sees what they have been granted. */
export function canSee(admin: Grantee | null | undefined, label: string): boolean {
  if (!admin) return false
  if (admin.role === 'owner') return true
  return Boolean(admin.tabs?.includes(label))
}

/**
 * Where this person lands, and where a stray URL sends them.
 *
 * Dashboard can be switched off now, so `/` is no longer somewhere everybody is
 * allowed to be. This answers with their first visible tab instead, and with
 * Settings when they have been granted nothing at all - an editor with an empty
 * list still has an account and still needs a screen to arrive on.
 *
 * It can only return `/` when Dashboard is actually visible, which is what
 * keeps the redirect on the index route from pointing at itself.
 */
export function homePath(admin: Grantee | null | undefined): string {
  const first = TABS.find(
    (tab) => !tab.locked && !tab.ownerOnly && !tab.always && canSee(admin, tab.label),
  )
  return first?.path ?? '/settings'
}
