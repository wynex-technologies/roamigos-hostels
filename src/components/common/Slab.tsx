import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The panel every page closes on - off white in light, charcoal in dark.
 *
 * One solid colour, one hairline border, one shadow - nothing else. The band
 * used to be built from stacked radial washes and a bloom that followed the
 * pointer, and lit panels like that read as decoration rather than as part of
 * the house: the eye goes to the glow instead of the ask. The content carries
 * this band now (headline, buttons, ticket), and a flat ground is what lets it.
 *
 * The only light on it is the one a real surface has - a hairline highlight
 * along the top edge and a shade along the bottom, so the panel has a lip
 * instead of being a printed rectangle.
 */
export function Slab({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'panel-slab relative isolate overflow-hidden rounded-xl2 border border-cream/12 text-gray-200',
        className,
      )}
      style={{ boxShadow: 'var(--slab-shadow)' }}
    >
      {children}
    </div>
  )
}
