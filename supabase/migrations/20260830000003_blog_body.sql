-- ============================================================================
-- The journal gets article pages.
--
-- Until now `blog_posts` held everything a *card* needs - headline, standfirst,
-- photograph - because the journal page printed cards and nothing else. The
-- slug was stored for a page that did not exist yet.
--
-- `body` is that page. It is the article itself, written in the small markdown
-- subset the site renders: `## ` for a heading, `- ` for a list item, `> ` for
-- a pulled quote, a blank line between paragraphs, `**bold**` inline.
--
-- It defaults to empty rather than being required, because every row that
-- already exists has no body and a NOT NULL with no default would refuse to
-- add the column at all. A post with an empty body still lists on the journal;
-- it simply has no page to open, and the site links accordingly.
-- ============================================================================

alter table public.blog_posts
  add column if not exists body text not null default '';

comment on column public.blog_posts.body is
  'The article, in the site''s markdown subset. Empty means the post is a card only, with no page of its own.';
