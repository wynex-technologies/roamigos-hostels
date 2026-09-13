-- ============================================================================
-- Back to RMG-001.
--
-- The sequence had run to 6 before the hostel took a single real booking: three
-- numbers went to rows that existed while the column was being added, two to
-- checks that the endpoint was answering, and one to a test booking. All of
-- those have since been deleted, so the first genuine booking would have been
-- called RMG-007 and every number below it would have belonged to nothing.
--
-- Nothing is lost by restarting: the reference is a name, not a count, and no
-- row is holding any of 001 to 006.
--
-- The guard matters more than the reset. A sequence rewound underneath rows
-- that already exist hands out references the unique index will refuse, and the
-- failure would land on a guest's booking rather than here - so this only fires
-- into an empty table. Applied to a database with bookings in it, it correctly
-- does nothing at all.
-- ============================================================================

do $$
begin
  if exists (select 1 from public.bookings) then
    raise notice 'bookings is not empty - leaving booking_reference_seq where it is';
  else
    -- `false` means "not yet called", so the next nextval returns 1 rather than 2.
    perform setval('public.booking_reference_seq', 1, false);
  end if;
end
$$;
