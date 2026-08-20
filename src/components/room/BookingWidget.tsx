import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, ChevronDown, Minus, Plus, ShieldCheck } from 'lucide-react'
import type { Room } from '@/data/rooms'
import { site } from '@/data/site'
import { bookingAssurances } from '@/data/content'
import { bookingTotals, buildWhatsAppUrl, type BookingDraft } from '@/lib/whatsapp'
import { addDaysISO, cn, formatINR, todayISO } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

export interface BookingState {
  checkIn: string
  checkOut: string
  guests: number
  name: string
  phone: string
  note: string
}

/** Seeds the widget from the dates picked on the homepage, when present. */
export function useBookingState(room: Room) {
  const [params] = useSearchParams()
  const [state, setState] = useState<BookingState>(() => ({
    checkIn: params.get('checkIn') ?? '',
    checkOut: params.get('checkOut') ?? '',
    guests: Math.min(Number(params.get('guests')) || 1, room.capacity),
    name: '',
    phone: '',
    note: '',
  }))
  return [state, setState] as const
}

export function toDraft(room: Room, state: BookingState): BookingDraft {
  return {
    room,
    checkIn: state.checkIn,
    checkOut: state.checkOut,
    guests: state.guests,
    guestName: state.name.trim() || undefined,
    guestPhone: state.phone.trim() || undefined,
    note: state.note.trim() || undefined,
  }
}

export function BookingWidget({
  room,
  state,
  setState,
  id,
}: {
  room: Room
  state: BookingState
  setState: (next: BookingState) => void
  id?: string
}) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const today = todayISO()
  const isDorm = room.categories.includes('dorm')

  const { nights, total } = bookingTotals(toDraft(room, state))
  const ready = Boolean(state.checkIn && state.checkOut && nights > 0)

  const field =
    'w-full rounded-xl border border-line bg-surface-2 px-4 pt-6 pb-2.5 text-[0.9375rem] font-medium text-heading ' +
    'transition-[border-color,box-shadow,background-color] duration-300 hover:border-line-strong ' +
    'focus:border-primary focus:bg-surface focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_14%,transparent)] focus:outline-none'
  const label =
    'pointer-events-none absolute top-2.5 left-4 text-[0.625rem] font-bold tracking-[0.14em] text-muted uppercase'

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!ready) return
    // No payment step and no booking record yet - this message *is* the booking.
    window.open(buildWhatsAppUrl(toDraft(room, state)), '_blank', 'noopener,noreferrer')
  }

  return (
    <div id={id} className="space-y-4">
      <form onSubmit={submit} className="card-raised p-6 shadow-raised-lg sm:p-7">
        <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-accent uppercase">
          Book direct
        </p>
        <h2 className="mt-2.5 font-display text-xl font-semibold">Select your dates</h2>
        <span aria-hidden className="mt-4 block h-px w-full bg-line" />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <span className={label}>Check-in</span>
            <input
              type="date"
              required
              min={today}
              value={state.checkIn}
              onChange={(e) => {
                const checkIn = e.target.value
                const checkOut =
                  state.checkOut && checkIn >= state.checkOut ? addDaysISO(checkIn, 1) : state.checkOut
                setState({ ...state, checkIn, checkOut })
              }}
              className={`${field} [color-scheme:light] dark:[color-scheme:dark]`}
              aria-label="Check-in date"
            />
            <CalendarDays className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-accent" />
          </div>

          <div className="relative">
            <span className={label}>Check-out</span>
            <input
              type="date"
              required
              min={state.checkIn ? addDaysISO(state.checkIn, 1) : addDaysISO(today, 1)}
              value={state.checkOut}
              onChange={(e) => setState({ ...state, checkOut: e.target.value })}
              className={`${field} [color-scheme:light] dark:[color-scheme:dark]`}
              aria-label="Check-out date"
            />
            <CalendarDays className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-accent" />
          </div>
        </div>

        {/* Guests stepper */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-surface-2 px-4 py-3 transition-colors duration-300 hover:border-line-strong">
          <span>
            <span className="block text-[0.625rem] font-bold tracking-[0.14em] text-muted uppercase">
              {isDorm ? 'Beds' : 'Guests'}
            </span>
            <span className="text-[0.9375rem] font-medium text-heading">
              {state.guests} {state.guests === 1 ? (isDorm ? 'Bed' : 'Guest') : isDorm ? 'Beds' : 'Guests'}
            </span>
          </span>
          <span className="flex items-center gap-2">
            {[
              { delta: -1, Icon: Minus, label: 'Decrease' },
              { delta: 1, Icon: Plus, label: 'Increase' },
            ].map(({ delta, Icon: StepIcon, label: stepLabel }) => (
              <button
                key={delta}
                type="button"
                aria-label={`${stepLabel} ${isDorm ? 'beds' : 'guests'}`}
                onClick={() =>
                  setState({
                    ...state,
                    guests: Math.min(room.capacity, Math.max(1, state.guests + delta)),
                  })
                }
                disabled={
                  delta < 0 ? state.guests <= 1 : state.guests >= room.capacity
                }
                className="grid size-9 place-items-center rounded-full border border-line-strong text-heading transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-on-primary active:scale-95 disabled:pointer-events-none disabled:opacity-35"
              >
                <StepIcon className="size-4" />
              </button>
            ))}
          </span>
        </div>

        {/* Optional guest details */}
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          aria-expanded={detailsOpen}
          className="mt-3 flex w-full items-center justify-between rounded-xl px-1 py-2 text-[0.875rem] font-semibold text-heading transition-colors duration-300 hover:text-primary"
        >
          Add your details <span className="font-normal text-muted">(optional)</span>
          <ChevronDown
            className={cn('size-4 text-muted transition-transform', detailsOpen && 'rotate-180')}
          />
        </button>

        {detailsOpen && (
          <div className="grid gap-3 pt-1">
            <div className="relative">
              <span className={label}>Your name</span>
              <input
                type="text"
                autoComplete="name"
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
                className={field}
                aria-label="Your name"
              />
            </div>
            <div className="relative">
              <span className={label}>Phone</span>
              <input
                type="tel"
                autoComplete="tel"
                value={state.phone}
                onChange={(e) => setState({ ...state, phone: e.target.value })}
                className={field}
                aria-label="Your phone number"
              />
            </div>
            <div className="relative">
              <span className={label}>Special request</span>
              <textarea
                rows={2}
                value={state.note}
                onChange={(e) => setState({ ...state, note: e.target.value })}
                className={`${field} resize-none`}
                aria-label="Special request"
              />
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mt-6 border-t border-line pt-5">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-heading">
              {formatINR(room.pricePerNight)}
            </span>
            <span className="text-muted">/ {isDorm ? 'bed / night' : 'night'}</span>
          </div>
          <p className="mt-1 text-[0.8125rem] text-muted">Inclusive of all taxes</p>

          {nights > 0 && (
            <dl className="mt-5 space-y-2 rounded-xl border border-line bg-surface-2 p-4 text-[0.875rem] animate-rise">
              <div className="flex justify-between">
                <dt className="text-muted">
                  {formatINR(room.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}
                  {isDorm && state.guests > 1 ? ` × ${state.guests} beds` : ''}
                </dt>
                <dd className="font-medium text-heading tabular-nums">{formatINR(total)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2">
                <dt className="font-semibold text-heading">Estimated total</dt>
                <dd className="font-display text-lg font-semibold text-heading tabular-nums">
                  {formatINR(total)}
                </dd>
              </div>
            </dl>
          )}
        </div>

        <button
          type="submit"
          disabled={!ready}
          className="gloss-sweep mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary text-[0.9375rem] font-semibold text-on-primary shadow-[0_14px_30px_-16px] shadow-maroon/80 transition-[background-color,transform,box-shadow] duration-300 hover:bg-primary-hover hover:shadow-[0_20px_38px_-18px] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none"
        >
          Book Now
        </button>

        <p className="mt-3 text-center text-[0.8125rem] text-muted">
          {ready
            ? 'Opens WhatsApp with your booking details - we confirm in minutes.'
            : 'Pick your dates to continue.'}
        </p>
        <p className="mt-1 text-center text-[0.8125rem] font-medium text-heading">
          Pay at check-in · No prepayment
        </p>

        <div className="mt-5 flex gap-3 rounded-xl border border-green-deep/25 bg-green-deep/8 p-4 dark:border-green/30 dark:bg-green/12">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-green-deep dark:text-cream" />
          <p className="text-[0.8125rem] leading-relaxed text-body">
            <span className="font-semibold text-heading">Flexible cancellation.</span> Cancel for
            free up to 24 hours before check-in.
          </p>
        </div>
      </form>

      <div className="card-raised p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold">Why book with {site.name}?</h2>
        <span aria-hidden className="mt-4 block h-px w-full bg-line" />
        <ul className="mt-5 space-y-5">
          {bookingAssurances.map((item) => (
            <li key={item.title} className="group flex gap-3.5">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-line text-accent transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:-translate-y-0.5 group-hover:border-transparent group-hover:bg-mustard group-hover:text-ink">
                <Icon name={item.icon} className="size-[1.05rem]" />
              </span>
              <span>
                <span className="block text-[0.9375rem] font-semibold text-heading">
                  {item.title}
                </span>
                <span className="text-[0.8125rem] text-muted">{item.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
