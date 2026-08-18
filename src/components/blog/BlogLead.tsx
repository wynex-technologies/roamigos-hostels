import { ArrowUpRight, Clock } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { Badge, Container, Eyebrow } from '@/components/ui/primitives'
import { blogCategories, blogPosts } from '@/data/blog'
import { useReveal } from '@/lib/useReveal'
import { formatDate } from '@/lib/utils'

/** Inline `--lag`, so the reveal order stays readable at the call site. */
const lag = (seconds: number) => ({ '--lag': `${seconds}s` }) as React.CSSProperties

/**
 * The lead story. One post gets the full spread — photograph on the left, the
 * standfirst and three hard facts on the right — so the page has a front page
 * before it has a contents list.
 */
export function BlogLead() {
  const post = blogPosts.find((entry) => entry.featured) ?? blogPosts[0]
  const block = useReveal<HTMLDivElement>(0.08)

  const category = blogCategories.find((entry) => entry.key === post.category)?.label ?? 'Journal'

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div ref={block}>
          <div style={lag(0)} className="reveal-rise flex items-center gap-4">
            <Eyebrow>The lead</Eyebrow>
            <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-line-strong to-transparent" />
          </div>

          <article className="card-raised mt-8 grid overflow-hidden lg:grid-cols-[1.15fr_1fr]">
            <div className="group relative min-h-70 overflow-hidden lg:min-h-[30rem]">
              <Photo
                id={post.image}
                width={1200}
                widths={[640, 900, 1400]}
                sizes="(min-width: 1024px) 46rem, 100vw"
                alt=""
                className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-ink/25"
              />
              <span className="absolute top-5 left-5">
                <Badge tone="primary">Issue 01 · Lead story</Badge>
              </span>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] tracking-[0.16em] text-muted uppercase">
                <span className="font-bold text-accent">{category}</span>
                <span aria-hidden className="size-1 rotate-45 bg-line-strong" />
                <span>{formatDate(post.date)}</span>
                <span aria-hidden className="size-1 rotate-45 bg-line-strong" />
                <span className="inline-flex items-center gap-1.5 normal-case">
                  <Clock className="size-3.5" />
                  {post.readTime}
                </span>
              </div>

              <h2 className="mt-5 font-display text-[clamp(1.6rem,3.2vw,2.5rem)] leading-[1.1] font-semibold text-balance">
                {post.title}
              </h2>

              <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty">{post.excerpt}</p>

              {post.facts && (
                <ul className="mt-8 grid gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-3">
                  {post.facts.map((fact) => (
                    <li key={fact.label}>
                      <p className="text-[0.625rem] font-bold tracking-[0.2em] text-muted uppercase">
                        {fact.label}
                      </p>
                      <p className="mt-1.5 font-display text-lg font-semibold text-heading">
                        {fact.value}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-maroon font-display text-sm font-semibold text-cream">
                  {post.author
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </span>
                <span className="text-[0.875rem]">
                  <span className="block font-semibold text-heading">{post.author}</span>
                  <span className="text-muted">Front desk, Guwahati</span>
                </span>
                <a
                  href="#stories"
                  className="group/link ml-auto inline-flex items-center gap-2 text-[0.875rem] font-semibold text-heading"
                >
                  <span className="relative">
                    More in this issue
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-0 block h-px w-full origin-left scale-x-0 bg-accent-soft transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover/link:scale-x-100"
                    />
                  </span>
                  <ArrowUpRight className="size-4 text-accent transition-transform duration-300 group-hover/link:rotate-45" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </Container>
    </section>
  )
}
