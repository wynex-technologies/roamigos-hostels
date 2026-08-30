import { Fragment } from 'react'
import { parseArticle, splitBold } from '@/lib/article'

/**
 * The article, set.
 *
 * Every mark the author typed becomes a React element here - there is no HTML
 * string anywhere in this path and no `dangerouslySetInnerHTML`, which is what
 * lets a body be edited from the panel by whoever is on the desk without that
 * field becoming a way to put script on the site.
 *
 * The article runs the full width of the page rather than sitting in a narrow
 * measure column, at every size - phone, tablet and desktop alike. Line height
 * and paragraph spacing are opened up to carry the longer line, since a wide
 * measure set tight is what actually makes long lines hard to follow.
 */
function Inline({ text }: { text: string }) {
  return (
    <>
      {splitBold(text).map((run, index) =>
        // splitBold alternates: even runs are plain, odd runs were **wrapped**.
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-heading">
            {run}
          </strong>
        ) : (
          <Fragment key={index}>{run}</Fragment>
        ),
      )}
    </>
  )
}

export function ArticleBody({ body }: { body: string }) {
  const blocks = parseArticle(body)

  return (
    <div className="w-full">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'heading':
            return (
              <h2
                key={index}
                className="mt-12 mb-5 font-display text-[clamp(1.3rem,2.2vw,1.75rem)] leading-tight font-semibold text-balance first:mt-0"
              >
                <Inline text={block.text} />
                <span aria-hidden className="mt-4 block h-px w-10 bg-accent-soft" />
              </h2>
            )

          case 'quote':
            return (
              <blockquote
                key={index}
                className="my-10 border-l-2 border-accent-soft pl-6 font-display text-[clamp(1.1875rem,1.6vw,1.4rem)] leading-relaxed text-heading text-pretty"
              >
                <Inline text={block.text} />
              </blockquote>
            )

          case 'list':
            return (
              <ul key={index} className="my-6 space-y-3">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-3.5 text-[1.0625rem] leading-[1.85] text-pretty">
                    <span
                      aria-hidden
                      className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-accent-soft"
                    />
                    <span>
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            )

          default:
            return (
              <p key={index} className="mt-6 text-[1.0625rem] leading-[1.85] text-pretty first:mt-0">
                <Inline text={block.text} />
              </p>
            )
        }
      })}
    </div>
  )
}
