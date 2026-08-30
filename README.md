# Roamigos Hostel

Marketing site for Roamigos - Vite + React 19 + TypeScript + Tailwind CSS v4.

```sh
npm install
cd admin && npm install && cd ..

npm run dev        # the site AND the panel, on one address
npm run build      # typecheck + production build into dist/
npm run typecheck
```

| | |
| --- | --- |
| `http://localhost:5173` | the site |
| `http://localhost:5173/admin` | the panel |

They are still two separate apps and two separate builds - the panel's code
never reaches a visitor's bundle. `npm run dev` runs both and proxies `/admin`
through, so the addresses match production, where Apache serves the site from
`public_html/` and the panel from `public_html/admin/` on one domain. A path
that works locally works live.

Run one on its own with `npm run dev:site` or `npm run dev:admin` if you need to.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home - hero with availability search, value props, room preview, amenities, experiences, travel reads, contact band |
| `/rooms` | Rooms & Beds - category chips, sort, price/amenity/capacity filters (sidebar on desktop, bottom sheet on mobile) |
| `/rooms/:slug` | Room detail - gallery with lightbox, description, amenities, reviews, and the booking widget |

Dates picked in the homepage hero are carried through `/rooms?checkIn=…&checkOut=…&guests=…`
into the room detail booking widget, so the guest never types them twice.

## Booking

There is no booking page, no modal and no payment step. The booking widget on the room
detail page builds a pre-filled WhatsApp message - room, rate, dates, nights, guest count,
estimated total, plus optional name / phone / request - and opens
`https://wa.me/<number>?text=…`. That message *is* the booking request.

**Before launch:** set the real number in `src/data/site.ts` → `site.whatsappNumber`
(international format, digits only). It currently holds a placeholder.

Not built yet, by design: the guest dashboard showing booking status, and the sync that
pushes a booking into the existing admin panel.

## Brand

Colours come off the brand sheet and the logo off the finished artwork in
`public/` - neither is eyeballed, and the lockup is never rebuilt from web type.
`CLAUDE.md` has the palette and the rules on how each colour may be used (in
particular: green is deliberately rare).

Typography is Playfair Display (the logo's own font) for headings and Inter for UI.
Light and dark themes are both supported; every component reads semantic tokens from
`src/index.css` rather than hardcoding a hex.

## SEO

The share card, the canonical link and the `Hostel` schema are generated from
`src/data/` and written into `index.html` at build time, because WhatsApp,
Facebook and X read that file and never run the app. `robots.txt` and
`sitemap.xml` are emitted the same way, so a new room is in the sitemap the
moment it is in `src/data/rooms.ts`. Per-route titles, descriptions and schema
(rooms, the journal, the contact FAQ, breadcrumbs) are rendered by the app,
which is enough for Google.

**Before launch:** set the live domain in `src/data/site.ts` -> `site.url`. It
currently holds `https://roamigos.in`, and every canonical, schema `@id` and
sitemap entry is built off it.

Because the site is client-rendered, a deep link pasted into WhatsApp shows the
site-wide card rather than that room's. Pre-rendering the routes at build is
what fixes it.

## Backend and admin panel

Supabase holds the content and the guest submissions; `admin/` is the panel that
edits them, served at `/admin` on the site's own domain.

Setting the database up is in [`supabase/README.md`](supabase/README.md).
Getting both apps onto the server is in [`hostinger/README.md`](hostinger/README.md).

```sh
npm run build:hostinger     # builds both, assembles deploy/ as public_html/
npm run preview:hostinger    # serves it with the same routing, on :4173
```

There is no deploy pipeline. The panel's Publish button writes `content.json`
straight onto the server through a small PHP endpoint, and the site fetches that
file when it boots - so a content edit is live on the next page load with
nothing rebuilt and nothing re-uploaded. You only rebuild when the code changes.

**No visitor ever queries Supabase.** The content is a static file on the same
disk as the rest of the site, so the egress bill does not grow with traffic. And
there is no service_role key anywhere on the web server: the panel is signed in
and reads the rows itself, the PHP only checks the sender is an admin.

Everything works with no backend at all. With no credentials, no network or an
empty database, the site renders the content written in `src/data/` and is
identical - which is also what happens on a fresh clone and on every local
`npm run dev`.

```sh
npm run sync:content    # pull content down into the bundled fallback
npm run seed:supabase   # push src/data/ into a fresh project, once
```

## Content

Copy, rooms, pricing and imagery live in `src/data/`. Edit there - components don't hold
strings. Once Supabase is connected the panel owns rooms, the journal, the FAQs and the
site settings, and what is written in `src/data/` becomes the fallback the site ships
with - so keep it real rather than letting it rot.

Photography is served from the Unsplash CDN via `src/lib/images.ts`, which requests the
exact width each slot renders at. Nothing is ever uploaded to Supabase Storage: serving
images from there is the fastest way to spend the project's egress quota, and image
fields take an id or a URL for that reason.
