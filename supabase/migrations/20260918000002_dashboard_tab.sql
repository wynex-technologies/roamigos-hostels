-- Dashboard became a grantable tab.
--
-- It used to be forced on: the panel showed it to every editor whatever their
-- `tabs` said, so nobody's row ever mentioned it. Now that the Users screen can
-- switch it off, an absent 'Dashboard' means hidden - which would quietly take
-- the tab away from every member who already has an account.
--
-- So the rows are brought up to what the panel was already doing. After this,
-- absence means the owner chose absence.
update public.admin_users
set tabs = array_append(tabs, 'Dashboard')
where role = 'editor'
  and not ('Dashboard' = any (tabs));

comment on column public.admin_users.tabs is
  'Allowed sidebar tabs, by their label in admin/src/lib/tabs.ts. Read for editors only - an owner sees every tab regardless. Empty means Settings and their own profile, nothing else.';
