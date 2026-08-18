import { valueProps } from '@/data/content'
import { Icon } from '@/components/ui/Icon'

/**
 * One elevated panel that straddles the hero's bottom edge, split into segments by
 * hairline rules — the row reads as a single object sitting on the photograph
 * rather than five cards floating on the canvas.
 */
export function ValueProps() {
  return (
    <section className="relative z-20 -mt-14 pb-12 lg:-mt-20 lg:pb-16">
      <div className="container-page">
        <ul className="card-raised grid overflow-hidden shadow-raised-lg divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5">
          {valueProps.map((prop, i) => (
            <li
              key={prop.title}
              className={`group flex flex-col items-center px-5 py-7 text-center transition-colors duration-300 hover:bg-surface-2 lg:px-4 lg:py-8 ${
                // Vertical rules between segments, never on the panel's own edges.
                i % 2 === 1 ? 'sm:border-l sm:border-line' : ''
              } ${i > 0 ? 'lg:border-l lg:border-line' : 'lg:border-l-0'}`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong bg-gradient-to-b from-surface to-surface-2 text-accent shadow-raised transition-transform duration-400 ease-[var(--ease-out-soft)] group-hover:-translate-y-0.5">
                <Icon name={prop.icon} className="size-5" />
              </span>

              <p className="mt-3.5 font-display text-[1.0625rem] font-semibold text-heading">
                {prop.title}
              </p>
              <p className="mt-1 max-w-[22ch] text-[0.8125rem] leading-relaxed text-muted text-pretty">
                {prop.note}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
