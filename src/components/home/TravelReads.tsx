import { Clock } from 'lucide-react'
import { travelReads } from '@/data/content'
import { Photo } from '@/components/ui/Photo'
import { Container, Eyebrow, Section, SectionTitle } from '@/components/ui/primitives'

export function TravelReads() {
  return (
    <Section id="gallery">
      <Container>
        <div className="max-w-xl">
          <Eyebrow>From the road</Eyebrow>
          <SectionTitle className="mt-3" underline="Reads">
            Travel
          </SectionTitle>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty">
            Expert-curated, locally approved travel guides from the places we call home.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {travelReads.map((read) => (
            <li key={read.title}>
              <article className="group card-surface h-full overflow-hidden transition-[transform,box-shadow] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:shadow-warm-lg">
                <div className="relative aspect-16/11 overflow-hidden bg-surface-2">
                  <Photo
                    id={read.image}
                    width={700}
                    widths={[400, 700, 1000]}
                    sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 90vw"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-canvas/90 px-3 py-1 text-[0.6875rem] font-semibold text-heading backdrop-blur">
                    <Clock className="size-3" />
                    {read.readTime}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-display text-[1.0625rem] leading-snug font-semibold text-balance">
                    {read.title}
                  </h3>
                  <p className="mt-3 text-[0.8125rem] text-muted">{read.author}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
