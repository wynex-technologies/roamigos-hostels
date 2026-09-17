-- Add tabs column to admin_users to store allowed tabs for restricted editors
alter table public.admin_users
  add column tabs text[] not null default '{}';

comment on column public.admin_users.tabs is 'Allowed sidebar tabs. Empty array means full access (default for owners).';
