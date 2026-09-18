-- Add tabs column to admin_users to store allowed tabs for restricted editors
-- `if not exists`, because these were applied by hand in the SQL editor before
-- they were ever pushed - so the history table does not know they ran and a
-- later `supabase db push` would try them again and stop on the first one.
alter table public.admin_users
  add column if not exists tabs text[] not null default '{}';

comment on column public.admin_users.tabs is 'Allowed sidebar tabs. Empty array means full access (default for owners).';
