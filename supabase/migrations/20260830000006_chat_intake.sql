-- ============================================================================
-- Every WhatsApp chat the site opens, on the board.
--
-- Only two things were ever recorded: a booking request from a room page, and
-- the contact form. Both ask for a name and a phone number first, which is why
-- `enquiries.name` and `.phone` were NOT NULL.
--
-- But most of the site's WhatsApp buttons ask for nothing - the hero, the
-- footer, the closing band, the offer popup, "help me pick the right room".
-- Somebody presses one, lands in WhatsApp, and as far as the desk was
-- concerned it never happened. That is the commonest way a lead is lost here,
-- because the chat that follows arrives with no context at all.
--
-- So those are recorded too, with what is actually known: which button, which
-- page, and the message the chat was going to open with. A name and a phone
-- number are not known at that moment and are not invented - they are null,
-- and the panel says "no name yet" rather than pretending.
-- ============================================================================

alter table public.enquiries alter column name drop not null;
alter table public.enquiries alter column phone drop not null;

-- Which button, and on which page. `null` for the contact form, which has a
-- page of its own and does not need saying.
alter table public.enquiries add column if not exists source text;

comment on column public.enquiries.source is
  'Where the chat was opened from, for rows with no name - the contact form leaves it null.';

-- The desk works the named ones first, so they have to be cheap to find.
create index if not exists enquiries_named_idx
  on public.enquiries (created_at desc) where name is not null;
