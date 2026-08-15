import { Link } from 'react-router-dom'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'whatsapp'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap ' +
  'transition-[transform,background-color,color,box-shadow,border-color] duration-200 ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary shadow-[0_10px_24px_-12px] shadow-maroon/70 hover:bg-primary-hover hover:shadow-[0_16px_32px_-14px]',
  accent: 'bg-mustard text-ink shadow-[0_10px_24px_-12px] shadow-gold/70 hover:brightness-105',
  secondary:
    'border border-line-strong bg-surface text-heading hover:border-primary hover:text-primary',
  ghost: 'text-heading hover:bg-surface-2',
  // The single place green is allowed to lead — it reads as "WhatsApp", not as brand colour.
  whatsapp: 'bg-green-deep text-cream hover:bg-green shadow-[0_10px_24px_-12px] shadow-green-deep/70',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.8125rem]',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-[0.9375rem]',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: CommonProps & ComponentProps<'button'>) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  to,
  ...props
}: CommonProps & { to: string } & Omit<ComponentProps<typeof Link>, 'to'>) {
  return (
    <Link to={to} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  )
}

export function ButtonAnchor({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: CommonProps & ComponentProps<'a'>) {
  return <a className={cn(base, variants[variant], sizes[size], className)} {...props} />
}
