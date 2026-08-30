-- ============================================================================
-- Row level security.
--
-- Three callers exist and they are deliberately unequal:
--
--   anon          the browser's key, and the one that leaks - it is in every
--                 bundle. It may read nothing and write nothing. Not one
--                 policy below grants it anything.
--   service_role  the build's key and the two edge functions. It bypasses RLS
--                 entirely and never leaves a server.
--   authenticated a signed-in admin, and only one who is also on the
--                 allowlist in `admin_users`.
--
-- Locking `anon` out completely is what makes the egress promise hold. A site
-- that reads its content over PostgREST pays for those rows on every page
-- view; this one cannot, because the key shipped to the browser is not allowed
-- to ask. Content reaches the site through the build (`npm run sync:content`,
-- service_role, once per deploy) and guest submissions leave through an edge
-- function, so there is no public read path to run up a bill.
-- ============================================================================

alter table public.admin_users   enable row level security;
alter table public.rooms         enable row level security;
alter table public.reviews       enable row level security;
alter table public.blog_posts    enable row level security;
alter table public.faqs          enable row level security;
alter table public.offers        enable row level security;
alter table public.site_settings enable row level security;
alter table public.bookings      enable row level security;
alter table public.enquiries     enable row level security;

-- An admin may see the allowlist but never edit it. Adding or removing an
-- admin is done with the service_role key, so nobody can promote themselves
-- through the panel they are signed into.
create policy admin_users_read on public.admin_users
  for select to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------ content ------
-- Admins get full control of everything the site prints.
create policy rooms_admin on public.rooms
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy reviews_admin on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy blog_posts_admin on public.blog_posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy faqs_admin on public.faqs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy offers_admin on public.offers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy site_settings_admin on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------- intake ------
-- Guest submissions are read and worked in the panel. They are never inserted
-- from the browser: the site posts to the `intake` edge function, which
-- validates the payload and writes with the service_role key. That keeps the
-- anon key unable to write, so nobody can fill this table from a script and
-- turn the desk's inbox into a bin.
create policy bookings_admin on public.bookings
  for select to authenticated using (public.is_admin());

create policy bookings_admin_update on public.bookings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy bookings_admin_delete on public.bookings
  for delete to authenticated using (public.is_admin());

create policy enquiries_admin on public.enquiries
  for select to authenticated using (public.is_admin());

create policy enquiries_admin_update on public.enquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy enquiries_admin_delete on public.enquiries
  for delete to authenticated using (public.is_admin());

-- ------------------------------------------------------------- grants ------
-- Belt and braces. RLS already stops `anon`, but revoking the privilege means
-- a policy added carelessly later cannot quietly open a public read path.
revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
