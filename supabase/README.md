# Backend runbook

The database, the two public endpoints and the admin panel, from an empty
Supabase project to a working desk. About twenty minutes.

Nothing below has been run for you - there are no credentials in this repo, and
there is no way to create a Supabase project from here. Every command is meant
to be run as written.

---

## How the pieces fit

```
                    ┌─────────────────────────────────────────┐
   admin/           │  Supabase                               │
   (the desk) ─────▶│  rooms, blog_posts, faqs, offers,       │
                    │  site_settings, bookings, enquiries     │
                    └───────┬──────────────┬──────────────┬───┘
                            │              │              │
              on publish    │   runtime    │   runtime    │
              (and once     │   (cached)   │   (write)    │
               per build)   │              │              │
                            ▼              ▼              ▼
                  Publish button      /offer         /intake
                            │              │              │
                            ▼              ▼              ▼
                    ┌────────────────────────────────────────┐
                    │  Hostinger: static files + one PHP     │
                    │  /content.json  ← publish.php writes   │
                    └────────────────────────────────────────┘
```

Everything the site prints comes down the left-hand path. The panel reads the
rows and posts the finished file to `api/publish.php`, which writes it next to
`index.html`; the site fetches it on boot. A visitor reading four pages makes
**zero** database requests, because that file is served off Hostinger's own
disk. That is the whole answer to the egress problem, and it costs one button.

`scripts/sync-content.ts` takes the same path at build time to bake a fallback
copy into the bundle, so the site still renders if that file ever goes missing.

Two things do run live, because both are small and both need to be:

- **`/offer`** - the welcome campaign. Half a kilobyte, cached five minutes in
  the browser and an hour on any CDN, and one fetch shared across the whole page
  by `useOffer()`. A campaign can be started or pulled in minutes.
- **`/intake`** - a booking request or an enquiry, on its way to the desk. About
  a kilobyte up, and the answer has no body at all.

---

## 1. Create the project

Any region near your guests; `ap-south-1` (Mumbai) for an Assam hostel. From the
dashboard, under **Project Settings → API**, copy:

| Value | Where it goes | Secret? |
| --- | --- | --- |
| Project URL | everywhere | no |
| `anon` public key | `admin/.env` | no - it can do nothing on its own |
| `service_role` key | the build, and the functions | **yes, never in a bundle** |

## 2. Run the migrations

With the Supabase CLI, from the repo root:

```sh
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste the files in `supabase/migrations/` into the SQL editor, in filename
order. `20260830000001_init.sql` builds the tables; `20260830000002_rls.sql`
closes them; `20260830000003_blog_body.sql` adds the journal's article text,
which is what gives a post a page of its own at `/blog/<slug>`; `20260830000004_media_storage.sql` creates the `media` bucket the panel
uploads images into; `20260830000005_coupons.sql` adds the discount codes
the booking form accepts; `20260830000006_chat_intake.sql` records the guest
submissions; and `20260831000007_page_content.sql` adds the two page documents
behind the panel's Page settings screen.

The later ones have to be run against an existing project too. Until the third
is, the panel cannot save an article and `npm run sync:content` will say
`column blog_posts.body does not exist` and keep the content it already had.
Until the fourth is, every image upload fails with `Bucket not found`. Until
the fifth is, the Coupons list on the Offer page cannot load. Until the seventh
is, Page settings cannot load and `npm run sync:content` says
`Could not find the table 'public.page_content'` - the site keeps rendering the
Home and About copy it shipped with, which is exactly what it should do.

### Why the pages are one jsonb document each

Everything else in the schema is a table because it is a list of things. A page
is not a list; it is one shaped document whose sections each hold a different
set of fields, and modelling that as columns would mean a migration every time
a section gains a line of copy.

So the row holds the document and `shared/page-content.ts` holds the shape and
the shipped copy. The site deep-merges the row over those defaults, which is
what makes a page that has never been edited store `{}` and render exactly what
the bundle shipped, and a field added to the shape later need no migration and
no backfill.

The fifth also needs the `offer` function redeployed, because that is what
checks a typed code:

```sh
supabase functions deploy offer
```

### About that bucket

It is public, which is the only way the site can fetch an image without a key -
and it is also the reason images used to be banned from Storage entirely, since
public means every page view is billed egress.

Three things hold that down, and they are described where they are implemented
(`admin/src/lib/media.ts`): the panel downscales and re-encodes to WebP before
uploading, objects are named by the hash of their bytes and cached for a year,
and removing or replacing an image deletes the object rather than orphaning it.

If somebody ever adds an upload path that skips `media.ts`, the first two stop
being true and the bill stops being small. There is one upload path on purpose.

## 3. Seed it with what the site already ships

The site is not empty - it has eight rooms, six journal entries, six FAQs and
the hostel's details written into `src/data/`. This puts that same content into
the database, so the panel opens onto a working site rather than eight blank
forms.

```sh
SUPABASE_URL=https://<project>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service_role key> \
npm run seed:supabase
```

It upserts on slugs, so running it twice changes nothing.

## 4. Deploy the functions

```sh
supabase functions deploy offer
supabase functions deploy intake

supabase secrets set ALLOWED_ORIGINS="https://your-domain.com"
```

There is no `publish` function. On Hostinger there is no build to trigger - the
panel writes the content file directly through `hostinger/api/publish.php`.

`ALLOWED_ORIGINS` matters. Left unset the functions answer any origin, which
means any page on the internet can post into the desk's inbox. Name the site's
domain and the panel's, comma separated.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected into every function
automatically - do not set them yourself.

## 5. Make yourself an admin

Sign up once through the panel, or create the user under **Authentication →
Users**. Being able to sign in is not access: every policy additionally requires
a row in `admin_users`. Add it from the SQL editor, which runs as
`service_role`:

```sql
insert into public.admin_users (id, email, full_name, role)
select id, email, 'Your Name', 'owner'
from auth.users
where email = 'you@example.com';
```

This is deliberately not something the panel can do. An admin cannot promote
anybody, including themselves - adding an admin means opening the SQL editor.

## 6. Wire up the site

The site reads two public endpoints at runtime. Put them in `.env` at the repo
root before building:

```
VITE_OFFER_ENDPOINT=https://<project>.functions.supabase.co/offer
VITE_INTAKE_ENDPOINT=https://<project>.functions.supabase.co/intake
```

And in `.env.local`, which is only ever read by the build and never shipped:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

Neither of those two carries a `VITE_` prefix, and that is the point: a `VITE_`
variable is inlined into the browser bundle, so a service_role key with that
prefix would be handed to every visitor.

## 7. Build and upload

```sh
npm run build:hostinger
```

That builds the site and the panel and assembles `deploy/` exactly as
`public_html/` should look - the site at the root, the panel at `/admin`, the
publish endpoint at `/api`. The full upload procedure, the permissions PHP needs
and the usual failure modes are in [`../hostinger/README.md`](../hostinger/README.md).

---

## Keeping egress flat

The free tier gives 5 GB of egress a month. The usual way a site like this eats
it is not traffic - it is habits. These are the rules this project is built on:

**1. No photographs in Supabase Storage.** Every image column here holds an
Unsplash id or a URL on somebody else's CDN. One 300 KB hero photo served from
Storage to 17,000 visitors is the entire monthly quota; the same photo on
Unsplash costs this project nothing. The panel therefore has no upload button,
and that is a decision rather than a gap. Put files on a CDN, an S3 bucket or
Cloudinary and paste the URL.

**2. Visitors never query the database.** They read `/content.json`, a static
file on the web server, written by the panel on publish and mirrored into the
bundle at build time. A page view costs this project nothing at all. A site that
reads its rooms over PostgREST pays for those rows on every page view of every
visitor, forever.

**3. The anon key can do nothing.** Not one RLS policy grants it anything, and
the privilege is revoked besides. There is no public read path to run up a bill,
and nobody can point a script at the tables.

**4. No `select *`, anywhere.** Every query in the panel names its columns, and
lists take a short set - a rooms list needs a name and a price, not six
paragraphs and five image URLs per row. `src/lib/db.ts` holds the lists.

**5. Counts are counted, not fetched.** The dashboard uses
`select('id', { count: 'exact', head: true })`, which returns the number in a
header and no rows at all.

**6. Lists are paged.** Twenty five rows at a time. Loading a year of bookings
to show the first screenful gets slower and more expensive every month it works.

**7. Realtime is not used.** An open subscription streams every change for as
long as a tab is left open, which on a desk machine means all day. The lists
fetch when opened and when refreshed.

Watch the actual number under **Reports → Usage** in the dashboard. With the
arrangement above, the site's own traffic contributes almost nothing to it and
the panel is a handful of megabytes a month.

---

## Things worth knowing

**An edit is not live until you publish.** Saving writes to the database
immediately; the site reads a file. Press Publish and that file is rewritten,
so the change is there on the next page load. The offer is the exception - it is
read live and needs no publish at all.

**Only one campaign runs at a time**, and only one journal post can be the lead
story. Both are enforced by partial unique indexes, so the second one is refused
rather than quietly making the answer depend on row order.

**A booking is still a WhatsApp conversation.** The row in `bookings` is the
desk's copy, taken as the guest opened the chat. It is not a confirmation and
nothing is held or charged - the status column is your own record of what
happened in the chat afterwards.

**Deleting a room does not break its links.** It disappears from the listing on
the next publish, and its URL starts redirecting to `/rooms`. If it is coming
back, use the Live toggle instead of deleting.

**If Supabase is unreachable at build time**, the sync says so and the build
continues with whatever content it already had. A deploy is never blocked on the
database being up, and a table that is empty is treated as "not filled in yet"
rather than "the site has no rooms".
