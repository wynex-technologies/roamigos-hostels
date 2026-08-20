import { useEffect, useRef, useState } from 'react'
import { Facebook, Instagram, MessageCircle, X, type LucideIcon } from 'lucide-react'
import { site } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

/**
 * The WhatsApp mark. Lucide ships no brand glyph for it, and the generic speech
 * bubble reads as "chat" rather than "WhatsApp" - on a green button people look
 * for the real logo, so it is drawn here as a single filled path.
 */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488" />
    </svg>
  )
}

/** Keyed by the `icon` string in `data/site.ts`. */
const socialIcons: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
}

/**
 * Which socials the dock surfaces, in order. The footer still lists every
 * channel - this is the short list worth interrupting someone mid-page for, so
 * a social added to `data/site.ts` stays out of here until it is named.
 */
const DOCK_SOCIALS = ['instagram', 'facebook']

/** Each channel trails the one below it, so the column unfurls rather than pops. */
const STAGGER_MS = 45

/**
 * The floating contact dock. Collapsed it is the WhatsApp shortcut it has always
 * been; tapped, it unfurls the rest of the channels above it. WhatsApp stays
 * green - this is the one CTA the brand rules hand that colour to - and the
 * social buttons take the footer's cream-to-mustard treatment.
 */
export function ContactDock({ lifted }: { lifted: boolean }) {
  const [open, setOpen] = useState(false)
  const dock = useRef<HTMLDivElement>(null)

  // A dock left hanging open is just clutter - Escape and any outside press close it.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!dock.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const socialClass =
    'border border-line-strong bg-surface text-heading hover:border-transparent hover:bg-mustard hover:text-ink'

  const channels = [
    {
      label: 'WhatsApp',
      href: enquiryUrl(),
      icon: <WhatsAppIcon className="size-5.5" />,
      className: 'bg-green-deep text-cream hover:bg-green',
    },
    ...DOCK_SOCIALS.flatMap((key) => {
      const social = site.socials.find((s) => s.icon === key)
      const Glyph = socialIcons[key]
      if (!social || !Glyph) return []
      return [
        {
          label: social.label,
          href: social.href,
          icon: <Glyph className="size-5" />,
          className: socialClass,
        },
      ]
    }),
  ]

  return (
    <div
      ref={dock}
      className={cn(
        'fixed right-5 z-40 flex flex-col items-center gap-3 sm:right-7',
        // Room detail pages carry a sticky booking bar on mobile - clear it.
        lifted ? 'bottom-24 sm:bottom-28' : 'bottom-6 sm:bottom-7',
      )}
    >
      <ul
        id="contact-dock-channels"
        className="flex flex-col items-center gap-3"
        // Hidden from the tree while collapsed, so the links are not tabbable.
        aria-hidden={!open || undefined}
      >
        {channels.map((channel, i) => (
          <li key={channel.label}>
            <a
              href={channel.href}
              target="_blank"
              rel="noreferrer"
              aria-label={channel.label}
              tabIndex={open ? undefined : -1}
              onClick={() => setOpen(false)}
              style={{
                // Nearest the button opens first; closing runs the order back down.
                transitionDelay: `${(open ? channels.length - 1 - i : i) * STAGGER_MS}ms`,
              }}
              className={cn(
                'grid size-12 place-items-center rounded-full shadow-lift',
                'transition-[opacity,transform,background-color,border-color,color] duration-300 ease-[var(--ease-out-soft)]',
                open
                  ? 'scale-100 opacity-100'
                  : 'pointer-events-none translate-y-3 scale-75 opacity-0',
                channel.className,
              )}
            >
              {channel.icon}
            </a>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="contact-dock-channels"
        aria-label={open ? 'Close contact options' : 'Open contact options'}
        className={cn(
          'grid size-13 place-items-center rounded-full text-cream shadow-lift',
          'transition-[transform,background-color] duration-300 ease-[var(--ease-out-soft)] hover:scale-105',
          open ? 'rotate-90 bg-primary hover:bg-primary-hover' : 'bg-green-deep hover:bg-green',
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  )
}
