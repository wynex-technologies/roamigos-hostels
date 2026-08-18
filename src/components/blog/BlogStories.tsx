import { useMemo, useState } from 'react'
import { Clock, MessageCircle } from 'lucide-react'
import { Photo } from '@/components/ui/Photo'
import { Container, Eyebrow, SectionTitle } from '@/components/ui/primitives'
import { blogCategories, blogPosts, mostAsked, type PostCategory } from '@/data/blog'
import { enquiryUrl } from '@/lib/whatsapp'
import { cn, formatDate } from '@/lib/utils'

/**
 * The contents of the issue. The lead story is deliberately left in the list as
 * well — someone arriving from a category chip should not find a hole where the
 * front page was.
 */
export function BlogStories() {
  const [category, setCategory] = useState<PostCategory | 'all'>('all')

  const posts = useMemo(
    () =>
      category === 'all' ? blogPosts : blogPosts.filter((post) => post.category === category),
    [category],
  )

  const label = (key: PostCategory) =>
    blogCategories.find((entry) => entry.key === key)?.label ?? 'Journal'

  return (
    <section
      id="stories"
      className="scroll-mt-24 border-t border-line bg-surface-2 py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Eyebrow>Every dispatch</Eyebrow>
            <SectionTitle className="mt-3" underline="road">
              Filed from the
            </SectionTitle>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-pretty">
              Guides written by the people who answer your questions at check-in — so the timings
              are the real ones, and the shortcuts have actually been walked.
            </p>
          </div>

          <p className="shrink-0 text-[0.8125rem] tracking-[0.16em] text-muted uppercase">
            {posts.length} {posts.length === 1 ? 'story' : 'stories'}
          </p>
        </div>

        <div className="no-scrollbar -mx-5 mt-10 flex gap-2.5 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
          {blogCategories.map((entry) => {
            const active = entry.key === category
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => setCategory(entry.key)}
                aria-pressed={active}
                className={cn(
                  'shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-line bg-surface text-body hover:border-line-strong hover:text-heading',
                )}
              >
                {entry.label}
              </button>
            )
          })}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_19rem] lg:gap-12">
          <ul className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <li key={post.slug}>
                <article className="group card-surface flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:shadow-warm-lg">
                  <div className="relative aspect-16/10 overflow-hidden bg-surface-2">
                    <Photo
                      id={post.image}
                      width={800}
                      widths={[420, 700, 1000]}
                      sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 90vw"
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-canvas/90 px-3 py-1 text-[0.625rem] font-bold tracking-[0.14em] text-heading uppercase backdrop-blur">
                      {label(post.category)}
                    </span>
                    <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-canvas/90 px-3 py-1 text-[0.6875rem] font-semibold text-heading backdrop-blur">
                      <Clock className="size-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-[1.1875rem] leading-snug font-semibold text-balance">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                      {post.excerpt}
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4 text-[0.8125rem]">
                      <span className="font-semibold text-heading">{post.author}</span>
                      <span className="text-muted">{formatDate(post.date)}</span>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {/* Sidebar: what the desk actually gets asked, in order. */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="card-surface p-6">
              <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-accent uppercase">
                Asked at the desk
              </p>
              <ol className="mt-5 space-y-5">
                {mostAsked.map((item, i) => (
                  <li key={item.slug} className="flex gap-4">
                    <span className="font-display text-lg leading-none font-semibold text-line-strong tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.9375rem] leading-snug font-semibold text-heading text-pretty">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-[0.8125rem] text-muted">{item.note}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-surface mt-6 p-6">
              <p className="font-display text-lg font-semibold">Question we have not answered?</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                Ask the desk directly. If it comes up three times, it becomes the next guide.
              </p>
              <a
                href={enquiryUrl("Hi Roamigos! I have a question about travelling around Guwahati.")}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-[0.875rem] font-semibold text-primary transition-colors hover:text-primary-hover"
              >
                <MessageCircle className="size-4" />
                Ask on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  )
}
