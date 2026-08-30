import { useEffect } from 'react'

/**
 * Injects a page's structured data into the head and takes it away again on the
 * way out, so a route change never leaves the previous page's schema behind for
 * the crawler to read alongside the new one.
 *
 * Search engines render the page before reading this, which is why per-route
 * schema can live in the app at all. The site-wide business entity cannot - it
 * has to survive a crawler that runs no JavaScript, so it is written into
 * `index.html` at build time instead (see `src/lib/seoStatic.ts`).
 */
export function JsonLd({ id, data }: { id: string; data: unknown }) {
  // The schema is serialised on render, not inside the effect: callers build a
  // fresh object every time, and depending on that object would tear the script
  // tag down and rebuild it on every render for no change at all.
  // `</script>` inside a string would close the tag it is sitting in.
  const json = JSON.stringify(data).replace(/</g, '\u003c')

  useEffect(() => {
    const tag = document.createElement('script')
    tag.type = 'application/ld+json'
    tag.dataset.schema = id
    tag.textContent = json
    document.head.appendChild(tag)
    return () => tag.remove()
  }, [id, json])

  return null
}
