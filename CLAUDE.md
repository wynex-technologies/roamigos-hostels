# Roamigos Hostel - Project Rules

## Git rules (STRICT - never violate)

- **NEVER** add `Co-Authored-By: Claude` (or any Claude/Anthropic co-author trailer) to commit messages.
- **NEVER** add "Generated with Claude Code" or any similar attribution line to commits or PR bodies.
- **NEVER** run `git push` unless the user explicitly asks for it in that message.
- **NEVER** commit unless the user explicitly asks in that message.
- Working directly on `main` is fine for this project - no feature branches needed unless asked.
- Commit messages: plain, human, imperative (`add booking widget`, `fix mobile nav overflow`). No emojis, no bot signatures.

## Stack

- Vite + React 19 + TypeScript (strict) + Tailwind CSS v4 + React Router 7
- Icons: `lucide-react`. No other UI library - components are hand-built in `src/components/ui`.
- Path alias: `@/` → `src/`

## Brand - the brand sheet is the authority

Every colour comes off the brand sheet and is used exactly as printed. The
`-deep` values are the pressed/hover step of their parent and `gold` is the deep
end of mustard, so gradients stay tonal - those three are the only derived
values on the site.

| Token | Hex | Sheet name | Use |
| --- | --- | --- | --- |
| `--color-maroon-deep` | `#8E272E` | - | pressed states, deep gradients |
| `--color-maroon` | `#B3313A` | Adventure Red | **primary** - headings, key CTAs, highlights |
| `--color-mustard` | `#D9A328` | Mustard Gold | **secondary** - buttons, icons, important accents |
| `--color-gold` | `#B8871F` | - | deep end of mustard: gradients, button glow |
| `--color-green` | `#355E3B` | Forest Green | **accent** - secondary CTAs, icons, tags |
| `--color-green-deep` | `#274630` | - | pressed green, WhatsApp CTA |
| `--color-terracotta` | `#C96B4A` | Terracotta | **support** - illustrations, badges, small highlights |
| `--color-cream` | `#F8F5EE` | Off White | header ground, slab ground, light fills |
| `--color-sand` | `#E8DDCB` | Sand | footer ground, borders, muted surfaces |
| `--color-ink` | `#262626` | Charcoal | **text** - body copy, and type on mustard |

Page canvas stays pure white in light - it is the one surface the sheet does not
govern, and it does not change. Dark theme sits on `#1C1B1A` with charcoal
surfaces. No paper grain: anything that gives a matte cast is out.

### The two panels
The closing slab and the footer bring their own ground, so they carry their own
ink with it. Both used to be near-black in either theme; they are light now and
they flip with the theme like everything else.

| | light | dark |
| --- | --- | --- |
| slab (`--slab-ground`) | `#F8F5EE` Off White | `#2E2C29` |
| footer (`--footer-ground`) | `#E8DDCB` Sand | `#211F1E` |

Type inside them asks for `cream` and `gray-200`; `.panel-slab` / `.panel-footer`
in `src/index.css` rebind both to the panel's ink, so a child never needs to know
which ground it is sitting on. Anything that must stay light on **any** ground -
the payment chips, for one - uses a literal (`bg-white`), not `cream`.

### Green usage rule
Green is an accent, the way the sheet has it: secondary CTAs, icons and tags,
plus success / confirmation states, the `secure / verified` trust icons and the
WhatsApp CTA.

Still never green for headings, primary CTAs, large backgrounds or section fills -
red leads, mustard supports, green accents.

## Punctuation (STRICT)

- **Never** use an em dash or an en dash - not in site copy, not in code comments,
  not in commit messages. Use a plain hyphen `-` everywhere, spaced as ` - ` when
  it breaks a sentence.

## Typography

Two families, exactly as the brand sheet sets them out. Do not add a third.

| Level | Face | Token |
| --- | --- | --- |
| Headings | **Playfair Display** | `--font-display`, and `h1`-`h4` inherit it |
| Sub-headings | Poppins SemiBold | `--font-sans` + `font-semibold` |
| Body, UI | Poppins Regular | `--font-sans` |

- `font-display` is the hook for headline type. Reach for it when something is a
  headline, not to make a label look fancy.
- Playfair ships **old-style figures**, which drop 4 and 9 below the baseline and
  shrink the zero - a price reads as `₹1,499` with the digits bouncing and a
  coupon code reads as `ROAM1o`. `src/index.css` forces `lining-nums` on `h1`-`h4`
  and `.font-display`; keep that in place, and keep it in mind for any new
  display-face element that carries digits.
- Both faces load from Google Fonts in `index.html` - Playfair as a `400..900`
  variable range so every heading weight is real, not synthesised.

## Design principles

- Premium, warm, editorial - cream canvas, maroon ink, mustard accents.
- Rounded-2xl cards, soft warm shadows (`--shadow-warm`), hairline sand borders.
- Fully responsive: mobile → tablet → desktop. Test at 375 / 768 / 1440.
- Both light and dark themes must be supported by every component (semantic tokens only -
  never hardcode a hex in a component; use the CSS variables in `src/index.css`).
- **Every full-screen overlay renders through `createPortal(..., document.body)`.** The page
  sits inside `<main class="relative z-10">` (`src/components/layout/Layout.tsx`), which opens
  a stacking context - a `z-100` inside it still loses to the `z-50` header outside it, and
  the overlay comes out with the nav painted across its top. `Lightbox`, `Gallery` and
  `GuestDetailsModal` all do this; a new one has to as well.
- A dialog taller than a short viewport must cap its own height (`max-h-[calc(100dvh-2rem)]`)
  and scroll inside, with the close button outside that scroller. A centred flex child clips
  its own top overflow instead of letting the backdrop scroll to it.

## Booking flow

There is **no booking page and no payment step**. "Book Now" builds a pre-filled WhatsApp
message (room, dates, guests, nights, coupon, total, guest details) and opens the hostel
owner's WhatsApp via `buildWhatsAppUrl()` in `src/lib/whatsapp.ts`.

### Nothing opens the chat without a name, phone and email
That message *is* the booking - no account, no record on the site - so the desk has to be
able to reach the guest from the message alone. Every Book Now on the room page (the
widget's and the sticky bar's) opens `GuestDetailsModal` first; only a valid name, phone
and email send the chat. The optional special request lives in that dialog too, so the
guest is asked for their details in exactly one place.

### The coupon has one source
`src/data/offer.ts` holds `CODE` and `DISCOUNT_PERCENT` at the top of the file. Every
`%` in the campaign copy is interpolated from that constant, so changing the two lines
changes the popup, the booking form's hint, the price breakdown and the WhatsApp message
together. The admin panel can override the same fields over HTTP.

Never hardcode a code or a percent in a component. Read the campaign through
`useOffer()` (`src/lib/useOffer.ts`), which shares one fetch across the page, and check a
typed code with `couponValue(offer, input)`. The resolved `{ code, percent }` rides on
`BookingDraft.coupon`, so `bookingTotals()` and `bookingMessage()` both see it.

Later (not now): user profile dashboard with booking status, and admin-panel sync on booking.
The admin panel already exists separately - only the website is in scope.

## Where things live

- `src/data/site.ts` - brand info, contact, nav, footer, WhatsApp number. **Edit content here, not in components.**
- `src/data/rooms.ts` - all rooms + full detail content
- `src/data/content.ts` - features, activities, amenities, reviews, blog
- `src/data/offer.ts` - the welcome-offer popup (copy, image, coupon, dates) plus
  `fetchOffer()`, which lets the admin panel serve the same shape as JSON from
  `VITE_OFFER_ENDPOINT` and override the shipped defaults without a deploy
- `src/components/brand/Logo.tsx` - logo, converted from the source PDF to vector paths
