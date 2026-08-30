/**
 * The journal's article format.
 *
 * A post body is written by whoever is on the desk, in the panel, in a plain
 * textarea. So the format has to be something a person types without thinking
 * about it - and it has to be a format the site can render without shipping a
 * markdown library to every visitor who opens the home page.
 *
 * This is that middle ground: the four or five marks people actually reach for,
 * parsed here into blocks the renderer knows how to set.
 *
 *   ## A heading
 *   > A pulled quote
 *   - A list item
 *   Anything else is a paragraph. A blank line ends the block.
 *
 * Inline, `**bold**` only. Deliberately not links: a body full of raw HTML or
 * arbitrary hrefs typed into a CMS is how a content field becomes an injection
 * surface, and nothing here ever reaches `dangerouslySetInnerHTML`. Every mark
 * below turns into a React element, so an author cannot emit markup at all.
 */

export type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'paragraph'; text: string }

export function parseArticle(body: string): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
      paragraph = []
    }
  }
  const flushList = () => {
    if (list.length) {
      blocks.push({ kind: 'list', items: list })
      list = []
    }
  }
  const flush = () => {
    flushParagraph()
    flushList()
  }

  for (const raw of body.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim()

    if (!line) {
      flush()
      continue
    }

    if (line.startsWith('## ')) {
      flush()
      blocks.push({ kind: 'heading', text: line.slice(3).trim() })
      continue
    }

    if (line.startsWith('> ')) {
      flush()
      blocks.push({ kind: 'quote', text: line.slice(2).trim() })
      continue
    }

    if (line.startsWith('- ')) {
      // A list interrupts a paragraph but continues itself across lines.
      flushParagraph()
      list.push(line.slice(2).trim())
      continue
    }

    flushList()
    // Soft-wrapped lines belong to the same paragraph, the way they read in the
    // textarea they were typed into.
    paragraph.push(line)
  }

  flush()
  return blocks
}

/** `**bold**` split into alternating plain/bold runs, odd indexes being bold. */
export function splitBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g)
}

/**
 * Roughly how long the article takes to read, for posts whose `readTime` was
 * never filled in. 220 words a minute is the usual figure for adult reading of
 * non-technical prose, rounded up so nothing ever says "0 min read".
 */
export function readingTime(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 220))} min read`
}
