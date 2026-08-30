import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { COLUMNS, type SettingsRow } from '@/lib/db'
import {
  Area,
  Button,
  Card,
  ErrorNote,
  Field,
  Loading,
  PageHeader,
  Text,
} from '@/components/ui'

/**
 * The hostel's own details.
 *
 * The WhatsApp number here is the one every Book Now on the site dials, so it
 * is the single most consequential field in the panel: get it wrong and the
 * entire booking funnel opens a chat with a stranger. It is stored as digits
 * only, in international format, because that is what a wa.me link takes.
 *
 * Brand identity - the name, the tagline, the domain, the share image - is not
 * here. It lives in the site's code, because it is not something a front desk
 * changes, and the domain in particular is compiled into static files at build.
 */
export default function Settings() {
  const [row, setRow] = useState<SettingsRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('site_settings')
      .select(COLUMNS.settings)
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error: failure }) => {
        if (failure) setError(failure.message)
        else setRow(data as unknown as SettingsRow)
      })
  }, [])

  async function save() {
    if (!row) return
    setBusy(true)
    setError('')
    setSaved(false)

    const { id, ...fields } = row
    const { error: failure } = await supabase.from('site_settings').upsert({ id, ...fields })

    setBusy(false)
    if (failure) setError(failure.message)
    else {
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    }
  }

  if (error && !row) return <ErrorNote error={error} />
  if (!row) return <Loading />

  const set = <K extends keyof SettingsRow>(key: K, value: SettingsRow[K]) =>
    setRow({ ...row, [key]: value })

  const digits = row.whatsapp_number.replace(/\D/g, '')
  const numberLooksWrong = digits.length < 10 || digits !== row.whatsapp_number

  return (
    <>
      <PageHeader
        title="Settings"
        note="Goes live on the next publish."
        actions={
          <>
            {saved && (
              <span className="self-center text-[0.8125rem] font-medium text-green-deep dark:text-green">
                Saved
              </span>
            )}
            <Button busy={busy} onClick={save}>
              <Save className="size-4" />
              Save
            </Button>
          </>
        }
      />

      {error && <ErrorNote error={error} />}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Reaching you</h2>

          <Field
            label="WhatsApp number"
            hint="Digits only, with the country code: 919876543210. Every Book Now on the site opens a chat with this number."
          >
            <Text
              value={row.whatsapp_number}
              onChange={(event) => set('whatsapp_number', event.target.value)}
            />
          </Field>

          {numberLooksWrong && (
            <p className="rounded-lg border border-mustard/50 bg-mustard/12 px-3 py-2 text-[0.8125rem] text-gold">
              That does not look like a wa.me number. It needs the country code and no spaces,
              plus signs or dashes.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone, as displayed">
              <Text
                value={row.phone_display}
                onChange={(event) => set('phone_display', event.target.value)}
              />
            </Field>

            <Field label="Email">
              <Text value={row.email} onChange={(event) => set('email', event.target.value)} />
            </Field>

            <Field label="Check-in">
              <Text value={row.check_in} onChange={(event) => set('check_in', event.target.value)} />
            </Field>

            <Field label="Check-out">
              <Text
                value={row.check_out}
                onChange={(event) => set('check_out', event.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Where you are</h2>

          <Field label="Address line 1">
            <Text
              value={row.address_line1}
              onChange={(event) => set('address_line1', event.target.value)}
            />
          </Field>

          <Field label="Address line 2">
            <Text
              value={row.address_line2}
              onChange={(event) => set('address_line2', event.target.value)}
            />
          </Field>

          <Field label="Address line 3">
            <Text
              value={row.address_line3}
              onChange={(event) => set('address_line3', event.target.value)}
            />
          </Field>

          <Field
            label="Coordinates"
            hint="lat,lng from the Google Maps pin. The embed and the directions link both take this, so they land on the door rather than a search result."
          >
            <Text value={row.coords} onChange={(event) => set('coords', event.target.value)} />
          </Field>

          <Field label="Google Maps link" hint="The share link off the listing.">
            <Text value={row.map_url} onChange={(event) => set('map_url', event.target.value)} />
          </Field>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">The numbers you advertise</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Guests" hint="e.g. 25K+">
              <Text
                value={row.stat_guests}
                onChange={(event) => set('stat_guests', event.target.value)}
              />
            </Field>

            <Field label="Rating">
              <Text
                type="number"
                step="0.1"
                value={row.stat_rating}
                onChange={(event) => set('stat_rating', Number(event.target.value))}
              />
            </Field>

            <Field label="Reviews">
              <Text
                type="number"
                value={row.stat_reviews}
                onChange={(event) => set('stat_reviews', Number(event.target.value))}
              />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Social accounts</h2>

          <Field
            label="Accounts"
            hint="One per line: Label | URL | icon | handle. The icon is one of instagram, facebook, youtube - anything else is skipped rather than drawn as a blank."
          >
            <Area
              rows={5}
              value={row.socials
                .map((social) => [social.label, social.href, social.icon, social.handle].join(' | '))
                .join('\n')}
              onChange={(event) =>
                set(
                  'socials',
                  event.target.value
                    .split('\n')
                    .map((line) => line.split('|').map((part) => part.trim()))
                    .filter((parts) => parts.length === 4)
                    .map(([label, href, icon, handle]) => ({ label, href, icon, handle })),
                )
              }
            />
          </Field>
        </Card>
      </div>
    </>
  )
}
