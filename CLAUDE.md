# Roamigos Hostel — Project Rules

## Git rules (STRICT — never violate)

- **NEVER** add `Co-Authored-By: Claude` (or any Claude/Anthropic co-author trailer) to commit messages.
- **NEVER** add "Generated with Claude Code" or any similar attribution line to commits or PR bodies.
- **NEVER** run `git push` unless the user explicitly asks for it in that message.
- **NEVER** commit unless the user explicitly asks. Never commit directly to `main`/`master`.
- Commit messages: plain, human, imperative (`add booking widget`, `fix mobile nav overflow`). No emojis, no bot signatures.

## Stack

- Vite + React 19 + TypeScript (strict) + Tailwind CSS v4 + React Router 7
- Icons: `lucide-react`. No other UI library — components are hand-built in `src/components/ui`.
- Path alias: `@/` → `src/`

## Brand — exact colors extracted from `Roamigos 9.pdf` (Illustrator vector fills)

| Token | Hex | Use |
| --- | --- | --- |
| `--brand-maroon-deep` | `#951A16` | pressed states, deep gradients |
| `--brand-maroon` | `#A92727` | **primary** — CTAs, headings accent, footer |
| `--brand-mustard` | `#D9A328` | **accent** — highlights, underlines, badges |
| `--brand-gold` | `#D78A26` | secondary accent, icon strokes |
| `--brand-cream` | `#FBF1E6` | page canvas |
| `--brand-sand` | `#E4C8AC` | borders, muted surfaces |
| `--brand-coral` | `#F47F72` | flamingo pop — sparing, badges/tags only |
| `--brand-green-deep` | `#364733` | **minimum use only** — see below |
| `--brand-green` | `#3F5B3C` | **minimum use only** |
| `--brand-ink` | `#252522` | body text, dark surfaces |

### Green usage rule
Green is **deliberately rare**. Use it only for:
1. Success / confirmation states (free cancellation note, "confirmed" chips)
2. The `secure / verified` trust icons
3. Rare decorative hairlines or the WhatsApp CTA

Never use green for headings, primary CTAs, large backgrounds, or section fills.

## Typography

- Headings: **Playfair Display** (this is the logo's actual font, extracted from the PDF)
- Body / UI: **Inter**
- Never introduce a third family.

## Design principles

- Premium, warm, editorial — cream canvas, maroon ink, mustard accents.
- Rounded-2xl cards, soft warm shadows (`--shadow-warm`), hairline sand borders.
- Fully responsive: mobile → tablet → desktop. Test at 375 / 768 / 1440.
- Both light and dark themes must be supported by every component (semantic tokens only —
  never hardcode a hex in a component; use the CSS variables in `src/index.css`).

## Booking flow

There is **no booking page and no modal**. "Book Now" builds a pre-filled WhatsApp message
(room, dates, guests, nights, total, guest details) and redirects straight to the hostel
owner's WhatsApp via `buildWhatsAppUrl()` in `src/lib/whatsapp.ts`.

Later (not now): user profile dashboard with booking status, and admin-panel sync on booking.
The admin panel already exists separately — only the website is in scope.

## Where things live

- `src/data/site.ts` — brand info, contact, nav, footer, WhatsApp number. **Edit content here, not in components.**
- `src/data/rooms.ts` — all rooms + full detail content
- `src/data/content.ts` — features, activities, amenities, reviews, blog
- `src/components/brand/Logo.tsx` — logo, converted from the source PDF to vector paths
