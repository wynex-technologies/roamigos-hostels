-- ============================================================================
-- Coupons, as their own thing.
--
-- The welcome campaign already carries one code, and that stays where it is:
-- it is part of the popup, it is what the artwork advertises, and it is filled
-- into the booking form automatically. This table is for every other code the
-- desk wants to hand out - a returning-guest code, one for a hostel partner,
-- one for a slow week in July - none of which should require running a popup
-- campaign to exist.
--
-- A code is checked by the `offer` edge function, not by the browser. That is
-- deliberate: shipping the list to the page would put every code, including
-- the ones handed to one partner, in plain view of anybody who opens the
-- network tab. The site sends the code somebody typed and is told what it is
-- worth, and nothing else.
-- ============================================================================

create table if not exists public.coupons (
  id bigint generated always as identity primary key,
  code text not null,
  percent int not null check (percent between 1 and 100),
  /** What it is for, so a list of eight codes is still readable in a year. */
  label text,
  active boolean not null default true,
  starts_on date,
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.coupons is
  'Discount codes the booking form accepts, beyond the welcome campaign''s own.';

-- Codes are quoted by people, who will type roam20, Roam20 and ROAM20 and mean
-- the same thing. Uniqueness has to agree with them.
create unique index if not exists coupons_code_idx on public.coupons (upper(code));

create index if not exists coupons_active_idx on public.coupons (active, expires_on);

drop trigger if exists coupons_touch on public.coupons;
create trigger coupons_touch before update on public.coupons
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- policies ---
alter table public.coupons enable row level security;

-- Admins manage them; `anon` cannot read this table at all, which is the whole
-- point of validating through the edge function rather than in the browser.
drop policy if exists coupons_admin on public.coupons;
create policy coupons_admin on public.coupons
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
