import { Link } from 'react-router-dom'
import {
  ArrowUp,
  BadgeCheck,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Wallet,
  Youtube,
} from 'lucide-react'
import { footerLinks, properties, site, trustBar } from '@/data/site'
import { enquiryUrl } from '@/lib/whatsapp'
import { Wordmark } from '@/components/brand/Wordmark'

const socialIcons = { instagram: Instagram, facebook: Facebook, youtube: Youtube }
const trustIcons = [ShieldCheck, Wallet, BadgeCheck, Clock]

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 text-[0.6875rem] font-bold tracking-[0.22em] text-mustard uppercase">
      {children}
    </h3>
  )
}

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-maroon-deep text-cream/75">
      {/* Warm radial glow so the flat maroon block does not read as a solid slab. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-maroon/60 blur-[120px]"
      />

      <div className="relative">
        {/* Trust strip */}
        <div className="border-b border-cream/10">
          <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {trustBar.map((item, i) => {
              const Icon = trustIcons[i]
              return (
                <div key={item.title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-cream/10 text-mustard">
                    <Icon className="size-[1.15rem]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-cream">{item.title}</p>
                    <p className="text-[0.8125rem] text-cream/60">{item.note}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr] lg:gap-10">
          {/* Brand */}
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

            <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed">{site.description}</p>

            <div className="mt-7 flex gap-3">
              {site.socials.map((social) => {
                const Icon = socialIcons[social.icon]
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="grid size-10 place-items-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-mustard hover:bg-mustard hover:text-ink"
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
                className="grid size-10 place-items-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-mustard hover:bg-mustard hover:text-ink"
              >
                <MessageCircle className="size-[1.05rem]" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <ColumnTitle>Explore</ColumnTitle>
            <ul className="space-y-3 text-[0.9375rem]">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition-colors hover:text-mustard">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Properties */}
          <div>
            <ColumnTitle>Properties</ColumnTitle>
            <ul className="space-y-4">
              {properties.map((property) => (
                <li key={property.name} className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-mustard" />
                  <span>
                    <span className="block text-[0.9375rem] font-medium text-cream">
                      {property.name}
                    </span>
                    <span className="text-[0.8125rem] text-cream/55">{property.area}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + contact */}
          <div>
            <ColumnTitle>Support</ColumnTitle>
            <ul className="space-y-3 text-[0.9375rem]">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition-colors hover:text-mustard">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-cream/15 bg-cream/5 p-5">
              <p className="text-[0.6875rem] font-bold tracking-[0.18em] text-mustard uppercase">
                Need help?
              </p>
              <a
                href={`tel:${site.phoneDisplay.replace(/\s/g, '')}`}
                className="mt-3 flex items-center gap-2 font-display text-lg text-cream transition-colors hover:text-mustard"
              >
                <Phone className="size-4 text-mustard" />
                {site.phoneDisplay}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="mt-2 flex items-center gap-2 text-[0.9375rem] transition-colors hover:text-mustard"
              >
                <Mail className="size-4 text-mustard" />
                {site.email}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream/10">
          <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-[0.8125rem] sm:flex-row">
            <p>
              © {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </p>
            <p className="text-cream/55">
              Pay at check-in — UPI, cards & cash accepted at the property.
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 transition-colors hover:border-mustard hover:text-mustard"
            >
              Back to top
              <ArrowUp className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
