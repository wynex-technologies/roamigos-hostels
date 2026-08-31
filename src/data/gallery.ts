/**
 * Gallery types, for the components that only need to name a shape.
 *
 * The photographs themselves moved into the About page document - they are
 * content the front desk edits, and the shipped copy of them lives beside the
 * rest of that document in `shared/page-content.ts`. Read them through
 * `aboutPage.wall` in `@/data/pages`; this module is the type home so a
 * component that just wants `GalleryShot` does not have to reach across into
 * `shared/`.
 */

export type { AlbumKey, GalleryAlbum, GalleryShot } from '@shared/page-content'
