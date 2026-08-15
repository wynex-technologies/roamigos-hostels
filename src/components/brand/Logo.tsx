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
}: {
  className?: string
  compact?: boolean
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
        width={52}
        height={52}
        className={cn(
          'shrink-0 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-rotate-3',
          compact ? 'size-10' : 'size-11 sm:size-13',
        )}
      />
      <span className="flex flex-col">
        <Wordmark
          className={cn(
            'text-primary transition-colors',
            compact ? 'h-6 w-[4.6rem]' : 'h-7 w-[5.4rem] sm:h-8 sm:w-[6.2rem]',
          )}
        />
        <span
          className={cn(
            'font-semibold tracking-[0.28em] text-accent uppercase',
            compact ? 'text-[0.5rem]' : 'text-[0.5rem] sm:text-[0.5625rem]',
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
