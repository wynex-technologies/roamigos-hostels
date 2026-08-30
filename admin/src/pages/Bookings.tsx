import { useCallback, useEffect, useState } from 'react'
import { Check, ChevronDown, Download, MessageCircle, RefreshCw, Trash2 } from 'lucide-react'
import { ExportPanel, type ExportRequest } from '@/components/ExportPanel'
import { downloadXlsx, rangeLabel, type Column } from '@/lib/xlsx'
import { supabase } from '@/lib/supabase'
import {
  COLUMNS,
  PAGE_SIZE,
  formatDate,
  formatWhen,
  inr,
  type BookingRow,
  type Status,
} from '@/lib/db'
import { Badge, Button, Card, Empty, ErrorNote, Loading, PageHeader, Select } from '@/components/ui'

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
  const [rows, setRows] = useState<BookingRow[]>([])
  // Everything, not just the pending ones.
  //
  // It used to open on `new`, which meant confirming or cancelling a booking
  // made it vanish from the screen the moment you acted on it - filtered out,
  // not deleted, but there is no way to tell those two apart by looking. The
  // filter is still here and still one click away; it just is not the default
  // any more.
  const [filter, setFilter] = useState<Status | 'all'>('all')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    let query = supabase
      .from('bookings')
      .select(COLUMNS.booking, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (filter !== 'all') query = query.eq('status', filter)

    const { data, error: failure, count } = await query

    if (failure) setError(failure.message)
    else {
      setRows((data ?? []) as unknown as BookingRow[])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [filter, page])

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
          .lte(basis, basis === 'created_at' ? `${to}T23:59:59.999Z` : to)
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

  async function setNote(id: string, admin_note: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, admin_note } : row)))
    await supabase.from('bookings').update({ admin_note }).eq('id', id)
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <PageHeader
        title="Bookings"
        note={`${total} ${filter === 'all' ? 'in total' : LABEL[filter]}`}
        actions={
          <>
            <Select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value as Status | 'all')
                setPage(0)
              }}
              className="w-auto"
            >
              <option value="all">All</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {LABEL[status]}
                </option>
              ))}
            </Select>
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
        <Empty>Nothing here. New booking requests land at the top of this list.</Empty>
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
                        {row.room_name ?? 'No room'} &middot; {formatDate(row.check_in)} to{' '}
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
