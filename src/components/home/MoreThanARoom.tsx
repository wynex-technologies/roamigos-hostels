import { ArrowRight } from 'lucide-react'
import { commonSpaceImages, roomPerks } from '@/data/content'
import { site } from '@/data/site'
import { Photo } from '@/components/ui/Photo'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/primitives'
import { Icon } from '@/components/ui/Icon'

export function MoreThanARoom() {
  const [lead, ...rest] = commonSpaceImages

  return (
    <section id="amenities" className="pb-4">
      <Container>
        <div className="card-surface overflow-hidden p-6 shadow-warm-lg sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
            {/* Photo cluster */}
            <div className="flex gap-3">
              <Photo
                id={lead}
                width={400}
                alt=""
                loading="lazy"
                className="h-40 w-28 rounded-2xl object-cover sm:h-44 sm:w-32"
              />
              <div className="flex flex-col gap-3">
                {rest.map((id) => (
                  <Photo
                    key={id}
                    id={id}
                    width={300}
                    alt=""
                    loading="lazy"
                    className="h-[4.75rem] w-28 rounded-xl object-cover sm:h-[5.25rem] sm:w-32"
                  />
                ))}
              </div>
            </div>

            <div className="lg:flex lg:items-center lg:gap-10">
              <div className="lg:w-56 lg:shrink-0">
                <h2 className="font-display text-[1.75rem] leading-tight font-semibold sm:text-3xl">
                  More Than
                  <br />
                  Just a Room
                </h2>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                  Great vibes, cozy spaces and memories that last forever.
                </p>
              </div>

              {/* Three across on every size — six columns leaves labels like
                  "Daily Housekeeping" too narrow and they collide. */}
              <ul className="mt-8 grid grid-cols-3 gap-x-6 gap-y-8 lg:mt-0 lg:flex-1">
                {roomPerks.map((perk) => (
                  <li key={perk.title} className="flex flex-col items-center gap-2.5 text-center">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-accent">
                      <Icon name={perk.icon} className="size-[1.15rem]" />
                    </span>
                    <span className="text-[0.8125rem] leading-snug font-semibold text-heading text-balance">
                      {perk.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-4 border-t border-line pt-6 lg:items-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
              <ButtonLink to="/rooms" variant="whatsapp">
                View All Rooms
                <ArrowRight className="size-4" />
              </ButtonLink>
              <p className="text-[0.8125rem] text-muted">
                Trusted by{' '}
                <span className="font-semibold text-heading">{site.stats.guests} happy guests</span>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
