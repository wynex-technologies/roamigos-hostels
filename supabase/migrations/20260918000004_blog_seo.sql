-- A post gets its own search listing, and its photograph gets a description.
--
-- Until now the title on a post's page was the headline with " - The Journal"
-- after it, and the description was the standfirst. Both are reasonable
-- defaults and neither is what somebody writing for search wants: a headline is
-- written to be read on the page, and a meta title is written to be clicked in
-- a result. So the desk can write the second one, and the first stays as the
-- fallback for every post nobody has bothered to.
--
-- `image_alt` is the photograph described in words. Empty is a legitimate
-- answer - a purely decorative image should have an empty alt rather than a
-- sentence a screen reader has to read out - so this is nullable and the site
-- treats null and '' the same way.
alter table public.blog_posts
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists image_alt text;

comment on column public.blog_posts.meta_title is
  'Title for search results and share cards. Falls back to the headline.';
comment on column public.blog_posts.meta_description is
  'Description for search results and share cards. Falls back to the standfirst.';
comment on column public.blog_posts.image_alt is
  'The post image described in words. Empty means decorative.';
