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
| `--color-cream` | `#F8F5EE` | Off White | slab ground, light fills |
| `--color-sand` | `#E8DDCB` | Sand | header ground, footer ground, borders, muted surfaces |
| `--color-ink` | `#262626` | Charcoal | **text** - body copy, and type on mustard |

Page canvas stays pure white in light - it is the one surface the sheet does not
govern, and it does not change. Dark theme sits on `#1C1B1A` with charcoal
surfaces. No paper grain: anything that gives a matte cast is out.

### The header
One bar, one ground, on every page. It is **never** transparent - it used to float
over the photographic heroes and it does not any more, so nothing sets an `overlay`
flag and no hero pads for a bar sitting on top of it.

`--header-ground` is the ground the logo artwork itself is drawn on, so the
flamingo sits in the bar with no square edge around it: `#E8DDCB` Sand in light,
`#262626` Charcoal in dark.

### The mark has two cuts, and dark needs its own
The flamingo is a charcoal silhouette with pink, green and cream shapes on top,
so on a dark ground the silhouette - the bird's whole outline, and the front of
the beak with it - disappears into the page. The dark cut answers that: the
silhouette carries a Sand hairline, and the shapes knocked out of it (between the
legs, two notches at the throat) are charcoal instead of cream.

So dark grounds take their own files, never a filtered copy of the light ones:
`logo-mark-dark.svg` for the mark (`Logo.tsx` swaps to it under `dark:`, the way
it already does for `logo-wordmark-light.svg`) and `logo-light.svg` for the
stacked lockup on the 404. Put `logo-mark.svg` or `logo.svg` on a dark ground and
the beak loses its front while the gap between the legs flares up as a cream
triangle.

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

One exception the other way: the **contact page** keeps a single CTA colour, so its
two WhatsApp buttons are mustard (`variant="accent"`), not the green `whatsapp`
variant. Green still carries the channel icon, the "front desk online" dot and the
confirmations on that page. Everywhere else the WhatsApp CTA is green - the rooms
listing still uses the variant.

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

## SEO - two crawlers, two mechanisms

Google renders the page, so anything React writes into `<head>` reaches it. The
social crawlers - WhatsApp, Facebook, Instagram, X - **do not run JavaScript**:
they read the shipped `index.html` and stop. The whole booking funnel here runs
on a pasted WhatsApp link, so the share card has to survive that.

- **Static, in the HTML file.** The share card, the canonical link, the
  `Hostel` / `LodgingBusiness` entity and the `WebSite` entity. Written by
  `src/lib/seoStatic.ts` and injected into the `<!--seo-->` marker by the
  `roamigos-seo` plugin in `vite.config.ts`, which also emits `robots.txt` and
  `sitemap.xml`. **Do not hand-write tags into `index.html`** - a second copy of
  the address or the room list goes stale the first time either changes.
- **Rendered, per route.** Title, description, canonical and the share card are
  refined for the actual route by `usePageMeta()`; page-specific schema goes
  through `<JsonLd>` and is built in `src/lib/structuredData.ts`.

`site.url` in `src/data/site.ts` is the origin everything is built off - the
canonical, every `@id`, the sitemap. One wrong value points the whole site at
another domain.

The site is a client-rendered SPA, so a **deep link shared into WhatsApp shows
the site-wide card**, not the room's - the crawler never runs the app that would
swap it. Fixing that properly means pre-rendering the routes at build.

### What carries a rating, and what deliberately does not
Rooms carry `aggregateRating`; the hostel entity does not. Google does not use
review markup a business writes about itself on a `LocalBusiness`, and marking
it up anyway risks a structured-data penalty. A room is a specific thing being
sold with its reviews printed on the same page, so its rating is legitimate.

An `FAQPage` only earns a rich result when the question and the answer are on
the page **as written**, which is why `faqSchema()` reads the same `contactFaqs`
array `ContactFaq` renders rather than a shortened copy.

## The backend

Supabase holds the content, the guest submissions and the admin accounts. The
panel is `admin/` - a separate Vite app with its own build and deployment, never
bundled into the site. The full runbook is `supabase/README.md`.

### Content has two copies, and the site prefers the fresher one
1. **Baked.** `scripts/sync-content.ts` pulls everything during `prebuild` into
   `src/data/generated/content.json`, which is compiled into the bundle.
2. **Live.** `/content.json` on the server, rewritten by `hostinger/api/publish.php`
   whenever somebody presses Publish, and fetched once when the site boots.

Each data module reads whichever the bootstrap settled on, and falls back to the
literal written beside it:

```ts
export const rooms: Room[] = content.rooms ?? shippedRooms
```

Three things follow, and all three are load-bearing:

- **A page view costs no database traffic.** Both copies are files - one in the
  bundle, one on the same disk as `index.html`. This is the whole egress
  strategy. A site that reads its rooms over PostgREST pays for those rows on
  every page view of every visitor.
- **The data stays synchronous.** `main.tsx` awaits the boot fetch and *then*
  dynamically imports `App`, because every data module resolves its content at
  module scope. That ordering is why `rooms` is still a plain `Room[]` and why
  not one component on the site has a loading state. **Do not make `App` a
  static import in `main.tsx`**, and do not turn any data module into a fetch.
- **The literals in `src/data/*.ts` are the shipped fallback, not dead code.**
  They are what builds with no credentials, no network or an empty table. Keep
  them real and keep them current.

### One mapping, two callers
`shared/content-shape.ts` holds the PostgREST queries and the row-to-site
mapping. `scripts/sync-content.ts` uses it at build time; `admin/src/lib/publish.ts`
uses it on Publish. If those two ever drifted, pressing Publish would reshape
the site into something no build had produced - visible only in production and
only after an edit. There is one copy. Do not add a second.

The queries are used **verbatim**, including `published=is.true` and every
`order`. Rebuilding them through a query builder is how hidden rooms end up live.

### What must never happen
- **No photographs in Supabase Storage.** Image fields hold an Unsplash id or a
  URL on somebody else's CDN. One hero image served from Storage would spend the
  free monthly egress in about 17,000 page views. The panel has no upload button
  for this reason.
- **No `VITE_` prefix on `SUPABASE_SERVICE_ROLE_KEY`.** A `VITE_` variable is
  inlined into the browser bundle. The sync script reads it unprefixed, at build.
- **No public read policy on any table.** `anon` is granted nothing, and the
  privilege is revoked as well. There is no public read path to run up a bill.
- **No service_role key on the web server.** `publish.php` is built so it does
  not need one: the panel is signed in and reads the rows itself. A key that
  bypasses every access rule has no business sitting in a PHP file on shared
  hosting.

### One address, both apps
`npm run dev` starts the site on 5173 and the panel on 5174, and the site
proxies `/admin` through to it - so development uses the same addresses as
production, where Apache serves the site from `public_html/` and the panel from
`public_html/admin/`. A plugin in `vite.config.ts` also answers bare `/admin`
with a 301 to `/admin/`, which is what mod_dir does for a real directory.

They remain two apps and two builds. The panel's code must never end up in the
bundle a visitor downloads, so do not merge them to make this simpler.

### Deployment
Hostinger shared hosting, no CI. `npm run build:hostinger` assembles `deploy/`
as `public_html/` should look - the site at the root, the panel at `/admin`
(which needs both Vite's `base: '/admin/'` and the router's `basename`, and
breaks silently if either is missed). `hostinger/.htaccess` routes both SPAs;
its rule order matters and the file explains why.

### The two runtime endpoints
Everything else is a file; these two are live because they have to be.

- `offer` - the welcome campaign, through the existing `VITE_OFFER_ENDPOINT`
  seam. Cached five minutes, one fetch shared per page by `useOffer()`. This is
  why a campaign can change without a deploy.
- `intake` - a copy of each booking request and enquiry for the desk. Called by
  `src/lib/intake.ts` on a `sendBeacon`, because both callers open WhatsApp in
  the same gesture and a plain fetch is often cancelled when the tab hands off.
  It must never block, throw at the caller, or delay the chat opening. The
  WhatsApp message is still the booking; this is a carbon copy.

## Where things live

- `src/data/site.ts` - brand info, contact, nav, footer, WhatsApp number. **Edit content here, not in components.**
- `src/data/rooms.ts` - all rooms + full detail content
- `src/data/content.ts` - features, activities, amenities, reviews, blog
- `src/data/offer.ts` - the welcome-offer popup (copy, image, coupon, dates) plus
  `fetchOffer()`, which lets the admin panel serve the same shape as JSON from
  `VITE_OFFER_ENDPOINT` and override the shipped defaults without a deploy
- `src/components/brand/Logo.tsx` - the logo lockups, as vector paths
- `src/lib/seoStatic.ts` - the tags built into `index.html`, plus `robots.txt`
  and `sitemap.xml`. Loaded by `vite.config.ts`, so its imports stay relative
  and it must never reach anything that pulls in `lucide-react`
- `src/lib/structuredData.ts` - the per-route schema, rendered by `<JsonLd>`
- `src/data/generated/` - what the last content sync brought down. `content.json`
  is committed empty and regenerated at build; never hand-edit it
- `scripts/sync-content.mjs` - Supabase to the bundle, once per build
- `scripts/seed-supabase.mjs` - the other direction, once, into a fresh project
- `admin/` - the panel. Its own app, its own build, its own README
- `shared/content-shape.ts` - the queries and the row mapping, shared by the
  build and the Publish button. One copy, on purpose
- `hostinger/` - `.htaccess`, `api/publish.php` and the deployment runbook
