import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The dark panel every page closes on.
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
        'relative isolate overflow-hidden rounded-xl2 border border-cream/12 text-gray-200',
        className,
      )}
      style={{
        backgroundColor: 'var(--slab-ground)',
        boxShadow:
          'inset 0 1px 0 rgb(255 255 255 / 0.07), inset 0 -1px 0 rgb(0 0 0 / 0.45),' +
          '0 2px 4px rgb(9 9 11 / 0.06), 0 28px 56px -34px rgb(9 9 11 / 0.45)',
      }}
    >
      {children}
    </div>
  )
}
