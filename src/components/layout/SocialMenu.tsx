import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, AtSign, Facebook, Instagram, X, Youtube, type LucideIcon } from 'lucide-react'
import { site } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

/**
 * The WhatsApp mark. Lucide ships no brand glyph for it, and the generic speech
 * bubble reads as "chat" rather than "WhatsApp" - on a green tile people look
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
  youtube: Youtube,
}

/**
 * The same accounts as plain round buttons. The menu button is hidden on a
 * phone - three controls plus the logo do not fit the bar - so the drawer
 * carries the channels instead.
 */
export function SocialRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {site.socials.map((social) => {
        const Glyph = socialIcons[social.icon]
        if (!Glyph) return null
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.label}
            className="grid size-11 place-items-center rounded-full border border-line bg-surface text-heading transition-colors duration-200 hover:border-transparent hover:bg-mustard hover:text-ink"
          >
            <Glyph className="size-[1.1rem]" />
          </a>
        )
      })}
    </div>
  )
}

/**
 * Every way to reach the house that is not a phone number, behind one control in
 * the bar. It replaces the floating dock that used to sit in the bottom-right
 * corner: a button parked over the page competes with the booking bar on room
 * pages and covers content on every other, and the header is where people look
 * for a brand's channels anyway.
 *
 * WhatsApp leads the list and keeps its green - it is the booking channel, and
 * the one place the brand rules hand that colour to.
 */
export function SocialMenu({
  className,
  buttonClassName,
}: {
  className?: string
  buttonClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  // A menu left hanging open is just clutter - Escape and any outside press close it.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const channels = [
    {
      label: 'WhatsApp',
      hint: 'Ask the desk anything',
      href: enquiryUrl(),
      icon: <WhatsAppIcon className="size-[1.15rem]" />,
      tone: 'border-transparent bg-green-deep text-cream',
    },
    ...site.socials.flatMap((social) => {
      const Glyph = socialIcons[social.icon]
      if (!Glyph) return []
      return [
        {
          label: social.label,
          hint: social.handle,
          href: social.href,
          icon: <Glyph className="size-[1.05rem]" />,
          tone: 'border-line-strong bg-surface text-heading group-hover:border-mustard group-hover:bg-mustard group-hover:text-ink',
        },
      ]
    }),
  ]

  return (
    <div ref={wrap} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="social-menu"
        aria-label={open ? 'Close social links' : 'Follow us and say hello'}
        className={cn(
          'grid size-10 place-items-center rounded-full border border-line bg-surface text-heading',
          'transition-colors hover:border-primary hover:text-primary',
          open && 'border-primary text-primary',
          buttonClassName,
        )}
      >
        {open ? <X className="size-[1.15rem]" /> : <AtSign className="size-[1.15rem]" />}
      </button>

      <div
        id="social-menu"
        aria-hidden={!open || undefined}
        className={cn(
          'absolute top-[calc(100%+0.85rem)] right-0 w-[17.5rem] origin-top-right rounded-xl2',
          'border border-line bg-surface p-2 shadow-lift',
          'transition-[opacity,transform] duration-300 ease-[var(--ease-out-soft)]',
          open
            ? 'scale-100 opacity-100'
            : 'pointer-events-none -translate-y-1.5 scale-95 opacity-0',
        )}
      >
        <p className="px-3 pt-2 pb-2.5 text-[0.625rem] font-bold tracking-[0.22em] text-muted uppercase">
          Say hello
        </p>

        <ul>
          {channels.map((channel) => (
            <li key={channel.label}>
              <a
                href={channel.href}
                target="_blank"
                rel="noreferrer"
                tabIndex={open ? undefined : -1}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-surface-2"
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-full border',
                    'transition-[background-color,border-color,color] duration-200',
                    channel.tone,
                  )}
                >
                  {channel.icon}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[0.875rem] font-semibold text-heading">
                    {channel.label}
                  </span>
                  <span className="block truncate text-[0.75rem] text-muted">{channel.hint}</span>
                </span>

                <ArrowUpRight className="size-4 shrink-0 text-line-strong transition-[color,transform] duration-300 group-hover:rotate-45 group-hover:text-primary" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
