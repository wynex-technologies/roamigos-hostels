import { useEffect, useMemo, useState } from 'react'
import { Save, X } from 'lucide-react'
import { supabase, anonKey, functionsBase } from '@/lib/supabase'
import { inr } from '@/lib/db'
import { Area, Button, DateText, ErrorNote, Field, Select, Text } from './ui'

/**
 * A booking taken at the desk, not through the site.
 *
 * ## Why it posts to `intake` instead of inserting
 *
 * It would be one line to `supabase.from('bookings').insert(...)` from here, and
 * it would be wrong twice over.
 *
 * The first reason is that it would not work: `authenticated` has select,
 * update and delete on that table and deliberately no insert, because guest
 * submissions arrive through the edge function that validates them.
 *
 * The second is the one that matters. A booking is not only a row - it is a row,
 * an email to the desk, a line in the Google Sheet and a reference that ties the
 * three together. All of that lives in `intake`, along with the sheet's webhook
 * URL and token, which are server secrets and must never be in this bundle. A
 * walk-in written straight into the table would be a booking the spreadsheet
 * never heard of, and nobody would notice until the month was totalled.
 *
 * So this sends exactly what the site sends, to exactly the same endpoint. One
 * path, one shape, and a booking taken over the counter is indistinguishable
 * from one that came through WhatsApp.
 *
 * ## What it does not set
 *
 * The status. A row lands as `new` like any other and the desk presses Confirm,
 * which is one click and already on screen. Letting the payload choose a status
 * would mean a public endpoint that accepts `confirmed` from anybody.
 */

interface RoomOption {
  slug: string
  name: string
  categories: string[]
  price_per_night: number
}

const BLANK = {
  roomSlug: '',
  checkIn: '',
  checkOut: '',
  guests: '1',
  salutation: '',
  name: '',
  phone: '',
  email: '',
  /** Blank means "use the calculated one" - see `money` below. */
  total: '',
  note: '',
}

/** Whole nights between two ISO dates; 0 when the range is empty or reversed. */
function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0
  const start = new Date(`${checkIn}T00:00:00`).getTime()
  const end = new Date(`${checkOut}T00:00:00`).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return 0
  return Math.max(0, Math.round((end - start) / 86_400_000))
}

export function NewBooking({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  /** The list reloads itself - the reference is issued by the database. */
  onSaved: (message: string) => void
}) {
  const [draft, setDraft] = useState(BLANK)
  const [rooms, setRooms] = useState<RoomOption[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Unpublished rooms included: the desk can still be putting somebody in a room
  // that is off the site this week.
  useEffect(() => {
    if (!open) return
    let alive = true
    void supabase
      .from('rooms')
      .select('slug,name,categories,price_per_night')
      .order('sort_order')
      .then(({ data }) => {
        if (alive) setRooms((data ?? []) as RoomOption[])
      })
    return () => {
      alive = false
    }
  }, [open])

  const room = rooms.find((entry) => entry.slug === draft.roomSlug)
  const guests = Math.max(1, Number(draft.guests) || 1)
  const nights = nightsBetween(draft.checkIn, draft.checkOut)

  /**
   * The figures, worked out the way the site's booking widget works them out:
   * a dorm is priced per bed, a private room per room.
   *
   * The desk can type over the total, because a walk-in is often a rate somebody
   * agreed at the counter. Whatever it is lowered by becomes the discount, so
   * the spreadsheet's Subtotal, Discount and Total columns still add up - a
   * total quietly written in without the difference recorded is a row that does
   * not reconcile.
   */
  const money = useMemo(() => {
    const units = room?.categories.includes('dorm') ? guests : 1
    const subtotal = (room?.price_per_night ?? 0) * nights * units
    const typed = draft.total.trim() === '' ? null : Math.max(0, Number(draft.total) || 0)
    const total = typed === null ? subtotal : Math.min(typed, subtotal || typed)
    return { subtotal, total, discount: Math.max(0, subtotal - total) }
  }, [room, guests, nights, draft.total])

  if (!open) return null

  function set<K extends keyof typeof BLANK>(key: K, value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const missing =
    draft.name.trim().length < 2 ||
    draft.phone.replace(/\D/g, '').length < 7 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email.trim())

  async function save() {
    if (missing || busy) return
    setBusy(true)
    setError('')

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token ?? anonKey

      const response = await fetch(`${functionsBase}/intake`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'booking',
          roomSlug: room?.slug,
          roomName: room?.name,
          guestName: draft.name.trim() ? (draft.salutation ? `${draft.salutation} ${draft.name.trim()}` : draft.name.trim()) : undefined,
          guestPhone: draft.phone.trim(),
          guestEmail: draft.email.trim(),
          checkIn: draft.checkIn || undefined,
          checkOut: draft.checkOut || undefined,
          nights,
          guests,
          subtotal: money.subtotal,
          discount: money.discount,
          total: money.total,
          note: draft.note.trim() || undefined,
        }),
      })

      // 202 is the endpoint saying it already has this one. It dedupes on the
      // email and the room inside a two minute window, which is a double tap
      // from a guest and, here, usually a second walk-in typed in too quickly
      // against the same placeholder address.
      if (response.status === 202) {
        setError(
          'That looks like the booking just added - same guest, same room, within two minutes. ' +
            'Nothing was saved twice.',
        )
        return
      }

      if (!response.ok) throw new Error(`The booking was not saved (${response.status}).`)

      setDraft(BLANK)
      onSaved('Booking added. It is on the sheet and the desk has been emailed.')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The booking was not saved.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-5 rounded-xl border border-line bg-surface-2 p-4 sm:p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-base font-semibold">Add a booking</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-7 place-items-center rounded-lg text-muted transition-colors hover:text-heading"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Room" className="lg:col-span-2">
          <Select value={draft.roomSlug} onChange={(event) => set('roomSlug', event.target.value)}>
            <option value="">No room</option>
            {rooms.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.name} - {inr.format(entry.price_per_night)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Check in">
          <DateText
            label="Check in"
            placeholder="Not set"
            value={draft.checkIn}
            max={draft.checkOut || undefined}
            onChange={(iso) => set('checkIn', iso)}
          />
        </Field>

        <Field label="Check out">
          <DateText
            label="Check out"
            placeholder="Not set"
            value={draft.checkOut}
            min={draft.checkIn || undefined}
            onChange={(iso) => set('checkOut', iso)}
          />
        </Field>

        <Field label="Guest name">
          <div className="flex gap-2">
            <Select
              value={draft.salutation}
              onChange={(event) => set('salutation', event.target.value)}
              className="w-24 shrink-0"
              aria-label="Title"
            >
              <option value=""></option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Dr.">Dr.</option>
            </Select>
            <Text 
              value={draft.name} 
              onChange={(event) => set('name', event.target.value)} 
              className="flex-1"
            />
          </div>
        </Field>

        <Field label="Phone">
          <Text
            type="tel"
            value={draft.phone}
            onChange={(event) => set('phone', event.target.value)}
          />
        </Field>

        <Field label="Email" hint="The desk has to be able to reach them.">
          <Text
            type="email"
            value={draft.email}
            onChange={(event) => set('email', event.target.value)}
          />
        </Field>

        <Field label={room?.categories.includes('dorm') ? 'Beds' : 'Guests'}>
          <Text
            type="number"
            min={1}
            max={64}
            value={draft.guests}
            onChange={(event) => set('guests', event.target.value)}
          />
        </Field>

        <Field
          label="Total"
          hint={
            nights > 0 && money.subtotal > 0
              ? `${nights} night(s) at the room rate is ${inr.format(money.subtotal)}. Leave blank for that.`
              : 'Leave blank to calculate from the room and the dates.'
          }
          className="lg:col-span-2"
        >
          <Text
            type="number"
            min={0}
            placeholder={money.subtotal ? String(money.subtotal) : '0'}
            value={draft.total}
            onChange={(event) => set('total', event.target.value)}
          />
        </Field>

        <Field label="Note" className="sm:col-span-2 lg:col-span-4">
          <Area
            rows={2}
            value={draft.note}
            onChange={(event) => set('note', event.target.value)}
            placeholder="Anything the desk should remember - late arrival, airport pickup."
          />
        </Field>
      </div>

      {money.discount > 0 && (
        <p className="mt-3 text-[0.8125rem] text-muted">
          Recorded as {inr.format(money.subtotal)} less {inr.format(money.discount)} off.
        </p>
      )}

      {error && (
        <div className="mt-4">
          <ErrorNote error={error} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button busy={busy} onClick={save} disabled={missing}>
          <Save className="size-4" />
          Add booking
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        {missing && (
          <span className="text-[0.8125rem] text-muted">
            A name, a phone number and an email are needed before this can be saved.
          </span>
        )}
      </div>
    </div>
  )
}
