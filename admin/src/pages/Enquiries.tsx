import { useCallback, useEffect, useState } from 'react'
import { Download, MessageCircle, RefreshCw, Search, X } from 'lucide-react'
import { ExportPanel, type ExportRequest } from '@/components/ExportPanel'
import { downloadXlsx, rangeLabel, type Column } from '@/lib/xlsx'
import { supabase } from '@/lib/supabase'
import { useMarkSeen } from '@/lib/notifications'
import {
  COLUMNS,
  PAGE_SIZE,
  formatDate,
  formatWhen,
  rangeEnd,
  searchFilter,
  type DateBasis,
  type EnquiryRow,
  type EnquiryStatus,
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

const STATUSES: EnquiryStatus[] = ['new', 'answered', 'closed']

/**
 * What a search looks in.
 *
 * The message is in the list, unlike the bookings search - an enquiry *is* its
 * message, and "the one asking about airport pickup" is how the desk remembers
 * it. A chat opened from a WhatsApp button carries no name or number at all, so
 * the topic is often the only thing there is to match on.
 */
const SEARCH_COLUMNS = ['name', 'phone', 'topic', 'message']

const tone: Record<EnquiryStatus, 'warn' | 'live' | 'neutral'> = {
  new: 'warn',
  answered: 'live',
  closed: 'neutral',
}

/**
 * The sheet, column by column.
 *
 * Two different things end up in this list and the sheet has to show both: a
 * filled-in contact form, and a WhatsApp button somebody pressed. The second
 * has no name and no number - those arrive in the chat - so those cells come
 * out empty and `Came from` is what identifies the row instead.
 */
const EXPORT_COLUMNS: Column<EnquiryRow>[] = [
  { header: 'Received', value: (row) => row.created_at, type: 'datetime', width: 18 },
  { header: 'Status', value: (row) => row.status, width: 11 },
  { header: 'Name', value: (row) => row.name, width: 22 },
  // Text, not a number: as a number Excel eats the leading zero.
  { header: 'Phone', value: (row) => row.phone, width: 16 },
  { header: 'Topic', value: (row) => row.topic, width: 34 },
  { header: 'Came from', value: (row) => row.source, width: 18 },
  { header: 'Check in', value: (row) => row.check_in, type: 'date', width: 12 },
  { header: 'Check out', value: (row) => row.check_out, type: 'date', width: 12 },
  { header: 'Guests', value: (row) => row.guests, width: 10 },
  { header: 'Message', value: (row) => row.message, width: 50 },
  { header: 'Desk note', value: (row) => row.admin_note, width: 40 },
]

/** Contact form submissions and chats opened. Same paging and same column
    discipline as the bookings list - see the note there for why neither is
    loaded whole. */
export default function Enquiries() {
  // On screen is read: opening this clears the badge beside it in the nav.
  useMarkSeen('enquiry')

  const [rows, setRows] = useState<EnquiryRow[]>([])
  // Everything, for the same reason the bookings list does: answering one
  // should not make it vanish off the screen the moment you act on it.
  const [filter, setFilter] = useState<EnquiryStatus | 'all'>('all')

  /** In the box, and what the query uses - see the note on the bookings search. */
  const [typed, setTyped] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(typed.trim())
      setPage(0)
    }, 300)
    return () => window.clearTimeout(id)
  }, [typed])

  /** Empty at both ends means no range, so the page still opens on everything. */
  const [basis, setBasis] = useState<DateBasis>('created_at')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  /** Narrowing the list always returns to page one. */
  function narrow(apply: () => void) {
    apply()
    setPage(0)
  }

  const dateFiltered = Boolean(from || to)
  const backwards = Boolean(from && to && from > to)
  const narrowed = Boolean(search || dateFiltered || filter !== 'all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    let query = supabase
      .from('enquiries')
      .select(COLUMNS.enquiry, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (filter !== 'all') query = query.eq('status', filter)

    // One `or()` group, ANDed with everything else - a search inside a date
    // range stays inside it.
    if (search) query = query.or(searchFilter(SEARCH_COLUMNS, search))

    if (from) query = query.gte(basis, from)
    if (to) query = query.lte(basis, rangeEnd(basis, to))

    const { data, error: failure, count } = await query

    if (failure) setError(failure.message)
    else {
      setRows((data ?? []) as unknown as EnquiryRow[])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [filter, page, search, basis, from, to])

  useEffect(() => {
    load()
  }, [load])

  async function setStatus(id: string, status: EnquiryStatus) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)))
    const { error: failure } = await supabase.from('enquiries').update({ status }).eq('id', id)
    if (failure) {
      setError(failure.message)
      load()
    }
  }

  /** Every matching row, in batches - see the note on the bookings export. */
  async function runExport({ from, to, basis, status }: ExportRequest) {
    setExporting(true)
    setError('')

    const all: EnquiryRow[] = []
    const BATCH = 1000

    try {
      for (let page = 0; ; page += 1) {
        let query = supabase
          .from('enquiries')
          .select(COLUMNS.enquiry)
          .gte(basis, from)
          // Inclusive: `created_at` is a timestamp, so the To date means the
          // end of that day rather than midnight at the start of it.
          .lte(basis, rangeEnd(basis, to))
          .order(basis, { ascending: false })
          .range(page * BATCH, page * BATCH + BATCH - 1)

        if (status !== 'all') query = query.eq('status', status)

        const { data, error: failure } = await query
        if (failure) throw new Error(failure.message)

        const batch = (data ?? []) as unknown as EnquiryRow[]
        all.push(...batch)
        if (batch.length < BATCH) break
      }

      if (!all.length) {
        setError('No enquiries in that range, so there was nothing to download.')
        return
      }

      downloadXlsx(
        `roamigos-enquiries-${rangeLabel(from, to)}.xlsx`,
        'Enquiries',
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

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <PageHeader
        title="Enquiries"
        note={
          `${total} ${filter === 'all' ? '' : `${filter} `}` +
          (narrowed
            ? `matching${dateFiltered ? ` in that ${basis === 'check_in' ? 'arrival' : 'date'} range` : ''}`
            : 'in total')
        }
        actions={
          <>
            <Select
              value={filter}
              onChange={(event) => narrow(() => setFilter(event.target.value as EnquiryStatus | 'all'))}
              className="w-auto"
            >
              <option value="all">All</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
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

      {/* Search first, then the range - the same order and the same controls as
          the Bookings screen, because it is the same job on a different table. */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <Text
          type="search"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder="Search by name, phone, topic or message"
          aria-label="Search enquiries"
          className="pl-9"
        />
      </div>

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
        statusLabel={(status) => status}
        note="Opens straight in Excel, Sheets or Numbers."
      />

      {error && <ErrorNote error={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty>
          {narrowed
            ? 'Nothing matches those filters. Widen the dates, or clear the search.'
            : 'No enquiries yet. New ones land at the top of this list.'}
        </Empty>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 font-medium text-heading">
                    {row.name ? (
                      <>
                        {row.name}
                        <span className="font-normal text-muted">{row.phone}</span>
                      </>
                    ) : (
                      /* A WhatsApp button somebody pressed. The name and the
                         number arrive in the chat itself, not here - saying so
                         is more useful than inventing a placeholder. */
                      <>
                        <span className="text-muted italic">No name yet</span>
                        <Badge tone="warn">chat opened</Badge>
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-muted">
                    {row.topic}
                    {row.check_in && (
                      <>
                        {' '}
                        &middot; {formatDate(row.check_in)} to {formatDate(row.check_out)}
                      </>
                    )}
                    {row.guests && <> &middot; {row.guests} guests</>}
                    {row.source && <> &middot; from {row.source}</>}
                    {' '}
                    &middot; {formatWhen(row.created_at)}
                  </p>
                </div>

                <Badge tone={tone[row.status]}>{row.status}</Badge>

                <Select
                  value={row.status}
                  onChange={(event) => setStatus(row.id, event.target.value as EnquiryStatus)}
                  className="w-auto"
                  aria-label={`Status for ${row.name ?? 'this chat'}`}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>

                {row.phone && (
                  <a
                    href={`https://wa.me/${row.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Message ${row.name ?? 'this guest'}`}
                    className="grid size-9 place-items-center rounded-full bg-green-deep text-white transition-colors hover:bg-green"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                )}
              </div>

              {row.message && (
                <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm leading-relaxed text-heading">
                  {row.message}
                </p>
              )}
            </Card>
          ))}
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
          <Button variant="ghost" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </>
  )
}
