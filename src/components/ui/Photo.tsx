import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import { photo, photoSet } from '@/lib/images'

const MAX_RETRIES = 2

interface PhotoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /** Unsplash photo id, e.g. `photo-1709805619372-40de3f158e83`. */
  id: string
  width?: number
  widths?: number[]
}

/**
 * `<img>` that retries a failed load.
 *
 * Unsplash serves resized derivatives on the fly and intermittently drops one when a
 * page requests a burst of them — the browser reports `complete` with `naturalWidth: 0`
 * and paints a broken-image icon. A short backoff clears it; two attempts are enough.
 */
export function Photo({ id, width = 1200, widths, ...props }: PhotoProps) {
  const [attempt, setAttempt] = useState(0)
  const timer = useRef<number>(undefined)

  useEffect(() => {
    setAttempt(0)
    return () => window.clearTimeout(timer.current)
  }, [id])

  // On a retry the srcSet is dropped: a busted `src` is only honoured when the browser
  // isn't choosing from a candidate list. One nominal-width image is fine for attempt 2+.
  const retrying = attempt > 0

  return (
    <img
      src={retrying ? `${photo(id, width)}&retry=${attempt}` : photo(id, width)}
      srcSet={widths && !retrying ? photoSet(id, widths) : undefined}
      onError={() => {
        if (attempt >= MAX_RETRIES) return
        timer.current = window.setTimeout(() => setAttempt((n) => n + 1), 400 * (attempt + 1))
      }}
      {...props}
    />
  )
}
