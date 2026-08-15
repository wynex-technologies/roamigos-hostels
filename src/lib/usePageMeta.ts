import { useEffect } from 'react'

/** Keeps <title> and the meta description in sync per route. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title
    if (!description) return
    const tag = document.querySelector('meta[name="description"]')
    if (tag) tag.setAttribute('content', description)
  }, [title, description])
}
