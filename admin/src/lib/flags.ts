/**
 * Screens that are built but not open yet.
 *
 * A flag rather than commented-out code or a deleted route: the screen keeps
 * compiling, keeps type-checking against the shape it edits, and keeps moving
 * with the rest of the panel. Flipping one constant is the whole unlock.
 */

/**
 * Page settings - the Home and About copy.
 *
 * Locked while the wording on those two pages is still being settled. The
 * screen itself is finished and the `page_content` rows exist; what is not
 * settled is whether the desk should be rewriting the homepage yet. Set this to
 * `false` to put it back in the nav.
 *
 * Locking hides the link *and* answers the route, because a hidden link is not
 * a lock - anybody who has been on the screen once has the URL.
 */
export const PAGE_SETTINGS_LOCKED = true
