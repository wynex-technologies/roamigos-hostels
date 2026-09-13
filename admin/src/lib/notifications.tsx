import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'

/**
 * Telling the desk that something came in.
 *
 * A booking is a guest waiting on WhatsApp for an answer, so the panel being
 * open and the panel being *current* have to be the same thing. This is the one
 * place the panel keeps a socket open (see the note in `supabase.ts`): two
 * tables, inserts only, which is a handful of messages a day against a poll
 * that would run all day whether anything happened or not.
 *
 * Three things come out of it, and they answer different questions:
 *
 *   - a **toast**, for "something just arrived while I was looking at this"
 *   - a **badge** on the nav, for "something arrived and I have not read it",
 *     which survives a reload and counts what landed while the panel was shut
 *   - a **browser notification**, for "the panel is open in a tab behind
 *     something else", which is where a desk machine actually leaves it
 *
 * The badge is the load-bearing one. A toast is gone in six seconds and a
 * browser notification needs permission that may never be granted; the count
 * beside Bookings is what is still true tomorrow morning.
 */

export type Kind = 'booking' | 'enquiry'

/** One thing that arrived, as the toast and the browser notification show it. */
export interface Arrival {
  id: string
  kind: Kind
  title: string
  line: string
}

interface Notifications {
  unseen: Record<Kind, number>
  toasts: Arrival[]
  dismiss: (id: string) => void
  /** Called by a list screen when it opens - what is on screen has been seen. */
  markSeen: (kind: Kind) => void
  /** 'unsupported' where the browser has no Notification API at all. */
  permission: NotificationPermission | 'unsupported'
  /** Must be called from a click: browsers refuse the prompt otherwise. */
  askPermission: () => void
}

const NotificationsContext = createContext<Notifications | null>(null)

/**
 * When each list was last read, per table, as an ISO timestamp.
 *
 * Kept in the browser rather than the database on purpose. It is a property of
 * *this desk machine*, not of the booking - marking a row read on the laptop
 * should not clear the badge on the phone somebody else is holding, and a
 * column on `bookings` would do exactly that.
 */
const SEEN_KEY = 'roamigos-admin-seen'

type Seen = Record<Kind, string>

/** The epoch, so a panel opened for the first time counts everything. */
const NEVER = new Date(0).toISOString()

function readSeen(): Seen {
  try {
    const stored = JSON.parse(localStorage.getItem(SEEN_KEY) ?? 'null') as Partial<Seen> | null
    return { booking: stored?.booking ?? NEVER, enquiry: stored?.enquiry ?? NEVER }
  } catch {
    return { booking: NEVER, enquiry: NEVER }
  }
}

function writeSeen(seen: Seen) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
  } catch {
    // Private mode. The badge then lasts only as long as the tab, which is a
    // worse experience and not a broken one.
  }
}

const TABLE: Record<Kind, string> = { booking: 'bookings', enquiry: 'enquiries' }

/** How long a toast stays up. Long enough to read a name, short enough to ignore. */
const TOAST_MS = 8000

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth()
  const [unseen, setUnseen] = useState<Record<Kind, number>>({ booking: 0, enquiry: 0 })
  const [toasts, setToasts] = useState<Arrival[]>([])
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  )

  // Read through a ref inside the subscription, so a new count does not tear the
  // socket down and rebuild it every time something arrives.
  const seen = useRef<Seen>(readSeen())
  const permissionRef = useRef(permission)
  permissionRef.current = permission

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const markSeen = useCallback((kind: Kind) => {
    seen.current = { ...seen.current, [kind]: new Date().toISOString() }
    writeSeen(seen.current)
    setUnseen((current) => (current[kind] === 0 ? current : { ...current, [kind]: 0 }))
  }, [])

  const askPermission = useCallback(() => {
    if (typeof Notification === 'undefined') return
    void Notification.requestPermission().then(setPermission)
  }, [])

  /**
   * What landed while nobody was looking.
   *
   * Counted with `head: true`, so PostgREST returns the number and not the
   * rows - the badge needs a figure, and pulling a month of bookings to length
   * an array is the habit this project is careful about everywhere else.
   */
  useEffect(() => {
    if (!admin) return
    let alive = true

    for (const kind of ['booking', 'enquiry'] as Kind[]) {
      void supabase
        .from(TABLE[kind])
        .select('id', { count: 'exact', head: true })
        .gt('created_at', seen.current[kind])
        .then(({ count }) => {
          if (alive && count) setUnseen((current) => ({ ...current, [kind]: count }))
        })
    }

    return () => {
      alive = false
    }
  }, [admin])

  /**
   * The socket.
   *
   * Only while somebody is signed in *and* on the allowlist - `admin` is the
   * second of those. Realtime applies the same RLS policies the panel's queries
   * do, so this can never deliver a row a plain `select` would have refused,
   * but there is no reason to hold a connection open on the login screen.
   */
  useEffect(() => {
    if (!admin) return

    function arrived(kind: Kind, row: Record<string, unknown>) {
      const title = kind === 'booking' ? 'New booking' : 'New enquiry'
      const line =
        kind === 'booking'
          ? [row.reference, row.guest_name, row.room_name].filter(Boolean).join(' - ')
          : [row.name ?? 'Someone', row.topic].filter(Boolean).join(' - ')

      const arrival: Arrival = { id: String(row.id ?? Date.now()), kind, title, line }

      setUnseen((current) => ({ ...current, [kind]: current[kind] + 1 }))
      setToasts((current) => [...current, arrival])
      window.setTimeout(() => dismiss(arrival.id), TOAST_MS)

      if (permissionRef.current === 'granted') {
        try {
          // `tag` keyed to the row, so a re-delivered message replaces the
          // notification rather than stacking a second identical one.
          new Notification(title, { body: line, tag: arrival.id })
        } catch {
          // Some browsers refuse the constructor outside a service worker.
          // The toast and the badge have already done the job.
        }
      }
    }

    const channel = supabase
      .channel('desk-intake')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => arrived('booking', payload.new as Record<string, unknown>),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'enquiries' },
        (payload) => arrived('enquiry', payload.new as Record<string, unknown>),
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [admin, dismiss])

  const value = useMemo(
    () => ({ unseen, toasts, dismiss, markSeen, permission, askPermission }),
    [unseen, toasts, dismiss, markSeen, permission, askPermission],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>')
  return ctx
}

/**
 * Clears a list's badge while that list is on screen.
 *
 * Called by the Bookings and Enquiries screens. `markSeen` is stable, so this
 * runs once when the screen opens - which is the moment the rows on it stop
 * being unread.
 */
export function useMarkSeen(kind: Kind) {
  const { markSeen } = useNotifications()
  useEffect(() => {
    markSeen(kind)
  }, [markSeen, kind])
}
