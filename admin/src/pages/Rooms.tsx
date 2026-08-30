import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ImageListField } from '@/components/ImageListField'
import { KeyChips } from '@/components/KeyChips'
import { COLUMNS, fromList, inr, toList, type RoomRow } from '@/lib/db'
import { useMediaCleanup } from '@/lib/media'
import {
  Area,
  Badge,
  Button,
  Card,
  Empty,
  ErrorNote,
  Field,
  Loading,
  PageHeader,
  Text,
  Toggle,
} from '@/components/ui'

type ListRow = Pick<
  RoomRow,
  'id' | 'slug' | 'name' | 'price_per_night' | 'capacity_label' | 'categories' | 'published' | 'sort_order'
>

/**
 * The keys the site was built around, offered first in the pickers below.
 *
 * Not a closed list any more: `KeyChips` can add one, and the site derives its
 * label and its icon from the key rather than looking it up here - so a
 * category or an amenity added at the front desk needs no code change on
 * either side. These stay because their order is deliberate and because two of
 * them ("Dorms", "AC") read better than a machine would write them.
 */
const CATEGORIES = ['dorm', 'private', 'deluxe', 'long-stay']
const AMENITIES = ['ac', 'ensuite', 'locker', 'balcony', 'desk', 'mountain-view']

const blank: Omit<RoomRow, 'id'> = {
  slug: '',
  name: '',
  categories: ['dorm'],
  badge: null,
  capacity: 4,
  capacity_label: '4 Beds',
  bathroom: 'Shared Bathroom',
  short_description: '',
  subtitle: '',
  price_per_night: 499,
  rating: 4.8,
  review_count: 0,
  highlights: [],
  about: '',
  inclusions: [],
  amenities: [],
  images: [],
  total_photos: 0,
  max_guests_note: '',
  sort_order: 99,
  published: true,
}

/**
 * Rooms and beds.
 *
 * The list takes eight columns; the full row is fetched only when one is opened
 * to edit. That split is the whole reason `COLUMNS` exists - a room carries
 * several paragraphs of prose and six image URLs, and none of it is needed to
 * draw a line in a table.
 *
 * Images are ids and URLs, never uploads. Photography is served from Unsplash
 * or whatever CDN it already lives on, which is what keeps this project's
 * egress flat no matter how much traffic the site takes.
 */
export default function Rooms() {
  const media = useMediaCleanup()
  const [rows, setRows] = useState<ListRow[]>([])
  const [editing, setEditing] = useState<RoomRow | Omit<RoomRow, 'id'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: failure } = await supabase
      .from('rooms')
      .select(COLUMNS.roomsList)
      .order('sort_order', { ascending: true })

    if (failure) setError(failure.message)
    else setRows((data ?? []) as unknown as ListRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function open(id: number) {
    setError('')
    const { data, error: failure } = await supabase
      .from('rooms')
      .select(COLUMNS.room)
      .eq('id', id)
      .single()

    if (failure) setError(failure.message)
    else setEditing(data as unknown as RoomRow)
  }

  async function save() {
    if (!editing) return
    setBusy(true)
    setError('')

    const { id, ...fields } = editing as RoomRow
    const { error: failure } = id
      ? await supabase.from('rooms').update(fields).eq('id', id)
      : await supabase.from('rooms').insert(fields)

    setBusy(false)
    if (failure) {
      setError(failure.message)
      return
    }

    // Saved, so the images this edit dropped are now unreferenced.
    await media.commit()
    setEditing(null)
    load()
  }

  async function remove(id: number, name: string) {
    if (!confirm(`Delete "${name}"? The site will stop showing it on the next publish.`)) return

    const images = (editing as RoomRow | null)?.images ?? []
    const { error: failure } = await supabase.from('rooms').delete().eq('id', id)
    if (failure) setError(failure.message)
    else {
      // The row is gone, so the whole gallery has nothing pointing at it.
      await media.purge(images)
      setEditing(null)
      load()
    }
  }

  /** Back, not Save: anything uploaded during this edit was never referenced. */
  async function cancel() {
    await media.discard()
    setEditing(null)
  }

  /* ------------------------------------------------------------- editor --- */
  if (editing) {
    const room = editing as RoomRow
    const set = <K extends keyof RoomRow>(key: K, value: RoomRow[K]) =>
      setEditing({ ...room, [key]: value })

    return (
      <>
        <PageHeader
          title={room.id ? room.name : 'New room'}
          note={room.id ? `/rooms/${room.slug}` : 'It appears on the site after the next publish.'}
          actions={
            <>
              <Button variant="ghost" onClick={cancel}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
              {room.id && (
                <Button variant="danger" onClick={() => remove(room.id, room.name)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
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
            <h2 className="font-display text-lg font-semibold">The basics</h2>

            <Field label="Name">
              <Text value={room.name} onChange={(e) => set('name', e.target.value)} />
            </Field>

            <Field label="Slug" hint="The web address: /rooms/8-bed-mixed-dorm">
              <Text value={room.slug} onChange={(e) => set('slug', e.target.value)} />
            </Field>

            <Field label="Short description" hint="One line, printed on the room card.">
              <Area
                rows={2}
                value={room.short_description}
                onChange={(e) => set('short_description', e.target.value)}
              />
            </Field>

            <Field label="Subtitle" hint="The longer line under the title on the room page.">
              <Area rows={2} value={room.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
            </Field>

            <Field label="About" hint="The full paragraph on the room page.">
              <Area rows={5} value={room.about} onChange={(e) => set('about', e.target.value)} />
            </Field>

            <div className="flex flex-wrap items-center gap-5">
              <Toggle
                checked={room.published}
                onChange={(next) => set('published', next)}
                label="Live on the site"
              />
              <Field label="Order" className="w-24">
                <Text
                  type="number"
                  value={room.sort_order}
                  onChange={(e) => set('sort_order', Number(e.target.value))}
                />
              </Field>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="space-y-4">
              <h2 className="font-display text-lg font-semibold">Price and capacity</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Price per night"
                  hint={`Dorms are per bed. ${inr.format(room.price_per_night)}`}
                >
                  <Text
                    type="number"
                    value={room.price_per_night}
                    onChange={(e) => set('price_per_night', Number(e.target.value))}
                  />
                </Field>

                <Field label="Capacity" hint="Beds for a dorm, guests for a room.">
                  <Text
                    type="number"
                    value={room.capacity}
                    onChange={(e) => set('capacity', Number(e.target.value))}
                  />
                </Field>

                <Field label="Capacity label">
                  <Text
                    value={room.capacity_label}
                    onChange={(e) => set('capacity_label', e.target.value)}
                  />
                </Field>

                <Field label="Bathroom">
                  <Text value={room.bathroom} onChange={(e) => set('bathroom', e.target.value)} />
                </Field>

                <Field label="Max guests note">
                  <Text
                    value={room.max_guests_note}
                    onChange={(e) => set('max_guests_note', e.target.value)}
                  />
                </Field>

                <Field label="Badge" hint="Optional ribbon, e.g. Most Popular.">
                  <Text
                    value={room.badge ?? ''}
                    onChange={(e) => set('badge', e.target.value || null)}
                  />
                </Field>

                <Field label="Rating" hint="0 to 5.">
                  <Text
                    type="number"
                    step="0.1"
                    value={room.rating}
                    onChange={(e) => set('rating', Number(e.target.value))}
                  />
                </Field>

                <Field label="Review count">
                  <Text
                    type="number"
                    value={room.review_count}
                    onChange={(e) => set('review_count', Number(e.target.value))}
                  />
                </Field>
              </div>

              <KeyChips
                label="Categories"
                hint="Which filters this room appears under, on the rooms page and on the home page deck. Add one and it appears in both on the next publish."
                values={room.categories}
                options={CATEGORIES}
                onChange={(next) => set('categories', next)}
                addLabel="Add another"
                placeholder="Family Room"
              />

              <KeyChips
                label="Amenities"
                hint="Drives the amenity filter, and prints on the room page. The icon is worked out from the name - what you see on each chip is what the site draws."
                values={room.amenities}
                options={AMENITIES}
                onChange={(next) => set('amenities', next)}
                tone="accent"
                withIcons
                addLabel="Add another"
                placeholder="Hot water"
              />
            </Card>

            <Card className="space-y-4">
              <h2 className="font-display text-lg font-semibold">Lists and photographs</h2>

              <Field label="Highlights" hint="One per line. The chips under the room title.">
                <Area
                  rows={4}
                  value={fromList(room.highlights)}
                  onChange={(e) => set('highlights', toList(e.target.value))}
                />
              </Field>

              <Field label="Inclusions" hint="One per line.">
                <Area
                  rows={5}
                  value={fromList(room.inclusions)}
                  onChange={(e) => set('inclusions', toList(e.target.value))}
                />
              </Field>

              <ImageListField
                label="Images"
                values={room.images}
                onChange={(next) => set('images', next)}
                folder="rooms"
                dimensions="1600 x 1200"
                note="Cropped to 4:3 in the gallery. Five or more and the room page shows one large shot plus a 2x2 block."
                onUploaded={media.trackUpload}
                onRemoved={media.trackRemoval}
              />

              <Field label="Total photos" hint="The number printed on the gallery button.">
                <Text
                  type="number"
                  value={room.total_photos}
                  onChange={(e) => set('total_photos', Number(e.target.value))}
                />
              </Field>
            </Card>
          </div>
        </div>
      </>
    )
  }

  /* --------------------------------------------------------------- list --- */
  return (
    <>
      <PageHeader
        title="Rooms"
        note={`${rows.length} rooms. Changes go live on the next publish.`}
        actions={
          <Button onClick={() => setEditing({ ...blank })}>
            <Plus className="size-4" />
            New room
          </Button>
        }
      />

      {error && <ErrorNote error={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty>No rooms yet. Run the seed script, or add one here.</Empty>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => open(row.id)}
              className="card flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left transition-colors hover:border-line-strong"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-heading">{row.name}</span>
                <span className="block truncate text-[0.8125rem] text-muted">
                  /{row.slug} &middot; {row.capacity_label} &middot; {row.categories.join(', ')}
                </span>
              </span>
              <span className="font-display font-semibold tabular-nums text-heading">
                {inr.format(row.price_per_night)}
              </span>
              <Badge tone={row.published ? 'live' : 'neutral'}>
                {row.published ? 'live' : 'hidden'}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
