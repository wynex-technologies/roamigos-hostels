import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button, Field, Select, Text, cn } from './ui'
import { isoMonthStart, isoToday } from '@/lib/xlsx'

export type DateBasis = 'created_at' | 'check_in'

export interface ExportRequest {
  from: string
  to: string
  basis: DateBasis
  status: string
}

/**
 * The export controls, as a panel rather than a dialog.
 *
 * A modal would have to be portalled out of the page, trapped, and dismissed -
 * three things to get right for a form with four fields that nobody needs to
 * see over the top of anything. It opens under the header instead, where the
 * list it is about is still visible behind it.
 *
 * Two date bases, because the two questions a hostel asks of the same table are
 * different ones: "what came in last month" is accounting, and "who is arriving
 * in December" is the rota. Defaulting to when the request arrived is the safer
 * of the two, since every row has one and some have no dates at all.
 */
export function ExportPanel({
  open,
  onClose,
  onExport,
  busy,
  statuses,
  statusLabel,
  note,
}: {
  open: boolean
  onClose: () => void
  onExport: (request: ExportRequest) => void
  busy: boolean
  /** The stored status values this list can be filtered to. */
  statuses: string[]
  statusLabel: (status: string) => string
  note?: string
}) {
  const [from, setFrom] = useState(isoMonthStart)
  const [to, setTo] = useState(isoToday)
  const [basis, setBasis] = useState<DateBasis>('created_at')
  const [status, setStatus] = useState('all')

  if (!open) return null

  const backwards = Boolean(from && to && from > to)

  return (
    <div className="mb-5 rounded-xl border border-line bg-surface-2 p-4 sm:p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-base font-semibold">Export to a spreadsheet</h2>
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
        <Field label="Dates are">
          <Select value={basis} onChange={(event) => setBasis(event.target.value as DateBasis)}>
            <option value="created_at">When it came in</option>
            <option value="check_in">Check-in date</option>
          </Select>
        </Field>

        <Field label="From">
          <Text type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </Field>

        <Field label="To" hint="Included.">
          <Text type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </Field>

        <Field label="Status">
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {statusLabel(value)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* True on both lists: a booking or an enquiry can arrive with no dates
          on it at all, and filtering by check-in silently leaves those out. */}
      {basis === 'check_in' && (
        <p className="mt-3 text-[0.8125rem] text-muted">
          Rows with no check-in date on them are not included when you filter this way.
        </p>
      )}

      {backwards && (
        <p className="mt-3 text-[0.8125rem] font-medium text-gold">
          The From date is after the To date, so nothing would come out.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          busy={busy}
          disabled={backwards || !from || !to}
          onClick={() => onExport({ from, to, basis, status })}
        >
          <Download className="size-4" />
          {busy ? 'Building the file' : 'Download'}
        </Button>
        <span className={cn('text-[0.75rem] text-muted', !note && 'hidden')}>{note}</span>
      </div>
    </div>
  )
}
