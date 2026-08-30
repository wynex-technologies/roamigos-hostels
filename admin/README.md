# Roamigos Desk

The admin panel. A separate Vite app - it has its own `package.json`, its own
build and its own deployment, and it is never bundled into the site.

```sh
cd admin
npm install
cp .env.example .env      # fill in the project URL and the anon key
```

Then run it from the repo root, together with the site:

```sh
npm run dev               # http://localhost:5173/admin
```

One address for both, the same way production works: the site is served from
`public_html/` and this from `public_html/admin/` on one domain. The panel's own
server is still there on `:5174` and still answers directly, but there is no
reason to open it - and using the proxied address means a link or a redirect
that works locally works live too.

Setting the project up from scratch - migrations, seed, functions, admin
accounts, deploy - is in [`../supabase/README.md`](../supabase/README.md).

## What it does

| Screen | What it controls |
| --- | --- |
| Dashboard | What is waiting, and what the site is currently showing |
| Bookings | Requests recorded as guests opened WhatsApp. Status, desk notes, reply |
| Enquiries | Contact form submissions, same |
| Rooms | Every room: price, capacity, copy, amenities, photographs, live or hidden |
| Journal | Posts, the lead story, categories |
| Offer | The welcome campaign: coupon, percent, copy, artwork, dates |
| FAQs | The contact page questions, which are also the FAQ search result |
| Settings | WhatsApp number, address, check-in times, advertised figures, socials |

## Publish

Saving writes to the database straight away. Publish is what puts it on the site:
the panel reads the content, shapes it exactly the way a build would, and posts
it to `api/publish.php`, which writes `content.json` next to the site's
`index.html`. The site fetches that file when it boots, so the change is live on
the next page load - nothing rebuilt, nothing re-uploaded.

The **welcome offer** does not even need that. The site reads it live from the
`offer` endpoint, so a campaign switched on here is running within five minutes.

Deployment, permissions and what to do when Publish complains are in
[`../hostinger/README.md`](../hostinger/README.md).

## Access

Two separate things have to be true, and the panel says which one failed:

1. **Signed in** - Supabase Auth, email and password.
2. **On the allowlist** - a row in `admin_users`. Every access rule in the
   database checks this, so an account without one gets a plain "no access"
   screen rather than a panel where every list is silently empty.

Rows are added with the service_role key from the SQL editor, never from here.
An admin cannot promote anybody, including themselves.

## Photographs

There is no upload button, on purpose. Image fields take an Unsplash id
(`photo-1709805619372-...`) or a full URL to a file on any CDN.

Serving photographs out of Supabase Storage is the fastest way to burn through
the project's egress quota - a single 300 KB hero image would use the whole free
monthly allowance in about 17,000 page views. Hosted anywhere else, the same
image costs this project nothing. The reasoning is in
[`../supabase/README.md`](../supabase/README.md).

## Keys

`.env` holds the project URL and the **anon** key. Both are compiled into the
bundle and both are public - anyone who opens the panel can read them. That is
fine: the anon key can read and write nothing on this project. Every table is
closed to it, and access is granted only to a signed-in admin.

The `service_role` key must never appear here. It bypasses every access rule.
It belongs in the site's build environment and in the edge functions, both of
which are servers.
