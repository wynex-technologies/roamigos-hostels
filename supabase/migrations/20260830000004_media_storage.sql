-- ============================================================================
-- The panel gets image uploads.
--
-- Until now every image field held an Unsplash id or a URL on somebody else's
-- CDN, deliberately: a photograph served from Supabase is billed egress on
-- every page view, and one hero image was enough to spend the free monthly
-- allowance in roughly seventeen thousand of them.
--
-- Uploads are now wanted anyway, so the cost has to be engineered down instead
-- of designed out. Three things do that, and all three are load-bearing:
--
--   1. The panel re-encodes before it uploads. Every file is downscaled to a
--      2000px long edge and written as WebP, so a 4MB phone photograph leaves
--      the browser at around 200KB. Nothing reaches this bucket at camera size.
--   2. Objects are named by the hash of their bytes and served with a one-year
--      immutable cache header, so a repeat view costs nothing at all and the
--      same file uploaded twice is stored once.
--   3. `file_size_limit` below is the backstop for both, enforced by the server
--      rather than by the browser that is asking.
--
-- Unsplash-hosted images keep working exactly as they did and still cost
-- nothing. This bucket is only for what the desk uploads itself.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880, -- 5MB. The panel aims for a tenth of this; the rest is headroom.
  array['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------- policies ---
-- Reading needs no policy: a public bucket is served straight off the CDN at
-- /storage/v1/object/public/media/..., which is the whole point - the site
-- fetches an image the same way it would fetch one from any other host, with
-- no key and no session.
--
-- Writing is admin-only, and asked the same way every other policy on this
-- project asks it: `is_admin()`, so being signed in is not by itself enough.

drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

-- Removing an image from a field removes the object, so the bucket does not
-- fill up with files nothing points at any more.
drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
