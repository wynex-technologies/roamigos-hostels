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
 * A trailer for the journal — the same posts the blog page publishes, never a
 * separate set. The lead story gets the plate; the next three are set beside it
 * as a contents list.
 */
export function TravelReads() {
  const header = useReveal<HTMLDivElement>(0.25)

  const lead = blogPosts.find((post) => post.featured) ?? blogPosts[0]
  const rest = blogPosts.filter((post) => post.slug !== lead.slug).slice(0, 3)

  return (
    <Section id="journal">
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
              Every guide below was walked, eaten and rewritten by somebody working downstairs — so
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

          {/* Contents beside it. */}
          <div className="card-raised flex flex-col p-5 sm:p-7">
            <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-accent uppercase">
              Also in this issue
            </p>

            <ul className="mt-3 flex flex-1 flex-col">
              {rest.map((post, i) => (
                <li key={post.slug} className="flex flex-1 items-center border-b border-line last:border-0">
                  <Link to="/blog" className="group flex w-full items-start gap-4 py-4 sm:gap-5">
                    <div className="relative size-18 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:size-20">
                      <Photo
                        id={post.image}
                        width={240}
                        widths={[160, 240, 320]}
                        sizes="5rem"
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-110"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 text-[0.625rem] font-bold tracking-[0.16em] uppercase">
                        <span className="font-display text-[0.75rem] tracking-normal text-line-strong tabular-nums">
                          {String(i + 2).padStart(2, '0')}
                        </span>
                        <span className="text-accent">{labelFor(post)}</span>
                      </div>

                      <h4 className="mt-1.5 line-clamp-2 font-display text-[1rem] leading-snug font-semibold text-pretty transition-colors duration-300 group-hover:text-primary">
                        {post.title}
                      </h4>

                      <p className="mt-1.5 flex items-center gap-2 text-[0.75rem] text-muted">
                        <Clock className="size-3" />
                        {post.readTime}
                        <span aria-hidden className="size-1 rotate-45 bg-line-strong" />
                        {formatDate(post.date)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              to="/blog"
              className="group mt-5 inline-flex items-center gap-2 border-t border-line pt-5 text-[0.875rem] font-semibold text-primary transition-colors hover:text-primary-hover"
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
