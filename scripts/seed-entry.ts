/**
 * Everything `seed-supabase.mjs` needs, in one entry point for esbuild to
 * bundle. It exists so the seed reads the real data modules rather than a
 * hand-copied snapshot of them that would go stale immediately.
 */
export { site } from '../src/data/site'
export { rooms, reviews } from '../src/data/rooms'
// The shipped copy, not the resolved one - see the note on it in `blog.ts`.
export { shippedPosts as blogPosts } from '../src/data/blog'
export { contactFaqs } from '../src/data/contact'
export { offer } from '../src/data/offer'
