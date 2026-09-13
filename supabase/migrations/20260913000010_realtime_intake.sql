-- ============================================================================
-- The desk gets told.
--
-- `bookings` and `enquiries` join the realtime publication so the panel can be
-- notified the moment one arrives, rather than whoever is on the desk
-- remembering to press Refresh.
--
-- These two tables and nothing else. The panel's rule is still that it fetches
-- when a screen is opened - see the note in `admin/src/lib/supabase.ts` - and
-- this is the one exception, because it is the one thing the desk needs to know
-- about before it goes looking. The cost is two tables' inserts, which is a
-- handful of messages a day, against a poll that would run every thirty seconds
-- all day whether anything happened or not.
--
-- Authorisation is unchanged and is not weakened by this. Realtime evaluates
-- the same RLS policies the panel's own queries do, so a socket only ever
-- receives rows its connection could already have selected: `bookings_admin`
-- and `enquiries_admin` both require `authenticated` *and* a row in
-- `admin_users`. `anon` still receives nothing, exactly as before.
-- ============================================================================

do $$
declare
  target text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    raise notice 'supabase_realtime publication not found - nothing to add to';
    return;
  end if;

  -- Added one at a time and only when absent: `alter publication ... add table`
  -- raises on a table that is already a member, which would fail the whole push
  -- on a project where somebody had already ticked the box in the dashboard.
  foreach target in array array['bookings', 'enquiries'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = target
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target);
    end if;
  end loop;
end
$$;
