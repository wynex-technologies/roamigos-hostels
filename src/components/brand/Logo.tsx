import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { site } from '@/data/site'

const ALT = `${site.name} - ${site.tagline}`

/**
 * The official artwork, straight out of `tools/logo/Roamigos final.ai` - never a
 * lockup rebuilt from web type.
 *
 * Stacked, the wordmark shrinks to nothing inside a 80px header bar, so the two
 * halves of the logo sit side by side here: the flamingo from `logo-mark.svg`,
 * the script + rules + serif tagline from `logo-wordmark.svg`. `logo.svg` keeps
 * the stacked original for places that have room for it.
 *
 * The `-light` copies are the same paths with the maroon script knocked out to
 * cream - it is unreadable on the footer ground and on the hero photo.
 */
function LogoLockup({
  className,
  size = 'default',
  tone = 'default',
}: {
  className?: string
  size?: 'default' | 'compact' | 'large'
  /** `light` is for a permanently dark ground - the footer, the transparent hero header. */
  tone?: 'default' | 'light'
}) {
  const mark = {
    compact: 'h-11',
    default: 'h-14 sm:h-16',
    large: 'h-20 sm:h-28 lg:h-36',
  }[size]
  const word = {
    compact: 'h-7',
    default: 'h-9 sm:h-10',
    large: 'h-12 sm:h-18 lg:h-24',
  }[size]

  return (
    <span className={cn('inline-flex items-center gap-2.5 sm:gap-3', className)}>
      <img src="/logo-mark.svg" alt="" width={44} height={81} className={cn('w-auto shrink-0', mark)} />
      {tone === 'light' ? (
        <img
          src="/logo-wordmark-light.svg"
          alt={ALT}
          width={95}
          height={36}
          className={cn('w-auto', word)}
        />
      ) : (
        <>
          <img
            src="/logo-wordmark.svg"
            alt={ALT}
            width={95}
            height={36}
            className={cn('w-auto dark:hidden', word)}
          />
          <img
            src="/logo-wordmark-light.svg"
            alt=""
            aria-hidden="true"
            width={95}
            height={36}
            className={cn('hidden w-auto dark:block', word)}
          />
        </>
      )}
    </span>
  )
}

/** Header and drawer lockup - the logo, linked home. */
export function Logo({
  className,
  compact = false,
  tone = 'default',
}: {
  className?: string
  compact?: boolean
  tone?: 'default' | 'light'
}) {
  return (
    <Link to="/" aria-label={ALT} className={cn('group inline-flex', className)}>
      <LogoLockup
        tone={tone}
        size={compact ? 'compact' : 'default'}
        className="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-rotate-3"
      />
    </Link>
  )
}

/** The same lockup standing on its own - the footer columns and the closing band. */
export function LogoRow({
  className,
  size = 'default',
  tone = 'default',
}: {
  className?: string
  size?: 'default' | 'compact' | 'large'
  tone?: 'default' | 'light'
}) {
  return <LogoLockup className={className} size={size} tone={tone} />
}

/** The stacked original, for places with room for the full logo - the 404 page. */
export function LogoStacked({
  className,
  tone = 'default',
}: {
  className?: string
  tone?: 'default' | 'light'
}) {
  const base = 'w-auto shrink-0'
  if (tone === 'light') {
    return (
      <img src="/logo-light.svg" alt={ALT} width={95} height={107} className={cn(base, 'h-32', className)} />
    )
  }
  return (
    <>
      <img
        src="/logo.svg"
        alt={ALT}
        width={95}
        height={107}
        className={cn(base, 'h-32 dark:hidden', className)}
      />
      <img
        src="/logo-light.svg"
        alt=""
        aria-hidden="true"
        width={95}
        height={107}
        className={cn(base, 'hidden h-32 dark:block', className)}
      />
    </>
  )
}
