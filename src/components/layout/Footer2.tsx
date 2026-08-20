import { Link } from 'react-router-dom'
import {
  ArrowUp,
  ArrowUpRight,
  CalendarCheck,
  Facebook,
  Headset,
  Instagram,
  Mail,
  MessageCircle,
  ShieldCheck,
  Tag,
  Youtube,
} from 'lucide-react'
import { footerLinks, properties, site, trustBar } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { Wordmark } from '@/components/brand/Wordmark'
import { paymentMarks } from '@/components/ui/PaymentMarks'

/**
 * Second take on the footer, and a different pattern rather than a restyle of
 * the first. `Footer` is the doormat: four link columns, then the small print.
 * This one inverts that hierarchy the way hotel groups do - the way to reach a
 * human leads, the four houses are set out as an index under it, and the links
 * drop to a single utility line at the bottom. Nav is one row, not columns; the
 * wordmark closes the page at size instead of being repeated small.
 *
 * Same content as `Footer` throughout - only the arrangement differs, so the
 * two can be read against each other.
 */

const socialIcons = { instagram: Instagram, facebook: Facebook, youtube: Youtube }

const trustIcons = [ShieldCheck, Tag, CalendarCheck, Headset]

/** Every link in the utility line reads the same. */
const quietLink = 'text-gray-200/70 transition-colors duration-200 hover:text-mustard'

export function Footer2() {
  const tel = `tel:${site.phoneDisplay.replace(/\s/g, '')}`

  return (
    <footer
      className="border-t border-cream/10 text-gray-200/70"
      style={{ backgroundColor: 'var(--footer-ground)' }}
    >
      {/* ================= the front desk ================= */}
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20 lg:py-24">
        <div>
          <p className="eyebrow">{site.motto}</p>

          <h2 className="mt-6 max-w-xl font-display text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.15] font-bold text-cream text-pretty">
            Questions before you book?
          </h2>

          <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-gray-200/70">
            Rooms, dates, directions - ask us anything. The front desk answers on WhatsApp,
            usually in minutes.
          </p>

          <p className="mt-8 text-[0.875rem] leading-relaxed text-gray-200/55">
            {site.address.line1}, {site.address.line2}
            <br />
            {site.address.line3}
          </p>
        </div>

        {/* The number set as display type - on a hostel page it is the CTA. */}
        <div className="lg:text-right">
          <p className="text-[0.6875rem] font-bold tracking-[0.2em] text-gray-200/40 uppercase">
            Front desk
          </p>
          <a
            href={tel}
            className="mt-3 block font-display text-[clamp(1.15rem,2vw,1.5rem)] font-bold tracking-tight text-cream transition-colors duration-200 hover:text-mustard"
          >
            {site.phoneDisplay}
          </a>
          <a
            href={`mailto:${site.email}`}
            className={`mt-2 inline-flex items-center gap-2 text-[0.9375rem] ${quietLink}`}
          >
            <Mail className="size-4 text-mustard" />
            {site.email}
          </a>

          <div className="mt-8 flex flex-wrap items-center gap-3 lg:justify-end">
            {/* The one place green leads - it reads as WhatsApp, not as brand colour. */}
            <a
              href={enquiryUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2.5 rounded-full bg-green-deep px-6 text-[0.9375rem] font-semibold text-cream transition-colors duration-200 hover:bg-green"
            >
              <MessageCircle className="size-[1.05rem]" />
              Chat on WhatsApp
            </a>

            {site.socials.map((social) => {
              const Icon = socialIcons[social.icon]
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="grid size-11 place-items-center rounded-full border border-cream/15 text-gray-200/75 transition-colors duration-200 hover:border-mustard/60 hover:text-mustard"
                >
                  <Icon className="size-[1.05rem]" />
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* ================= the four houses, set out as an index ================= */}
      <div className="container-page pb-14">
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((property) => (
            <li key={property.name}>
              <Link
                to="/rooms"
                className="group/house flex items-start justify-between gap-4 border-t border-cream/12 pt-5 transition-colors duration-300 hover:border-mustard/50"
              >
                <span>
                  <span className="block font-display text-[1.0625rem] font-semibold text-gray-200 transition-colors duration-200 group-hover/house:text-mustard">
                    {property.name}
                  </span>
                  <span className="mt-1 block text-[0.8125rem] text-gray-200/45">
                    {property.area}
                  </span>
                </span>
                <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-gray-200/30 transition-colors duration-200 group-hover/house:text-mustard" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ================= what the house promises, one row, four cells =================
          Ruled apart rather than spaced apart, so the four sit on a single line
          across the page instead of wrapping into a second row. */}
      <div className="border-t border-cream/10">
        <ul className="container-page grid gap-5 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {trustBar.map((item, i) => {
            const Icon = trustIcons[i]
            return (
              <li
                key={item.title}
                className="flex items-center gap-3 lg:border-l lg:border-cream/10 lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
              >
                <Icon className="size-[1.4rem] shrink-0 text-mustard" />
                <span className="min-w-0">
                  <span className="block truncate text-[0.875rem] font-semibold text-gray-200">
                    {item.title}
                  </span>
                  <span className="block truncate text-[0.75rem] text-gray-200/50">
                    {item.note}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ================= nav as one line, and what the desk takes ================= */}
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[0.9375rem]">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={quietLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <ul className="flex flex-wrap items-center gap-2">
              {paymentMarks.map((method) => (
                <li
                  key={method.label}
                  className="flex h-8 min-w-14 items-center justify-center rounded-md bg-cream px-2.5"
                >
                  {method.mark}
                  <span className="sr-only">{method.label}</span>
                </li>
              ))}
            </ul>
            <p className="text-[0.8125rem] text-gray-200/50">Pay at check-in - nothing upfront.</p>
          </div>
        </div>
      </div>

      {/* ================= the anchor =================
          The wordmark is the last thing on the page and it is allowed to be
          large. It sits in the flow, at a readable weight - not a ghost behind
          the columns - and the small print rules off underneath it. */}
      <div className="border-t border-cream/10">
        <div className="container-page pt-12 pb-2">
          <Wordmark className="mx-auto h-auto w-full max-w-[17rem] text-cream/[0.14] sm:max-w-md lg:max-w-2xl" />
        </div>

        <div className="container-page flex flex-col items-center justify-between gap-4 border-t border-cream/10 py-5 text-[0.8125rem] sm:flex-row">
          <p className="text-gray-200/50">
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.support.map((link) => (
              <Link key={link.label} to={link.to} className={quietLink}>
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`inline-flex items-center gap-2 ${quietLink}`}
            >
              <ArrowUp className="size-4" />
              Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
