import { cn } from './ui'

/**
 * The official artwork, the same files the site uses. Never a lockup rebuilt
 * from web type.
 *
 * The mark has two cuts and a dark ground needs its own. The flamingo is a
 * charcoal silhouette with pink, green and cream shapes on top, so on a dark
 * ground the silhouette - the bird's whole outline, and the front of the beak
 * with it - disappears into the page, while the gap between its legs flares up
 * as a cream triangle. `logo-light.svg` is the artwork's own answer to that,
 * not a filter over the light one, which is why there is a second file rather
 * than a CSS `invert`.
 *
 *   tone="light"  for a dark ground - the maroon panel on the sign-in screen
 *   tone="auto"   follows the theme, for the panel's own light/dark surfaces
 *
 * `className` styles the **wrapper**, not the images, and both of those matter:
 *
 * - The wrapper is `inline-flex`, so the artwork is never a direct child of a
 *   flex column. As one it would be stretched to the container's full width,
 *   and an SVG stretched that way quietly re-centres itself inside the box -
 *   the logo drifts to the middle of a panel whose text is left aligned, and
 *   nothing in the markup explains why.
 * - A visibility utility like `lg:hidden` belongs on one element, not on two
 *   images that each carry their own `dark:` visibility. Put both on the same
 *   element and they fight: `dark:block` beats `lg:hidden`, and the small
 *   mobile logo reappears on a wide screen, but only in dark mode.
 */
export function Logo({
  tone = 'auto',
  className,
}: {
  tone?: 'auto' | 'light'
  className?: string
}) {
  const image = 'h-full w-auto'

  return (
    <span className={cn('inline-flex shrink-0 items-center', className)}>
      {tone === 'light' ? (
        <img src="/admin/logo-light.svg" alt="Roamigos" width={95} height={107} className={image} />
      ) : (
        <>
          <img
            src="/admin/logo.svg"
            alt="Roamigos"
            width={95}
            height={107}
            className={cn(image, 'dark:hidden')}
          />
          <img
            src="/admin/logo-light.svg"
            alt=""
            aria-hidden="true"
            width={95}
            height={107}
            className={cn(image, 'hidden dark:block')}
          />
        </>
      )}
    </span>
  )
}

/** The mark on its own, for the rail where a stacked lockup has no room. */
export function LogoMark({ className }: { className?: string }) {
  const image = 'h-full w-auto'

  return (
    <span className={cn('inline-flex shrink-0 items-center', className)}>
      <img
        src="/admin/logo-mark.svg"
        alt=""
        width={44}
        height={81}
        className={cn(image, 'dark:hidden')}
      />
      <img
        src="/admin/logo-mark-dark.svg"
        alt=""
        width={44}
        height={81}
        className={cn(image, 'hidden dark:block')}
      />
    </span>
  )
}

/**
 * The mark and the wordmark stacked, each at its own size.
 *
 * `logo.svg` is the same two things in one file, but it is one drawing at one
 * scale: the flamingo is 80 units tall and the script under it is 36, so
 * sizing the whole lockup to fit a card leaves the wordmark and its hairline
 * tagline at a size where the letters close up and the rule under them
 * disappears. Splitting it means the mark can be big enough to read as a mark
 * and the wordmark big enough to read as words - the same reason the site's
 * header builds its lockup from the two files rather than shrinking this one.
 *
 * Both halves swap for the theme, and both take the artwork's own dark cut
 * rather than a filter over the light one.
 */
export function LogoStacked({ className }: { className?: string }) {
  return (
    /* `flex`, not `inline-flex`. A flex container is block level, so it fills
       the card and `items-center` genuinely centres the two halves inside it.
       As `inline-flex` the whole lockup is inline content, `mx-auto` does
       nothing to it, and it sits left against a heading that is centred - which
       reads as the logo being off, not as a layout mistake. */
    <span className={cn('flex flex-col items-center gap-4', className)}>
      {/* 44 x 81 in the artwork, so height drives it and the width follows. */}
      <span className="inline-flex h-[5.5rem] sm:h-24">
        <img
          src="/admin/logo-mark.svg"
          alt=""
          width={44}
          height={81}
          className="h-full w-auto dark:hidden"
        />
        <img
          src="/admin/logo-mark-dark.svg"
          alt=""
          width={44}
          height={81}
          className="hidden h-full w-auto dark:block"
        />
      </span>

      {/* 95 x 36, and wide - so this one is capped by width, not height. */}
      <span className="inline-flex w-[10.5rem] sm:w-44">
        <img
          src="/admin/logo-wordmark.svg"
          alt="Roamigos"
          width={95}
          height={36}
          className="h-auto w-full dark:hidden"
        />
        <img
          src="/admin/logo-wordmark-light.svg"
          alt=""
          aria-hidden="true"
          width={95}
          height={36}
          className="hidden h-auto w-full dark:block"
        />
      </span>
    </span>
  )
}
