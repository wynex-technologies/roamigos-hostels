import { ABOUT_DEFAULTS, type AboutContent, type AlbumKey } from '@shared/page-content'
import type { useMediaCleanup } from '@/lib/media'
import { ImageField } from './ImageField'
import { Paragraphs, Repeater, SectionCard } from './PageFields'
import { Area, Field, Select, Text } from './ui'

type Media = ReturnType<typeof useMediaCleanup>

/**
 * The about page, section by section, in the order a visitor scrolls them.
 *
 * The one part of this page the panel does not offer is the strip of four
 * figures under the opening statement - the room count, the guests hosted, the
 * rating. Every one of those is derived from the room list and the Settings
 * row, deliberately, so the page cannot drift away from the footer and the
 * homepage. Change the rating in Settings and it changes here.
 *
 * Only copy and pictures. Nothing here can change a colour, a size or a face.
 */
export function AboutPageForm({
  value,
  onChange,
  media,
}: {
  value: AboutContent
  onChange: (next: AboutContent) => void
  media: Media
}) {
  const set = <K extends keyof AboutContent>(key: K, next: AboutContent[K]) =>
    onChange({ ...value, [key]: next })

  const hero = value.hero
  const setHero = (patch: Partial<AboutContent['hero']>) => set('hero', { ...hero, ...patch })

  const intro = value.intro
  const wall = value.wall
  const day = value.day
  const guests = value.guests
  const cta = value.cta

  const image = {
    folder: 'pages' as const,
    onUploaded: media.trackUpload,
    onRemoved: media.trackRemoval,
  }

  /** Every album except "Everything", which is the filter rather than a shelf. */
  const albumKeys = wall.albums.filter((album) => album.key !== 'all')

  return (
    <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
      {/* ------------------------------------------------------------ hero -- */}
      <SectionCard
        title="The corkboard"
        note="The pinned hero. Each piece is placed by hand, so they are listed here by what they are rather than as a gallery."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Chip" hint="The small lozenge at the top.">
            <Text value={hero.chip} onChange={(e) => setHero({ chip: e.target.value })} />
          </Field>
          <Field label="Handwritten line">
            <Text value={hero.script} onChange={(e) => setHero({ script: e.target.value })} />
          </Field>
          <Field label="Heading, first line">
            <Text
              value={hero.heading[0]}
              onChange={(e) => setHero({ heading: [e.target.value, hero.heading[1]] })}
            />
          </Field>
          <Field label="Heading, second line">
            <Text
              value={hero.heading[1]}
              onChange={(e) => setHero({ heading: [hero.heading[0], e.target.value] })}
            />
          </Field>
        </div>

        <Field label="Paragraph">
          <Area rows={3} value={hero.copy} onChange={(e) => setHero({ copy: e.target.value })} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Button">
            <Text value={hero.cta} onChange={(e) => setHero({ cta: e.target.value })} />
          </Field>
          <Field label="Line under the button">
            <Text value={hero.meta} onChange={(e) => setHero({ meta: e.target.value })} />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] font-semibold text-heading">The trail shot</p>
          <ImageField
            label="Photograph"
            value={hero.traveller.img}
            onChange={(img) => setHero({ traveller: { ...hero.traveller, img } })}
            dimensions="900 x 1200"
            note="Bleeds off the left edge. No caption - it is the mood, not a picture of a thing."
            aspect="aspect-3/4"
            {...image}
          />
          <Field label="Description" hint="For anyone who cannot see it.">
            <Text
              value={hero.traveller.alt}
              onChange={(e) => setHero({ traveller: { ...hero.traveller, alt: e.target.value } })}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] font-semibold text-heading">The polaroid</p>
          <ImageField
            label="Photograph"
            value={hero.polaroid.img}
            onChange={(img) => setHero({ polaroid: { ...hero.polaroid, img } })}
            dimensions="1000 x 1000"
            aspect="aspect-square"
            {...image}
          />
          <Field label="Caption">
            <Text
              value={hero.polaroid.name}
              onChange={(e) => setHero({ polaroid: { ...hero.polaroid, name: e.target.value } })}
            />
          </Field>
          <Field label="Second line">
            <Text
              value={hero.polaroid.line}
              onChange={(e) => setHero({ polaroid: { ...hero.polaroid, line: e.target.value } })}
            />
          </Field>
          <Field label="Place">
            <Text
              value={hero.polaroid.tag}
              onChange={(e) => setHero({ polaroid: { ...hero.polaroid, tag: e.target.value } })}
            />
          </Field>
          <Field label="Description">
            <Text
              value={hero.polaroid.alt}
              onChange={(e) => setHero({ polaroid: { ...hero.polaroid, alt: e.target.value } })}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] font-semibold text-heading">The round shot and the count</p>
          <ImageField
            label="Photograph"
            value={hero.round.img}
            onChange={(img) => setHero({ round: { ...hero.round, img } })}
            dimensions="800 x 800"
            aspect="aspect-square"
            {...image}
          />
          <Field label="Description">
            <Text
              value={hero.round.alt}
              onChange={(e) => setHero({ round: { ...hero.round, alt: e.target.value } })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <Field label="Figure">
              <Text
                value={hero.stat.value}
                onChange={(e) => setHero({ stat: { ...hero.stat, value: e.target.value } })}
              />
            </Field>
            <Field label="Label">
              <Text
                value={hero.stat.label}
                onChange={(e) => setHero({ stat: { ...hero.stat, label: e.target.value } })}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] font-semibold text-heading">The magazine clipping</p>
          <ImageField
            label="Photograph"
            value={hero.clipping.img}
            onChange={(img) => setHero({ clipping: { ...hero.clipping, img } })}
            dimensions="1200 x 800"
            {...image}
          />
          <Field label="Caption">
            <Text
              value={hero.clipping.name}
              onChange={(e) => setHero({ clipping: { ...hero.clipping, name: e.target.value } })}
            />
          </Field>
          <Field label="Second line">
            <Text
              value={hero.clipping.line}
              onChange={(e) => setHero({ clipping: { ...hero.clipping, line: e.target.value } })}
            />
          </Field>
          <Field label="Place">
            <Text
              value={hero.clipping.tag}
              onChange={(e) => setHero({ clipping: { ...hero.clipping, tag: e.target.value } })}
            />
          </Field>
          <Field label="Description">
            <Text
              value={hero.clipping.alt}
              onChange={(e) => setHero({ clipping: { ...hero.clipping, alt: e.target.value } })}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] font-semibold text-heading">The stamp</p>
          <ImageField
            label="Photograph"
            value={hero.stamp.img}
            onChange={(img) => setHero({ stamp: { ...hero.stamp, img } })}
            dimensions="600 x 700"
            aspect="aspect-square"
            {...image}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Note">
              <Text
                value={hero.stamp.note}
                onChange={(e) => setHero({ stamp: { ...hero.stamp, note: e.target.value } })}
              />
            </Field>
            <Field label="Place">
              <Text
                value={hero.stamp.place}
                onChange={(e) => setHero({ stamp: { ...hero.stamp, place: e.target.value } })}
              />
            </Field>
            <Field label="Coordinates">
              <Text
                value={hero.stamp.coord}
                onChange={(e) => setHero({ stamp: { ...hero.stamp, coord: e.target.value } })}
              />
            </Field>
          </div>
          <Field label="Description">
            <Text
              value={hero.stamp.alt}
              onChange={(e) => setHero({ stamp: { ...hero.stamp, alt: e.target.value } })}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] font-semibold text-heading">The boarding pass</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From" hint="Airport code, e.g. GAU.">
              <Text
                value={hero.pass.from}
                onChange={(e) => setHero({ pass: { ...hero.pass, from: e.target.value } })}
              />
            </Field>
            <Field label="To">
              <Text
                value={hero.pass.to}
                onChange={(e) => setHero({ pass: { ...hero.pass, to: e.target.value } })}
              />
            </Field>
            <Field label="Seat">
              <Text
                value={hero.pass.seat}
                onChange={(e) => setHero({ pass: { ...hero.pass, seat: e.target.value } })}
              />
            </Field>
            <Field label="Gate">
              <Text
                value={hero.pass.gate}
                onChange={(e) => setHero({ pass: { ...hero.pass, gate: e.target.value } })}
              />
            </Field>
          </div>
          <Field label="Route">
            <Text
              value={hero.pass.route}
              onChange={(e) => setHero({ pass: { ...hero.pass, route: e.target.value } })}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] font-semibold text-heading">The film still</p>
          <ImageField
            label="Photograph"
            value={hero.reel.img}
            onChange={(img) => setHero({ reel: { ...hero.reel, img } })}
            dimensions="1400 x 800"
            {...image}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Place">
              <Text
                value={hero.reel.place}
                onChange={(e) => setHero({ reel: { ...hero.reel, place: e.target.value } })}
              />
            </Field>
            <Field label="Length">
              <Text
                value={hero.reel.length}
                onChange={(e) => setHero({ reel: { ...hero.reel, length: e.target.value } })}
              />
            </Field>
          </div>
          <Field label="Description">
            <Text
              value={hero.reel.alt}
              onChange={(e) => setHero({ reel: { ...hero.reel, alt: e.target.value } })}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ----------------------------------------------------------- intro -- */}
      <SectionCard
        title="Who we are"
        note="The opening statement and the plate beside it. The four figures under it are worked out from the rooms and the Settings screen, so they are not editable here."
      >
        <Field label="Eyebrow">
          <Text value={intro.eyebrow} onChange={(e) => set('intro', { ...intro, eyebrow: e.target.value })} />
        </Field>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] leading-relaxed text-muted">
            The opening sentence is two pieces: the first clause is printed in maroon and the rest
            carries in heading colour. Mind the space at the start of the second box.
          </p>
          <Field label="Opening clause">
            <Text
              value={intro.leadAccent}
              onChange={(e) => set('intro', { ...intro, leadAccent: e.target.value })}
            />
          </Field>
          <Field label="The rest of the sentence" hint="Usually starts with a space.">
            <Area
              rows={2}
              value={intro.leadRest}
              onChange={(e) => set('intro', { ...intro, leadRest: e.target.value })}
            />
          </Field>
        </div>

        <Paragraphs
          label="Body"
          value={intro.body}
          onChange={(body) => set('intro', { ...intro, body })}
          rows={9}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Signed off by">
            <Text
              value={intro.signoffBy}
              onChange={(e) => set('intro', { ...intro, signoffBy: e.target.value })}
            />
          </Field>
          <Field label="Place">
            <Text
              value={intro.signoffPlace}
              onChange={(e) => set('intro', { ...intro, signoffPlace: e.target.value })}
            />
          </Field>
        </div>

        <ImageField
          label="The plate"
          value={intro.image}
          onChange={(next) => set('intro', { ...intro, image: next })}
          dimensions="900 x 1200"
          note="A common room, not a bed - this one is the house."
          aspect="aspect-3/4"
          {...image}
        />

        <Field label="Description" hint="For anyone who cannot see it.">
          <Text
            value={intro.imageAlt}
            onChange={(e) => set('intro', { ...intro, imageAlt: e.target.value })}
          />
        </Field>
      </SectionCard>

      {/* ------------------------------------------------------------ wall -- */}
      <SectionCard
        title="The wall"
        note="The album chips and every photograph behind them. The footprint decides how big a tile is - keep the mix varied or the wall reads as a grid."
      >
        <Field label="Eyebrow">
          <Text value={wall.eyebrow} onChange={(e) => set('wall', { ...wall, eyebrow: e.target.value })} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Heading, first line">
            <Text
              value={wall.titleLine1}
              onChange={(e) => set('wall', { ...wall, titleLine1: e.target.value })}
            />
          </Field>
          <Field label="Heading, second line">
            <Text
              value={wall.titleLine2}
              onChange={(e) => set('wall', { ...wall, titleLine2: e.target.value })}
            />
          </Field>
          <Field label="Last word" hint="Carries the brush stroke.">
            <Text
              value={wall.underline}
              onChange={(e) => set('wall', { ...wall, underline: e.target.value })}
            />
          </Field>
        </div>

        <Repeater
          label="Albums"
          hint="The chips above the wall. The first one is the everything filter - the rest are the shelves a photograph can be filed under."
          items={wall.albums}
          onChange={(albums) => set('wall', { ...wall, albums })}
          title={(album) => album.label}
        >
          {(album, setAlbum) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Label">
                  <Text
                    value={album.label}
                    onChange={(e) => setAlbum({ ...album, label: e.target.value })}
                  />
                </Field>
                <Field label="Key" hint="What a photograph is filed under. Changing it re-files nothing.">
                  <Text value={album.key} disabled readOnly />
                </Field>
              </div>
              <Field label="Note" hint="Printed under the heading while this album is showing.">
                <Text
                  value={album.note}
                  onChange={(e) => setAlbum({ ...album, note: e.target.value })}
                />
              </Field>
            </>
          )}
        </Repeater>

        <Repeater
          label="Photographs"
          items={wall.shots}
          onChange={(shots) => set('wall', { ...wall, shots })}
          title={(shot) => shot.caption}
          blank={() => ({ ...ABOUT_DEFAULTS.wall.shots[0], id: '', caption: '', place: '' })}
          addLabel="Add a photograph"
        >
          {(shot, setShot) => (
            <>
              <ImageField
                label="Photograph"
                value={shot.id}
                onChange={(id) => setShot({ ...shot, id })}
                dimensions="1400 x 1000"
                {...image}
              />
              <Field label="Caption">
                <Text
                  value={shot.caption}
                  onChange={(e) => setShot({ ...shot, caption: e.target.value })}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Place">
                  <Text
                    value={shot.place}
                    onChange={(e) => setShot({ ...shot, place: e.target.value })}
                  />
                </Field>
                <Field label="Album">
                  <Select
                    value={shot.album}
                    onChange={(e) => setShot({ ...shot, album: e.target.value as AlbumKey })}
                  >
                    {albumKeys.map((album) => (
                      <option key={album.key} value={album.key}>
                        {album.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Footprint" hint="How big the tile is.">
                  <Select
                    value={shot.span}
                    onChange={(e) =>
                      setShot({ ...shot, span: e.target.value as typeof shot.span })
                    }
                  >
                    <option value="square">Square</option>
                    <option value="tall">Tall</option>
                    <option value="wide">Wide</option>
                  </Select>
                </Field>
              </div>
            </>
          )}
        </Repeater>
      </SectionCard>

      {/* ------------------------------------------------------------- day -- */}
      <SectionCard
        title="One ordinary day"
        note="Four moments on a timeline, dropped alternately above and below the rule."
      >
        <Field label="Eyebrow">
          <Text value={day.eyebrow} onChange={(e) => set('day', { ...day, eyebrow: e.target.value })} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Heading, first line">
            <Text
              value={day.titleLine1}
              onChange={(e) => set('day', { ...day, titleLine1: e.target.value })}
            />
          </Field>
          <Field label="Heading, second line">
            <Text
              value={day.titleLine2}
              onChange={(e) => set('day', { ...day, titleLine2: e.target.value })}
            />
          </Field>
          <Field label="Last word" hint="Carries the brush stroke.">
            <Text
              value={day.underline}
              onChange={(e) => set('day', { ...day, underline: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Paragraph">
          <Area
            rows={3}
            value={day.copy}
            onChange={(e) => set('day', { ...day, copy: e.target.value })}
          />
        </Field>

        <Repeater
          label="Moments"
          hint="Four is what the strip is laid out for."
          items={day.moments}
          onChange={(moments) => set('day', { ...day, moments })}
          title={(moment) => `${moment.time} - ${moment.title}`}
          blank={() => ({ time: '', title: '', note: '', image: '' })}
          addLabel="Add a moment"
          max={4}
        >
          {(moment, setMoment) => (
            <>
              <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                <Field label="Time" hint="24 hour, e.g. 17:52.">
                  <Text
                    value={moment.time}
                    onChange={(e) => setMoment({ ...moment, time: e.target.value })}
                  />
                </Field>
                <Field label="Title">
                  <Text
                    value={moment.title}
                    onChange={(e) => setMoment({ ...moment, title: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Note">
                <Text
                  value={moment.note}
                  onChange={(e) => setMoment({ ...moment, note: e.target.value })}
                />
              </Field>
              <ImageField
                label="Photograph"
                value={moment.image}
                onChange={(next) => setMoment({ ...moment, image: next })}
                dimensions="900 x 675"
                aspect="aspect-4/3"
                {...image}
              />
            </>
          )}
        </Repeater>
      </SectionCard>

      {/* ---------------------------------------------------------- guests -- */}
      <SectionCard
        title="Tagged by our guests"
        note="The marquee at the foot of the page. The Instagram link itself comes from the social accounts on the Settings screen."
      >
        <Field label="Eyebrow">
          <Text
            value={guests.eyebrow}
            onChange={(e) => set('guests', { ...guests, eyebrow: e.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Heading, first line">
            <Text
              value={guests.titleLine1}
              onChange={(e) => set('guests', { ...guests, titleLine1: e.target.value })}
            />
          </Field>
          <Field label="Heading, second line">
            <Text
              value={guests.titleLine2}
              onChange={(e) => set('guests', { ...guests, titleLine2: e.target.value })}
            />
          </Field>
          <Field label="Last word" hint="Carries the brush stroke.">
            <Text
              value={guests.underline}
              onChange={(e) => set('guests', { ...guests, underline: e.target.value })}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] leading-relaxed text-muted">
            The paragraph is split around the handle, which is printed in bold. Mind the spaces.
          </p>
          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <Field label="Before the handle">
              <Text
                value={guests.copyBefore}
                onChange={(e) => set('guests', { ...guests, copyBefore: e.target.value })}
              />
            </Field>
            <Field label="Handle">
              <Text
                value={guests.handle}
                onChange={(e) => set('guests', { ...guests, handle: e.target.value })}
              />
            </Field>
          </div>
          <Field label="After the handle">
            <Area
              rows={2}
              value={guests.copyAfter}
              onChange={(e) => set('guests', { ...guests, copyAfter: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Button">
          <Text
            value={guests.ctaLabel}
            onChange={(e) => set('guests', { ...guests, ctaLabel: e.target.value })}
          />
        </Field>

        <Repeater
          label="Frames"
          hint="Square crops, drifting past on a loop. The rail is rendered twice so the loop has no visible seam - eight or more keeps it full."
          items={guests.frames}
          onChange={(frames) => set('guests', { ...guests, frames })}
          title={(frame) => frame.handle}
          blank={() => ({ id: '', handle: '' })}
          addLabel="Add a frame"
        >
          {(frame, setFrame) => (
            <>
              <ImageField
                label="Photograph"
                value={frame.id}
                onChange={(id) => setFrame({ ...frame, id })}
                dimensions="800 x 800"
                aspect="aspect-square"
                {...image}
              />
              <Field label="Handle" hint="Printed in the corner of the frame.">
                <Text
                  value={frame.handle}
                  onChange={(e) => setFrame({ ...frame, handle: e.target.value })}
                />
              </Field>
            </>
          )}
        </Repeater>
      </SectionCard>

      {/* ------------------------------------------------------------- cta -- */}
      <SectionCard title="The closing band" note="The ask at the foot of the page.">
        <Field label="Eyebrow">
          <Text value={cta.eyebrow} onChange={(e) => set('cta', { ...cta, eyebrow: e.target.value })} />
        </Field>

        <Field label="Heading, first line">
          <Text
            value={cta.titleLine1}
            onChange={(e) => set('cta', { ...cta, titleLine1: e.target.value })}
          />
        </Field>

        <Field label="Heading, closing line" hint="Set in the mustard sheen.">
          <Text
            value={cta.titleSheen}
            onChange={(e) => set('cta', { ...cta, titleSheen: e.target.value })}
          />
        </Field>

        <Field label="Paragraph">
          <Area
            rows={3}
            value={cta.copy}
            onChange={(e) => set('cta', { ...cta, copy: e.target.value })}
          />
        </Field>

        <Field
          label="WhatsApp message"
          hint="Prefilled into the chat when somebody taps the button here, so the desk knows which page they came from."
        >
          <Area
            rows={2}
            value={cta.chatPrompt}
            onChange={(e) => set('cta', { ...cta, chatPrompt: e.target.value })}
          />
        </Field>
      </SectionCard>
    </div>
  )
}
