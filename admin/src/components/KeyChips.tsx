import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { iconFor, toKey, toLabel } from '@shared/amenity-icons'
import { Field, cn } from './ui'

/**
 * A set of chips that can be added to.
 *
 * Categories and amenities used to be a fixed list in this file, which meant a
 * hostel that started renting bikes had to wait for a deploy to say so. They
 * are open sets now: the curated keys are offered first, whatever this room
 * already carries is offered next, and Add another puts a new one in.
 *
 * What gets stored is a key - `rooftop-hammock` - because that is what the
 * site's filters compare and what a URL can carry. The name typed here is
 * slugified into one, and the site turns it back into a label, so nothing has
 * to be typed twice and the two can never drift.
 *
 * `withIcons` shows the icon the site will draw for each name. That is not
 * decoration: the icon is worked out from the words, so seeing it here is the
 * only way to know that "Geyser" gets a flame before the page is published.
 */
export function KeyChips({
  label,
  hint,
  values,
  options,
  onChange,
  tone = 'primary',
  withIcons,
  addLabel = 'Add another',
  placeholder,
}: {
  label: string
  hint?: string
  /** The keys this record carries. */
  values: string[]
  /** The curated keys, offered whether or not this record uses them. */
  options: string[]
  onChange: (next: string[]) => void
  tone?: 'primary' | 'accent'
  withIcons?: boolean
  addLabel?: string
  placeholder?: string
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')

  // Curated first, then anything this record carries that is not curated - a
  // key added last week has to keep showing up, or unticking it once would lose
  // it for good.
  const all = [...options, ...values.filter((value) => !options.includes(value))]

  const toggle = (key: string) =>
    onChange(values.includes(key) ? values.filter((item) => item !== key) : [...values, key])

  function add() {
    const key = toKey(draft)
    if (!key) return

    // Already on the list: tick it rather than adding a second chip that looks
    // identical and is not.
    onChange(values.includes(key) ? values : [...values, key])
    setDraft('')
    setAdding(false)
  }

  const draftKey = toKey(draft)
  const DraftIcon = iconFor(draftKey || draft)

  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap gap-2">
        {all.map((key) => {
          const on = values.includes(key)
          const Icon = iconFor(key)

          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-pressed={on}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.8125rem] font-semibold transition-colors',
                on
                  ? tone === 'primary'
                    ? 'border-transparent bg-primary text-on-primary'
                    : 'border-transparent bg-mustard text-ink'
                  : 'border-line text-body hover:border-line-strong',
              )}
            >
              {withIcons && <Icon className="size-3.5" />}
              {toLabel(key)}
            </button>
          )
        })}

        {adding ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-surface py-0.5 pr-0.5 pl-2.5">
            {withIcons && <DraftIcon className="size-3.5 shrink-0 text-muted" />}
            <input
              autoFocus
              value={draft}
              placeholder={placeholder}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  add()
                }
                if (event.key === 'Escape') {
                  setDraft('')
                  setAdding(false)
                }
              }}
              className="w-36 bg-transparent py-1 text-[0.8125rem] font-semibold text-heading outline-none placeholder:font-normal placeholder:text-muted"
            />
            <button
              type="button"
              onClick={add}
              aria-label="Add"
              className="grid size-6 place-items-center rounded-full bg-primary text-on-primary"
            >
              <Check className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft('')
                setAdding(false)
              }}
              aria-label="Cancel"
              className="grid size-6 place-items-center rounded-full text-muted hover:text-heading"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1 text-[0.8125rem] font-semibold text-muted transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="size-3.5" />
            {addLabel}
          </button>
        )}
      </div>

      {/* Said only while typing, because this is the one moment it is useful. */}
      {adding && draftKey && (
        <p className="mt-2 text-[0.75rem] text-muted">
          Saved as <span className="font-semibold text-heading">{draftKey}</span>, shown on the
          site as <span className="font-semibold text-heading">{toLabel(draftKey)}</span>
          {withIcons && ' with the icon above'}.
        </p>
      )}
    </Field>
  )
}
