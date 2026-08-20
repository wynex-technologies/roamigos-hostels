import { Link } from 'react-router-dom'
import {
  ArrowUp,
  ArrowUpRight,
  BadgeCheck,
  BedDouble,
  CalendarCheck,
  FileText,
  Facebook,
  Headset,
  Home,
  Images,
  Instagram,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Newspaper,
  PhoneCall,
  ShieldCheck,
  Tag,
  Youtube,
  type LucideIcon,
} from 'lucide-react'
import { builtBy, footerLinks, properties, site, trustBar } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { Wordmark } from '@/components/brand/Wordmark'

const socialIcons = { instagram: Instagram, facebook: Facebook, youtube: Youtube }

/** Larger, outlined, gold - the trust row is read at a glance, not studied. */
const trustIcons = [ShieldCheck, Tag, CalendarCheck, Headset]

/**
 * A mark against every link. Keyed by label so the columns stay driven by
 * `data/site.ts` - a link added there gets the fallback dot, not a crash.
 */
const linkIcons: Record<string, LucideIcon> = {
  Home: Home,
  'Rooms & Beds': BedDouble,
  Gallery: Images,
  Blog: Newspaper,
  'Contact Us': PhoneCall,
  'Cancellation Policy': BadgeCheck,
  'Terms & Conditions': FileText,
  'Privacy Policy': Lock,
}

/** Resting angles for the stamp row - no two the same, none of them square. */
const stampTilts = ['-1.3deg', '0.9deg', '-0.6deg', '1.2deg']

/** Register marks: they start pushed out past the corners and pull in on hover. */
const stampCorners = [
  'top-2.5 left-2.5 -translate-x-1 -translate-y-1 border-t border-l',
  'top-2.5 right-2.5 translate-x-1 -translate-y-1 border-t border-r',
  'bottom-2.5 left-2.5 -translate-x-1 translate-y-1 border-b border-l',
  'bottom-2.5 right-2.5 translate-x-1 translate-y-1 border-b border-r',
]

/** What the desk takes at check-in. Set as type, so there are no logos to licence. */
const payments = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Cash']

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-6 flex items-center gap-3 text-[0.6875rem] font-bold tracking-[0.24em] text-mustard uppercase">
      {children}
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-mustard/30 to-transparent" />
    </h3>
  )
}

/**
 * The build credit on the stub, set as type rather than a badge - a studio line
 * should read like a signature, not an ad. At rest it is one quiet sentence; on
 * hover the plate warms, the name takes the mustard with a rule drawn under it,
 * and the arrow steps out. A click presses the whole line down.
 */
function StudioCredit() {
  return (
    <a
      href={builtBy.href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${builtBy.prefix} ${builtBy.name} (opens in a new tab)`}
      className="group/studio inline-flex items-center gap-2 rounded-full border border-cream/12 bg-cream/[0.03] px-4 py-2 transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-mustard/45 hover:bg-mustard/[0.07] focus-visible:ring-2 focus-visible:ring-mustard/70 focus-visible:outline-none active:translate-y-0 active:scale-[0.98]"
    >
      <span className="text-[0.625rem] font-medium tracking-[0.08em] whitespace-nowrap text-gray-200/45 uppercase transition-colors duration-300 group-hover/studio:text-gray-200/70 sm:text-[0.6875rem] sm:tracking-[0.12em]">
        {builtBy.prefix}
      </span>

      <span className="relative font-semibold whitespace-nowrap text-gray-200/90 transition-colors duration-300 group-hover/studio:text-mustard sm:tracking-wide">
        {builtBy.name}
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-mustard to-mustard/20 transition-transform duration-400 ease-[var(--ease-out-soft)] group-hover/studio:scale-x-100"
        />
      </span>

      <ArrowUpRight
        aria-hidden
        className="size-3.5 shrink-0 text-gray-200/35 transition-all duration-300 ease-[var(--ease-out-soft)] group-hover/studio:translate-x-0.5 group-hover/studio:-translate-y-0.5 group-hover/studio:text-mustard"
      />
    </a>
  )
}

/** Every footer link reads the same: gold mark, near-white label, nudge on hover. */
function FooterLink({ to, label }: { to: string; label: string }) {
  const Icon = linkIcons[label]
  return (
    <Link
      to={to}
      className="group/link flex items-center gap-3 text-gray-200/90 transition-colors duration-300 hover:text-mustard"
    >
      {Icon ? (
        <Icon className="size-[1.05rem] shrink-0 text-mustard transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover/link:-translate-y-0.5" />
      ) : (
        <span aria-hidden className="size-1.5 shrink-0 rotate-45 bg-mustard" />
      )}
      <span className="transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover/link:translate-x-0.5">
        {label}
      </span>
    </Link>
  )
}

export function Footer() {
  return (
    <footer
      className="relative isolate mt-24 overflow-hidden text-gray-200/75"
      style={{ backgroundColor: 'var(--footer-ground)' }}
    >
      {/* ---- warmth, kept low. Small type needs a quiet ground to sit on, so the
              maroon only washes the seam and the gold only pools in the corner. ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(58% 44% at 30% -22%, color-mix(in oklab, var(--footer-lit) 62%, transparent), transparent 72%),' +
            'radial-gradient(40% 44% at 104% 102%, color-mix(in oklab, var(--footer-lamp) 34%, transparent), transparent 72%)',
        }}
      />

      {/* ---- the wordmark, blown up and left as a watermark under everything ---- */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-1/2 hidden w-full -translate-x-1/2 justify-center select-none md:flex"
      >
        <span
          className="font-display text-[15vw] leading-none font-bold tracking-[-0.03em] text-gray-200/[0.035]"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, #000 75%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 75%)',
          }}
        >
          Roamigos
        </span>
      </span>

      {/* ---- the seam: one gold hairline where the slab above hands over ---- */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mustard/55 to-transparent"
      />

      <div className="relative">
        {/* ===================== the columns ===================== */}
        <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.5fr_1fr_1.15fr_1.05fr] lg:gap-12 lg:py-20">
          {/* ---------- brand ---------- */}
          <div>
            <div className="flex items-center gap-3">
              <img src="/logo-mark.svg" alt="" width={56} height={56} className="size-14" />
              <span className="flex flex-col">
                <Wordmark className="h-8 w-24 text-cream" />
                <span className="text-[0.5625rem] font-semibold tracking-[0.28em] text-mustard uppercase">
                  {site.tagline}
                </span>
              </span>
            </div>

            <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-gray-200">
              {site.description}
            </p>

            <div className="mt-8 flex gap-3">
              {site.socials.map((social) => {
                const Icon = socialIcons[social.icon]
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="grid size-11 place-items-center rounded-full border border-cream/20 bg-cream/[0.04] text-gray-200/85 transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-mustard hover:bg-mustard hover:text-ink hover:shadow-[0_12px_24px_-10px] hover:shadow-gold/80"
                  >
                    <Icon className="size-[1.1rem]" />
                  </a>
                )
              })}
              <a
                href={enquiryUrl()}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="grid size-11 place-items-center rounded-full border border-cream/20 bg-cream/[0.04] text-gray-200/85 transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-mustard hover:bg-mustard hover:text-ink hover:shadow-[0_12px_24px_-10px] hover:shadow-gold/80"
              >
                <MessageCircle className="size-[1.1rem]" />
              </a>
            </div>
          </div>

          {/* ---------- explore ---------- */}
          <nav aria-label="Explore">
            <ColumnTitle>Explore</ColumnTitle>
            <ul className="space-y-3.5 text-[0.9375rem]">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <FooterLink to={link.to} label={link.label} />
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------- properties ---------- */}
          <div>
            <ColumnTitle>Properties</ColumnTitle>
            <ul className="space-y-4">
              {properties.map((property) => (
                <li
                  key={property.name}
                  className="group/pin flex gap-3 transition-transform duration-500 ease-[var(--ease-out-soft)] hover:translate-x-1"
                >
                  <MapPin className="mt-0.5 size-[1.05rem] shrink-0 text-mustard transition-transform duration-500 group-hover/pin:-translate-y-0.5" />
                  <span>
                    <span className="block text-[0.9375rem] font-semibold text-gray-200">
                      {property.name}
                    </span>
                    <span className="text-[0.8125rem] text-gray-200/55">{property.area}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- support ---------- */}
          <div>
            <ColumnTitle>Support</ColumnTitle>
            <ul className="space-y-3.5 text-[0.9375rem]">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <FooterLink to={link.to} label={link.label} />
                </li>
              ))}
            </ul>

            {/* The one card down here: a phone number should never be hunted for. */}
            <div className="group/help relative mt-8 overflow-hidden rounded-2xl border border-cream/15 bg-cream/[0.05] p-5 transition-colors duration-500 hover:border-mustard/50">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-mustard/14 to-transparent transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover/help:scale-x-100"
              />
              <div className="relative flex items-center gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-mustard/40 bg-mustard/15 text-mustard transition-colors duration-500 group-hover/help:bg-mustard group-hover/help:text-ink">
                  <Headset className="size-[1.15rem]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.6875rem] font-bold tracking-[0.18em] text-gray-200/55 uppercase">
                    Need help?
                  </span>
                  <a
                    href={`tel:${site.phoneDisplay.replace(/\s/g, '')}`}
                    className="font-display text-lg font-semibold text-mustard transition-colors hover:text-cream"
                  >
                    {site.phoneDisplay}
                  </a>
                </span>
              </div>
              <a
                href={`mailto:${site.email}`}
                className="relative mt-4 flex items-center gap-2.5 border-t border-cream/10 pt-4 text-[0.875rem] text-gray-200/80 transition-colors hover:text-mustard"
              >
                <Mail className="size-4 shrink-0 text-mustard" />
                <span className="truncate">{site.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* ===================== the stamp row =====================
            Not a row of feature cells with dividers between them - four
            impressions in a passport. Each sits at its own angle, so the row
            reads as hand-stamped rather than laid out, and hovering one presses
            it: the register marks pull into the corners, the dashed ring inks
            solid, and mustard floods up from the base as the stamp squares
            itself to the page. */}
        <div className="border-t border-cream/10">
          <div className="container-page py-12">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {trustBar.map((item, i) => {
                const Icon = trustIcons[i]
                return (
                  // The grid stretches the <li> to the tallest card in the row, so
                  // the stamp inside has to fill it - otherwise the one whose
                  // title wraps ends up taller than the three beside it.
                  <li key={item.title} className="h-full">
                    <div
                      style={{ '--tilt': stampTilts[i] } as React.CSSProperties}
                      className="group/stamp relative flex h-full flex-col justify-center overflow-hidden rounded-2xl px-5 py-5 [transform:rotate(var(--tilt))] transition-transform duration-700 ease-[var(--ease-out-soft)] hover:[transform:rotate(0deg)_translateY(-3px)]"
                    >
                      {/* the ring, dashed until it is pressed */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-2xl border border-dashed border-cream/20 transition-colors duration-500 group-hover/stamp:border-solid group-hover/stamp:border-mustard/70"
                      />
                      {/* ink, flooding up from the base */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 rounded-2xl bg-gradient-to-t from-mustard/20 via-mustard/[0.06] to-transparent transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover/stamp:scale-y-100"
                      />
                      {/* register marks, pulling into the corners on the press */}
                      {stampCorners.map((corner) => (
                        <span
                          key={corner}
                          aria-hidden
                          className={`pointer-events-none absolute size-2.5 border-mustard opacity-0 transition-all duration-500 ease-[var(--ease-out-soft)] group-hover/stamp:translate-x-0 group-hover/stamp:translate-y-0 group-hover/stamp:opacity-100 ${corner}`}
                        />
                      ))}

                      <div className="relative flex items-start gap-3.5">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-dashed border-mustard/45 text-mustard transition-all duration-500 ease-[var(--ease-out-soft)] group-hover/stamp:-rotate-6 group-hover/stamp:border-solid group-hover/stamp:bg-mustard group-hover/stamp:text-ink">
                          <Icon className="size-[1.2rem]" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[0.8125rem] font-bold tracking-[0.1em] text-gray-200 uppercase">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[0.8125rem] leading-snug text-gray-200/60 transition-colors duration-500 group-hover/stamp:text-gray-200/85">
                            {item.note}
                          </p>
                        </div>
                        <span
                          aria-hidden
                          className="ml-auto font-display text-[0.6875rem] font-bold tracking-[0.14em] text-gray-200/25 transition-colors duration-500 group-hover/stamp:text-mustard"
                        >
                          No.0{i + 1}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* ===================== the luggage tag =====================
            The payment line hangs off the footer the way a tag hangs off a bag:
            an eyelet at one end, notches punched into both, and chips that come
            off the strip one at a time. */}
        <div className="container-page pb-10">
          <div
            className="relative flex flex-wrap items-center gap-x-5 gap-y-4 rounded-[1.25rem] border border-cream/15 bg-cream/[0.045] px-6 py-4"
            style={{
              maskImage:
                'radial-gradient(circle 0.6rem at 0% 50%, transparent 97%, #000 100%),' +
                'radial-gradient(circle 0.6rem at 100% 50%, transparent 97%, #000 100%)',
              WebkitMaskImage:
                'radial-gradient(circle 0.6rem at 0% 50%, transparent 97%, #000 100%),' +
                'radial-gradient(circle 0.6rem at 100% 50%, transparent 97%, #000 100%)',
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
            }}
          >
            {/* the eyelet the string would go through */}
            <span
              aria-hidden
              className="hidden size-3 shrink-0 rounded-full border-2 border-mustard/50 sm:block"
            />
            <p className="text-[0.6875rem] font-bold tracking-[0.24em] text-gray-200/50 uppercase">
              We accept
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {payments.map((method) => (
                <li
                  key={method}
                  className="cursor-default rounded-lg border border-cream/15 bg-cream/[0.05] px-3.5 py-1.5 text-[0.8125rem] font-semibold text-gray-200/85 transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-mustard/60 hover:bg-mustard/10 hover:text-mustard hover:shadow-[0_10px_20px_-12px] hover:shadow-gold/90"
                >
                  {method}
                </li>
              ))}
            </ul>
            <p className="text-[0.8125rem] text-gray-200/55 sm:ml-auto">
              Pay at check-in - nothing upfront.
            </p>
          </div>
        </div>

        {/* ===================== the stub =====================
            Torn off along a perforation, the way the ticket at the top of the
            page is. Everything under this line is the receipt. */}
        <div
          aria-hidden
          className="container-page h-px"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgb(251 241 230 / 0.28) 0 7px, transparent 7px 14px)',
          }}
        />
        <div className="bg-black/40">
          <div className="container-page flex flex-col items-center justify-between gap-5 py-6 text-center text-[0.8125rem] lg:flex-row lg:gap-4 lg:text-left">
            <p className="text-gray-200/60">
              © {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </p>

            <StudioCredit />
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group/top inline-flex items-center gap-2.5 rounded-full border border-cream/20 bg-cream/[0.05] px-5 py-2 font-semibold text-gray-200/85 transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-mustard/70 hover:bg-mustard/10 hover:text-mustard"
            >
              Back to top
              {/* The arrow leaves through the top and the next one is already on
                  its way up behind it - the button performing its own gesture. */}
              <span aria-hidden className="relative block size-4 overflow-hidden">
                <ArrowUp className="absolute inset-0 size-4 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover/top:-translate-y-4" />
                <ArrowUp className="absolute inset-0 size-4 translate-y-4 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover/top:translate-y-0" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
