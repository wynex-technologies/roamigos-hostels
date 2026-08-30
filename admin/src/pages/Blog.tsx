import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { COLUMNS, formatDate, type BlogRow } from '@/lib/db'
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
  Select,
  Text,
  Toggle,
} from '@/components/ui'

type ListRow = Pick<
  BlogRow,
  'id' | 'slug' | 'title' | 'category' | 'author' | 'published_on' | 'featured' | 'published' | 'sort_order'
>

/** The chapter index on the journal page. Adding one here means adding it to
    `blogCategories` in the site's `src/data/blog.ts` too, or the filter will
    have nothing to label it with. */
const CATEGORIES = [
  { key: 'city', label: 'The City' },
  { key: 'hills', label: 'The Hills' },
  { key: 'river', label: 'The River' },
  { key: 'table', label: 'The Table' },
  { key: 'kit', label: 'Kit & Advice' },
]

const blank: Omit<BlogRow, 'id'> = {
  slug: '',
  title: '',
  excerpt: '',
  category: 'city',
  author: '',
  published_on: new Date().toISOString().slice(0, 10),
  read_time: '6 min read',
  image: '',
  featured: false,
  facts: [],
  sort_order: 99,
  published: true,
}

/**
 * The journal.
 *
 * One post can be the lead story, and the database enforces it with a partial
 * unique index - so turning Featured on for a second post is refused rather
 * than quietly making the lead depend on row order. The message says so.
 *
 * Posts have no pages of their own on the site yet: the journal prints titles
 * and standfirsts, and the slug is stored for when article pages land.
 */
export default function Blog() {
  const [rows, setRows] = useState<ListRow[]>([])
  const [editing, setEditing] = useState<BlogRow | Omit<BlogRow, 'id'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: failure } = await supabase
      .from('blog_posts')
      .select(COLUMNS.blogList)
      .order('published_on', { ascending: false })

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
      .from('blog_posts')
      .select(COLUMNS.blog)
      .eq('id', id)
      .single()

    if (failure) setError(failure.message)
    else setEditing(data as unknown as BlogRow)
  }

  async function save() {
    if (!editing) return
    setBusy(true)
    setError('')

    const { id, ...fields } = editing as BlogRow
    const { error: failure } = id
      ? await supabase.from('blog_posts').update(fields).eq('id', id)
      : await supabase.from('blog_posts').insert(fields)

    setBusy(false)
    if (failure) {
      setError(
        failure.message.includes('blog_posts_one_featured_idx')
          ? 'Another post is already the lead story. Turn Featured off there first.'
          : failure.message,
      )
      return
    }

    setEditing(null)
    load()
  }

  async function remove(id: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return
    const { error: failure } = await supabase.from('blog_posts').delete().eq('id', id)
    if (failure) setError(failure.message)
    else {
      setEditing(null)
      load()
    }
  }

  if (editing) {
    const post = editing as BlogRow
    const set = <K extends keyof BlogRow>(key: K, value: BlogRow[K]) =>
      setEditing({ ...post, [key]: value })

    return (
      <>
        <PageHeader
          title={post.id ? 'Edit story' : 'New story'}
          actions={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
              {post.id && (
                <Button variant="danger" onClick={() => remove(post.id, post.title)}>
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
            <Field label="Title">
              <Area rows={2} value={post.title} onChange={(e) => set('title', e.target.value)} />
            </Field>

            <Field label="Slug">
              <Text value={post.slug} onChange={(e) => set('slug', e.target.value)} />
            </Field>

            <Field label="Standfirst" hint="The paragraph under the headline on the card.">
              <Area rows={5} value={post.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <Select value={post.category} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORIES.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Author">
                <Text value={post.author} onChange={(e) => set('author', e.target.value)} />
              </Field>

              <Field label="Published on">
                <Text
                  type="date"
                  value={post.published_on}
                  onChange={(e) => set('published_on', e.target.value)}
                />
              </Field>

              <Field label="Read time">
                <Text value={post.read_time} onChange={(e) => set('read_time', e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card className="space-y-4">
            <Field label="Image" hint="Unsplash id or a full URL. Never an upload.">
              <Text value={post.image} onChange={(e) => set('image', e.target.value)} />
            </Field>

            <Field
              label="Facts"
              hint="Up to three, printed under the lead story. One per line as: label | value"
            >
              <Area
                rows={4}
                value={post.facts.map((fact) => `${fact.label} | ${fact.value}`).join('\n')}
                onChange={(e) =>
                  set(
                    'facts',
                    e.target.value
                      .split('\n')
                      .map((line) => line.split('|'))
                      .filter((parts) => parts.length === 2)
                      .map(([label, value]) => ({ label: label.trim(), value: value.trim() })),
                  )
                }
              />
            </Field>

            <div className="flex flex-wrap items-center gap-6">
              <Toggle
                checked={post.published}
                onChange={(next) => set('published', next)}
                label="Live on the site"
              />
              <Toggle
                checked={post.featured}
                onChange={(next) => set('featured', next)}
                label="Lead story"
              />
            </div>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Journal"
        note={`${rows.length} stories.`}
        actions={
          <Button onClick={() => setEditing({ ...blank })}>
            <Plus className="size-4" />
            New story
          </Button>
        }
      />

      {error && <ErrorNote error={error} />}

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty>No stories yet.</Empty>
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
                <span className="block truncate font-medium text-heading">{row.title}</span>
                <span className="block truncate text-[0.8125rem] text-muted">
                  {row.author} &middot; {formatDate(row.published_on)} &middot; {row.category}
                </span>
              </span>
              {row.featured && <Badge tone="warn">lead</Badge>}
              <Badge tone={row.published ? 'live' : 'neutral'}>
                {row.published ? 'live' : 'draft'}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
