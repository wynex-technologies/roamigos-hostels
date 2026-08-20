import { useMemo, useState } from 'react'
import { Expand } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { Lightbox } from './Lightbox'
import { Container, Eyebrow, SectionTitle } from '@/components/ui/primitives'
import { galleryAlbums, galleryShots, type AlbumKey } from '@/data/gallery'
import { useReveal } from '@/lib/useReveal'
import { cn } from '@/lib/utils'

/**
 * Tile footprints. The mix is what keeps the wall from reading as a grid - a
 * `wide` frame takes two columns, a `tall` one takes an extra row, and dense
 * auto-flow backfills the holes that leaves behind.
 */
const footprint = {
  square: 'row-span-2',
  tall: 'row-span-3',
  wide: 'row-span-2 sm:col-span-2',
} as const

export function GalleryWall() {
  const [album, setAlbum] = useState<AlbumKey | 'all'>('all')
  const [open, setOpen] = useState<number | null>(null)
  const header = useReveal<HTMLDivElement>(0.3)

  const shots = useMemo(
    () => (album === 'all' ? galleryShots : galleryShots.filter((shot) => shot.album === album)),
    [album],
  )

  const current = galleryAlbums.find((entry) => entry.key === album) ?? galleryAlbums[0]

  return (
    <section id="wall" className="scroll-mt-24 border-t border-line bg-surface-2 py-16 sm:py-20 lg:py-24">
      <Container>
        <div ref={header} className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Eyebrow>The wall</Eyebrow>
            <SectionTitle className="mt-3" underline="frame">
              Pick an album,
              <br />
              then pick a
            </SectionTitle>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty">{current.note}.</p>
          </div>

          <p className="shrink-0 text-[0.8125rem] tracking-[0.16em] text-muted uppercase">
            {shots.length} {shots.length === 1 ? 'frame' : 'frames'} shown
          </p>
        </div>

        {/* Album chips - same control language as the rooms filter rail. */}
        <div className="no-scrollbar -mx-5 mt-10 flex gap-2.5 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
          {galleryAlbums.map((entry) => {
            const active = entry.key === album
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => setAlbum(entry.key)}
                aria-pressed={active}
                className={cn(
                  'shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-line bg-surface text-body hover:border-line-strong hover:text-heading',
                )}
              >
                {entry.label}
              </button>
            )
          })}
        </div>

        {/* The wall itself. */}
        <ul className="mt-10 grid auto-rows-[5.5rem] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[7rem] sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {shots.map((shot, i) => (
            <li key={`${shot.id}-${i}`} className={footprint[shot.span]}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block size-full overflow-hidden rounded-xl2 border border-line bg-surface text-left shadow-warm transition-[box-shadow,transform] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-warm-lg"
              >
                <Photo
                  id={shot.id}
                  width={800}
                  widths={[400, 640, 900, 1300]}
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 32vw, 46vw"
                  alt={shot.caption}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-107"
                />

                {/* Resting scrim keeps the place label legible; it deepens for the caption. */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-0"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-cream/90 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Expand className="size-3.5" />
                </span>

                <span className="absolute inset-x-3 bottom-3">
                  <span className="block text-[0.625rem] font-bold tracking-[0.16em] text-mustard uppercase">
                    {shot.place}
                  </span>
                  {/* The caption only exists on hover, so the photograph owns the tile at rest. */}
                  <span className="mt-1 block max-h-0 translate-y-1 overflow-hidden text-[0.8125rem] leading-snug text-gray-200 opacity-0 transition-[max-height,opacity,transform] duration-500 ease-[var(--ease-out-soft)] group-hover:max-h-20 group-hover:translate-y-0 group-hover:opacity-100">
                    {shot.caption}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Container>

      {open !== null && (
        <Lightbox shots={shots} index={open} onClose={() => setOpen(null)} onStep={setOpen} />
      )}
    </section>
  )
}
