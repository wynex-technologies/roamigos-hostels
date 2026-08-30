import { useId, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { ACCEPT, formatBytes, isManaged, upload, type MediaFolder } from '@/lib/media'
import { cn } from './ui'

/**
 * A gallery field: several images, in an order that matters.
 *
 * The order is the order they appear on the site, and the first one is the
 * cover - so the arrows are not a nicety, they are how somebody chooses which
 * photograph of a room is the one people see in the listing. That is said on
 * the first tile rather than left to be discovered.
 *
 * Several files can be picked at once. They upload one after another rather
 * than all at once, because each one is being decoded and re-encoded in the
 * browser and running six of those in parallel on a desk machine is how the
 * panel locks up for ten seconds.
 *
 * Like `ImageField`, removing a tile does not delete the object - it reports it
 * upward, and the record's Save is what settles it.
 */
export function ImageListField({
  label,
  values,
  onChange,
  folder,
  dimensions,
  note,
  onUploaded,
  onRemoved,
}: {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  folder: MediaFolder
  dimensions: string
  note?: string
  onUploaded?: (url: string) => void
  onRemoved?: (url: string) => void
}) {
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(0)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [dragging, setDragging] = useState(false)

  async function take(files: FileList | null) {
    if (!files?.length) return
    setError('')
    setSaved('')

    const list = Array.from(files)
    const added: string[] = []
    let bytes = 0

    for (const [index, file] of list.entries()) {
      setBusy(list.length - index)
      try {
        const result = await upload(file, folder)
        added.push(result.url)
        onUploaded?.(result.url)
        bytes += result.blob.size
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : 'That image could not be uploaded.')
        break
      }
    }

    setBusy(0)
    if (input.current) input.current.value = ''

    if (added.length) {
      // Duplicates are dropped: the object name is the hash of the bytes, so
      // the same photograph picked twice is the same URL, and the gallery
      // should not print it twice.
      onChange([...values, ...added.filter((url) => !values.includes(url))])
      setSaved(`${added.length} added, ${formatBytes(bytes)} in total`)
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= values.length) return
    const next = [...values]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  const drop = (index: number) => {
    const value = values[index]
    onRemoved?.(value)
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[0.6875rem] font-bold tracking-[0.12em] text-muted uppercase">
          {label}
        </span>
        <span className="text-[0.75rem] text-muted">
          {values.length} {values.length === 1 ? 'image' : 'images'}
        </span>
      </div>

      {values.length > 0 && (
        <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {values.map((value, index) => (
            <li
              key={value}
              className="group relative overflow-hidden rounded-xl border border-line bg-surface-2"
            >
              <span className="block aspect-4/3">
                <img src={value} alt="" className="size-full object-cover" />
              </span>

              {index === 0 && (
                <span className="absolute top-2 left-2 rounded-full bg-ink/75 px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-white uppercase">
                  Cover
                </span>
              )}

              {!isManaged(value) && (
                <span className="absolute top-2 right-2 rounded-full bg-ink/75 px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-white uppercase">
                  Linked
                </span>
              )}

              <div className="flex items-center justify-between gap-1 border-t border-line bg-surface px-1.5 py-1.5">
                <span className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Move earlier"
                    className="grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-heading disabled:opacity-30"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === values.length - 1}
                    aria-label="Move later"
                    className="grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-heading disabled:opacity-30"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => drop(index)}
                  aria-label="Remove this image"
                  className="grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-maroon/10 hover:text-maroon"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

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
          void take(event.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-7 text-center transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-line hover:border-line-strong',
          busy > 0 && 'pointer-events-none opacity-60',
        )}
      >
        {busy > 0 ? (
          <Loader2 className="size-5 animate-spin text-muted" />
        ) : (
          <ImagePlus className="size-5 text-muted" />
        )}
        <span className="text-sm font-semibold text-heading">
          {busy > 0
            ? `Uploading, ${busy} to go`
            : 'Add images, or drop them here'}
        </span>
        <span className="text-[0.75rem] text-muted">Several at once is fine</span>
      </label>

      <input
        id={inputId}
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(event) => void take(event.target.files)}
      />

      <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
        <span className="font-semibold text-heading">Best at {dimensions}.</span>{' '}
        {note ? `${note} ` : ''}
        Any size is accepted - this is a guide, not a limit. The first image is the cover; use
        the arrows to reorder.
      </p>

      {saved && <p className="mt-2 text-[0.75rem] text-green-deep dark:text-green">{saved}</p>}
      {error && <p className="mt-2 text-[0.8125rem] font-medium text-maroon">{error}</p>}
    </div>
  )
}
