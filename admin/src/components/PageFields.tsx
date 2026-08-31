import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import type { SplitHeading } from '@shared/page-content'
import { Area, Button, Card, Field, Text, cn } from './ui'

/**
 * The controls the two page forms are built from.
 *
 * They exist so `PageSettings.tsx` reads as a list of what is on each page
 * rather than as three hundred lines of `<Field><Text value=... />`. Nothing
 * here knows anything about the site's design - these are plain text boxes over
 * a document whose shape `shared/page-content.ts` declares.
 */

/** One section of a page, titled the way the section is known on the site. */
export function SectionCard({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {note && <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">{note}</p>}
      </div>
      {children}
    </Card>
  )
}

/**
 * The two-line heading every section on the home page carries.
 *
 * It is four boxes rather than one because the markup sets each piece
 * differently - the second line puts one word in the italic accent face - and
 * the panel is deliberately not able to change that. `lead` and `tail` are the
 * plain text either side of that word, spaces included, which is why the hints
 * say so: a missing space is the one mistake this field invites.
 */
export function HeadingFields<T extends Partial<SplitHeading>>({
  value,
  onChange,
  withFirstLine = true,
}: {
  value: T
  onChange: (next: T) => void
  /** The "why us" heading opens on its own quiet line, so it has no first line. */
  withFirstLine?: boolean
}) {
  const heading = value as Partial<SplitHeading>
  const set = (key: keyof SplitHeading, next: string) => onChange({ ...value, [key]: next })

  return (
    <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
      <p className="text-[0.75rem] leading-relaxed text-muted">
        The heading, in the pieces the page sets differently. The accent word is the one printed
        in italics - the rest is plain. Mind the spaces on either side of it.
      </p>

      {withFirstLine && (
        <Field label="First line">
          <Text value={heading.line1 ?? ''} onChange={(e) => set('line1', e.target.value)} />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Second line, before" hint="Usually ends with a space.">
          <Text value={heading.lead ?? ''} onChange={(e) => set('lead', e.target.value)} />
        </Field>
        <Field label="Accent word" hint="Set in italics.">
          <Text value={heading.accent ?? ''} onChange={(e) => set('accent', e.target.value)} />
        </Field>
        <Field label="Second line, after" hint="Usually just the full stop.">
          <Text value={heading.tail ?? ''} onChange={(e) => set('tail', e.target.value)} />
        </Field>
      </div>
    </div>
  )
}

/**
 * A list of things, in the order they appear on the page.
 *
 * Order matters everywhere this is used - the cards in a carousel, the moments
 * on the timeline - so moving a row is a first-class control rather than
 * something to be done by retyping two rows into each other.
 *
 * `blank` builds a new row from the shape's own defaults, so an added card is
 * never a set of empty required fields somebody has to guess at.
 */
export function Repeater<T>({
  label,
  hint,
  items,
  onChange,
  blank,
  title,
  addLabel = 'Add',
  max,
  children,
}: {
  label: string
  hint?: string
  items: T[]
  onChange: (next: T[]) => void
  blank?: () => T
  /** What to print in a row's header, so a collapsed list is still readable. */
  title: (item: T, index: number) => string
  addLabel?: string
  /** Some rows are laid out for a fixed count - the site says so, not the desk. */
  max?: number
  children: (item: T, set: (next: T) => void, index: number) => ReactNode
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return
    const next = [...items]
    const [row] = next.splice(from, 1)
    next.splice(to, 0, row)
    onChange(next)
  }

  const setAt = (index: number, row: T) =>
    onChange(items.map((item, i) => (i === index ? row : item)))

  return (
    <div>
      <span className="mb-1.5 block text-[0.6875rem] font-bold tracking-[0.12em] text-muted uppercase">
        {label}
      </span>
      {hint && <p className="mb-3 text-[0.75rem] leading-relaxed text-muted">{hint}</p>}

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="rounded-xl border border-line bg-surface-2/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold text-heading">
                <span className="text-muted tabular-nums">{index + 1}.</span>{' '}
                {title(item, index) || 'Untitled'}
              </span>

              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label="Move up"
                className={arrow}
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === items.length - 1}
                aria-label="Move down"
                className={arrow}
              >
                <ChevronDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label="Remove"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-maroon/40 text-maroon transition-colors hover:bg-maroon/10"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="space-y-4">{children(item, (next) => setAt(index, next), index)}</div>
          </li>
        ))}
      </ul>

      {blank && (max === undefined || items.length < max) && (
        <Button
          variant="ghost"
          className="mt-3"
          onClick={() => onChange([...items, blank()])}
          type="button"
        >
          <Plus className="size-4" />
          {addLabel}
        </Button>
      )}

      {max !== undefined && items.length >= max && (
        <p className="mt-3 text-[0.75rem] text-muted">
          The page is laid out for {max}. Remove one before adding another.
        </p>
      )}
    </div>
  )
}

const arrow = cn(
  'grid size-8 shrink-0 place-items-center rounded-full border border-line text-heading',
  'transition-colors hover:border-line-strong hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40',
)

/** A paragraph per line, which is how every body-copy field in the panel works. */
export function Paragraphs({
  label,
  hint,
  value,
  onChange,
  rows = 6,
}: {
  label: string
  hint?: string
  value: string[]
  onChange: (next: string[]) => void
  rows?: number
}) {
  return (
    <Field label={label} hint={hint ?? 'One paragraph per line. Blank lines are ignored.'}>
      <Area
        rows={rows}
        value={value.join('\n\n')}
        onChange={(event) =>
          onChange(
            event.target.value
              .split(/\n{2,}|\n/)
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
      />
    </Field>
  )
}
