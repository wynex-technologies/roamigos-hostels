import { useEffect } from 'react'
import { recordChat } from './intake'

/**
 * Records every WhatsApp chat the site opens, from one place.
 *
 * There are a dozen WhatsApp buttons on this site - the hero, the header, the
 * footer, the closing band on every page, the offer popup, "help me pick the
 * right room", the one under each journal article. Wiring each of them to
 * report itself would work until somebody adds the thirteenth and forgets, and
 * the failure is silent: a lead that simply never appears on the board.
 *
 * So it is done once, here, by listening for clicks on the document and asking
 * whether what was clicked sits inside a link to `wa.me`. A button added
 * tomorrow is covered by having been built the same way as the rest.
 *
 * Two paths deliberately do not come through here, because both already record
 * something better: the booking dialog and the contact form open WhatsApp with
 * `window.open`, not a link, and each writes a full row of its own.
 *
 * The capture phase is used so this runs before anything that might stop the
 * event, and the send is a beacon - it cannot delay or block the navigation
 * that follows it by even a frame.
 */
export function useChatIntake() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      // Only a plain left click opens the link. A middle click or a modified
      // one may or may not, and guessing wrong means a phantom row.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a')
      const href = link?.getAttribute('href') ?? ''
      if (!href.includes('wa.me/')) return

      // The prefilled message is the best description of what they want, and
      // it is right there in the URL every one of these links is built from.
      let topic = ''
      try {
        topic = new URL(href, window.location.origin).searchParams.get('text') ?? ''
      } catch {
        // A malformed href is not worth a row, and definitely not worth a throw
        // inside a click handler on the way to another app.
        return
      }

      recordChat(topic || 'Opened WhatsApp', window.location.pathname)
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])
}
