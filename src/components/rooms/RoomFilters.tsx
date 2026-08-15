import { Check } from 'lucide-react'
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
    <div className="border-b border-line pb-6 last:border-b-0 last:pb-0">
      <h3 className="mb-4 text-[0.8125rem] font-bold tracking-[0.12em] text-heading uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 py-1.5 text-[0.9375rem] transition-colors',
        checked ? 'text-heading' : 'text-body hover:text-heading',
      )}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          'grid size-[1.125rem] shrink-0 place-items-center rounded-[0.3rem] border transition-colors',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
          checked ? 'border-primary bg-primary text-on-primary' : 'border-line-strong bg-surface',
        )}
      >
        {checked && <Check className="size-3 stroke-3" />}
      </span>
      <span className="flex-1">{label}</span>
      <span className="text-[0.8125rem] text-muted tabular-nums">{count}</span>
    </label>
  )
}

export function RoomFilters({
  state,
  onChange,
}: {
  state: FilterState
  onChange: (next: FilterState) => void
}) {
  const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  return (
    <div className="space-y-6">
      <Group title="Price per night">
        <input
          type="range"
          min={400}
          max={priceCeiling}
          step={50}
          value={state.maxPrice}
          onChange={(e) => onChange({ ...state, maxPrice: Number(e.target.value) })}
          aria-label="Maximum price per night"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-[var(--primary)]"
        />
        <div className="mt-3 flex justify-between text-[0.8125rem] text-muted">
          <span>{formatINR(400)}</span>
          <span className="font-semibold text-heading">
            Up to {formatINR(state.maxPrice)}
            {state.maxPrice >= priceCeiling && '+'}
          </span>
        </div>
      </Group>

      <Group title="Room type">
        <div className="space-y-0.5">
          {categoryOptions.map((option) => (
            <CheckRow
              key={option.key}
              label={option.label}
              count={counts.category[option.key]}
              checked={state.category === option.key}
              onChange={() =>
                onChange({
                  ...state,
                  category: state.category === option.key ? 'all' : option.key,
                })
              }
            />
          ))}
        </div>
      </Group>

      <Group title="Amenities">
        <div className="space-y-0.5">
          {amenityOptions.map((option) => (
            <CheckRow
              key={option.key}
              label={option.label}
              count={counts.amenity[option.key]}
              checked={state.amenities.includes(option.key)}
              onChange={() =>
                onChange({ ...state, amenities: toggle<AmenityKey>(state.amenities, option.key) })
              }
            />
          ))}
        </div>
      </Group>

      <Group title="Capacity">
        <div className="space-y-0.5">
          {capacityBuckets.map((bucket) => (
            <CheckRow
              key={bucket.key}
              label={bucket.label}
              count={counts.capacity[bucket.key]}
              checked={state.capacities.includes(bucket.key)}
              onChange={() =>
                onChange({ ...state, capacities: toggle(state.capacities, bucket.key) })
              }
            />
          ))}
        </div>
      </Group>

      <button
        type="button"
        onClick={() => onChange({ ...emptyFilters, sort: state.sort })}
        disabled={activeFilterCount(state) === 0}
        className="w-full rounded-full border border-line-strong py-3 text-sm font-semibold text-heading transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
      >
        Clear Filters
      </button>
    </div>
  )
}
