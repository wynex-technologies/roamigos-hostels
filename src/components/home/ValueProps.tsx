import { valueProps } from '@/data/content'
import { Icon } from '@/components/ui/Icon'

export function ValueProps() {
  return (
    <section className="relative z-10 border-y border-line bg-surface">
      <div className="container-page">
        <ul className="grid divide-line sm:grid-cols-2 sm:divide-x lg:grid-cols-5">
          {valueProps.map((prop) => (
            <li
              key={prop.title}
              className="flex items-start gap-3.5 border-b border-line py-7 last:border-b-0 sm:border-b-0 sm:px-5 sm:first:pl-0 sm:last:pr-0 lg:flex-col lg:gap-3 lg:py-9"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-accent">
                <Icon name={prop.icon} className="size-5" />
              </span>
              <div>
                <p className="font-display text-[1.0625rem] font-semibold text-heading">
                  {prop.title}
                </p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted text-pretty">
                  {prop.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
