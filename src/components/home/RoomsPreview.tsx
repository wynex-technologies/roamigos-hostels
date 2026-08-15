import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { categoryLabels, rooms, type RoomCategory } from '@/data/rooms'
import { RoomCard } from '@/components/rooms/RoomCard'
import { ButtonLink } from '@/components/ui/Button'
import { Container, Eyebrow, Section, SectionTitle } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

const filters: { key: RoomCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Rooms' },
  ...(Object.keys(categoryLabels) as RoomCategory[]).map((key) => ({
    key,
    label: categoryLabels[key],
  })),
]

export function RoomsPreview() {
  const [active, setActive] = useState<RoomCategory | 'all'>('all')

  const visible = useMemo(
    () =>
      (active === 'all' ? rooms : rooms.filter((room) => room.categories.includes(active))).slice(
        0,
        4,
      ),
    [active],
  )

  return (
    <Section id="rooms">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Eyebrow>Rooms & Beds</Eyebrow>
            <SectionTitle className="mt-3" underline="Beds">
              Our Rooms &
            </SectionTitle>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty">
              From cozy dorms to private retreats, find the perfect space for your journey.
            </p>
          </div>

          <ButtonLink to="/rooms" variant="secondary" className="self-start lg:self-auto">
            View All Rooms
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>

        <div className="no-scrollbar -mx-5 mt-10 flex gap-2.5 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          {filters.map((filter) => {
            const isActive = active === filter.key
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActive(filter.key)}
                aria-pressed={isActive}
                className={cn(
                  'shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-line bg-surface text-body hover:border-line-strong hover:text-heading',
                )}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-10 text-center text-muted">No rooms in this category right now.</p>
        )}
      </Container>
    </Section>
  )
}
