/**
 * The date control the site and the panel both use, in place of
 * `<input type="date">`.
 *
 * ## Why it exists
 *
 * The native picker is drawn by the browser, not by us: Chrome on Android puts
 * a Clear / Cancel / OK row under the grid and does not commit the tap until OK
 * is pressed, and nothing in CSS or script can reach inside it to change that.
 * The only way a tapped day can *be* the answer is to draw the calendar
 * ourselves, which is what this is - pick a day and the popover closes with the
 * value set. There is no OK button because there is nothing left to confirm,
 * and no Cancel either: Escape or a click outside is the way out.
 *
 * Month and year stay as selects, so a guest booking next March is two taps in
 * and not eleven presses of a chevron.
 *
 * ## Why it lives in `shared/`
 *
 * For the same reason `content-shape.ts` does - both apps need it and a second
 * copy would drift. It is the first component in here, so two rules keep it
 * portable, and both are load-bearing:
 *
 * - **It imports nothing from either app.** The two date helpers it needs are
 *   four lines each and are written out below rather than reached for across
 *   an alias that only resolves in one of the two.
 * - **It only uses tokens both stylesheets define.** `surface`, `surface-2`,
 *   `line`, `line-strong`, `muted`, `heading`, `primary`, `on-primary` and
 *   `shadow-warm`. The site's `accent` and `shadow-lift` do not exist in the
 *   panel, so they are not used here.
 *
 * ## What it does not draw
 *
 * The trigger and the popover, and nothing else. The floating label and the
 * calendar glyph stay at the call site, because the two apps sit them
 * differently - the site absolutely positions a label inside the field, the
 * panel stacks one above it in `<Field>`. Hard-coding either would have made
 * this fit one app and fight the other.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** How many years past this one the year select offers. */
const YEARS_AHEAD = 3

/** Today as `YYYY-MM-DD` in local time. */
function todayISO() {
  const now = new Date()
  return toISO(now.getFullYear(), now.getMonth(), now.getDate())
}

/** `2026-08-15` → `15 Aug 2026`. '' for an empty or unparseable value. */
function formatDate(iso: string) {
  const parts = parseISO(iso)
  if (!parts) return ''
  return new Date(parts.y, parts.m, parts.d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** `2026-03-09` → `{ y: 2026, m: 2, d: 9 }`; null for anything unparseable. */
function parseISO(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) }
}

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Monday-first offset of the 1st, so the grid lines up under the weekday row. */
function leadingBlanks(y: number, m: number) {
  return (new Date(y, m, 1).getDay() + 6) % 7
}

export interface DateFieldProps {
  /** Names the control for assistive tech. Not drawn - the call site draws it. */
  label: string
  /** ISO `YYYY-MM-DD`, or '' for empty. */
  value: string
  onChange: (iso: string) => void
  /** ISO lower bound. Earlier days render disabled. */
  min?: string
  /** ISO upper bound. */
  max?: string
  /** Classes for the trigger - each app passes its own field styling. */
  className?: string
  /** Shown in place of the date when nothing is picked yet. */
  placeholder?: string
  /** Marked on the trigger the way `required` was on the input. */
  required?: boolean
  disabled?: boolean
  id?: string
}

export function DateField({
  label,
  value,
  onChange,
  min,
  max,
  className = '',
  placeholder = 'Select a date',
  required,
  disabled,
  id,
}: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-required={required || undefined}
        aria-label={label}
        className={`${className} flex items-center text-left`}
      >
        <span className={value ? '' : 'font-normal text-muted/70'}>
          {value ? formatDate(value) : placeholder}
        </span>
      </button>

      {open && (
        <CalendarPopover
          anchor={triggerRef}
          value={value}
          min={min}
          max={max}
          onPick={(iso) => {
            // The tap is the answer: commit and close in the same gesture.
            onChange(iso)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

/* ------------------------------------------------------------- the panel --- */

function CalendarPopover({
  anchor,
  value,
  min,
  max,
  onPick,
  onClose,
}: {
  anchor: React.RefObject<HTMLButtonElement | null>
  value: string
  min?: string
  max?: string
  onPick: (iso: string) => void
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const today = todayISO()
  const selected = parseISO(value)
  // Open on the selected month, else on the earliest month the bounds allow.
  const start = selected ?? parseISO(min ?? '') ?? parseISO(today)!
  const [view, setView] = useState({ y: start.y, m: start.m })
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  /**
   * Rendered through a portal for the reason every overlay on the site is - the
   * page sits in a stacking context that a `z-100` inside it cannot escape -
   * plus one of its own: the hero section is `overflow-hidden`, so a popover
   * positioned inside that form would be clipped at the section edge.
   *
   * So it is `fixed` and measured off the trigger after paint, which is what
   * lets its real height decide whether it opens upwards. On a screen too
   * narrow to hang it off the field it centres instead.
   */
  useLayoutEffect(() => {
    function place() {
      const trigger = anchor.current
      const panel = panelRef.current
      if (!trigger || !panel) return
      const rect = trigger.getBoundingClientRect()
      const { width, height } = panel.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (vw < width + 32) {
        setPos({ top: Math.max(16, (vh - height) / 2), left: (vw - width) / 2 })
        return
      }
      const below = rect.bottom + 8
      const top = below + height > vh - 16 ? Math.max(16, rect.top - height - 8) : below
      const left = Math.min(Math.max(16, rect.left), vw - width - 16)
      setPos({ top, left })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchor, view])

  // Escape and any click outside close it - the only two ways out, since there
  // is no Cancel button either.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    function onDown(event: PointerEvent) {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || anchor.current?.contains(target)) return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [anchor, onClose])

  const days = new Date(view.y, view.m + 1, 0).getDate()
  const blanks = leadingBlanks(view.y, view.m)
  const thisYear = new Date().getFullYear()
  // The list has to reach whatever is already selected, or a saved date would
  // vanish from its own select - the panel edits campaigns that have expired.
  const firstYear = Math.min(thisYear, parseISO(min ?? '')?.y ?? thisYear, selected?.y ?? thisYear)
  const lastYear = Math.max(thisYear + YEARS_AHEAD, selected?.y ?? 0, parseISO(max ?? '')?.y ?? 0)
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i)

  function step(delta: number) {
    setView(({ y, m }) => {
      const next = m + delta
      return { y: y + Math.floor(next / 12), m: ((next % 12) + 12) % 12 }
    })
  }

  const nav =
    'grid size-8 shrink-0 place-items-center rounded-full border border-line text-heading transition-colors ' +
    'hover:border-primary hover:bg-primary hover:text-on-primary'
  const select =
    'rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-[0.8125rem] font-semibold text-heading ' +
    'transition-colors hover:border-line-strong focus:border-primary focus:outline-none'

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Choose a date"
      style={{
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        visibility: pos ? 'visible' : 'hidden',
      }}
      className="fixed z-[200] w-[19.5rem] rounded-2xl border border-line bg-surface p-4 shadow-warm"
    >
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => step(-1)} className={nav} aria-label="Previous month">
          <ChevronLeft className="size-4" />
        </button>

        <div className="flex flex-1 items-center justify-center gap-1.5">
          <select
            value={view.m}
            onChange={(e) => setView({ ...view, m: Number(e.target.value) })}
            className={select}
            aria-label="Month"
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={view.y}
            onChange={(e) => setView({ ...view, y: Number(e.target.value) })}
            className={select}
            aria-label="Year"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={() => step(1)} className={nav} aria-label="Next month">
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-1 text-[0.625rem] font-bold tracking-wide text-muted uppercase"
          >
            {day}
          </span>
        ))}

        {Array.from({ length: blanks }, (_, i) => (
          <span key={`blank-${i}`} aria-hidden />
        ))}

        {Array.from({ length: days }, (_, i) => {
          const day = i + 1
          const iso = toISO(view.y, view.m, day)
          const disabled = Boolean((min && iso < min) || (max && iso > max))
          const isSelected = iso === value
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onPick(iso)}
              aria-current={iso === today ? 'date' : undefined}
              className={`grid size-9 place-items-center rounded-full text-[0.8125rem] font-medium transition-colors
                ${
                  isSelected
                    ? 'bg-primary text-on-primary'
                    : iso === today
                      ? 'border border-primary text-heading hover:bg-surface-2'
                      : 'text-heading hover:bg-surface-2'
                }
                disabled:pointer-events-none disabled:text-muted/35`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>,
    document.body,
  )
}
