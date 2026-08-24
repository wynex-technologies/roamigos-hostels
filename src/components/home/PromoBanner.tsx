import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Container, Section } from '@/components/ui/primitives'
import { homeBanner } from '@/data/content'
import { photo, photoSet } from '@/lib/images'
import { useReveal } from '@/lib/useReveal'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/**
 * Offers and promotions.
 *
 * Whatever is running - a festival rate, a long-stay deal - is painted into one
 * piece of artwork, so the band draws no type over it: the header says what the
 * section is, and the picture says what the offer is.
 *
 * Phones get their own crop through `<picture>` rather than a shrunk copy of the
 * wide file, and only the matching one is ever fetched. Everything is set in
 * `homeBanner` (`src/data/content.ts`).
 */
export function PromoBanner() {
  const header = useReveal<HTMLDivElement>(0.3)
  const frameRef = useReveal<HTMLDivElement>(0.15)

  if (!homeBanner.active || !homeBanner.image) return null

  const { image, imageMobile, alt, href, ratio, ratioMobile } = homeBanner
  const phone = imageMobile || image

  /* The ratio comes from the data so the slot holds its height before the file
     lands - a banner that pops in shoves the whole page down. */
  const frame = (
    <div
      style={
        {
          '--banner-ratio': ratio ?? '1600 / 500',
          '--banner-ratio-sm': ratioMobile ?? '4 / 3',
        } as React.CSSProperties
      }
      className="group relative block aspect-[var(--banner-ratio-sm)] overflow-hidden rounded-xl2 border border-line bg-surface-2 shadow-warm transition-[box-shadow,transform] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-warm-lg sm:aspect-[var(--banner-ratio)]"
    >
      <picture>
        {/* Matches the `sm` breakpoint above, where the wide artwork takes over. */}
        <source
          media="(max-width: 639px)"
          srcSet={photoSet(phone, [480, 720, 960, 1280]) ?? photo(phone, 1080)}
          sizes="100vw"
        />
        <img
          src={photo(image, 1600)}
          srcSet={photoSet(image, [768, 1100, 1600, 2000])}
          sizes="(min-width: 1280px) 1200px, 100vw"
          alt={alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
        />
      </picture>

      {/* A hairline that travels the top edge, the same tell the closing slab
          uses - it marks the band as something live rather than decoration. */}
      {href && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden"
        >
          <span className="animate-edge-travel block h-px w-1/3 bg-gradient-to-r from-transparent via-mustard to-transparent" />
        </span>
      )}
    </div>
  )

  let banner: ReactNode = frame
  if (href) {
    banner = href.startsWith('/') ? (
      <Link to={href} aria-label={alt}>
        {frame}
      </Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer" aria-label={alt}>
        {frame}
      </a>
    )
  }

  return (
    <Section id="offers">
      <Container>
        <div ref={header}>
          {/* A breathing dot, not the usual static lozenge - this band is the one
              place on the page that says "running right now". */}
          <p style={lag(0)} className="reveal-rise eyebrow flex items-center gap-2.5">
            <span className="relative grid size-2 place-items-center">
              <span className="absolute size-2 rounded-full bg-mustard" />
              <span
                aria-hidden
                className="animate-dot-halo absolute size-2 rounded-full bg-mustard"
              />
            </span>
            Offers &amp; promotions
          </p>

          <div className="mt-6 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
            <h2 className="max-w-2xl font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08] font-semibold">
              <span style={lag(0.14)} className="reveal-line">
                <span>Deals worth</span>
              </span>
              <span style={lag(0.26)} className="reveal-line">
                <span>
                  <em className="font-normal text-accent-soft italic">packing</em> for.
                </span>
              </span>
            </h2>

            <div style={lag(0.42)} className="reveal-rise max-w-md lg:text-right">
              <p className="text-[1.0625rem] leading-relaxed text-muted text-pretty">
                Book with us and not a listing site - what is running this month is below, and
                the desk applies it on WhatsApp before you pay a rupee.
              </p>
              <Link
                to="/rooms"
                className="group/link mt-4 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-primary transition-colors duration-300 hover:text-primary-hover"
              >
                Browse rooms &amp; beds
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>

        <div ref={frameRef} style={lag(0.1)} className="reveal-rise mt-10 sm:mt-12">
          {banner}
        </div>
      </Container>
    </Section>
  )
}
