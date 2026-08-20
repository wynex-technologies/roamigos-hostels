import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock } from 'lucide-react'
import { blogCategories, blogPosts, type BlogPost } from '@/data/blog'
import { Photo } from '@/components/ui/Photo'
import { Container, Section } from '@/components/ui/primitives'
import { useReveal } from '@/lib/useReveal'
import { formatDate } from '@/lib/utils'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

const labelFor = (post: BlogPost) =>
  blogCategories.find((entry) => entry.key === post.category)?.label ?? 'Journal'

/**
 * A trailer for the journal - the same posts the blog page publishes, never a
 * separate set. The lead story gets the plate; two full cards stand beside it,
 * sized so their photographs read rather than sit as thumbnails.
 */
export function TravelReads() {
  const header = useReveal<HTMLDivElement>(0.25)

  const lead = blogPosts.find((post) => post.featured) ?? blogPosts[0]
  const rest = blogPosts.filter((post) => post.slug !== lead.slug).slice(0, 2)

  // Desktop/tablet only - on phones the journal trailer pushed the contact band
  // too far down to be worth the scroll.
  return (
    <Section id="journal" className="hidden md:block">
      <Container wide>
        <div ref={header}>
          <p style={lag(0)} className="reveal-rise eyebrow flex items-center gap-2.5">
            <span aria-hidden className="size-1.5 rotate-45 bg-accent-soft" />
            The Roamigos Journal
          </p>

          <div className="mt-6 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
            <h2 className="max-w-2xl font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08] font-semibold">
              <span style={lag(0.14)} className="reveal-line">
                <span>Travel reads,</span>
              </span>
              <span style={lag(0.26)} className="reveal-line">
                <span>
                  written at the <em className="font-normal text-accent-soft italic">desk</em>.
                </span>
              </span>
            </h2>

            <p
              style={lag(0.42)}
              className="reveal-rise max-w-sm text-[1.0625rem] leading-relaxed text-muted text-pretty lg:pb-2"
            >
              Every guide below was walked, eaten and rewritten by somebody working downstairs - so
              the timings are the real ones.
            </p>
          </div>

          <span
            aria-hidden
            style={lag(0.55)}
            className="reveal-rule mt-10 block h-px w-full origin-left bg-line"
          />
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:gap-8">
          {/* The lead story. */}
          <Link
            to="/blog"
            className="card-raised group flex flex-col overflow-hidden transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:shadow-raised-lg"
          >
            <div className="relative aspect-4/3 overflow-hidden sm:aspect-16/10">
              <Photo
                id={lead.image}
                width={1200}
                widths={[600, 900, 1400]}
                sizes="(min-width: 1024px) 44rem, 100vw"
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-ink/20"
              />

              <span className="absolute top-5 left-5 rounded-full bg-mustard px-3 py-1 text-[0.625rem] font-bold tracking-[0.14em] text-ink uppercase shadow-warm">
                {labelFor(lead)}
              </span>

              <span className="absolute top-5 right-5 inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-ink/45 px-3 py-1 text-[0.6875rem] font-semibold text-cream backdrop-blur-md">
                <Clock className="size-3.5" />
                {lead.readTime}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <span
                aria-hidden
                className="block h-px w-8 origin-left bg-accent-soft transition-transform duration-600 ease-[var(--ease-out-soft)] group-hover:scale-x-[3]"
              />

              <h3 className="mt-5 font-display text-[clamp(1.375rem,2.3vw,1.875rem)] leading-snug font-semibold text-balance">
                {lead.title}
              </h3>

              <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                {lead.excerpt}
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-maroon font-display text-[0.75rem] font-semibold text-cream">
                  {lead.author
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </span>
                <span className="text-[0.8125rem] leading-tight">
                  <span className="block font-semibold text-heading">{lead.author}</span>
                  <span className="text-muted">{formatDate(lead.date)}</span>
                </span>

                <span className="ml-auto grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-accent transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </div>
          </Link>

          {/* Two cards beside it. They split the lead card's height between them
              and let the photograph take whatever the text does not need, so the
              images carry the column instead of sitting in it as thumbnails. */}
          <div className="flex min-h-0 flex-col gap-6 lg:gap-8">
            {rest.map((post, i) => (
              <Link
                key={post.slug}
                to="/blog"
                className="card-raised group flex min-h-0 flex-1 flex-col overflow-hidden transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:shadow-raised-lg"
              >
                {/* The photograph is absolutely placed so it contributes no
                    intrinsic height - the column stretches to the lead card and
                    the image fills whatever is left, never the other way round. */}
                <div className="relative aspect-16/10 overflow-hidden lg:aspect-auto lg:min-h-0 lg:flex-1">
                  <Photo
                    id={post.image}
                    width={900}
                    widths={[400, 600, 900]}
                    sizes="(min-width: 1024px) 34rem, 100vw"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/15"
                  />

                  <span className="absolute top-4 left-4 rounded-full bg-mustard px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.14em] text-ink uppercase shadow-warm">
                    {labelFor(post)}
                  </span>

                  <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-ink/45 px-2.5 py-1 text-[0.6875rem] font-semibold text-cream backdrop-blur-md">
                    <Clock className="size-3" />
                    {post.readTime}
                  </span>

                  {/* Keeps the lead card's numbering running down the column. */}
                  <span className="absolute right-4 bottom-3 font-display text-[0.875rem] font-semibold text-gray-200/70 tabular-nums">
                    {String(i + 2).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-start gap-4 p-5 sm:p-6">
                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 font-display text-[1.0625rem] leading-snug font-semibold text-pretty transition-colors duration-300 group-hover:text-primary sm:text-[1.1875rem]">
                      {post.title}
                    </h4>

                    <p className="mt-2 text-[0.75rem] text-muted">
                      {post.author}
                      <span aria-hidden className="mx-2 inline-block size-1 rotate-45 bg-line-strong align-middle" />
                      {formatDate(post.date)}
                    </p>
                  </div>

                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong text-accent transition-[background-color,border-color,color,transform] duration-400 ease-[var(--ease-out-soft)] group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            ))}

            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 self-start text-[0.875rem] font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Read all {blogPosts.length} stories
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
