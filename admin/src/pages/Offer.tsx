import { useCallback, useEffect, useState } from 'react'
import { Plus, Save, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { COLUMNS, fromList, toList, type OfferRow } from '@/lib/db'
import {
  Area,
  Badge,
  Button,
  Card,
  ErrorNote,
  Field,
  Loading,
  PageHeader,
  Text,
  Toggle,
} from '@/components/ui'

const blank: Omit<OfferRow, 'id'> = {
  name: 'New campaign',
  active: false,
  eyebrow: 'Direct booking offer',
  headline: 'Book direct and',
  headline_accent: 'save 10%.',
  badge_value: '10%',
  badge_label: 'OFF',
  description: '',
  code: 'ROAM10',
  discount_percent: 10,
  image: '',
  image_alt: '',
  perks: [],
  cta_label: 'Claim 10% off',
  cta_href: '/rooms',
  note: 'Valid on direct bookings only. Subject to availability.',
  expires_on: null,
  delay_ms: 1200,
}

/**
 * The welcome campaign.
 *
 * This is the one thing on the site that does not wait for a publish. The site
 * reads it from the `offer` edge function on page load, so switching a campaign
 * on or changing its percent is live within five minutes - the length of the
 * cache on that endpoint. Everything else here goes out with the next build.
 *
 * The percent typed here is the percent the booking form actually subtracts.
 * The site interpolates it into every line of copy that mentions a number, so
 * the popup, the coupon hint, the price breakdown and the WhatsApp message can
 * never disagree with each other.
 *
 * Only one campaign may be active. The database refuses a second, which is why
 * activating one deactivates the rest first.
 */
export default function Offer() {
  const [rows, setRows] = useState<OfferRow[]>([])
  const [selected, setSelected] = useState<OfferRow | Omit<OfferRow, 'id'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: failure } = await supabase
      .from('offers')
      .select(COLUMNS.offer)
      .order('active', { ascending: false })
      .order('id', { ascending: true })

    if (failure) setError(failure.message)
    else {
      const list = (data ?? []) as unknown as OfferRow[]
      setRows(list)
      setSelected((current) => current ?? list[0] ?? null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function save(activate?: boolean) {
    if (!selected) return
    setBusy(true)
    setError('')

    const { id, ...fields } = selected as OfferRow
    const next = { ...fields, active: activate ?? fields.active }

    // The unique index allows one active row, so the others stand down first.
    if (next.active) {
      const query = supabase.from('offers').update({ active: false }).eq('active', true)
      await (id ? query.neq('id', id) : query)
    }

    const { error: failure } = id
      ? await supabase.from('offers').update(next).eq('id', id)
      : await supabase.from('offers').insert(next)

    setBusy(false)
    if (failure) {
      setError(failure.message)
      return
    }

    setSelected(null)
    load()
  }

  if (loading) return <Loading />

  const offer = selected as OfferRow | null

  return (
    <>
      <PageHeader
        title="Welcome offer"
        note="The only thing here that goes live without a publish - within five minutes."
        actions={
          <>
            <Button variant="ghost" onClick={() => setSelected({ ...blank })}>
              <Plus className="size-4" />
              New campaign
            </Button>
            {offer && !offer.active && (
              <Button variant="accent" busy={busy} onClick={() => save(true)}>
                <Zap className="size-4" />
                Save and run this
              </Button>
            )}
            {offer && (
              <Button busy={busy} onClick={() => save()}>
                <Save className="size-4" />
                Save
              </Button>
            )}
          </>
        }
      />

      {error && <ErrorNote error={error} />}

      {rows.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelected(row)}
              className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-semibold transition-colors ${
                offer && 'id' in offer && offer.id === row.id
                  ? 'border-transparent bg-primary text-on-primary'
                  : 'border-line text-body hover:border-line-strong'
              }`}
            >
              {row.name}
              {row.active && <span className="ml-2 text-mustard">running</span>}
            </button>
          ))}
        </div>
      )}

      {!offer ? (
        <Card>No campaign selected.</Card>
      ) : (
        (() => {
          const set = <K extends keyof OfferRow>(key: K, value: OfferRow[K]) =>
            setSelected({ ...offer, [key]: value })

          return (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">The deal</h2>
                  <Badge tone={offer.active ? 'live' : 'neutral'}>
                    {offer.active ? 'running' : 'off'}
                  </Badge>
                </div>

                <Field label="Campaign name" hint="Only you see this.">
                  <Text value={offer.name} onChange={(e) => set('name', e.target.value)} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Coupon code" hint="What the guest types into the booking form.">
                    <Text
                      value={offer.code ?? ''}
                      onChange={(e) => set('code', e.target.value.toUpperCase() || null)}
                    />
                  </Field>

                  <Field
                    label="Discount percent"
                    hint="The real number. The booking total subtracts it."
                  >
                    <Text
                      type="number"
                      min={0}
                      max={100}
                      value={offer.discount_percent}
                      onChange={(e) => set('discount_percent', Number(e.target.value))}
                    />
                  </Field>

                  <Field label="Expires on" hint="Blank means it runs until switched off.">
                    <Text
                      type="date"
                      value={offer.expires_on ?? ''}
                      onChange={(e) => set('expires_on', e.target.value || null)}
                    />
                  </Field>

                  <Field label="Popup delay (ms)">
                    <Text
                      type="number"
                      value={offer.delay_ms}
                      onChange={(e) => set('delay_ms', Number(e.target.value))}
                    />
                  </Field>
                </div>

                <Toggle
                  checked={offer.active}
                  onChange={(next) => set('active', next)}
                  label="Show this campaign on the site"
                />
              </Card>

              <Card className="space-y-4">
                <h2 className="font-display text-lg font-semibold">What the popup says</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Eyebrow">
                    <Text value={offer.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
                  </Field>

                  <Field label="Headline">
                    <Text value={offer.headline} onChange={(e) => set('headline', e.target.value)} />
                  </Field>

                  <Field label="Headline accent" hint="Set in the accent colour, after the headline.">
                    <Text
                      value={offer.headline_accent ?? ''}
                      onChange={(e) => set('headline_accent', e.target.value || null)}
                    />
                  </Field>

                  <Field label="Ribbon number" hint="e.g. 10%">
                    <Text
                      value={offer.badge_value ?? ''}
                      onChange={(e) => set('badge_value', e.target.value || null)}
                    />
                  </Field>

                  <Field label="Ribbon label" hint="e.g. OFF">
                    <Text
                      value={offer.badge_label ?? ''}
                      onChange={(e) => set('badge_label', e.target.value || null)}
                    />
                  </Field>

                  <Field label="Button label">
                    <Text value={offer.cta_label} onChange={(e) => set('cta_label', e.target.value)} />
                  </Field>
                </div>

                <Field label="Description">
                  <Area
                    rows={4}
                    value={offer.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </Field>

                <Field label="Perks" hint="Up to three, one per line.">
                  <Area
                    rows={3}
                    value={fromList(offer.perks)}
                    onChange={(e) => set('perks', toList(e.target.value))}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Image" hint="Unsplash id or full URL.">
                    <Text value={offer.image} onChange={(e) => set('image', e.target.value)} />
                  </Field>

                  <Field label="Image alt">
                    <Text value={offer.image_alt} onChange={(e) => set('image_alt', e.target.value)} />
                  </Field>

                  <Field
                    label="Button goes to"
                    hint="A path like /rooms stays on the site. Blank opens WhatsApp."
                  >
                    <Text value={offer.cta_href} onChange={(e) => set('cta_href', e.target.value)} />
                  </Field>

                  <Field label="Small print">
                    <Text
                      value={offer.note ?? ''}
                      onChange={(e) => set('note', e.target.value || null)}
                    />
                  </Field>
                </div>
              </Card>
            </div>
          )
        })()
      )}
    </>
  )
}
