import { Link } from 'react-router-dom'
import { ArrowUpRight, BedDouble, Bath, Users } from 'lucide-react'
import type { Room } from '@/data/rooms'
import { Photo } from '@/components/ui/Photo'
import { cn, formatINR } from '@/lib/utils'
import { Badge, Rating } from '@/components/ui/primitives'

export function RoomCard({
  room,
  className,
  /** Dates picked on the homepage, forwarded so the detail page opens pre-filled. */
  search,
}: {
  room: Room
  className?: string
  search?: string
}) {
  const isDorm = room.categories.includes('dorm')
  const CapacityIcon = isDorm ? BedDouble : Users

  return (
    <Link
      to={{ pathname: `/rooms/${room.slug}`, search }}
      className={cn(
        'group card-surface flex flex-col overflow-hidden',
        'transition-[transform,box-shadow,border-color] duration-400 ease-[var(--ease-out-soft)]',
        'hover:-translate-y-1.5 hover:border-line-strong hover:shadow-warm-lg',
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-surface-2">
        <Photo
          id={room.images[0]}
          width={800}
          widths={[400, 640, 800, 1200]}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 90vw"
          alt={room.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent"
        />

        {room.badge && (
          <Badge tone="accent" className="absolute top-4 left-4 shadow-warm">
            {room.badge}
          </Badge>
        )}

        <span className="absolute right-4 bottom-4 rounded-full bg-canvas/90 px-3 py-1 text-[0.6875rem] font-semibold text-heading backdrop-blur">
          +{room.totalPhotos - 1} photos
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-tight font-semibold sm:text-[1.375rem]">
            {room.name}
          </h3>
          <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.8125rem] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CapacityIcon className="size-4 text-accent" />
            {room.capacityLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath className="size-4 text-accent" />
            {room.bathroom}
          </span>
        </div>

        <p className="mt-4 text-[0.9375rem] leading-relaxed text-pretty">{room.shortDescription}</p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-5 [margin-block-start:1.5rem]">
          <Rating value={room.rating} count={room.reviewCount} />
          <p className="text-right">
            <span className="block text-[0.6875rem] tracking-wide text-muted uppercase">From</span>
            <span className="font-display text-2xl font-semibold text-heading">
              {formatINR(room.pricePerNight)}
            </span>
            <span className="text-[0.8125rem] text-muted"> / {isDorm ? 'bed' : 'night'}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
