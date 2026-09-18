-- A room's photographs get descriptions.
--
-- `images` was `text[]` - a list of Unsplash ids and uploaded URLs, and nowhere
-- to say what is in any of them. The site filled the gap by generating
-- "Deluxe Private - photo 3", which is not a description of anything; it tells
-- a screen reader the file's position in a list.
--
-- So the column becomes jsonb holding `[{ "src": ..., "alt": ... }]`. A
-- parallel `image_alts text[]` was the other option and was rejected: two
-- arrays that have to stay the same length and the same order is a bug waiting
-- for the first time somebody reorders a gallery, and it would go unnoticed
-- because the wrong alt still renders.
--
-- Existing rows convert in place, each id keeping its position with an empty
-- description - which renders exactly as before until somebody writes one.

-- The conversion goes through a function, because `ALTER COLUMN ... TYPE ...
-- USING` will not take a subquery - and unnesting an array to rebuild it in
-- order is a subquery however it is written. The function is evaluated per row,
-- which is what is wanted, and it is dropped again below.
create or replace function public.rooms_images_to_jsonb(arr text[])
returns jsonb
language sql
immutable
as $fn$
  select coalesce(
    jsonb_agg(jsonb_build_object('src', value, 'alt', '') order by ordinality),
    '[]'::jsonb
  )
  from unnest(coalesce(arr, '{}'::text[])) with ordinality as t(value, ordinality)
$fn$;

-- Idempotent: safe to run twice, and safe on a project where somebody has
-- already converted the column by hand.
do $do$
begin
  if (
    select data_type from information_schema.columns
    where table_schema = 'public' and table_name = 'rooms' and column_name = 'images'
  ) = 'ARRAY' then
    alter table public.rooms alter column images drop default;
    alter table public.rooms
      alter column images type jsonb using public.rooms_images_to_jsonb(images);
  end if;
end
$do$;

alter table public.rooms alter column images set default '[]'::jsonb;

drop function if exists public.rooms_images_to_jsonb(text[]);

-- A list, not an object. This is as far as a CHECK can go - a constraint may
-- not contain a subquery, and asking "is every entry an object with a src"
-- needs one however it is phrased. The per-entry shape is settled where it can
-- be: the panel only ever writes `{ src, alt }`, and `pictures()` in
-- shared/media.ts drops anything malformed on the way to the site, so a bad
-- entry costs one missing photograph rather than an empty gallery.
alter table public.rooms
  drop constraint if exists rooms_images_shape;

alter table public.rooms
  add constraint rooms_images_shape check (jsonb_typeof(images) = 'array');

comment on column public.rooms.images is
  'Gallery, in order. `[{ src, alt }]` - the first is the cover. An empty alt means decorative.';
