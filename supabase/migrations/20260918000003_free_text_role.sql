-- Role becomes what the desk types, with one reserved word.
--
-- It was 'owner' or 'editor' and nothing else, which made it an access level
-- wearing the name of a job. A hostel has more jobs than that - front desk,
-- housekeeping, night manager - and the panel prints this string as the
-- person's designation, so the desk should be able to write the real one.
--
-- 'owner' stays reserved and keeps its meaning: full access, every tab, the
-- Users screen. Every other value is a label. It grants nothing on its own and
-- the person sees exactly the tabs they have been given, which is what the
-- panel already did for 'editor' - so an unrecognised role is the safe case
-- rather than an open one. `is_admin()` is unchanged: being on the allowlist at
-- all is still what grants entry.
alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (length(btrim(role)) between 1 and 40);

comment on column public.admin_users.role is
  'The person''s designation, free text. ''owner'' is reserved and grants full access; every other value is a label and access comes from `tabs`.';
