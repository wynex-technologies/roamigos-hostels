import { Link } from 'react-router-dom'
import {
  ArrowUp,
  CalendarCheck,
  Facebook,
  Headset,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Tag,
  Youtube,
} from 'lucide-react'
import { footerLinks, site, trustBar } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { LogoRow } from '@/components/brand/Logo'
import { paymentMarks } from '@/components/ui/PaymentMarks'

const socialIcons = { instagram: Instagram, facebook: Facebook, youtube: Youtube }

/** One mark per trust line, in the order `trustBar` lists them. */
const trustIcons = [ShieldCheck, Tag, CalendarCheck, Headset]

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-6 text-[0.6875rem] font-bold tracking-[0.22em] text-mustard uppercase">
      {children}
    </h3>
  )
}

/** Plain text link - the label carries it, colour is the only hover state. */
function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="text-gray-200/80 transition-colors duration-200 hover:text-mustard">
      {label}
    </Link>
  )
}

/** Shared shape for the round social buttons. */
const socialButton =
  'grid size-10 place-items-center rounded-full border border-cream/15 text-gray-200/80 ' +
  'transition-colors duration-200 hover:border-mustard/60 hover:text-mustard'

export function Footer() {
  return (
    <footer className="panel-footer mt-24 border-t border-cream/10 text-gray-200/70">
      {/* ---------------------- the columns ---------------------- */}
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.6fr_1fr_1.1fr_1.15fr] lg:gap-10 lg:py-20">
        {/* brand */}
        <div>
          <LogoRow />

          <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-gray-200/85">
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
                  className={socialButton}
                >
                  <Icon className="size-[1.05rem]" />
                </a>
              )
            })}
            <a
              href={enquiryUrl()}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className={socialButton}
            >
              <MessageCircle className="size-[1.05rem]" />
            </a>
          </div>
        </div>

        {/* explore */}
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

        {/* support */}
        <div>
          <ColumnTitle>Support</ColumnTitle>
          <ul className="space-y-3.5 text-[0.9375rem]">
            {footerLinks.support.map((link) => (
              <li key={link.label}>
                <FooterLink to={link.to} label={link.label} />
              </li>
            ))}
          </ul>
        </div>

        {/* contact - the two numbers people actually come down here for */}
        <div>
          <ColumnTitle>Contact</ColumnTitle>
          <ul className="space-y-3.5 text-[0.9375rem]">
            <li>
              <a
                href={`tel:${site.phoneDisplay.replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-gray-200/85 transition-colors duration-200 hover:text-mustard"
              >
                <PhoneCall className="size-4 shrink-0 text-mustard" />
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-3 text-gray-200/85 transition-colors duration-200 hover:text-mustard"
              >
                <Mail className="size-4 shrink-0 text-mustard" />
                <span className="truncate">{site.email}</span>
              </a>
            </li>
            <li>
              <a
                href={site.address.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="flex gap-3 text-gray-200/85 transition-colors duration-200 hover:text-mustard"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-mustard" />
                <span>
                  {site.address.line1}, {site.address.line2}
                  <br />
                  {site.address.line3}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ---------------------- what the house promises ---------------------- */}
      <div className="border-t border-cream/10">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {trustBar.map((item, i) => {
            const Icon = trustIcons[i]
            return (
              <div key={item.title} className="flex items-start gap-3.5">
                <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-cream/12 text-mustard">
                  <Icon className="size-[1.4rem]" />
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-semibold text-gray-200">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] leading-snug text-gray-200/55">
                    {item.note}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ---------------------- what the desk takes ---------------------- */}
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-gray-200/50 uppercase">
              We accept
            </p>
            <ul className="flex flex-wrap items-center gap-2">
              {paymentMarks.map((method) => (
                <li
                  key={method.label}
                  className="flex h-8 min-w-14 items-center justify-center rounded-md bg-white px-2.5"
                >
                  {method.mark}
                  <span className="sr-only">{method.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[0.8125rem] text-gray-200/55">Pay at check-in - nothing upfront.</p>
        </div>
      </div>

      {/* ---------------------- the anchor ----------------------
          The full lockup closes the page at size, sitting in the flow rather
          than ghosting behind the columns, and the small print rules off under
          it. Mark and wordmark are both sized by height, never by width, so the
          flamingo always stands exactly as tall as the lettering beside it - and
          the heights are a shade under what the wordmark used to take on its
          own, so the band does not grow to hold the pair. */}
      <div className="border-t border-cream/10">
        {/* Even padding top and bottom - the lockup sits in the middle of its
            own band. The pair is the same total (`pt-12 pb-2` before), so the
            band keeps the height it always had. */}
        <div className="container-page flex items-center justify-center py-7">
          <LogoRow size="large" />
        </div>

        <div className="container-page flex flex-col items-center justify-between gap-4 border-t border-cream/10 py-6 text-[0.8125rem] sm:flex-row">
          <p className="text-gray-200/55">
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 text-gray-200/70 transition-colors duration-200 hover:text-mustard"
          >
            <ArrowUp className="size-4" />
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
