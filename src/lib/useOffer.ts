import { useEffect, useState } from 'react'
import { loadOffer, offerIsLive, type Offer } from '@/data/offer'

/**
 * The live campaign, or `null` while it loads and whenever none is running.
 *
 * Both the welcome popup and the booking form's coupon field read the campaign
 * through here, so there is exactly one place a code or a percent comes from -
 * `src/data/offer.ts`, or whatever the admin panel serves over it.
 */
export function useOffer(): Offer | null {
  const [current, setCurrent] = useState<Offer | null>(null)

  useEffect(() => {
    let alive = true
    loadOffer().then((next) => {
      if (alive && offerIsLive(next)) setCurrent(next)
    })
    return () => {
      alive = false
    }
  }, [])

  return current
}
