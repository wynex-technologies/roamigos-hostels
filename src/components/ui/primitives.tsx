import { Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('container-page', className)}>{children}</div>
}

export function Section({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={cn('relative py-16 sm:py-20 lg:py-28', className)}>
      {children}
    </section>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('eyebrow', className)}>{children}</p>
}

/** Section heading with the mustard brush stroke under the final word. */
export function SectionTitle({
  children,
  underline,
  className,
  as: Tag = 'h2',
}: {
  children: ReactNode
  underline?: string
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <Tag
      className={cn(
        'text-[clamp(1.875rem,4.2vw,3rem)] leading-[1.08] font-semibold text-balance',
        className,
      )}
    >
      {children}
      {underline ? <> <span className="brush-underline">{underline}</span></> : null}
    </Tag>
  )
}

export function Badge({
  children,
  tone = 'accent',
  className,
}: {
  children: ReactNode
  tone?: 'accent' | 'primary' | 'coral' | 'muted' | 'success'
  className?: string
}) {
  const tones = {
    accent: 'bg-mustard text-ink',
    primary: 'bg-primary text-on-primary',
    coral: 'bg-coral text-ink',
    muted: 'bg-surface-2 text-muted border border-line',
    success: 'bg-green-deep/10 text-green-deep dark:bg-green/20 dark:text-cream',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] font-bold tracking-wide uppercase',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Rating({
  value,
  count,
  className,
}: {
  value: number
  count?: number
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
      <Star className="size-4 fill-mustard text-mustard" aria-hidden />
      <span className="font-semibold text-heading">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted">({count})</span>}
    </span>
  )
}

/** Thin mustard rule with a diamond in the middle — the recurring section divider. */
export function Flourish({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3', className)} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-line-strong" />
      <span className="size-1.5 rotate-45 bg-mustard" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-line-strong" />
    </div>
  )
}
