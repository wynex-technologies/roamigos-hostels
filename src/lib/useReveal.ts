import { useLayoutEffect, useRef } from 'react'

/**
 * Flips `--in` from 0 to 1 the first time the element scrolls into view, so an
 * entire block of `reveal-*` utilities can play from one inherited value with
 * `--lag` deciding the order.
 *
 * It runs once and then disconnects - the reveal is an arrival, not something the
 * visitor can scrub back and forth. Reduced motion never sees the hidden state:
 * `--in` is simply left at its dealt default of 1.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null)

  // Layout effect, so the hidden state is in place before the first paint.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    el.style.setProperty('--in', '0')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.style.setProperty('--in', '1')
        observer.disconnect()
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
