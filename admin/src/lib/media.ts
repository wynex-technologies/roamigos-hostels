import { useCallback, useRef } from 'react'
import { supabase, url as projectUrl } from './supabase'

/**
 * Image uploads, and the cost of them.
 *
 * Every photograph the desk uploads is served from Supabase to every visitor
 * who loads the page it is on, and that traffic is billed. This module exists
 * to make that number small enough to stop being a problem, because the panel
 * cannot be trusted to only ever be handed a well-prepared file - it is handed
 * whatever came off somebody's phone.
 *
 * So nothing is uploaded as it arrives:
 *
 *   - It is drawn into a canvas and scaled down to a 2000px long edge, which is
 *     larger than any slot on the site renders at.
 *   - It is re-encoded as WebP at quality 0.82. A 4MB JPEG off a phone comes
 *     out somewhere around 200KB, which is the entire ballgame - a tenth of the
 *     bytes is a tenth of the bill.
 *   - It is named after the SHA-256 of the encoded bytes and uploaded with a
 *     one-year immutable cache header. A returning visitor re-downloads
 *     nothing, and the same photograph uploaded twice is stored once.
 *
 * The bucket is public, so the site fetches these the way it fetches an
 * Unsplash URL: no key, no session, no PostgREST. Writing is admin-only, and
 * `20260830000004_media_storage.sql` has the policies.
 */

const BUCKET = 'media'

/** Larger than any slot on the site, and small enough to stay cheap. */
const MAX_EDGE = 2000

/** WebP at this quality is visually clean on photographs and roughly a tenth
    the size of the JPEG that went in. */
const QUALITY = 0.82

/** The server refuses more than this too - see the bucket's file_size_limit. */
export const MAX_INPUT_BYTES = 15 * 1024 * 1024

export const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'

/** Where an image belongs, which is only used to keep the bucket browsable. */
export type MediaFolder = 'rooms' | 'journal' | 'offer' | 'pages'

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** The public prefix for this project's bucket, so an uploaded image can be
    told apart from an Unsplash id or somebody else's CDN. */
const publicPrefix = () => `${projectUrl}/storage/v1/object/public/${BUCKET}/`

/**
 * True only for a URL this panel uploaded and is therefore allowed to delete.
 * An Unsplash id or a link to another host is somebody else's file, and
 * clearing that field must never try to remove anything.
 */
export const isManaged = (value: string) =>
  Boolean(value) && value.startsWith(publicPrefix())

const pathFromUrl = (value: string) =>
  isManaged(value) ? decodeURIComponent(value.slice(publicPrefix().length).split('?')[0]) : null

/* --------------------------------------------------------------- encoding --- */

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((done, fail) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      done(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      fail(new Error('That file could not be read as an image.'))
    }
    image.src = objectUrl
  })
}

function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((done, fail) => {
    canvas.toBlob(
      (blob) => (blob ? done(blob) : fail(new Error('The image could not be encoded.'))),
      'image/webp',
      QUALITY,
    )
  })
}

async function sha256(blob: Blob) {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export interface Prepared {
  blob: Blob
  width: number
  height: number
  /** What the file weighed before any of this happened, for the panel to show. */
  originalBytes: number
}

/**
 * Downscale and re-encode, in the browser, before a single byte is uploaded.
 *
 * Deliberately not a hard limit on the incoming dimensions: the desk should be
 * able to upload whatever photograph it has, and the panel's job is to make it
 * cheap rather than to refuse it. The dimension note beside each field is
 * guidance for how the picture will be cropped, not a rule.
 */
export async function prepare(file: File): Promise<Prepared> {
  if (!file.type.startsWith('image/')) throw new Error('That is not an image file.')
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(`That image is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_INPUT_BYTES)}.`)
  }

  const image = await loadImage(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.round(image.naturalWidth * scale)
  const height = Math.round(image.naturalHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot process images.')
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)

  return { blob: await toBlob(canvas), width, height, originalBytes: file.size }
}

/* ---------------------------------------------------------------- storage --- */

export interface Uploaded extends Prepared {
  url: string
}

export async function upload(file: File, folder: MediaFolder): Promise<Uploaded> {
  const prepared = await prepare(file)
  const path = `${folder}/${await sha256(prepared.blob)}.webp`

  const { error } = await supabase.storage.from(BUCKET).upload(path, prepared.blob, {
    contentType: 'image/webp',
    // A year, immutable. The name is the hash of the bytes, so the file at this
    // path can never be different bytes and a revalidation would be wasted.
    cacheControl: '31536000',
    // Same bytes, same name: an upload of a photograph already in the bucket is
    // a no-op rather than a duplicate.
    upsert: true,
  })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { ...prepared, url: data.publicUrl }
}

/** Best effort, and quiet. A file that will not delete is a bucket with one
    stray object in it; an error dialog here would be about nothing the person
    saving a room can act on. */
export async function remove(values: string[]) {
  const paths = values.map(pathFromUrl).filter((path): path is string => Boolean(path))
  if (!paths.length) return
  await supabase.storage.from(BUCKET).remove(paths)
}

/* ---------------------------------------------------------------- cleanup --- */

/**
 * Which objects to delete, and when.
 *
 * Deleting the moment somebody clears a field is wrong: they might press Back
 * instead of Save, and the row would still point at a file that no longer
 * exists. Uploading and never deleting is also wrong - the bucket fills with
 * photographs nothing references.
 *
 * So both directions are tracked and settled at the end of the edit:
 *
 *   Save    the images this edit removed are deleted, because the row no
 *           longer points at them.
 *   Cancel  the images this edit uploaded are deleted, because nothing ever
 *           pointed at them.
 *
 * Delete a whole row and everything it referenced goes with it, which is what
 * `purge` is for.
 */
export function useMediaCleanup() {
  const uploaded = useRef<string[]>([])
  const removed = useRef<string[]>([])

  const trackUpload = useCallback((value: string) => {
    if (isManaged(value)) uploaded.current.push(value)
  }, [])

  const trackRemoval = useCallback((value: string) => {
    if (!isManaged(value)) return
    // An image uploaded and then removed inside the same edit never reached the
    // row at all, so it is simply an upload to undo.
    const pending = uploaded.current.indexOf(value)
    if (pending >= 0) {
      uploaded.current.splice(pending, 1)
      void remove([value])
      return
    }
    removed.current.push(value)
  }, [])

  /** After a successful save. */
  const commit = useCallback(async () => {
    const doomed = removed.current
    uploaded.current = []
    removed.current = []
    await remove(doomed)
  }, [])

  /** After Back, or a failed save that is being abandoned. */
  const discard = useCallback(async () => {
    const doomed = uploaded.current
    uploaded.current = []
    removed.current = []
    await remove(doomed)
  }, [])

  /** Everything a deleted row referenced. */
  const purge = useCallback(async (values: string[]) => {
    uploaded.current = []
    removed.current = []
    await remove(values)
  }, [])

  return { trackUpload, trackRemoval, commit, discard, purge }
}
