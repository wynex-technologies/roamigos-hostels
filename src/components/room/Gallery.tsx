import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { Badge } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

/**
 * The room's photographs, staged the way a hotel stages them: one cinematic
 * frame that fills the top of the page with the room's own titling laid over it,
 * a filmstrip underneath to move through the set, and a lightbox for anyone who
 * wants the picture and nothing else.
 *
 * `children` is the titling - the page owns that copy, the gallery owns the
 * photograph it sits on.
 */
export function Gallery({
  images,
  name,
  badge,
  totalPhotos,
  topSlot,
  children,
}: {
  images: string[]
  name: string
  badge?: string
  totalPhotos: number
  /** Sits on the top line of the frame, beside the badge - the breadcrumb. */
  topSlot?: ReactNode
  children?: ReactNode
}) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length)

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

  // The controls now sit on the filmstrip's own surface, not on a photograph.
  const control =
    'grid size-11 place-items-center rounded-full border border-line bg-surface text-heading ' +
    'transition-[background-color,border-color,color,transform] duration-300 ease-[var(--ease-out-soft)] ' +
    'hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-on-primary active:scale-95'

  return (
    <>
      {/* ------------------------------ the frame ------------------------------
          The heights are the old 34 / 40 / 45rem less the header's own (4.5rem,
          5rem from sm): the bar used to be laid over the top of this stage and
          now stacks above it, so keeping the old numbers would push everything
          below the fold by exactly one bar. */}
      <section className="group/stage relative isolate flex min-h-[29.5rem] flex-col justify-between gap-10 overflow-hidden pt-8 pb-12 sm:min-h-[35rem] sm:pt-10 lg:min-h-[40rem] lg:pb-16">
        {images.map((image, i) => (
          <Photo
            key={image}
            id={image}
            width={2000}
            widths={[900, 1400, 2000]}
            sizes="100vw"
            alt={i === index ? `${name} - photo ${i + 1}` : ''}
            aria-hidden={i !== index}
            className={cn(
              'absolute inset-0 -z-20 size-full object-cover',
              'transition-[opacity,transform] duration-[1200ms] ease-[var(--ease-out-soft)]',
              i === index ? 'scale-100 opacity-100' : 'scale-105 opacity-0',
            )}
          />
        ))}

        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/45"
        />

        {/* Top line of the frame: the badge, with the breadcrumb alongside it. */}
        {(badge || topSlot) && (
          <div className="container-page relative flex flex-wrap items-center gap-x-4 gap-y-3">
            {badge && (
              <Badge tone="accent" className="shadow-warm">
                {badge}
              </Badge>
            )}
            {topSlot}
          </div>
        )}

        {/* Titling supplied by the page. */}
        <div className="container-page relative">{children}</div>
      </section>

      {/* ----------------------------- the filmstrip ----------------------------
          The whole control set lives down here with the thumbnails - the frame
          above stays a photograph with the room's name on it, nothing else. */}
      <div className="border-b border-line bg-surface-2">
        <div className="container-page">
          <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="no-scrollbar -mx-5 flex min-w-0 flex-1 gap-3 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              {images.map((image, i) => (
                <button
                  key={`${image}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index ? 'true' : undefined}
                  className={cn(
                    'group relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-1 sm:h-20 sm:w-30',
                    'transition-[transform,box-shadow,--tw-ring-color] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-0.5',
                    i === index ? 'ring-2 ring-accent-soft' : 'ring-line hover:ring-line-strong',
                  )}
                >
                  <Photo
                    id={image}
                    width={300}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-110"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-0 transition-opacity duration-400',
                      i === index ? 'opacity-0' : 'bg-ink/25 group-hover:opacity-0',
                    )}
                  />
                </button>
              ))}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end lg:border-l lg:border-line lg:pl-6">
              <span className="font-display text-[0.875rem] font-semibold text-muted tabular-nums">
                <span className="text-heading">{String(index + 1).padStart(2, '0')}</span> /{' '}
                {String(totalPhotos).padStart(2, '0')}
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                  className={control}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photo"
                  className={control}
                >
                  <ChevronRight className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightbox(true)}
                  className={cn(control, 'w-auto gap-2 px-5 text-[0.8125rem] font-semibold')}
                >
                  <Expand className="size-4" />
                  All {totalPhotos} photos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ the lightbox ----------------------------
          Portalled to the body on purpose: `<main>` carries `relative z-10`, so
          an overlay rendered in place would sit under the sticky header - and
          the close button would be unclickable behind it. */}
      {lightbox &&
        createPortal(
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
              alt={`${name} - photo ${index + 1}`}
              className="max-h-full max-w-full animate-rise rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-cream/20 bg-ink/50 px-4 py-1.5 text-[0.8125rem] font-semibold text-cream tabular-nums backdrop-blur-md">
              {index + 1} / {images.length}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightbox(false)
              }}
              aria-label="Close"
              className="absolute top-5 right-5 grid size-11 place-items-center rounded-full border border-cream/20 bg-cream/15 text-cream backdrop-blur transition-[background-color,transform] duration-300 hover:scale-105 hover:bg-cream/30"
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
              className="absolute left-5 grid size-11 place-items-center rounded-full border border-cream/20 bg-cream/15 text-cream backdrop-blur transition-[background-color,transform] duration-300 hover:scale-105 hover:bg-cream/30"
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
              className="absolute right-5 grid size-11 place-items-center rounded-full border border-cream/20 bg-cream/15 text-cream backdrop-blur transition-[background-color,transform] duration-300 hover:scale-105 hover:bg-cream/30"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}
