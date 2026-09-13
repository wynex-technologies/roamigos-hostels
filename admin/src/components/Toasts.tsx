import { createPortal } from 'react-dom'
import { CalendarCheck, MessageSquare, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotifications } from '@/lib/notifications'
import { cn } from './ui'

/**
 * What just arrived, in the corner.
 *
 * Rendered through a portal for the same reason the site's overlays are: the
 * panel's layout is a grid with its own stacking, and a fixed corner inside it
 * is only fixed until something above it opens.
 *
 * `aria-live="polite"` rather than `assertive` - a booking arriving is worth
 * announcing after the current sentence, not over the top of one. The whole
 * card is a link to the list it came from, because that is the only thing
 * anybody wants to do next.
 */
export function Toasts() {
  const { toasts, dismiss } = useNotifications()
  if (!toasts.length) return null

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[200] flex flex-col gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-80"
    >
      {toasts.map((toast) => {
        const Icon = toast.kind === 'booking' ? CalendarCheck : MessageSquare
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-warm',
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-on-primary">
              <Icon className="size-4" />
            </span>

            <Link
              to={toast.kind === 'booking' ? '/bookings' : '/enquiries'}
              onClick={() => dismiss(toast.id)}
              className="min-w-0 flex-1"
            >
              <span className="block text-sm font-semibold text-heading">{toast.title}</span>
              <span className="block truncate text-[0.8125rem] text-muted">{toast.line}</span>
            </Link>

            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:text-heading"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body,
  )
}
