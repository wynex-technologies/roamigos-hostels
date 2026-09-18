import { useCallback, useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  Download,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { ExportPanel, type ExportRequest } from '@/components/ExportPanel'
import { NewBooking } from '@/components/NewBooking'
import { downloadXlsx, rangeLabel, type Column } from '@/lib/xlsx'
import { supabase } from '@/lib/supabase'
import { useMarkSeen } from '@/lib/notifications'
import {
  COLUMNS,
  PAGE_SIZE,
  formatDate,
  formatWhen,
  inr,
  rangeEnd,
  searchFilter,
  type BookingRow,
  type DateBasis,
  type Status,
} from '@/lib/db'
import {
  Badge,
  Button,
  Card,
  DateText,
  Empty,
  ErrorNote,
  Field,
  Loading,
  PageHeader,
  Select,
  Text,
} from '@/components/ui'

const STATUSES: Status[] = ['new', 'confirmed', 'cancelled', 'stayed']

/**
 * What the desk calls them.
 *
 * The stored value stays `new`, because that is what the column's check
 * constraint allows and what every query filters on - but nobody at a front
 * desk thinks of an unanswered request as "new", they think of it as one they
 * have not confirmed yet. The label is the only thing that changes.
 */
const LABEL: Record<Status, string> = {
  new: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  stayed: 'stayed',
}

/**
 * `long-stay` -> `Long stay`.
 *
 * Categories are free text the desk types on the Rooms screen - there is no
 * fixed list in the code, deliberately, so that adding one needs no deploy.
 * That also means there is nowhere to look a pretty name up, so the slug is
 * tidied rather than translated.
 */
/** A slug no room can have, so a category with no rooms in it matches nothing.
    An empty `in()` is not valid PostgREST, hence a value rather than no filter. */
const NO_SUCH_ROOM = '__no_such_room__'

function typeLabel(value: string) {
  const words = value.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * What a search looks in.
 *
 * The fields somebody would have in front of them when they go looking: a
 * reference off a chat, a name, the number that rang, the room. Not the notes -
 * a desk searching for "Anita" wants the booking, not every request that
 * mentioned one.
 */
const SEARCH_COLUMNS = ['reference', 'guest_name', 'guest_phone', 'guest_email', 'room_name']

const tone: Record<Status, 'warn' | 'live' | 'alert' | 'neutral'> = {
  new: 'warn',
  confirmed: 'live',
  cancelled: 'alert',
  stayed: 'neutral',
}

/**
 * The sheet, column by column.
 *
 * Written out rather than dumped from the row, because a spreadsheet is read by
 * a person: the headings are words rather than column names, the money is
 * plain numbers so it can be summed, and the coupon is split into a code and a
 * percent rather than one string nobody can filter on.
 */
const EXPORT_COLUMNS: Column<BookingRow>[] = [
  // First, to match the Google Sheet and the email - one reference, read the
  // same way wherever the desk happens to be looking.
  { header: 'Booking ID', value: (row) => row.reference, width: 12 },
  { header: 'Received', value: (row) => row.created_at, type: 'datetime', width: 18 },
  { header: 'Status', value: (row) => LABEL[row.status], width: 11 },
  { header: 'Guest', value: (row) => row.guest_name, width: 22 },
  // Phone stays text on purpose: as a number Excel eats the leading zero and
  // turns a long one into 9.1988E+11.
  { header: 'Phone', value: (row) => row.guest_phone, width: 16 },
  { header: 'Email', value: (row) => row.guest_email, width: 26 },
  { header: 'Room', value: (row) => row.room_name, width: 24 },
  { header: 'Room slug', value: (row) => row.room_slug, width: 20 },
  { header: 'Check in', value: (row) => row.check_in, type: 'date', width: 12 },
  { header: 'Check out', value: (row) => row.check_out, type: 'date', width: 12 },
  { header: 'Nights', value: (row) => row.nights, type: 'number', width: 8 },
  { header: 'Guests', value: (row) => row.guests, type: 'number', width: 8 },
  { header: 'Coupon', value: (row) => row.coupon_code, width: 14 },
  { header: 'Coupon %', value: (row) => row.coupon_percent || '', type: 'number', width: 10 },
  { header: 'Subtotal', value: (row) => row.subtotal, type: 'money', width: 12 },
  { header: 'Discount', value: (row) => row.discount, type: 'money', width: 12 },
  { header: 'Total', value: (row) => row.total, type: 'money', width: 12 },
  { header: 'Guest request', value: (row) => row.note, width: 40 },
  { header: 'Desk note', value: (row) => row.admin_note, width: 40 },
]

/**
 * The booking requests the site has recorded.
 *
 * Each row is the copy taken as the guest opened WhatsApp - the chat is still
 * where the booking is actually agreed, and the status here is the desk's own
 * record of what happened in it.
 *
 * The list is paged rather than loaded whole. Twenty five rows is what a screen
 * shows; fetching a year of bookings to display the first page is exactly the
 * habit that runs a project into its egress limit, and it gets slower every
 * month it works.
 */
export default function Bookings() {
  // On screen is read: opening this clears the badge beside it in the nav.
  useMarkSeen('booking')

  const [rows, setRows] = useState<BookingRow[]>([])
  // Everything, not just the pending ones.
  //
  // It used to open on `new`, which meant confirming or cancelling a booking
  // made it vanish from the screen the moment you acted on it - filtered out,
  // not deleted, but there is no way to tell those two apart by looking. The
  // filter is still here and still one click away; it just is not the default
  // any more.
  const [filter, setFilter] = useState<Status | 'all'>('all')

  /**
   * The date range the list is narrowed to. Both ends start empty, so the page
   * still opens on everything - a filter nobody set should not be hiding rows.
   *
   * `basis` is the same choice the export offers, and for the same reason: the
   * desk asks "what came in last month" and "who is arriving in December" of
   * the same table. Note that measuring by `check_in` drops every row that has
   * no stay dates on it, which is correct - a booking with no arrival cannot be
   * in December - but it is why the default is when the request arrived.
   */
  const [basis, setBasis] = useState<DateBasis>('created_at')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  /**
   * Which room, or which kind of room. `''` is any; otherwise `slug:pod-bunk`
   * for one room or `cat:dorm` for every room carrying that category.
   *
   * A booking row stores the room's slug and its name, not its categories, so a
   * category has to be turned into the slugs that were in it - which is what
   * `roomList` below is for. It is eight rows, fetched once when the screen
   * opens, and it is the whole cost of this filter.
   */
  /**
   * What is in the box, and what the query is actually using.
   *
   * They are two values on purpose: typing `RMG-012` is six keystrokes and six
   * queries, on a table this page is otherwise careful not to over-fetch. The
   * second one catches up a third of a second after the typing stops.
   */
  const [typed, setTyped] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(typed.trim())
      setPage(0)
    }, 300)
    return () => window.clearTimeout(id)
  }, [typed])

  const [room, setRoom] = useState('')
  const [roomList, setRoomList] = useState<{ slug: string; name: string; categories: string[] }[]>(
    [],
  )

  // Unpublished rooms are included on purpose: a room the hostel has since
  // taken off the site still has last winter's bookings against it, and they
  // have to stay findable.
  useEffect(() => {
    let alive = true
    supabase
      .from('rooms')
      .select('slug,name,categories')
      .order('sort_order')
      .then(({ data }) => {
        if (alive) setRoomList((data ?? []) as { slug: string; name: string; categories: string[] }[])
      })
    return () => {
      alive = false
    }
  }, [])

  /** Every category actually in use, in the order the rooms are sorted. */
  const categories = [...new Set(roomList.flatMap((entry) => entry.categories))]

  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [saved, setSaved] = useState('')

  /** Bumped to force a refetch when nothing else about the query changed. */
  const [tick, setTick] = useState(0)

  /** Narrowing the list always returns to page one - page 3 of the old result
      is usually past the end of the new one, which just reads as "no bookings". */
  function narrow(apply: () => void) {
    apply()
    setPage(0)
  }

  /** Anything narrowing the list, for the count line and the empty state. */
  const narrowed = Boolean(search || from || to || room || filter !== 'all')
  const dateFiltered = Boolean(from || to)
  const backwards = Boolean(from && to && from > to)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    let query = supabase
      .from('bookings')
      .select(COLUMNS.booking, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (filter !== 'all') query = query.eq('status', filter)

    // One `or()` group, which PostgREST ANDs with every other filter - so a
    // search inside a date range stays inside it.
    if (search) query = query.or(searchFilter(SEARCH_COLUMNS, search))

    if (room.startsWith('slug:')) {
      query = query.eq('room_slug', room.slice(5))
    } else if (room.startsWith('cat:')) {
      const slugs = roomList
        .filter((entry) => entry.categories.includes(room.slice(4)))
        .map((entry) => entry.slug)
      query = slugs.length
        ? query.in('room_slug', slugs)
        : query.eq('room_slug', NO_SUCH_ROOM)
    }

    if (from) query = query.gte(basis, from)
    // Inclusive, and `rangeEnd` is what knows that a timestamp needs the end of
    // the day rather than the start of it.
    if (to) query = query.lte(basis, rangeEnd(basis, to))

    const { data, error: failure, count } = await query

    if (failure) setError(failure.message)
    else {
      setRows((data ?? []) as unknown as BookingRow[])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [filter, page, basis, from, to, room, roomList, search, tick])

  useEffect(() => {
    load()
  }, [load])

  async function setStatus(id: string, status: Status) {
    // Optimistic: the desk changes these in bursts and should not wait.
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)))
    const { error: failure } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (failure) {
      setError(failure.message)
      load()
    }
  }

  /**
   * Removes the row for good.
   *
   * Deliberately separate from Cancelled, and deliberately not next to it.
   * Cancelling is a fact about the booking that the desk will want to look
   * back at - how many fell through in July is a real question. Deleting is
   * for a row that should never have existed: a test, a duplicate, somebody's
   * mistyped submission. Two different actions, so two different buttons, and
   * this one lives inside the opened row rather than in the list.
   */
  async function remove(row: BookingRow) {
    if (!confirm(`Delete ${row.guest_name}'s booking? This cannot be undone.\n\nTo record that it fell through, set it to cancelled instead - that keeps it on the books.`)) {
      return
    }

    const { error: failure } = await supabase.from('bookings').delete().eq('id', row.id)
    if (failure) {
      setError(failure.message)
      return
    }

    setRows((current) => current.filter((item) => item.id !== row.id))
    setTotal((current) => Math.max(0, current - 1))
    setOpenId(null)
  }

  /**
   * Every matching row, as a spreadsheet.
   *
   * Fetched here rather than reusing the page on screen, because the point of
   * an export is the rows that are *not* on screen. It is pulled in batches of
   * a thousand: one query for a year of bookings is the kind of request that
   * times out on a slow connection right when somebody is trying to close their
   * books, and the loop costs nothing when there are forty rows.
   */
  async function runExport({ from, to, basis, status }: ExportRequest) {
    setExporting(true)
    setError('')

    const all: BookingRow[] = []
    const BATCH = 1000

    try {
      for (let page = 0; ; page += 1) {
        let query = supabase
          .from('bookings')
          .select(COLUMNS.booking)
          .gte(basis, from)
          // The To date is inclusive, and `created_at` is a timestamp - so the
          // 4th means up to the end of the 4th, not midnight at the start of it.
          .lte(basis, rangeEnd(basis, to))
          .order(basis, { ascending: false })
          .range(page * BATCH, page * BATCH + BATCH - 1)

        if (status !== 'all') query = query.eq('status', status)

        const { data, error: failure } = await query
        if (failure) throw new Error(failure.message)

        const batch = (data ?? []) as unknown as BookingRow[]
        all.push(...batch)
        if (batch.length < BATCH) break
      }

      if (!all.length) {
        setError('No bookings in that range, so there was nothing to download.')
        return
      }

      downloadXlsx(
        `roamigos-bookings-${rangeLabel(from, to)}.xlsx`,
        'Bookings',
        EXPORT_COLUMNS,
        all,
      )
      setExportOpen(false)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The export failed.')
    } finally {
      setExporting(false)
    }
  }

  /**
   * The desk note, saved on blur.
   *
   * Two things this has to get right, neither of which it did.
   *
   * It has to say when it fails. A note is typed once and clicked away from,
   * and nobody re-opens the row to check it stuck - so a write that quietly
   * did not land is a note the desk believes it left. It is reported the same
   * way a status change is, and the list is reloaded so what is on screen is
   * what is actually stored.
   *
   * And it has to not write when nothing changed. Blur fires every time the
   * desk clicks away from the box, opened to read and closed again included,
   * which was one update per glance.
   */
  async function setNote(id: string, admin_note: string) {
    const before = rows.find((row) => row.id === id)?.admin_note ?? ''
    if (admin_note === before) return

    setRows((current) => current.map((row) => (row.id === id ? { ...row, admin_note } : row)))

    const { error: failure } = await supabase
      .from('bookings')
      .update({ admin_note })
      .eq('id', id)

    if (failure) {
      setError(`That note was not saved: ${failure.message}`)
      load()
    }
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <PageHeader
        title="Bookings"
        note={
          `${total} ${filter === 'all' ? '' : `${LABEL[filter]} `}` +
          (narrowed
            ? `matching${dateFiltered ? ` in that ${basis === 'check_in' ? 'arrival' : 'date'} range` : ''}`
            : 'in total')
        }
        actions={
          <>
            {/* One select for both questions the desk asks: "the dorms" and
                "that one room". A category resolves to the slugs in it, a room
                filters on its own slug. */}
            <Select
              value={room}
              onChange={(event) => narrow(() => setRoom(event.target.value))}
              className="w-auto"
              aria-label="Room type"
            >
              <option value="">Any room</option>
              {categories.length > 0 && (
                <optgroup label="Type">
                  {categories.map((value) => (
                    <option key={value} value={`cat:${value}`}>
                      {typeLabel(value)}
                    </option>
                  ))}
                </optgroup>
              )}
              {roomList.length > 0 && (
                <optgroup label="Room">
                  {roomList.map((entry) => (
                    <option key={entry.slug} value={`slug:${entry.slug}`}>
                      {entry.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </Select>

            <Select
              value={filter}
              onChange={(event) => narrow(() => setFilter(event.target.value as Status | 'all'))}
              className="w-auto"
            >
              <option value="all">All</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {LABEL[status]}
                </option>
              ))}
            </Select>
            <Button
              onClick={() => {
                setAddOpen((on) => !on)
                setExportOpen(false)
              }}
            >
              <Plus className="size-4" />
              Add booking
            </Button>
            <Button variant="ghost" onClick={() => setExportOpen((on) => !on)}>
              <Download className="size-4" />
              Export
            </Button>
            <Button variant="ghost" onClick={load}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </>
        }
      />

      <NewBooking
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={(message) => {
          setAddOpen(false)
          setSaved(message)
          // Straight back to page one and no filters in the way, or the row just
          // added is somewhere behind a search nobody remembers typing. `tick`
          // is what guarantees the refetch: with every filter already clear,
          // none of these change and the query would not otherwise re-run.
          narrow(() => {
            setTyped('')
            setSearch('')
            setFrom('')
            setTo('')
            setRoom('')
            setFilter('all')
            setTick((current) => current + 1)
          })
        }}
      />

      {saved && (
        <p className="mb-5 rounded-xl border border-green/30 bg-green/8 px-4 py-3 text-sm text-green">
          {saved}
        </p>
      )}

      {/* Search first, because it is the one control that answers "this exact
          booking" - a reference read off a chat, or the name the guest gave. */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <Text
          type="search"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder="Search by booking ID, name, phone, email or room"
          aria-label="Search bookings"
          className="pl-9"
        />
      </div>

      {/* The date range, always on screen rather than behind a toggle: it is a
          question the desk asks the list constantly ("who is arriving this
          week"), and a filter hidden behind a button is a filter nobody
          remembers is set. Both ends empty is the default and means no range. */}
      <div className="mb-5 grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
        <Field label="Dates are" className="sm:w-40">
          <Select
            value={basis}
            onChange={(event) => narrow(() => setBasis(event.target.value as DateBasis))}
          >
            <option value="created_at">When it came in</option>
            <option value="check_in">Check-in date</option>
          </Select>
        </Field>

        <Field label="From">
          <DateText
            label="From"
            placeholder="Any date"
            value={from}
            max={to || undefined}
            onChange={(iso) => narrow(() => setFrom(iso))}
          />
        </Field>

        <Field label="To">
          <DateText
            label="To"
            placeholder="Any date"
            value={to}
            min={from || undefined}
            onChange={(iso) => narrow(() => setTo(iso))}
          />
        </Field>

        {dateFiltered && (
          <Button
            variant="ghost"
            onClick={() =>
              narrow(() => {
                setFrom('')
                setTo('')
              })
            }
          >
            <X className="size-4" />
            Clear dates
          </Button>
        )}
      </div>

      {backwards && (
        <p className="mb-5 text-[0.8125rem] text-maroon">
          The From date is after the To date, so nothing can match.
        </p>
      )}

      <ExportPanel
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={runExport}
        busy={exporting}
        statuses={STATUSES}
        statusLabel={(status) => LABEL[status as Status]}
        note="Opens straight in Excel, Sheets or Numbers."
      />

      {error && <ErrorNote error={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty>
          {narrowed
            ? 'Nothing matches those filters. Widen the dates, or clear the search.'
            : 'Nothing here. New booking requests land at the top of this list.'}
        </Empty>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const open = openId === row.id
            return (
              <Card key={row.id} className="p-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : row.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-expanded={open}
                  >
                    <ChevronDown
                      className={`size-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-heading">
                        {row.guest_name}
                        <span className="ml-2 font-normal text-muted">{row.guest_phone}</span>
                      </span>
                      <span className="block truncate text-[0.8125rem] text-muted">
                        <span className="font-semibold tabular-nums text-heading">
                          {row.reference}
                        </span>{' '}
                        &middot; {row.room_name ?? 'No room'} &middot; {formatDate(row.check_in)} to{' '}
                        {formatDate(row.check_out)} &middot; {row.nights}n
                      </span>
                    </span>
                  </button>

                  <span className="font-display font-semibold tabular-nums text-heading">
                    {inr.format(row.total)}
                  </span>

                  <Badge tone={tone[row.status]}>{LABEL[row.status]}</Badge>

                  {/* A request that has been agreed in the chat is confirmed
                      here, and that is the single commonest thing this page is
                      opened to do - so it is a button, not a dropdown to find
                      the right line in. Everything else stays in the Select. */}
                  {row.status === 'new' && (
                    <Button onClick={() => setStatus(row.id, 'confirmed')}>
                      <Check className="size-4" />
                      Confirm
                    </Button>
                  )}

                  <Select
                    value={row.status}
                    onChange={(event) => setStatus(row.id, event.target.value as Status)}
                    className="w-auto"
                    aria-label={`Status for ${row.guest_name}`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {LABEL[status]}
                      </option>
                    ))}
                  </Select>
                </div>

                {open && (
                  <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2 sm:p-5">
                    <dl className="space-y-1.5 text-sm">
                      {[
                        ['Email', row.guest_email],
                        ['Guests', String(row.guests)],
                        ['Subtotal', inr.format(row.subtotal)],
                        [
                          'Coupon',
                          row.coupon_code
                            ? `${row.coupon_code} (-${row.coupon_percent}%, ${inr.format(row.discount)})`
                            : 'None',
                        ],
                        ['Received', formatWhen(row.created_at)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4">
                          <dt className="text-muted">{label}</dt>
                          <dd className="text-right text-heading">{value}</dd>
                        </div>
                      ))}

                      {row.note && (
                        <div className="pt-2">
                          <dt className="text-muted">Guest request</dt>
                          <dd className="mt-1 rounded-lg bg-surface-2 p-3 text-heading">
                            {row.note}
                          </dd>
                        </div>
                      )}
                    </dl>

                    <div className="flex flex-col gap-3">
                      <label className="block">
                        <span className="mb-1.5 block text-[0.6875rem] font-bold tracking-[0.12em] text-muted uppercase">
                          Desk note
                        </span>
                        <textarea
                          rows={4}
                          defaultValue={row.admin_note ?? ''}
                          onBlur={(event) => setNote(row.id, event.target.value)}
                          placeholder="Saved when you click away."
                          className="field resize-y"
                        />
                      </label>

                      <a
                        href={`https://wa.me/${row.guest_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-green-deep px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green"
                      >
                        <MessageCircle className="size-4" />
                        Message {row.guest_name.split(' ')[0]}
                      </a>

                      {/* Inside the opened row, well away from Confirm. A row
                          deleted by a mis-tap is not recoverable. */}
                      <Button variant="danger" onClick={() => remove(row)}>
                        <Trash2 className="size-4" />
                        Delete this booking
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted">
            {page + 1} of {pages}
          </span>
          <Button
            variant="ghost"
            disabled={page + 1 >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  )
}
