import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, X } from 'lucide-react'
import type { Room } from '@/data/rooms'
import { bookingTotals, buildWhatsAppUrl } from '@/lib/whatsapp'
import { recordBooking } from '@/lib/intake'
import { formatDate, formatINR } from '@/lib/utils'
import { toDraft, type BookingState } from './BookingWidget'

type Field = 'name' | 'phone' | 'email'

/**
 * Who is arriving, asked once, right before the chat opens.
 *
 * The WhatsApp message *is* the booking - there is no account and no record on
 * the site - so the desk has to be able to reach the guest from the message
 * alone. Name, phone and email are the three things that make that true, and
 * they are the reason this dialog exists rather than the widget sending
 * straight through.
 */
export function GuestDetailsModal({
  open,
  onClose,
  room,
  state,
  setState,
}: {
  open: boolean
  onClose: () => void
  room: Room
  state: BookingState
  setState: (next: BookingState) => void
}) {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const nameRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // The guest's answers live in the room page, so every keystroke in here
  // re-renders the parent and hands this component a fresh `onClose`. Anything
  // that depends on it therefore re-runs on every letter typed - which is why
  // the focus below is on an effect of its own, keyed to `open` alone. Sharing
  // one effect moved the cursor back to the name field mid-word.
  useEffect(() => {
    if (!open) return
    nameRef.current?.focus()
  }, [open])

  // Escape closes and the page behind stays put. `onClose` is read through a
  // ref so a new identity does not tear the listener down and re-add it, or
  // release the scroll lock, between two characters.
  const closeHandler = useRef(onClose)
  closeHandler.current = onClose

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeHandler.current()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // A fresh open should not carry the last attempt's red text back with it.
  useEffect(() => {
    if (open) setErrors({})
  }, [open])

  if (!open) return null

  const { nights, discount, total } = bookingTotals(toDraft(room, state))
  const isDorm = room.categories.includes('dorm')

  function validate(): Partial<Record<Field, string>> {
    const found: Partial<Record<Field, string>> = {}
    if (state.name.trim().length < 2) found.name = 'Please enter your name.'
    // Enough digits to be dialled - the desk calls this number back.
    if (state.phone.replace(/\D/g, '').length < 7) found.phone = 'Please enter a valid phone number.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(state.email.trim()))
      found.email = 'Please enter a valid email address.'
    return found
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      const first = (['name', 'phone', 'email'] as const).find((key) => found[key])
      document.getElementById(`guest-${first}`)?.focus()
      return
    }
    const draft = toDraft(room, state)

    // The desk's carbon copy, so a request that never gets sent in WhatsApp is
    // still on the board. It cannot fail loudly and it cannot delay the line
    // below - see `src/lib/intake.ts`.
    recordBooking(room, draft)

    window.open(buildWhatsAppUrl(draft), '_blank', 'noopener,noreferrer')
    onClose()
  }

  const field =
    'w-full rounded-xl border border-line bg-surface-2 px-4 pt-6 pb-2.5 text-[0.9375rem] font-medium text-heading ' +
    'transition-[border-color,box-shadow,background-color] duration-300 hover:border-line-strong ' +
    'focus:border-primary focus:bg-surface focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_14%,transparent)] focus:outline-none'
  const labelClass =
    'pointer-events-none absolute top-2.5 left-4 text-[0.625rem] font-bold tracking-[0.14em] text-muted uppercase'

  const rows: { key: Field; label: string; type: string; autoComplete: string; mode?: 'tel' | 'email' }[] = [
    { key: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
    { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', mode: 'tel' },
    { key: 'email', label: 'Email', type: 'email', autoComplete: 'email', mode: 'email' },
  ]

  /* Portalled to the body on purpose. The page renders inside
     `<main class="relative z-10">`, which opens a stacking context - a `z-100`
     inside it still loses to the `z-50` header outside it, and the dialog comes
     out with its top strip painted over by the nav. */
  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      className="animate-backdrop-in fixed inset-0 z-100 flex items-end justify-center overflow-y-auto overscroll-contain bg-ink/70 p-4 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-details-title"
        onClick={(event) => event.stopPropagation()}
        /* The panel is taller than a short viewport once the errors show, and a
           centred flex child clips its own top overflow instead of letting the
           backdrop scroll to it - so the panel caps its height and the form
           scrolls inside it. The close button sits outside that scroller and
           stays reachable. */
        className="card-raised animate-modal-in relative my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden shadow-lift sm:max-h-[calc(100dvh-3rem)]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 z-20 grid size-9 place-items-center rounded-full border border-line text-muted transition-colors duration-300 hover:bg-surface-2 hover:text-heading"
        >
          <X className="size-4" />
        </button>

        <form
          onSubmit={submit}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8"
          noValidate
        >
          <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-accent uppercase">
            Almost there
          </p>
          <h2 id="guest-details-title" className="mt-2.5 font-display text-2xl font-semibold">
            Who is checking in?
          </h2>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
            We send the booking to our desk on WhatsApp - these three let us confirm it and
            reach you back.
          </p>

          {/* What they are about to send, so the dialog is a confirmation and not
              just a gate. */}
          <dl className="mt-5 space-y-1.5 rounded-xl border border-line bg-surface-2 p-4 text-[0.875rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Room</dt>
              <dd className="text-right font-medium text-heading">{room.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Dates</dt>
              <dd className="text-right font-medium text-heading">
                {formatDate(state.checkIn)} - {formatDate(state.checkOut)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                {nights} {nights === 1 ? 'night' : 'nights'} · {state.guests}{' '}
                {isDorm ? (state.guests === 1 ? 'bed' : 'beds') : state.guests === 1 ? 'guest' : 'guests'}
                {discount > 0 && state.coupon ? ` · ${state.coupon.code}` : ''}
              </dt>
              <dd className="text-right font-display font-semibold text-heading tabular-nums">
                {formatINR(total)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 grid gap-3">
            {rows.map((row) => (
              <div key={row.key}>
                <div className="relative">
                  <span className={labelClass}>{row.label}</span>
                  <input
                    id={`guest-${row.key}`}
                    ref={row.key === 'name' ? nameRef : undefined}
                    type={row.type}
                    inputMode={row.mode}
                    autoComplete={row.autoComplete}
                    required
                    aria-invalid={Boolean(errors[row.key])}
                    aria-describedby={errors[row.key] ? `guest-${row.key}-error` : undefined}
                    value={state[row.key]}
                    onChange={(e) => {
                      setState({ ...state, [row.key]: e.target.value })
                      if (errors[row.key]) setErrors({ ...errors, [row.key]: undefined })
                    }}
                    className={`${field} ${errors[row.key] ? 'border-primary' : ''}`}
                  />
                </div>
                {errors[row.key] && (
                  <p
                    id={`guest-${row.key}-error`}
                    className="mt-1.5 text-[0.8125rem] font-medium text-primary"
                  >
                    {errors[row.key]}
                  </p>
                )}
              </div>
            ))}

            <div className="relative">
              <span className={labelClass}>Special request (optional)</span>
              <textarea
                rows={2}
                value={state.note}
                onChange={(e) => setState({ ...state, note: e.target.value })}
                className={`${field} resize-none`}
                aria-label="Special request"
              />
            </div>
          </div>

          <button
            type="submit"
            className="gloss-sweep mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary text-[0.9375rem] font-semibold text-on-primary shadow-[0_14px_30px_-16px] shadow-maroon/80 transition-[background-color,transform,box-shadow] duration-300 hover:bg-primary-hover hover:shadow-[0_20px_38px_-18px] active:scale-[0.99]"
          >
            Send on WhatsApp
            <ArrowUpRight className="size-4" />
          </button>

          <p className="mt-3 text-center text-[0.8125rem] text-muted">
            Pay at check-in · No prepayment · Free cancellation up to 24h
          </p>
        </form>
      </div>
    </div>,
    document.body,
  )
}
