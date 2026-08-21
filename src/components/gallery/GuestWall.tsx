import { Instagram } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { Container, Eyebrow, SectionTitle } from '@/components/ui/primitives'
import { ButtonAnchor } from '@/components/ui/Button'
import { guestFrames } from '@/data/gallery'
import { site } from '@/data/site'

/**
 * Guest frames, drifting past on a loop. The list is rendered twice and the
 * track translates exactly -50%, so the seam lands on an identical frame and
 * the loop has no visible jump.
 */
export function GuestWall() {
  const instagram = site.socials.find((social) => social.icon === 'instagram')?.href ?? '#'

  return (
    <section className="overflow-hidden border-y border-line bg-surface-2 py-16 sm:py-20">
      <Container>
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="max-w-xl">
            <Eyebrow>Tagged by our guests</Eyebrow>
            <SectionTitle className="mt-3" underline="us">
              The half of the wall
              <br />
              that is not
            </SectionTitle>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty">
              Tag <span className="font-semibold text-heading">@roamigos</span> and your frame goes
              up on the board by the stairs - the physical one, with actual pins.
            </p>
          </div>

          <ButtonAnchor
            href={instagram}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            size="lg"
            className="shrink-0"
          >
            <Instagram className="size-4" />
            Follow on Instagram
          </ButtonAnchor>
        </div>
      </Container>

      {/* Full-bleed rail, faded at both ends so it runs out of the page edges. */}
      <div className="relative mt-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface-2 to-transparent sm:w-32"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface-2 to-transparent sm:w-32"
        />

        <ul
          className="flex w-max gap-4 pl-4 [animation:marquee_48s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:[animation:none]"
          // The duplicate half is decorative - it exists only so the loop is seamless.
          aria-label="Photographs shared by our guests"
        >
          {[...guestFrames, ...guestFrames].map((frame, i) => (
            <li
              key={`${frame.handle}-${i}`}
              aria-hidden={i >= guestFrames.length}
              className="group relative w-40 shrink-0 overflow-hidden rounded-xl2 border border-line shadow-warm sm:w-52"
            >
              <Photo
                id={frame.id}
                width={420}
                widths={[280, 420, 620]}
                sizes="13rem"
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-108"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent"
              />
              <span className="absolute bottom-3 left-3 text-[0.75rem] font-semibold text-gray-200 [text-shadow:0_1px_10px_rgb(9_9_11/0.6)]">
                {frame.handle}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
