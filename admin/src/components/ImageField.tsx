import { useId, useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { ACCEPT, formatBytes, isManaged, upload, type MediaFolder } from '@/lib/media'
import { cn } from './ui'

/**
 * An image field, with the file picker where the URL box used to be.
 *
 * Two things are worth knowing about how this behaves.
 *
 * **The dimensions under it are a note, not a rule.** Every slot on the site
 * crops to its own aspect, so knowing what will survive the crop is genuinely
 * useful - but a photograph that does not match is still accepted and still
 * uploaded. Refusing somebody's only picture of a room because it is 3:2
 * instead of 4:3 would be the panel getting in the way of the work.
 *
 * **Removing does not delete immediately.** It clears the field and reports the
 * old value upward; the object is deleted when the record is saved, because
 * until then Back is still on the table. See `useMediaCleanup`.
 *
 * A field that already holds an Unsplash id or somebody else's URL keeps
 * working and says so - those cost nothing to serve and there is no reason to
 * make anybody re-upload one.
 */
export function ImageField({
  label,
  value,
  onChange,
  folder,
  dimensions,
  note,
  onUploaded,
  onRemoved,
  aspect = 'aspect-16/10',
}: {
  label: string
  value: string
  onChange: (next: string) => void
  folder: MediaFolder
  /** Printed under the picker, e.g. "1600 x 1000". Guidance only. */
  dimensions: string
  /** One line on where the image is used and how it is cropped. */
  note?: string
  onUploaded?: (url: string) => void
  onRemoved?: (url: string) => void
  aspect?: string
}) {
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [dragging, setDragging] = useState(false)

  async function take(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    setSaved('')

    try {
      const result = await upload(file, folder)
      // The old file is only orphaned once the new one is in, so this order
      // matters: a failed upload must leave the field exactly as it was.
      if (value) onRemoved?.(value)
      onChange(result.url)
      onUploaded?.(result.url)
      setSaved(
        `${result.width} x ${result.height}, ${formatBytes(result.blob.size)}` +
          (result.originalBytes > result.blob.size
            ? ` (down from ${formatBytes(result.originalBytes)})`
            : ''),
      )
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'That image could not be uploaded.')
    }

    setBusy(false)
    if (input.current) input.current.value = ''
  }

  function clear() {
    if (value) onRemoved?.(value)
    onChange('')
    setSaved('')
    setError('')
  }

  return (
    <div>
      <span className="mb-1.5 block text-[0.6875rem] font-bold tracking-[0.12em] text-muted uppercase">
        {label}
      </span>

      {value ? (
        <div className="flex flex-wrap items-start gap-4">
          <span
            className={cn(
              'relative w-40 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2',
              aspect,
            )}
          >
            <img src={value} alt="" className="size-full object-cover" />
          </span>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <label
                htmlFor={inputId}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2',
                  'text-sm font-semibold text-heading transition-colors hover:border-line-strong hover:bg-surface-2',
                  busy && 'pointer-events-none opacity-45',
                )}
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {busy ? 'Uploading' : 'Replace'}
              </label>
              <button
                type="button"
                onClick={clear}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full border border-maroon/40 px-4 py-2 text-sm font-semibold text-maroon transition-colors hover:bg-maroon/10 disabled:opacity-45"
              >
                <Trash2 className="size-4" />
                Remove
              </button>
            </div>

            {!isManaged(value) && (
              <p className="text-[0.75rem] leading-relaxed text-muted">
                This one is hosted elsewhere - an Unsplash id or another CDN. It costs nothing to
                serve, so there is no need to replace it unless you want a different picture.
              </p>
            )}
            {saved && <p className="text-[0.75rem] text-green-deep dark:text-green">{saved}</p>}
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            void take(event.dataTransfer.files[0])
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-9 text-center transition-colors',
            dragging ? 'border-primary bg-primary/5' : 'border-line hover:border-line-strong',
            busy && 'pointer-events-none opacity-60',
          )}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin text-muted" />
          ) : (
            <ImagePlus className="size-5 text-muted" />
          )}
          <span className="text-sm font-semibold text-heading">
            {busy ? 'Uploading' : 'Choose an image, or drop one here'}
          </span>
          <span className="text-[0.75rem] text-muted">JPEG, PNG or WebP</span>
        </label>
      )}

      <input
        id={inputId}
        ref={input}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(event) => void take(event.target.files?.[0])}
      />

      <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
        <span className="font-semibold text-heading">Best at {dimensions}.</span>{' '}
        {note ? `${note} ` : ''}
        Any size is accepted - this is a guide, not a limit. Large files are resized and
        converted to WebP before upload, so nothing here slows the site down.
      </p>

      {error && <p className="mt-2 text-[0.8125rem] font-medium text-maroon">{error}</p>}
    </div>
  )
}
