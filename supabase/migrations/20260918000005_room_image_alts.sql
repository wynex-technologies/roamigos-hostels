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
alter table public.rooms
  alter column images drop default;

alter table public.rooms
  alter column images type jsonb
  using coalesce(
    (
      select jsonb_agg(jsonb_build_object('src', value, 'alt', '') order by ordinality)
      from unnest(images) with ordinality as t(value, ordinality)
    ),
    '[]'::jsonb
  );

alter table public.rooms
  alter column images set default '[]'::jsonb;

-- A list, not an object, and every entry has to carry a src. Without this a
-- single bad write turns a room's gallery into nothing on the live site.
alter table public.rooms
  drop constraint if exists rooms_images_shape;

alter table public.rooms
  add constraint rooms_images_shape check (
    jsonb_typeof(images) = 'array'
    and not exists (
      select 1 from jsonb_array_elements(images) as entry
      where jsonb_typeof(entry) <> 'object' or jsonb_typeof(entry -> 'src') <> 'string'
    )
  );

comment on column public.rooms.images is
  'Gallery, in order. `[{ src, alt }]` - the first is the cover. An empty alt means decorative.';
