import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { Badge } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

export function Gallery({
  images,
  name,
  badge,
  totalPhotos,
}: {
  images: string[]
  name: string
  badge?: string
  totalPhotos: number
}) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length)

  const thumbnails = images.slice(1, 5)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false)
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, images.length])

  const arrow =
    'grid size-10 place-items-center rounded-full bg-canvas/90 text-heading shadow-warm backdrop-blur transition-colors hover:bg-canvas'

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[1.55fr_1fr]">
        {/* Main image */}
        <div className="relative isolate aspect-4/3 overflow-hidden rounded-xl2 border border-line bg-surface-2 sm:aspect-16/11 lg:aspect-auto lg:h-[30rem]">
          <Photo
            key={images[index]}
            id={images[index]}
            width={1400}
            widths={[640, 960, 1400, 1920]}
            sizes="(min-width: 1024px) 60vw, 100vw"
            alt={`${name} — photo ${index + 1}`}
            className="size-full animate-rise object-cover"
          />

          {badge && (
            <Badge tone="accent" className="absolute top-5 left-5 shadow-warm">
              {badge}
            </Badge>
          )}

          <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={arrow}>
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className={arrow}>
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="absolute right-4 bottom-4 flex items-center gap-2">
            <span className="rounded-full bg-ink/70 px-3 py-1.5 text-[0.75rem] font-semibold text-cream tabular-nums backdrop-blur">
              {index + 1} / {totalPhotos}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(true)}
              aria-label="View full size"
              className="grid size-9 place-items-center rounded-full bg-ink/70 text-cream backdrop-blur transition-colors hover:bg-ink"
            >
              <Expand className="size-4" />
            </button>
          </div>
        </div>

        {/* Thumbnails — always a 2x2 block so it lines up with the main image height.
            Every room ships at least four photos, and the rest stay reachable via the arrows. */}
        <div className="grid grid-cols-4 gap-3 lg:h-[30rem] lg:grid-cols-2 lg:grid-rows-2">
          {thumbnails.map((image, i) => {
            const realIndex = i + 1
            const isLast = i === thumbnails.length - 1
            const hidden = totalPhotos - thumbnails.length - 1
            return (
              <button
                key={`${image}-${i}`}
                type="button"
                onClick={() => setIndex(realIndex)}
                className={cn(
                  'group relative overflow-hidden rounded-xl border transition-[border-color,transform] hover:-translate-y-0.5',
                  index === realIndex ? 'border-primary' : 'border-line',
                )}
              >
                <Photo
                  id={image}
                  width={500}
                  alt={`${name} — photo ${realIndex + 1}`}
                  className="aspect-4/3 size-full object-cover transition-transform duration-500 group-hover:scale-105 lg:aspect-auto"
                />
                {isLast && hidden > 0 && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/60 text-[0.9375rem] font-semibold text-cream backdrop-blur-[2px]">
                    +{hidden} photos
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-ink/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photo viewer`}
          onClick={() => setLightbox(false)}
        >
          <Photo
            id={images[index]}
            width={1920}
            alt={`${name} — photo ${index + 1}`}
            className="max-h-full max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur transition-colors hover:bg-cream/25"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
            aria-label="Previous photo"
            className="absolute left-5 grid size-11 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur transition-colors hover:bg-cream/25"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
            aria-label="Next photo"
            className="absolute right-5 grid size-11 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur transition-colors hover:bg-cream/25"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </>
  )
}
