import { useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The ink slab every page closes on.
 *
 * A flat dark rectangle with a headline in it is the default every template
 * ships with, so this one is built in layers instead: a warm mesh baked into
 * the ground, an engraved grid that gives the surface a grain to catch light
 * on, and — the part that makes it feel like an object rather than a section —
 * a mustard bloom that leans toward the pointer. The bloom is written as
 * `--mx` / `--my` on the wrapper, so the whole effect is one repaint of one
 * gradient and no React state changes while the cursor moves.
 *
 * Children are rendered above every layer and inherit `group/slab`, so anything
 * inside can react to the slab being hovered.
 */
export function Slab({ className, children }: { className?: string; children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null)

  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = el.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    node.style.setProperty('--mx', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`)
    node.style.setProperty('--my', `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`)
  }

  // Back to the resting position — top-left, where the maroon already sits.
  const rest = () => {
    el.current?.style.setProperty('--mx', '18%')
    el.current?.style.setProperty('--my', '14%')
  }

  return (
    <div
      ref={el}
      onPointerMove={track}
      onPointerLeave={rest}
      className={cn(
        'group/slab relative isolate overflow-hidden rounded-[2rem] border border-cream/10 text-cream',
        'shadow-[0_40px_90px_-40px_rgb(37_37_34/0.55)]',
        className,
      )}
      style={
        {
          '--mx': '16%',
          '--my': '10%',
          backgroundColor: 'var(--slab-ground)',
          // Hairline of cream along the top edge and a shade along the bottom:
          // the panel is lit from above, so it should have a lip.
          boxShadow:
            'inset 0 1px 0 rgb(251 241 230 / 0.14), inset 0 -1px 0 rgb(0 0 0 / 0.5), 0 40px 90px -40px rgb(37 37 34 / 0.55)',
        } as React.CSSProperties
      }
    >
      {/* ---- the two lights: maroon breaking over the head, a gold lamp at the foot ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(58% 76% at -2% -14%, var(--slab-lit), color-mix(in oklab, var(--slab-lit) 34%, transparent) 42%, transparent 68%),' +
            'radial-gradient(46% 60% at 103% 108%, color-mix(in oklab, var(--slab-lamp) 78%, transparent), color-mix(in oklab, var(--slab-lamp) 22%, transparent) 46%, transparent 72%)',
        }}
      />

      {/* ---- lacquer: one wide, shallow highlight raking across the panel ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(112deg, rgb(251 241 230 / 0.07) 0%, transparent 34%, transparent 64%, rgb(251 241 230 / 0.035) 100%)',
        }}
      />

      {/* ---- engraved grid, faded out at the edges so it never reads as a table ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0 63px, rgb(251 241 230 / 0.05) 63px 64px),' +
            'repeating-linear-gradient(90deg, transparent 0 63px, rgb(251 241 230 / 0.05) 63px 64px)',
          maskImage: 'radial-gradient(120% 100% at 50% 40%, #000 20%, transparent 82%)',
          WebkitMaskImage: 'radial-gradient(120% 100% at 50% 40%, #000 20%, transparent 82%)',
        }}
      />

      {/* ---- the bloom that follows the pointer ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-700 group-hover/slab:opacity-100"
        style={{
          backgroundImage:
            'radial-gradient(24rem 24rem at var(--mx) var(--my), color-mix(in oklab, var(--color-mustard) 30%, transparent), transparent 66%)',
        }}
      />

      {/* ---- vignette. Last of the ambient layers, so it closes down everything
              under it and the panel reads as an object with edges. ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(126% 116% at 46% 38%, transparent 26%, rgb(0 0 0 / calc(var(--slab-vignette) * 0.55)) 72%, rgb(0 0 0 / var(--slab-vignette)) 100%)',
        }}
      />

      {/* ---- a hairline that keeps travelling the top edge ---- */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden"
      >
        <span className="animate-edge-travel block h-px w-1/3 bg-gradient-to-r from-transparent via-mustard to-transparent" />
      </span>

      <div className="relative">{children}</div>
    </div>
  )
}
