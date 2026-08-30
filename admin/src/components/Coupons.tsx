import { useCallback, useEffect, useState } from 'react'
import { Plus, Save, Tag, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { COLUMNS, formatDate, isoDate, type CouponRow } from '@/lib/db'
import { Badge, Button, Card, Empty, ErrorNote, Field, Loading, Text, Toggle, cn } from './ui'

/**
 * Discount codes, beside the campaign that has its own.
 *
 * The welcome campaign's code is part of the popup - it is on the artwork, it
 * is filled into the booking form on its own, and it lives with the rest of
 * that campaign above. Everything here is the other kind: a code the desk hands
 * out directly, which has to work whether or not a popup is running.
 *
 * A code entered here is live the moment it is saved. There is no publish step,
 * for the same reason the campaign has none - a discount is the thing most
 * likely to need pulling in a hurry, and waiting for a build to do it is how a
 * mistake gets expensive.
 *
 * The site never receives this list. It sends the code somebody typed to the
 * offer endpoint and is told what it is worth, so a code given to one partner
 * is not sitting in every visitor's network tab.
 */

const blank: Omit<CouponRow, 'id'> = {
  code: '',
  percent: 10,
  label: '',
  active: true,
  starts_on: null,
  expires_on: null,
}

/** Today, in the format the date inputs and the database both use - and in the
    desk's own timezone, so a coupon does not expire at half past five in the
    morning. See `isoDate`. */
const today = isoDate

type Draft = CouponRow | Omit<CouponRow, 'id'>

/** Live, or the reason it is not. The panel says which rather than showing a
    green dot that is only sometimes true. */
function status(row: CouponRow) {
  if (!row.active) return { tone: 'neutral' as const, text: 'off' }
  if (row.starts_on && row.starts_on > today()) return { tone: 'warn' as const, text: 'scheduled' }
  if (row.expires_on && row.expires_on < today()) return { tone: 'alert' as const, text: 'expired' }
  return { tone: 'live' as const, text: 'live' }
}

export function Coupons() {
  const [rows, setRows] = useState<CouponRow[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: failure } = await supabase
      .from('coupons')
      .select(COLUMNS.coupon)
      .order('created_at', { ascending: false })

    if (failure) setError(failure.message)
    else setRows((data ?? []) as unknown as CouponRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function save() {
    if (!draft) return

    const code = draft.code.trim().toUpperCase()
    if (!code) {
      setError('A coupon needs a code.')
      return
    }
    if (draft.percent < 1 || draft.percent > 100) {
      setError('The discount has to be between 1 and 100 percent.')
      return
    }

    setBusy(true)
    setError('')

    const { id, ...fields } = draft as CouponRow
    const payload = {
      ...fields,
      code,
      // Empty date inputs come back as '', which is not a date.
      starts_on: fields.starts_on || null,
      expires_on: fields.expires_on || null,
      label: fields.label?.trim() || null,
    }

    const { error: failure } = id
      ? await supabase.from('coupons').update(payload).eq('id', id)
      : await supabase.from('coupons').insert(payload)

    setBusy(false)
    if (failure) {
      setError(
        failure.message.includes('coupons_code_idx')
          ? `${code} already exists. Edit that one instead, or pick another code.`
          : failure.message,
      )
      return
    }

    setDraft(null)
    load()
  }

  async function remove(row: CouponRow) {
    if (!confirm(`Delete ${row.code}? Anybody holding it will be told it is not valid.`)) return
    const { error: failure } = await supabase.from('coupons').delete().eq('id', row.id)
    if (failure) setError(failure.message)
    else load()
  }

  /** The switch on a listed row, saved immediately - turning a code off is the
      most urgent thing this panel does and should not need a second click. */
  async function setActive(row: CouponRow, active: boolean) {
    setRows(rows.map((item) => (item.id === row.id ? { ...item, active } : item)))
    const { error: failure } = await supabase.from('coupons').update({ active }).eq('id', row.id)
    if (failure) {
      setError(failure.message)
      load()
    }
  }

  const set = <K extends keyof CouponRow>(key: K, value: CouponRow[K]) =>
    setDraft((current) => (current ? ({ ...current, [key]: value } as Draft) : current))

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Tag className="size-4 text-gold dark:text-mustard" />
          Coupons
        </h2>
        {!draft && (
          <Button variant="ghost" onClick={() => setDraft({ ...blank })}>
            <Plus className="size-4" />
            Add coupon
          </Button>
        )}
      </div>

      <p className="text-[0.8125rem] leading-relaxed text-muted">
        Codes the booking form accepts, on top of the campaign&apos;s own. A guest types one into
        the coupon box on any room and the price drops by that percent straight away. Live as soon
        as it is saved - no publish needed.
      </p>

      {error && <ErrorNote error={error} />}

      {draft && (
        <div className="rounded-xl border border-line bg-surface-2 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code" hint="What the guest types. Case does not matter.">
              <Text
                autoFocus
                value={draft.code}
                onChange={(event) => set('code', event.target.value.toUpperCase())}
                className="uppercase"
                placeholder="MONSOON20"
              />
            </Field>

            <Field label="Discount" hint="A whole percent, 1 to 100.">
              <Text
                type="number"
                min={1}
                max={100}
                value={draft.percent}
                onChange={(event) => set('percent', Number(event.target.value))}
              />
            </Field>

            <Field label="What it is for" hint="Only you see this.">
              <Text
                value={draft.label ?? ''}
                onChange={(event) => set('label', event.target.value)}
                placeholder="Monsoon slow weeks"
              />
            </Field>

            <div className="flex items-end pb-2">
              <Toggle
                checked={draft.active}
                onChange={(next) => set('active', next)}
                label="Accepted right now"
              />
            </div>

            <Field label="Starts" hint="Leave empty to start immediately.">
              <Text
                type="date"
                value={draft.starts_on ?? ''}
                onChange={(event) => set('starts_on', event.target.value || null)}
              />
            </Field>

            <Field label="Expires" hint="Leave empty and it runs until you turn it off.">
              <Text
                type="date"
                value={draft.expires_on ?? ''}
                onChange={(event) => set('expires_on', event.target.value || null)}
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button busy={busy} onClick={save}>
              <Save className="size-4" />
              Save coupon
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              <X className="size-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty>No coupons yet.</Empty>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const state = status(row)
            return (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line px-4 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[0.9375rem] font-semibold text-heading">
                      {row.code}
                    </span>
                    <span
                      className={cn(
                        'rounded-full bg-primary/10 px-2 py-0.5 text-[0.75rem] font-bold text-primary',
                      )}
                    >
                      -{row.percent}%
                    </span>
                    <Badge tone={state.tone}>{state.text}</Badge>
                  </span>
                  <span className="mt-1 block truncate text-[0.8125rem] text-muted">
                    {row.label || 'No note'}
                    {row.starts_on && ` · from ${formatDate(row.starts_on)}`}
                    {row.expires_on && ` · until ${formatDate(row.expires_on)}`}
                  </span>
                </span>

                <Toggle
                  checked={row.active}
                  onChange={(next) => setActive(row, next)}
                  label="On"
                />

                <button
                  type="button"
                  onClick={() => setDraft(row)}
                  className="rounded-lg px-2 py-1 text-[0.8125rem] font-semibold text-body transition-colors hover:text-heading"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(row)}
                  aria-label={`Delete ${row.code}`}
                  className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-maroon/10 hover:text-maroon"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
