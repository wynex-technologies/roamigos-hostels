import { Check, RotateCcw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AmenityKey } from '@/data/rooms'
import { cn, formatINR } from '@/lib/utils'
import {
  activeFilterCount,
  amenityOptions,
  capacityBuckets,
  categoryOptions,
  counts,
  emptyFilters,
  priceCeiling,
  type FilterState,
} from './filters'

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-[0.625rem] font-bold tracking-[0.2em] text-muted uppercase">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

/** Pill toggle - used for amenities and capacity, where more than one can be on. */
function Chip({
  label,
  on,
  onClick,
  icon: Icon,
}: {
  label: string
  on: boolean
  onClick: () => void
  /** Amenity chips carry one, worked out from the name. The rest do not. */
  icon?: LucideIcon
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.8125rem] font-semibold',
        'transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-soft)] active:scale-[0.97]',
        on
          ? 'border-primary bg-primary/8 text-primary'
          : 'border-line bg-surface text-body hover:border-line-strong hover:text-heading',
      )}
    >
      {/* The tick replaces the icon when selected rather than joining it - two
          glyphs on a chip this size is a crowd. */}
      {on ? <Check className="size-3.5" /> : Icon ? <Icon className="size-3.5" /> : null}
      {label}
    </button>
  )
}

/**
 * The refine rail. One panel, four plain-language groups, every option carrying
 * the number of rooms behind it - so nothing on the list ever promises a result
 * it cannot deliver.
 */
export function RoomFilters({
  state,
  onChange,
  resultCount,
  total,
}: {
  state: FilterState
  onChange: (next: FilterState) => void
  /** Shown in the live summary at the top of the rail. */
  resultCount?: number
  total?: number
}) {
  const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  const active = activeFilterCount(state)
  const share = resultCount !== undefined && total ? Math.max(0.04, resultCount / total) : 1

  return (
    <div className="space-y-6">
      {/* Live summary - the rail answers before you scroll the list. */}
      {resultCount !== undefined && total !== undefined && (
        <div className="border-b border-line pb-6">
          <p className="flex items-baseline justify-between gap-3">
            <span className="font-display text-[1.75rem] leading-none font-semibold text-heading tabular-nums">
              {resultCount}
            </span>
            <span className="text-[0.8125rem] text-muted">of {total} rooms</span>
          </p>
          <span aria-hidden className="mt-3 block h-1 w-full overflow-hidden rounded-full bg-line">
            <span
              className="block h-full origin-left rounded-full bg-accent-soft transition-transform duration-600 ease-[var(--ease-out-soft)]"
              style={{ transform: `scaleX(${share})` }}
            />
          </span>
        </div>
      )}

      <Group title="Price per night">
        <p className="flex items-baseline justify-between gap-3">
          <span className="font-display text-lg font-semibold text-heading">
            Up to {formatINR(state.maxPrice)}
            {state.maxPrice >= priceCeiling && '+'}
          </span>
        </p>
        <input
          type="range"
          min={400}
          max={priceCeiling}
          step={50}
          value={state.maxPrice}
          onChange={(e) => onChange({ ...state, maxPrice: Number(e.target.value) })}
          aria-label="Maximum price per night"
          className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-[var(--primary)]"
        />
        <div className="mt-2 flex justify-between text-[0.75rem] text-muted">
          <span>{formatINR(400)}</span>
          <span>{formatINR(priceCeiling)}+</span>
        </div>
      </Group>

      <Group title="Room type">
        <ul className="-mx-2">
          {categoryOptions.map((option) => {
            const on = state.category === option.key
            return (
              <li key={option.key}>
                <button
                  type="button"
                  onClick={() => onChange({ ...state, category: on ? 'all' : option.key })}
                  aria-pressed={on}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[0.9375rem] transition-colors duration-300',
                    on ? 'text-heading' : 'text-body hover:bg-surface-2 hover:text-heading',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'grid size-[1.125rem] shrink-0 place-items-center rounded-full border transition-colors duration-300',
                      on ? 'border-primary bg-primary text-on-primary' : 'border-line-strong',
                    )}
                  >
                    {on && <Check className="size-3 stroke-3" />}
                  </span>
                  <span className={cn('flex-1', on && 'font-semibold')}>{option.label}</span>
                  <span className="text-[0.8125rem] text-muted tabular-nums">
                    {counts.category[option.key]}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Group>

      <Group title="Amenities">
        <div className="flex flex-wrap gap-2">
          {amenityOptions.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              icon={option.icon}
              on={state.amenities.includes(option.key)}
              onClick={() =>
                onChange({ ...state, amenities: toggle<AmenityKey>(state.amenities, option.key) })
              }
            />
          ))}
        </div>
      </Group>

      <Group title="Sleeps">
        <div className="flex flex-wrap gap-2">
          {capacityBuckets.map((bucket) => (
            <Chip
              key={bucket.key}
              label={bucket.label}
              on={state.capacities.includes(bucket.key)}
              onClick={() =>
                onChange({ ...state, capacities: toggle(state.capacities, bucket.key) })
              }
            />
          ))}
        </div>
      </Group>

      <button
        type="button"
        onClick={() => onChange({ ...emptyFilters, sort: state.sort })}
        disabled={active === 0}
        className="group flex w-full items-center justify-center gap-2 rounded-full border border-line-strong py-3 text-sm font-semibold text-heading transition-colors duration-300 hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
      >
        <RotateCcw className="size-4 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-rotate-180" />
        Reset {active > 0 && `(${active})`}
      </button>
    </div>
  )
}
