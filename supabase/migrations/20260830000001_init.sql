-- ============================================================================
-- Roamigos: content, intake and admin access.
--
-- Two rules shape this schema, and both exist to keep egress flat:
--
-- 1. No photograph is ever stored in Supabase. Every image column holds an
--    Unsplash id or a URL on somebody else's CDN, so the bytes a visitor
--    downloads never leave this project. Serving images out of Storage is the
--    single biggest way a site like this burns through its egress quota.
--
-- 2. Visitors do not read these tables. The site is static: `npm run build`
--    pulls the content once and bakes it into the bundle, so a page view costs
--    zero database traffic no matter how many of them there are. The only
--    runtime paths are the offer endpoint (one small cached JSON) and the
--    intake endpoint (a write that answers with no body).
-- ============================================================================

create extension if not exists "pgcrypto";

-- Every table with an `updated_at` shares this.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$;

-- ----------------------------------------------------------------- admins ---
-- Who may sign into the panel. A row here is the grant: Supabase Auth proves
-- who somebody is, this table decides whether they get in. Being able to sign
-- up is not enough on its own, so a leaked panel URL is not an open door.
create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Allowlist for the admin panel. Auth proves identity; membership here grants access.';

-- Used by nearly every policy below, so it is worth keeping cheap. It is
-- `security definer` so that reading the allowlist does not itself need a
-- policy that reads the allowlist.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (select 1 from public.admin_users where id = auth.uid());
$fn$;

-- ------------------------------------------------------------------ rooms ---
create table public.rooms (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  categories text[] not null default '{}',
  badge text,
  capacity int not null check (capacity > 0),
  capacity_label text not null,
  bathroom text not null,
  short_description text not null,
  subtitle text not null,
  price_per_night int not null check (price_per_night >= 0),
  rating numeric(2, 1) not null default 5.0 check (rating between 0 and 5),
  review_count int not null default 0 check (review_count >= 0),
  highlights text[] not null default '{}',
  about text not null,
  inclusions text[] not null default '{}',
  amenities text[] not null default '{}',
  -- Unsplash ids or absolute URLs. Never a Supabase Storage path.
  images text[] not null default '{}',
  total_photos int not null default 0,
  max_guests_note text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rooms_published_order_idx on public.rooms (published, sort_order);

create trigger rooms_touch before update on public.rooms
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- reviews ---
-- Guest quotes. A null `room_id` means the review is about the hostel itself,
-- which is the wall the homepage and the about page print.
create table public.reviews (
  id bigint generated always as identity primary key,
  room_id bigint references public.rooms (id) on delete cascade,
  name text not null,
  date_label text not null,
  rating int not null check (rating between 1 and 5),
  text text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index reviews_published_idx on public.reviews (published, sort_order);

-- ------------------------------------------------------------- blog posts ---
create table public.blog_posts (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null,
  category text not null,
  author text not null,
  published_on date not null,
  read_time text not null,
  image text not null,
  featured boolean not null default false,
  facts jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_published_idx on public.blog_posts (published, published_on desc);

create trigger blog_posts_touch before update on public.blog_posts
  for each row execute function public.touch_updated_at();

-- The journal page pulls one story into the lead slot, so only one row may
-- claim it. Without this the lead is whichever row happens to sort first.
create unique index blog_posts_one_featured_idx
  on public.blog_posts ((featured)) where featured;

-- ------------------------------------------------------------------- faqs ---
create table public.faqs (
  id bigint generated always as identity primary key,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger faqs_touch before update on public.faqs
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------- offers ---
-- The welcome popup. The column set matches the `Offer` interface in
-- src/data/offer.ts, because the offer endpoint serves this straight back to
-- the site and the site merges it over its shipped defaults.
create table public.offers (
  id bigint generated always as identity primary key,
  -- The campaign's own name, in the panel's list. Unique so the seed and any
  -- re-import can upsert on it rather than stacking duplicates.
  name text not null unique,
  active boolean not null default false,
  eyebrow text not null default '',
  headline text not null default '',
  headline_accent text,
  badge_value text,
  badge_label text,
  description text not null default '',
  code text,
  discount_percent int not null default 0 check (discount_percent between 0 and 100),
  image text not null default '',
  image_alt text not null default '',
  perks text[] not null default '{}',
  cta_label text not null default '',
  cta_href text not null default '/rooms',
  note text,
  expires_on date,
  delay_ms int not null default 1200 check (delay_ms >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger offers_touch before update on public.offers
  for each row execute function public.touch_updated_at();

-- One campaign runs at a time. The endpoint reads whichever row is active, so
-- a second active row would make the answer depend on row order.
create unique index offers_one_active_idx on public.offers ((active)) where active;

-- ---------------------------------------------------------- site settings ---
-- One row, always id = 1. The things the desk actually changes: the number
-- every Book Now dials, where the hostel is, and the figures it advertises.
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text not null,
  phone_display text not null,
  email text not null,
  address_line1 text not null,
  address_line2 text not null,
  address_line3 text not null,
  coords text not null,
  map_url text not null,
  check_in text not null,
  check_out text not null,
  stat_guests text not null,
  stat_rating numeric(2, 1) not null,
  stat_reviews int not null,
  socials jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------- bookings ---
-- A booking request, recorded as the guest opens WhatsApp with it. The chat is
-- still the real conversation; this is the desk's own copy, so a request is not
-- lost when somebody closes their phone half way through sending it.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_slug text,
  room_name text,
  guest_name text not null,
  guest_phone text not null,
  guest_email text not null,
  check_in date,
  check_out date,
  nights int not null default 0,
  guests int not null default 1,
  coupon_code text,
  coupon_percent int not null default 0,
  subtotal int not null default 0,
  discount int not null default 0,
  total int not null default 0,
  note text,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'cancelled', 'stayed')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_status_idx on public.bookings (status, created_at desc);
create index bookings_created_idx on public.bookings (created_at desc);

create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------------- enquiries ---
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  topic text not null,
  check_in date,
  check_out date,
  guests text,
  message text,
  status text not null default 'new' check (status in ('new', 'answered', 'closed')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enquiries_status_idx on public.enquiries (status, created_at desc);

create trigger enquiries_touch before update on public.enquiries
  for each row execute function public.touch_updated_at();
