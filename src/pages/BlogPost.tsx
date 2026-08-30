import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Clock, MessageCircle } from 'lucide-react'
import { ArticleBody } from '@/components/blog/ArticleBody'
import { CtaBand } from '@/components/common/CtaBand'
import { Photo } from '@/components/ui/Photo'
import { Badge, Container, Eyebrow } from '@/components/ui/primitives'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { JsonLd } from '@/components/seo/JsonLd'
import { blogCategories, getPost, hasArticle, orderedPosts } from '@/data/blog'
import { site } from '@/data/site'
import { articleSchema, breadcrumbs } from '@/lib/structuredData'
import { readingTime } from '@/lib/article'
import { usePageMeta } from '@/lib/usePageMeta'
import { enquiryUrl } from '@/lib/whatsapp'
import { formatDate } from '@/lib/utils'
import NotFound from './NotFound'

/**
 * One story from the journal.
 *
 * The page is full width and stays full width - phone, tablet, desktop, and
 * every article published from the panel from here on, since they all render
 * through this one component. Nothing is capped to a reading measure and
 * nothing sits in a margin: the headline, the standfirst, the facts and the
 * body all run the width of the page, and the photograph runs wider still,
 * edge to edge past the page gutters.
 *
 * A slug that matches nothing renders the site's own 404 rather than
 * redirecting to `/blog`. A redirect would quietly answer 200 for an address
 * that does not exist, which is how dead links stay in an index for years.
 */
export default function BlogPost() {
  const { slug = '' } = useParams()
  const post = getPost(slug)

  // Every hook above the guard, so the early return cannot change hook order.
  usePageMeta(
    post ? `${post.title} - The Journal` : `Page not found - ${site.legalName}`,
    post?.excerpt,
    { image: post?.image, type: 'article' },
  )

  if (!post || !hasArticle(post)) return <NotFound />

  const category = blogCategories.find((entry) => entry.key === post.category)?.label ?? 'Journal'

  // Next in the issue, wrapping at the end - the reader who finishes one story
  // is the reader most likely to want another, and a dead end here sends them
  // back to the browser's back button instead.
  const others = orderedPosts.filter((entry) => entry.slug !== post.slug && hasArticle(entry))
  const more = others.slice(0, 2)

  return (
    <>
      <JsonLd id={`article-${post.slug}`} data={articleSchema(post)} />
      <JsonLd
        id="article-crumbs"
        data={breadcrumbs([
          { name: 'The Journal', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <article>
        {/* ------------------------------ masthead ------------------------- */}
        <Container className="pt-10 sm:pt-14">
          <Link
            to="/blog"
            className="group inline-flex items-center gap-2 text-[0.8125rem] font-semibold tracking-wide text-muted uppercase transition-colors hover:text-heading"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            The Journal
          </Link>

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] tracking-[0.16em] text-muted uppercase">
              <span className="font-bold text-accent">{category}</span>
              <span aria-hidden className="size-1 rotate-45 bg-line-strong" />
              <span>{formatDate(post.date)}</span>
              <span aria-hidden className="size-1 rotate-45 bg-line-strong" />
              <span className="inline-flex items-center gap-1.5 normal-case">
                <Clock className="size-3.5" />
                {post.readTime || readingTime(post.body ?? '')}
              </span>
            </div>

            <h1 className="mt-5 font-display text-[clamp(1.9rem,4.4vw,3.1rem)] leading-[1.08] font-semibold text-balance">
              {post.title}
            </h1>

            <p className="mt-6 text-[1.1875rem] leading-relaxed text-muted text-pretty">
              {post.excerpt}
            </p>

            <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-maroon font-display text-sm font-semibold text-cream">
                {post.author
                  .split(' ')
                  .map((part) => part[0])
                  .join('')}
              </span>
              <span className="text-[0.875rem]">
                <span className="block font-semibold text-heading">{post.author}</span>
                <span className="text-muted">Front desk, Guwahati</span>
              </span>
            </div>
          </div>
        </Container>

        {/* ------------------------------ the photo ------------------------ */}
        <div className="relative mt-10 aspect-16/10 overflow-hidden bg-surface-2 sm:aspect-21/9">
          <Photo
            id={post.image}
            width={2000}
            widths={[760, 1200, 1800, 2400]}
            sizes="100vw"
            alt=""
            className="size-full object-cover"
          />
          {post.featured && (
            <span className="absolute top-5 left-5 sm:top-7 sm:left-7">
              <Badge tone="primary">Issue 01 · Lead story</Badge>
            </span>
          )}
        </div>

        {/* ------------------------------- the read ------------------------ */}
        <Container className="py-14 sm:py-16 lg:py-20">
          {post.facts && (
            <ul className="mb-12 grid gap-x-6 gap-y-5 border-y border-line py-6 sm:grid-cols-3">
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

          <ArticleBody body={post.body ?? ''} />

          {/* The desk wrote it, so the desk is who you ask about it. */}
          <div className="card-surface mt-14 p-7 sm:p-8">
            <p className="font-display text-lg font-semibold">
              Something here out of date, or a question it did not answer?
            </p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted text-pretty">
              Ferry times change, roads close and prices move. Ask the desk and you will get
              this week&apos;s answer rather than this article&apos;s.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonAnchor
                href={enquiryUrl(`Hi Roamigos! I was reading "${post.title}" and have a question.`)}
                target="_blank"
                rel="noreferrer"
                variant="whatsapp"
                size="md"
              >
                <MessageCircle className="size-4" />
                Ask on WhatsApp
              </ButtonAnchor>
              <ButtonLink to="/rooms" variant="secondary" size="md">
                Browse rooms &amp; beds
              </ButtonLink>
            </div>
          </div>
        </Container>
      </article>

      {/* -------------------------------- read on -------------------------- */}
      {more.length > 0 && (
        <section className="border-t border-line bg-surface-2 py-16 sm:py-20">
          <Container>
            <Eyebrow>Next in this issue</Eyebrow>

            <ul className="mt-8 grid gap-6 sm:grid-cols-2">
              {more.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    to={`/blog/${entry.slug}`}
                    className="group card-surface flex h-full gap-5 overflow-hidden p-4 transition-[transform,box-shadow] duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-warm-lg"
                  >
                    <span className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                      <Photo
                        id={entry.image}
                        width={320}
                        widths={[200, 320]}
                        sizes="6rem"
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-soft)] group-hover:scale-105"
                      />
                    </span>
                    <span className="flex min-w-0 flex-col justify-center">
                      <span className="text-[0.6875rem] font-bold tracking-[0.16em] text-accent uppercase">
                        {blogCategories.find((c) => c.key === entry.category)?.label ?? 'Journal'}
                      </span>
                      <span className="mt-2 font-display text-[1.0625rem] leading-snug font-semibold text-balance">
                        {entry.title}
                      </span>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-primary">
                        Read article
                        <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:rotate-45" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <CtaBand
        eyebrow="Stop reading, start going"
        title={
          <>
            Every one of these started
            <br />
            <span className="text-sheen">with a bed for the night.</span>
          </>
        }
        copy="Book the bed, and the desk will plan the rest with you - shared cabs, ferry timings and the safari slot nobody else got."
        chatPrompt={`Hi Roamigos! I read "${post.title}" and I'd like help planning a trip.`}
      />
    </>
  )
}
