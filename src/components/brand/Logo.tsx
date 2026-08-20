import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { site } from '@/data/site'
import { Wordmark } from './Wordmark'

/**
 * Header/footer lockup: the flamingo mark, the script wordmark (both traced from
 * the source logo PDF) and the letterspaced tagline.
 */
export function Logo({
  className,
  compact = false,
  tone = 'default',
}: {
  className?: string
  compact?: boolean
  /** `light` is for the lockup sitting on a dark photo — e.g. the transparent hero header. */
  tone?: 'default' | 'light'
}) {
  return (
    <Link
      to="/"
      aria-label={`${site.name} — ${site.tagline}`}
      className={cn('group inline-flex items-center gap-2.5 sm:gap-3', className)}
    >
      <img
        src="/logo-mark.svg"
        alt=""
        width={56}
        height={56}
        className={cn(
          'shrink-0 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-rotate-3',
          compact ? 'size-11' : 'size-12 sm:size-14',
        )}
      />
      <span className="flex flex-col">
        <Wordmark
          className={cn(
            'transition-colors',
            tone === 'light' ? 'text-cream' : 'text-primary',
            compact ? 'h-7 w-[5.4rem]' : 'h-8 w-[6.2rem] sm:h-9 sm:w-[7.1rem]',
          )}
        />
        <span
          className={cn(
            'font-bold tracking-[0.2em] uppercase transition-colors',
            tone === 'light' ? 'text-mustard' : 'text-heading',
            compact ? 'text-[0.5625rem]' : 'text-[0.625rem] sm:text-[0.6875rem]',
          )}
        >
          {site.tagline}
        </span>
      </span>
    </Link>
  )
}

/** Full circular badge — used where the logo stands alone. */
export function LogoBadge({ className }: { className?: string }) {
  return (
    <img
      src="/logo-badge.svg"
      alt={`${site.name} ${site.tagline}`}
      width={160}
      height={160}
      className={cn('size-32', className)}
    />
  )
}
