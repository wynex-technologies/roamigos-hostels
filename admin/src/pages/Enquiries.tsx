import { useCallback, useEffect, useState } from 'react'
import { MessageCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  COLUMNS,
  PAGE_SIZE,
  formatDate,
  formatWhen,
  type EnquiryRow,
  type EnquiryStatus,
} from '@/lib/db'
import { Badge, Button, Card, Empty, ErrorNote, Loading, PageHeader, Select } from '@/components/ui'

const STATUSES: EnquiryStatus[] = ['new', 'answered', 'closed']

const tone: Record<EnquiryStatus, 'warn' | 'live' | 'neutral'> = {
  new: 'warn',
  answered: 'live',
  closed: 'neutral',
}

/** Contact form submissions. Same paging and same column discipline as the
    bookings list - see the note there for why neither is loaded whole. */
export default function Enquiries() {
  const [rows, setRows] = useState<EnquiryRow[]>([])
  const [filter, setFilter] = useState<EnquiryStatus | 'all'>('new')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    let query = supabase
      .from('enquiries')
      .select(COLUMNS.enquiry, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (filter !== 'all') query = query.eq('status', filter)

    const { data, error: failure, count } = await query

    if (failure) setError(failure.message)
    else {
      setRows((data ?? []) as unknown as EnquiryRow[])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [filter, page])

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

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <>
      <PageHeader
        title="Enquiries"
        note={`${total} ${filter === 'all' ? 'in total' : filter}`}
        actions={
          <>
            <Select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value as EnquiryStatus | 'all')
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
        <Empty>No enquiries in this view.</Empty>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-heading">
                    {row.name}
                    <span className="ml-2 font-normal text-muted">{row.phone}</span>
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
                    {' '}
                    &middot; {formatWhen(row.created_at)}
                  </p>
                </div>

                <Badge tone={tone[row.status]}>{row.status}</Badge>

                <Select
                  value={row.status}
                  onChange={(event) => setStatus(row.id, event.target.value as EnquiryStatus)}
                  className="w-auto"
                  aria-label={`Status for ${row.name}`}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>

                <a
                  href={`https://wa.me/${row.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Message ${row.name}`}
                  className="grid size-9 place-items-center rounded-full bg-green-deep text-white transition-colors hover:bg-green"
                >
                  <MessageCircle className="size-4" />
                </a>
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
