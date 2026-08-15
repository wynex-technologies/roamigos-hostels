# Roamigos Hostel

Marketing site for Roamigos — Vite + React 19 + TypeScript + Tailwind CSS v4.

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run typecheck
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home — hero with availability search, value props, room preview, amenities, experiences, travel reads, contact band |
| `/rooms` | Rooms & Beds — category chips, sort, price/amenity/capacity filters (sidebar on desktop, bottom sheet on mobile) |
| `/rooms/:slug` | Room detail — gallery with lightbox, description, amenities, reviews, and the booking widget |

Dates picked in the homepage hero are carried through `/rooms?checkIn=…&checkOut=…&guests=…`
into the room detail booking widget, so the guest never types them twice.

## Booking

There is no booking page, no modal and no payment step. The booking widget on the room
detail page builds a pre-filled WhatsApp message — room, rate, dates, nights, guest count,
estimated total, plus optional name / phone / request — and opens
`https://wa.me/<number>?text=…`. That message *is* the booking request.

**Before launch:** set the real number in `src/data/site.ts` → `site.whatsappNumber`
(international format, digits only). It currently holds a placeholder.

Not built yet, by design: the guest dashboard showing booking status, and the sync that
pushes a booking into the existing admin panel.

## Brand

Colours and the logo are derived from the source artwork, not eyeballed — see
`tools/logo/README.md` for the pipeline and `CLAUDE.md` for the palette and the rules on
how each colour may be used (in particular: green is deliberately rare).

Typography is Playfair Display (the logo's own font) for headings and Inter for UI.
Light and dark themes are both supported; every component reads semantic tokens from
`src/index.css` rather than hardcoding a hex.

## Content

Copy, rooms, pricing and imagery live in `src/data/`. Edit there — components don't hold
strings. Photography is served from the Unsplash CDN via `src/lib/images.ts`, which
requests the exact width each slot renders at.
