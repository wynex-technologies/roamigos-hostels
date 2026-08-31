-- ============================================================================
-- Editable page copy: the Home and About pages, one jsonb document each.
--
-- Everything else in this schema is a table because it is a list of things -
-- rooms, posts, FAQs. A page is not a list; it is one shaped document whose
-- sections each hold a different set of fields, and modelling that as columns
-- would mean a migration every time a section gains a line of copy.
--
-- So the row holds the document and `src/data/pages.ts` holds the shape. The
-- site deep-merges whatever is stored here over the defaults written beside
-- that shape, which means three things:
--
--   * a page that has never been edited stores `{}` and renders exactly what
--     the bundle shipped,
--   * a field added to the shape later needs no migration and no backfill -
--     the default answers for it until somebody edits it,
--   * a key removed from the shape is simply ignored rather than breaking a
--     render.
--
-- The panel saves the whole document, so fields it does not draw an input for
-- (a crop hint, a card key) round-trip untouched.
-- ============================================================================

create table if not exists public.page_content (
  page       text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Both rows exist from the start, so the panel edits rather than creates and
-- the publish step always has something to read.
insert into public.page_content (page, data)
values ('home', '{}'::jsonb), ('about', '{}'::jsonb)
on conflict (page) do nothing;

alter table public.page_content enable row level security;

create policy page_content_admin on public.page_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- `anon` is granted nothing here either. The site never reads this table: the
-- document travels into `content.json` at build time and on Publish, exactly
-- like the rooms do.
revoke all on public.page_content from anon;
