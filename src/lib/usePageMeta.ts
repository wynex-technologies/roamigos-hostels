import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { absoluteUrl, setCanonical, setMeta, shareImage } from './seo'
import { site } from '@/data/site'

interface PageMetaOptions {
  /** Unsplash id or URL for the share card. Defaults to `site.ogImage`. */
  image?: string
  /** `website` for the site's own pages, `article` for a journal post. */
  type?: 'website' | 'article'
}

/**
 * Keeps the title, the description, the canonical link and the share card in
 * sync per route.
 *
 * The canonical is built from `pathname` alone: `/rooms?checkIn=...` is the
 * same page as `/rooms` with the dates carried in, and indexing one URL per
 * date range would split the page's ranking across thousands of duplicates.
 */
export function usePageMeta(title: string, description?: string, options: PageMetaOptions = {}) {
  const { pathname } = useLocation()
  const { image, type = 'website' } = options

  useEffect(() => {
    const url = absoluteUrl(pathname)
    const card = shareImage(image)

    document.title = title
    setCanonical(url)

    setMeta('property', 'og:title', title)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:image', card)
    setMeta('property', 'og:site_name', site.legalName)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:image', card)

    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
      setMeta('name', 'twitter:description', description)
    }
  }, [title, description, pathname, image, type])
}
