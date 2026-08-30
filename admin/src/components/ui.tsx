import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

/* -------------------------------------------------------------- buttons --- */

const variants = {
  // Red leads, mustard supports. Green stays an accent and is never a button
  // here, exactly as the site's brand rules have it.
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  accent: 'bg-mustard text-ink hover:bg-gold',
  ghost: 'border border-line text-heading hover:border-line-strong hover:bg-surface-2',
  danger: 'border border-maroon/40 text-maroon hover:bg-maroon/10',
} as const

export function Button({
  variant = 'primary',
  busy,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  busy?: boolean
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
        'transition-colors duration-200 disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        className,
      )}
    >
      {busy && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

/* ---------------------------------------------------------------- fields --- */

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[0.6875rem] font-bold tracking-[0.12em] text-muted uppercase">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[0.75rem] text-muted">{hint}</span>}
    </label>
  )
}

export function Text(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('field', props.className)} />
}

export function Area(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('field resize-y', props.className)} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('field cursor-pointer', props.className)} />
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-sm font-medium text-heading"
    >
      <span
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors duration-200',
          // Green carries confirmation states. This is one of them.
          checked ? 'bg-green' : 'bg-line-strong',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-white transition-[left] duration-200 ease-[var(--ease-out-soft)]',
            checked ? 'left-[1.125rem]' : 'left-0.5',
          )}
        />
      </span>
      {label}
    </button>
  )
}

/* ---------------------------------------------------------------- layout --- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('card p-5 sm:p-6', className)}>{children}</div>
}

export function PageHeader({
  title,
  note,
  actions,
}: {
  title: string
  note?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

const tones = {
  neutral: 'border-line-strong/60 text-muted',
  live: 'border-green/40 bg-green/10 text-green-deep dark:text-green',
  warn: 'border-mustard/50 bg-mustard/12 text-gold',
  alert: 'border-maroon/40 bg-maroon/10 text-maroon',
} as const

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof tones
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-bold tracking-wide uppercase',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}

/** The three states every list in the panel can be in, said the same way. */
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center text-sm text-muted">
      {children}
    </div>
  )
}

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
      <Loader2 className="size-4 animate-spin" />
      Loading
    </div>
  )
}

export function ErrorNote({ error }: { error: string }) {
  return (
    <div className="rounded-xl border border-maroon/30 bg-maroon/8 px-4 py-3 text-sm text-maroon">
      {error}
    </div>
  )
}
