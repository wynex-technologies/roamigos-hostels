# Deploying to Hostinger

The site and the admin panel on one shared-hosting account, no build pipeline.
Once this is up, the desk changes content from the panel and nobody touches the
server again - you only come back here when the *code* changes.

```
https://your-domain.com/        the site
https://your-domain.com/admin   the panel
```

---

## How publishing works without a pipeline

There is no CI, so nothing rebuilds when content changes. Instead:

```
   panel  ──reads the rows it is allowed to read (it is signed in)
     │
     └──POST──▶  /api/publish.php  ──writes──▶  /content.json
                 (checks you are an admin)           │
                                                     ▼
                                    the site fetches it when it boots
```

Press Publish, reload the site, the change is there. Nothing is rebuilt and
nothing is re-uploaded.

The site also carries a copy of the content inside its JavaScript bundle. That
is the fallback: if `/content.json` is missing, half-written or unreachable, the
site renders what it shipped with instead of an empty page.

**No visitor ever queries Supabase.** `/content.json` is a static file Apache
reads off the same disk as everything else. The database is touched once per
publish, by the panel. That is why the egress bill does not grow with traffic.

**There is no service_role key on this server**, and there must never be one.
`publish.php` does not need it: the panel is already signed in and already
governed by the database's own access rules, so it reads the content and sends
it. The PHP only proves the sender is an admin and writes the bytes. Everything
it uses for that is public.

---

## First upload

### 1. Build

```sh
npm run build:hostinger
```

That builds the site, builds the panel, and assembles `deploy/` laid out exactly
as `public_html/` should look. Check it before uploading:

```sh
npm run preview:hostinger      # http://localhost:4173
```

It follows the same routing rules as `.htaccess`, so a deep link like
`/rooms/deluxe-private` or `/admin/bookings` behaves as it will on the server.
Publish will not work there - it needs PHP.

### 2. Upload

hPanel → **File Manager** → `public_html/`, and upload **everything inside**
`deploy/` - the contents, not the folder.

Turn on **show hidden files** first, or `.htaccess` will not appear and nothing
will route. It is the single most common way this goes wrong: the home page
works, every other URL 404s.

Uploading a zip and extracting in place is faster than dragging 25 files.

`public_html/` should end up as:

```
public_html/
  .htaccess
  index.html
  content.json
  assets/            favicon.svg  logo-*.svg  logo-*.png
  sitemap.xml        robots.txt   journal-traveller.webp
  admin/
    .htaccess  index.html  assets/  favicon.svg
  api/
    publish.php
    config.example.php
```

### 3. Make the config

In `public_html/api/`, rename `config.example.php` to **`config.php`**. It
already carries the project URL and the anon key; both are public.

Then add your domain to `ALLOWED_ORIGINS` in it only if you plan to run the
panel locally against this server. For normal use the panel is on the same
domain and the list is never consulted.

### 4. Let PHP write the content file

`publish.php` replaces `public_html/content.json`, so PHP has to be able to
write into `public_html/`. In the File Manager, right-click `public_html` →
Permissions → **755**, and `content.json` → **644**. That is the default on
Hostinger, so usually there is nothing to do.

If Publish ever answers *"Could not write the content file"*, this is why.

### 5. Point Supabase at the domain

The two edge functions only answer origins they have been told about:

```sh
npx supabase secrets set --project-ref sfolclcnfpxirlojembb \
  ALLOWED_ORIGINS="https://your-domain.com"
```

Without this the booking and enquiry records stop arriving - the site still
works and guests still reach WhatsApp, but the desk gets no copy.

### 6. Set the real domain in the code

`src/data/site.ts` → `site.url`. Every canonical link, every schema `@id` and
every line of the sitemap is built from it, and it is compiled into static files
at build - so this one needs a rebuild and a re-upload to take effect. Do it
before announcing the site.

---

## After a content change

Nothing. Press Publish in the panel.

## After a code change

```sh
npm run build:hostinger
```

Then re-upload `deploy/`. **Leave `content.json` out of that upload** if the
desk has published since your last build - your copy is older than theirs and
would roll their edits back. The build knows this and refuses to write a
`content.json` at all when it has no synced content, but it cannot know whether
the server's copy is newer than yours.

Safest habit: run `npm run sync:content` immediately before the build. Then your
copy *is* theirs.

---

## When something is wrong

**Home page works, every other URL 404s.** `.htaccess` did not upload. Turn on
hidden files in the File Manager and check it is there.

**The panel loads blank at /admin.** Open the browser console. If it is asking
for `/assets/...` rather than `/admin/assets/...`, the panel was built without
`base: '/admin/'` - rebuild with `npm run build:hostinger` rather than building
in `admin/` by hand.

**Publish says "Not signed in".** Some PHP setups strip the `Authorization`
header. The `.htaccess` carries it through explicitly; make sure that block
survived the upload.

**Publish says "Could not write the content file".** Permissions - see step 4.

**Publish works but the site does not change.** Hard-reload. `content.json` is
sent with `no-cache`, so it revalidates, but a service worker or an aggressive
proxy in between can still hold it.

**The site shows old content after a code upload.** `index.html` is `no-cache`
too, but Hostinger's own edge cache may need a moment. hPanel has a purge.

**A publish went wrong.** `publish.php` keeps the previous file as
`content.json.bak`. Rename it back in the File Manager.
