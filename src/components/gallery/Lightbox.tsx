import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import type { GalleryShot } from '@/data/gallery'

interface LightboxProps {
  shots: GalleryShot[]
  index: number
  onClose: () => void
  onStep: (next: number) => void
}

/**
 * Full-screen viewer for the wall. Deliberately hand-built rather than a native
 * `<dialog>` so the backdrop can carry the same warm ink scrim as the rest of
 * the site, and so arrow-key stepping wraps around the album.
 */
export function Lightbox({ shots, index, onClose, onStep }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const shot = shots[index]

  // Keyboard is the point of a viewer like this: Esc closes, arrows walk the album.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onStep((index + 1) % shots.length)
      if (event.key === 'ArrowLeft') onStep((index - 1 + shots.length) % shots.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, shots.length, onClose, onStep])

  // Freeze the wall behind the viewer, and hand focus to the one control that
  // always exists so Esc and Tab both land somewhere sensible.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  if (!shot) return null

  // Portalled to the body on purpose: `<main>` carries `relative z-10`, which
  // opens a stacking context the viewer could never climb out of — it would sit
  // under the sticky header no matter how high its own z-index went.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shot.caption}
      className="fixed inset-0 z-[70] flex flex-col bg-ink/95 backdrop-blur-md"
    >
      {/* Clicking the ground closes; the frame itself stops the bubble. */}
      <button
        type="button"
        aria-label="Close gallery viewer"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-zoom-out"
      />

      <div className="relative flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-mustard uppercase">
          {shot.place}
        </p>
        <p className="text-[0.8125rem] text-cream/60 tabular-nums">
          {index + 1} / {shots.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:border-mustard hover:bg-mustard hover:text-ink"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-6">
        <button
          type="button"
          onClick={() => onStep((index - 1 + shots.length) % shots.length)}
          aria-label="Previous photo"
          className="absolute left-2 z-10 grid size-11 place-items-center rounded-full border border-cream/20 bg-ink/50 text-cream backdrop-blur transition-colors hover:border-mustard hover:bg-mustard hover:text-ink sm:left-5 sm:size-13"
        >
          <ChevronLeft className="size-5" />
        </button>

        <figure className="relative max-h-full">
          <Photo
            key={shot.id}
            id={shot.id}
            width={1600}
            widths={[900, 1400, 1900]}
            sizes="90vw"
            alt={shot.caption}
            className="max-h-[70vh] w-auto max-w-full rounded-xl2 object-contain shadow-lift"
          />
        </figure>

        <button
          type="button"
          onClick={() => onStep((index + 1) % shots.length)}
          aria-label="Next photo"
          className="absolute right-2 z-10 grid size-11 place-items-center rounded-full border border-cream/20 bg-ink/50 text-cream backdrop-blur transition-colors hover:border-mustard hover:bg-mustard hover:text-ink sm:right-5 sm:size-13"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="relative px-5 pt-5 pb-8 text-center sm:px-8">
        <p className="mx-auto max-w-xl font-display text-[1.0625rem] leading-snug text-cream text-balance sm:text-xl">
          {shot.caption}
        </p>
        <p className="mt-3 text-[0.75rem] tracking-[0.16em] text-cream/45 uppercase">
          Use ← → to walk the album · Esc to close
        </p>
      </div>
    </div>,
    document.body,
  )
}
