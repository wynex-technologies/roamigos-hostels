import { useEffect, useState } from 'react'
import { Lock, Save } from 'lucide-react'
import {
  ABOUT_DEFAULTS,
  HOME_DEFAULTS,
  mergePage,
  type AboutContent,
  type HomeContent,
} from '@shared/page-content'
import { supabase } from '@/lib/supabase'
import { PAGE_SETTINGS_LOCKED } from '@/lib/flags'
import { useMediaCleanup } from '@/lib/media'
import { Button, Card, ErrorNote, Loading, PageHeader, cn } from '@/components/ui'
import { HomePageForm } from '@/components/HomePageForm'
import { AboutPageForm } from '@/components/AboutPageForm'

/**
 * The words and photographs on the Home and About pages.
 *
 * Everything else in this panel edits a list of things - rooms, posts, coupons.
 * This edits two *pages*: the line over a section, the two lines of its
 * heading, the paragraph beside it, the pictures in it. Which is the whole
 * point of it existing: until now changing "Travel More. Pay Less." meant a
 * developer and a deploy.
 *
 * **It cannot change how anything looks.** There is no colour, size, spacing or
 * font in the document it writes - only copy and image references. A heading is
 * stored as the pieces the site already sets differently, so the desk can
 * rewrite the words without being able to disturb the type. That is deliberate
 * and it is why this screen is safe to hand over.
 *
 * The shape and the shipped copy come from `shared/page-content.ts`, the same
 * module the site renders through. The form is filled from those defaults deep
 * merged with whatever the row holds, and Save writes the merged document back
 * whole - so a field this screen does not draw an input for (a crop hint, a
 * card's key) survives untouched, and a page nobody has edited yet stays
 * exactly as the site shipped it.
 *
 * Both pages are saved together. Editing Home, switching tab, editing About and
 * pressing Save once is the obvious thing to do, and losing half of it would be
 * the panel being clever at the desk's expense.
 */
export default function PageSettings() {
  if (PAGE_SETTINGS_LOCKED) return <Locked />
  return <PageSettingsForm />
}

/**
 * The screen while it is closed.
 *
 * The route answers rather than the link simply being absent: hiding a nav item
 * is not a lock, and anybody who has been on this screen once still has the
 * URL. It says which page it is and how it comes back, so finding it locked is
 * not mistaken for the panel being broken.
 */
function Locked() {
  return (
    <>
      <PageHeader title="Page settings" />
      <Card className="max-w-lg text-center">
        <Lock className="mx-auto size-7 text-mustard" />
        <h2 className="mt-4 font-display text-lg font-semibold">Not open yet</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The Home and About copy is edited here, and this screen is finished - it is closed while
          the wording on those two pages is still being settled. Nothing on the live site is
          affected either way.
        </p>
      </Card>
    </>
  )
}

function PageSettingsForm() {
  const [tab, setTab] = useState<'home' | 'about'>('home')
  const [home, setHome] = useState<HomeContent | null>(null)
  const [about, setAbout] = useState<AboutContent | null>(null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const media = useMediaCleanup()

  useEffect(() => {
    supabase
      .from('page_content')
      .select('page,data')
      .then(({ data, error: failure }) => {
        if (failure) {
          setError(failure.message)
          return
        }
        const rows = Object.fromEntries(
          (data ?? []).map((row) => [row.page as string, row.data as unknown]),
        )
        setHome(mergePage(HOME_DEFAULTS, rows.home))
        setAbout(mergePage(ABOUT_DEFAULTS, rows.about))
      })
  }, [])

  async function save() {
    if (!home || !about) return
    setBusy(true)
    setError('')
    setSaved(false)

    const stamp = new Date().toISOString()
    const { error: failure } = await supabase.from('page_content').upsert([
      { page: 'home', data: home, updated_at: stamp },
      { page: 'about', data: about, updated_at: stamp },
    ])

    setBusy(false)
    if (failure) {
      setError(failure.message)
      return
    }

    // The row no longer points at whatever this edit replaced, so those objects
    // can go. Never before Save - until then Back is still on the table.
    await media.commit()
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
  }

  if (error && !home) return <ErrorNote error={error} />
  if (!home || !about) return <Loading />

  return (
    <>
      <PageHeader
        title="Page settings"
        note="The copy and photographs on the Home and About pages. Goes live on the next publish."
        actions={
          <>
            {saved && (
              <span className="self-center text-[0.8125rem] font-medium text-green-deep dark:text-green">
                Saved
              </span>
            )}
            <Button busy={busy} onClick={save}>
              <Save className="size-4" />
              Save
            </Button>
          </>
        }
      />

      {error && <ErrorNote error={error} />}

      {/* Two pages, same control language as the rooms filter rail on the site. */}
      <div className="mb-6 flex gap-2.5">
        {(['home', 'about'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={cn(
              'rounded-full border px-5 py-2 text-sm font-semibold transition-colors',
              tab === key
                ? 'border-primary bg-primary text-on-primary'
                : 'border-line text-body hover:border-line-strong hover:bg-surface-2',
            )}
          >
            {key === 'home' ? 'Home' : 'About'}
          </button>
        ))}
      </div>

      {/* Both forms stay mounted, so switching tab never drops an unsaved edit
          and never re-runs an image field's state. */}
      <div className={tab === 'home' ? '' : 'hidden'}>
        <HomePageForm value={home} onChange={setHome} media={media} />
      </div>
      <div className={tab === 'about' ? '' : 'hidden'}>
        <AboutPageForm value={about} onChange={setAbout} media={media} />
      </div>
    </>
  )
}
