import { useEffect, useState } from 'react'

/**
 * Tracks a CSS media query from React.
 *
 * Only for layout decisions that cannot be made in CSS - the header's overlay
 * mode, for instance, is a prop rather than a class, so a `hidden md:flex` on
 * the hero it floats over is invisible to it. Anything that can be a Tailwind
 * breakpoint should stay a Tailwind breakpoint.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}
