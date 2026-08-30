import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, MessageCircle, RefreshCw } from 'lucide-react'
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

const tone: Record<Status, 'warn' | 'live' | 'alert' | 'neutral'> = {
  new: 'warn',
  confirmed: 'live',
  cancelled: 'alert',
  stayed: 'neutral',
}

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
  const [filter, setFilter] = useState<Status | 'all'>('new')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

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

  async function setNote(id: string, admin_note: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, admin_note } : row)))
    await supabase.from('bookings').update({ admin_note }).eq('id', id)
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <PageHeader
        title="Bookings"
        note={`${total} ${filter === 'all' ? 'in total' : filter}`}
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
                  {status}
                </option>
              ))}
            </Select>
            <Button variant="ghost" onClick={load}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </>
        }
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

                  <Badge tone={tone[row.status]}>{row.status}</Badge>

                  <Select
                    value={row.status}
                    onChange={(event) => setStatus(row.id, event.target.value as Status)}
                    className="w-auto"
                    aria-label={`Status for ${row.guest_name}`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
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
