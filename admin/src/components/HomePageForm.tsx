import { HOME_DEFAULTS, type HomeContent } from '@shared/page-content'
import { ICON_NAMES } from '@shared/icon-names'
import type { useMediaCleanup } from '@/lib/media'
import { ImageField } from './ImageField'
import { HeadingFields, Repeater, SectionCard } from './PageFields'
import { Area, Field, Select, Text, Toggle } from './ui'

type Media = ReturnType<typeof useMediaCleanup>

/**
 * The home page, section by section, in the order a visitor scrolls them.
 *
 * The order is the point. Somebody at the desk who wants to change the line
 * under the offers band should be able to find it by counting down the page,
 * not by knowing what the component is called - so each card is titled the way
 * the section reads on the site rather than the way it is named in the code.
 *
 * Only copy and pictures. Nothing here can change a colour, a size or a face.
 */
export function HomePageForm({
  value,
  onChange,
  media,
}: {
  value: HomeContent
  onChange: (next: HomeContent) => void
  media: Media
}) {
  /** Replace one section, leaving the rest of the document exactly as it was. */
  const set = <K extends keyof HomeContent>(key: K, next: HomeContent[K]) =>
    onChange({ ...value, [key]: next })

  const hero = value.hero
  const setHero = (patch: Partial<HomeContent['hero']>) => set('hero', { ...hero, ...patch })

  const offers = value.offers
  const setOffers = (patch: Partial<HomeContent['offers']>) =>
    set('offers', { ...offers, ...patch })

  const rooms = value.rooms
  const destinations = value.destinations
  const stay = value.stay
  const experiences = value.experiences
  const why = value.why
  const contact = value.contact

  const image = { folder: 'pages' as const, onUploaded: media.trackUpload, onRemoved: media.trackRemoval }

  return (
    <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
      {/* ------------------------------------------------------------ hero -- */}
      <SectionCard
        title="Hero"
        note="The first screen: the photographs, the headline over them and the availability card beside it."
      >
        <Field label="Eyebrow" hint="The small letter-spaced line above the headline.">
          <Text value={hero.eyebrow} onChange={(e) => setHero({ eyebrow: e.target.value })} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Headline, first line">
            <Text value={hero.titleLine1} onChange={(e) => setHero({ titleLine1: e.target.value })} />
          </Field>
          <Field label="Headline, second line">
            <Text value={hero.titleLine2} onChange={(e) => setHero({ titleLine2: e.target.value })} />
          </Field>
        </div>

        <Field label="Opening line" hint="The sentence under the logo lettering.">
          <Area rows={2} value={hero.lead} onChange={(e) => setHero({ lead: e.target.value })} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Main button">
            <Text
              value={hero.primaryCta}
              onChange={(e) => setHero({ primaryCta: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp button">
            <Text
              value={hero.secondaryCta}
              onChange={(e) => setHero({ secondaryCta: e.target.value })}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] font-semibold text-heading">The availability card</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Badge">
              <Text
                value={hero.searchBadge}
                onChange={(e) => setHero({ searchBadge: e.target.value })}
              />
            </Field>
            <Field label="Title">
              <Text
                value={hero.searchTitle}
                onChange={(e) => setHero({ searchTitle: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Note under the title">
            <Text
              value={hero.searchNote}
              onChange={(e) => setHero({ searchNote: e.target.value })}
            />
          </Field>

          <Field label="Button">
            <Text value={hero.searchCta} onChange={(e) => setHero({ searchCta: e.target.value })} />
          </Field>
        </div>

        <Repeater
          label="Background photographs"
          hint="They crossfade in this order. The first one is the one a visitor sees before anything has loaded, so it is the one that has to look best cold."
          items={hero.slides}
          onChange={(slides) => setHero({ slides })}
          title={(_, index) => (index === 0 ? 'First - loads immediately' : `Photograph ${index + 1}`)}
          blank={() => ({ ...HOME_DEFAULTS.hero.slides[0], key: `slide-${Date.now()}` })}
          addLabel="Add a photograph"
        >
          {(slide, setSlide) => (
            <ImageField
              label="Photograph"
              value={slide.image}
              onChange={(next) => setSlide({ ...slide, image: next })}
              dimensions="2400 x 1400"
              note="Full-bleed behind the headline, cropped hard on phones."
              aspect="aspect-16/9"
              {...image}
            />
          )}
        </Repeater>
      </SectionCard>

      {/* ------------------------------------------------------ value props -- */}
      <SectionCard
        title="The five promises"
        note="The panel that straddles the bottom of the hero. Five segments on desktop; phones do not get it."
      >
        <Repeater
          label="Segments"
          items={value.valueProps}
          onChange={(valueProps) => set('valueProps', valueProps)}
          title={(prop) => prop.title}
          blank={() => ({ title: '', note: '', icon: 'sparkles' })}
          addLabel="Add a promise"
          max={5}
        >
          {(prop, setProp) => (
            <>
              <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
                <Field label="Title">
                  <Text
                    value={prop.title}
                    onChange={(e) => setProp({ ...prop, title: e.target.value })}
                  />
                </Field>
                <IconPicker value={prop.icon} onChange={(icon) => setProp({ ...prop, icon })} />
              </div>
              <Field label="Note">
                <Text
                  value={prop.note}
                  onChange={(e) => setProp({ ...prop, note: e.target.value })}
                />
              </Field>
            </>
          )}
        </Repeater>
      </SectionCard>

      {/* ---------------------------------------------------------- offers -- */}
      <SectionCard
        title="Offers & promotions"
        note="The band under the hero. Whatever is running is painted into the artwork, so the banner carries no type of its own."
      >
        <Field label="Eyebrow">
          <Text value={offers.eyebrow} onChange={(e) => setOffers({ eyebrow: e.target.value })} />
        </Field>

        <HeadingFields
          value={offers.heading}
          onChange={(heading) => setOffers({ heading })}
        />

        <Field label="Paragraph">
          <Area rows={3} value={offers.copy} onChange={(e) => setOffers({ copy: e.target.value })} />
        </Field>

        <Field label="Link">
          <Text value={offers.linkLabel} onChange={(e) => setOffers({ linkLabel: e.target.value })} />
        </Field>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <Toggle
            checked={offers.banner.active}
            onChange={(active) => setOffers({ banner: { ...offers.banner, active } })}
            label="Show the banner"
          />

          <ImageField
            label="Banner artwork, wide"
            value={offers.banner.image}
            onChange={(next) => setOffers({ banner: { ...offers.banner, image: next } })}
            dimensions="1600 x 500"
            note="Used from tablet up."
            aspect="aspect-[16/5]"
            {...image}
          />

          <ImageField
            label="Banner artwork, phone"
            value={offers.banner.imageMobile ?? ''}
            onChange={(next) => setOffers({ banner: { ...offers.banner, imageMobile: next } })}
            dimensions="1200 x 900"
            note="A 3:1 banner shrinks to unreadable on a phone, so give it its own crop whenever the artwork carries type. Left empty, the wide one is used."
            aspect="aspect-4/3"
            {...image}
          />

          <Field
            label="Description"
            hint="What the banner says, for anyone who cannot see it. Never leave this empty."
          >
            <Text
              value={offers.banner.alt}
              onChange={(e) => setOffers({ banner: { ...offers.banner, alt: e.target.value } })}
            />
          </Field>

          <Field
            label="Where it leads"
            hint="A path like /rooms stays on the site. Empty means the banner is not clickable."
          >
            <Text
              value={offers.banner.href ?? ''}
              onChange={(e) => setOffers({ banner: { ...offers.banner, href: e.target.value } })}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ----------------------------------------------------------- rooms -- */}
      <SectionCard
        title="Rooms & beds"
        note="The header over the room stage. The rooms themselves are on the Rooms screen."
      >
        <Field label="Eyebrow">
          <Text value={rooms.eyebrow} onChange={(e) => set('rooms', { ...rooms, eyebrow: e.target.value })} />
        </Field>

        <HeadingFields
          value={rooms.heading}
          onChange={(heading) => set('rooms', { ...rooms, heading })}
        />

        <Field label="Paragraph">
          <Area
            rows={3}
            value={rooms.copy}
            onChange={(e) => set('rooms', { ...rooms, copy: e.target.value })}
          />
        </Field>

        <Field label="Link">
          <Text
            value={rooms.browseLabel}
            onChange={(e) => set('rooms', { ...rooms, browseLabel: e.target.value })}
          />
        </Field>
      </SectionCard>

      {/* ---------------------------------------------------- destinations -- */}
      <SectionCard
        title="Guwahati & the house"
        note="The card deck that fans out and then rotates. Places first, then whatever offers are running - they ride the same deck."
      >
        <Field label="Eyebrow">
          <Text
            value={destinations.eyebrow}
            onChange={(e) => set('destinations', { ...destinations, eyebrow: e.target.value })}
          />
        </Field>

        <HeadingFields
          value={destinations.heading}
          onChange={(heading) => set('destinations', { ...destinations, heading })}
        />

        <Field label="Paragraph">
          <Area
            rows={3}
            value={destinations.copy}
            onChange={(e) => set('destinations', { ...destinations, copy: e.target.value })}
          />
        </Field>

        <Field label="Link">
          <Text
            value={destinations.linkLabel}
            onChange={(e) => set('destinations', { ...destinations, linkLabel: e.target.value })}
          />
        </Field>

        <Repeater
          label="Place cards"
          hint="Only this first row fans out when the deck arrives - anything beyond it waits off-stage and comes round on the rotation."
          items={destinations.cards}
          onChange={(cards) => set('destinations', { ...destinations, cards })}
          title={(card) => card.title}
          blank={() => ({ key: `card-${Date.now()}`, title: '', tag: '', note: '', image: '' })}
          addLabel="Add a place"
        >
          {(card, setCard) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <Text
                    value={card.title}
                    onChange={(e) => setCard({ ...card, title: e.target.value })}
                  />
                </Field>
                <Field label="Tag" hint="Riverfront, Inside, Day trip.">
                  <Text value={card.tag} onChange={(e) => setCard({ ...card, tag: e.target.value })} />
                </Field>
              </div>
              <Field label="Note" hint="One short line - it only shows on hover.">
                <Text value={card.note} onChange={(e) => setCard({ ...card, note: e.target.value })} />
              </Field>
              <ImageField
                label="Photograph"
                value={card.image}
                onChange={(next) => setCard({ ...card, image: next })}
                dimensions="900 x 1200"
                note="Cropped tall in the deck."
                aspect="aspect-3/4"
                {...image}
              />
            </>
          )}
        </Repeater>

        <Repeater
          label="Offer cards"
          hint="The same card with a mustard ribbon on it. Empty this list and the deck simply carries the places."
          items={destinations.promos}
          onChange={(promos) => set('destinations', { ...destinations, promos })}
          title={(card) => card.title}
          blank={() => ({
            key: `promo-${Date.now()}`,
            title: '',
            tag: '',
            note: '',
            image: '',
            offer: '',
            href: '/rooms',
          })}
          addLabel="Add an offer"
        >
          {(card, setCard) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <Text
                    value={card.title}
                    onChange={(e) => setCard({ ...card, title: e.target.value })}
                  />
                </Field>
                <Field label="Tag" hint="Long stay, Seasonal, Groups.">
                  <Text value={card.tag} onChange={(e) => setCard({ ...card, tag: e.target.value })} />
                </Field>
                <Field label="Ribbon" hint="28% off, From Rs 499.">
                  <Text
                    value={card.offer ?? ''}
                    onChange={(e) => setCard({ ...card, offer: e.target.value })}
                  />
                </Field>
                <Field label="Where it leads" hint="/rooms or /contact.">
                  <Text
                    value={card.href ?? ''}
                    onChange={(e) => setCard({ ...card, href: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Note">
                <Text value={card.note} onChange={(e) => setCard({ ...card, note: e.target.value })} />
              </Field>
              <ImageField
                label="Photograph"
                value={card.image}
                onChange={(next) => setCard({ ...card, image: next })}
                dimensions="900 x 1200"
                aspect="aspect-3/4"
                {...image}
              />
            </>
          )}
        </Repeater>
      </SectionCard>

      {/* ------------------------------------------------------------ stay -- */}
      <SectionCard
        title="More than just a room"
        note="The panel of photographs and the grid of perks beside them."
      >
        <Field label="Eyebrow">
          <Text value={stay.eyebrow} onChange={(e) => set('stay', { ...stay, eyebrow: e.target.value })} />
        </Field>

        <HeadingFields
          value={stay.heading}
          onChange={(heading) => set('stay', { ...stay, heading })}
        />

        <Field label="Paragraph">
          <Area
            rows={3}
            value={stay.copy}
            onChange={(e) => set('stay', { ...stay, copy: e.target.value })}
          />
        </Field>

        <Repeater
          label="Photographs"
          hint="Three plates: the first takes the tall half, the other two stack beside it. The layout is built for exactly three."
          items={stay.images}
          onChange={(images) => set('stay', { ...stay, images })}
          title={(_, index) => (index === 0 ? 'The large plate' : `Small plate ${index}`)}
          blank={() => ''}
          addLabel="Add a photograph"
          max={3}
        >
          {(src, setSrc) => (
            <ImageField
              label="Photograph"
              value={src}
              onChange={setSrc}
              dimensions="1200 x 900"
              {...image}
            />
          )}
        </Repeater>

        <Repeater
          label="Perks"
          items={stay.perks}
          onChange={(perks) => set('stay', { ...stay, perks })}
          title={(perk) => perk.title}
          blank={() => ({ title: '', icon: 'sparkles' })}
          addLabel="Add a perk"
        >
          {(perk, setPerk) => (
            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <Field label="Title">
                <Text
                  value={perk.title}
                  onChange={(e) => setPerk({ ...perk, title: e.target.value })}
                />
              </Field>
              <IconPicker value={perk.icon} onChange={(icon) => setPerk({ ...perk, icon })} />
            </div>
          )}
        </Repeater>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp link">
            <Text
              value={stay.askLabel}
              onChange={(e) => set('stay', { ...stay, askLabel: e.target.value })}
            />
          </Field>
          <Field label="Button">
            <Text
              value={stay.ctaLabel}
              onChange={(e) => set('stay', { ...stay, ctaLabel: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid gap-4 rounded-xl border border-line bg-surface-2/50 p-4 sm:grid-cols-3">
          <Field label="Foot note, before">
            <Text
              value={stay.footNote.before}
              onChange={(e) =>
                set('stay', { ...stay, footNote: { ...stay.footNote, before: e.target.value } })
              }
            />
          </Field>
          <Field label="The link itself">
            <Text
              value={stay.footNote.link}
              onChange={(e) =>
                set('stay', { ...stay, footNote: { ...stay.footNote, link: e.target.value } })
              }
            />
          </Field>
          <Field label="Foot note, after">
            <Text
              value={stay.footNote.after}
              onChange={(e) =>
                set('stay', { ...stay, footNote: { ...stay.footNote, after: e.target.value } })
              }
            />
          </Field>
        </div>
      </SectionCard>

      {/* ----------------------------------------------------- experiences -- */}
      <SectionCard
        title="What happens here"
        note="The bonfires, treks and open mics, laid out as a mosaic. The first one takes the large tile."
      >
        <Field label="Eyebrow">
          <Text
            value={experiences.eyebrow}
            onChange={(e) => set('experiences', { ...experiences, eyebrow: e.target.value })}
          />
        </Field>

        <HeadingFields
          value={experiences.heading}
          onChange={(heading) => set('experiences', { ...experiences, heading })}
        />

        <Field label="Paragraph">
          <Area
            rows={3}
            value={experiences.copy}
            onChange={(e) => set('experiences', { ...experiences, copy: e.target.value })}
          />
        </Field>

        <Repeater
          label="Experiences"
          hint="Six is what the mosaic is laid out for."
          items={experiences.items}
          onChange={(items) => set('experiences', { ...experiences, items })}
          title={(item) => item.title}
          blank={() => ({ title: '', note: '', image: '', icon: 'sparkles' })}
          addLabel="Add an experience"
        >
          {(item, setItem) => (
            <>
              <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
                <Field label="Title">
                  <Text
                    value={item.title}
                    onChange={(e) => setItem({ ...item, title: e.target.value })}
                  />
                </Field>
                <IconPicker value={item.icon} onChange={(icon) => setItem({ ...item, icon })} />
              </div>
              <Field label="Note">
                <Area
                  rows={2}
                  value={item.note}
                  onChange={(e) => setItem({ ...item, note: e.target.value })}
                />
              </Field>
              <ImageField
                label="Photograph"
                value={item.image}
                onChange={(next) => setItem({ ...item, image: next })}
                dimensions="1200 x 800"
                {...image}
              />
            </>
          )}
        </Repeater>
      </SectionCard>

      {/* ------------------------------------------------------------- why -- */}
      <SectionCard
        title="Why Roamigos"
        note="The numbered ledger and the score panel beside it. Desktop and tablet only - it is not shown on a phone."
      >
        <Field label="Eyebrow">
          <Text value={why.eyebrow} onChange={(e) => set('why', { ...why, eyebrow: e.target.value })} />
        </Field>

        <Field
          label="The quiet line"
          hint="Set small and grey above the answer - the concession the heading then argues with."
        >
          <Text
            value={why.titleQuiet}
            onChange={(e) => set('why', { ...why, titleQuiet: e.target.value })}
          />
        </Field>

        <HeadingFields
          withFirstLine={false}
          value={why.heading}
          onChange={(heading) => set('why', { ...why, heading })}
        />

        <Field label="Paragraph">
          <Area
            rows={3}
            value={why.copy}
            onChange={(e) => set('why', { ...why, copy: e.target.value })}
          />
        </Field>

        <Repeater
          label="The ledger"
          hint="Four is the count it is laid out for. These answer why here and not the hostel down the road, so nothing should repeat the five promises under the hero."
          items={why.reasons}
          onChange={(reasons) => set('why', { ...why, reasons })}
          title={(reason) => reason.title}
          blank={() => ({ title: '', note: '', proof: '', icon: 'sparkles' })}
          addLabel="Add a reason"
        >
          {(reason, setReason) => (
            <>
              <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
                <Field label="Title">
                  <Text
                    value={reason.title}
                    onChange={(e) => setReason({ ...reason, title: e.target.value })}
                  />
                </Field>
                <IconPicker
                  value={reason.icon}
                  onChange={(icon) => setReason({ ...reason, icon })}
                />
              </div>
              <Field label="Note">
                <Area
                  rows={3}
                  value={reason.note}
                  onChange={(e) => setReason({ ...reason, note: e.target.value })}
                />
              </Field>
              <Field label="Proof" hint="The short claim printed under it, e.g. Rewritten every season.">
                <Text
                  value={reason.proof}
                  onChange={(e) => setReason({ ...reason, proof: e.target.value })}
                />
              </Field>
            </>
          )}
        </Repeater>

        <Field label="Score panel eyebrow">
          <Text
            value={why.verdictEyebrow}
            onChange={(e) => set('why', { ...why, verdictEyebrow: e.target.value })}
          />
        </Field>

        <Repeater
          label="Score breakdown"
          hint="The bars under the headline rating. Keep them consistent with the rating on the Settings screen - these are what it is an average of."
          items={why.breakdown}
          onChange={(breakdown) => set('why', { ...why, breakdown })}
          title={(row) => row.label}
          blank={() => ({ label: '', value: 4.8 })}
          addLabel="Add a category"
        >
          {(row, setRow) => (
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <Field label="Category">
                <Text
                  value={row.label}
                  onChange={(e) => setRow({ ...row, label: e.target.value })}
                />
              </Field>
              <Field label="Out of 5">
                <Text
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={row.value}
                  onChange={(e) => setRow({ ...row, value: Number(e.target.value) })}
                />
              </Field>
            </div>
          )}
        </Repeater>

        <Field label="Button">
          <Text
            value={why.ctaLabel}
            onChange={(e) => set('why', { ...why, ctaLabel: e.target.value })}
          />
        </Field>
      </SectionCard>

      {/* --------------------------------------------------------- contact -- */}
      <SectionCard
        title="The closing band"
        note="The last thing on the page. The phone number and address in it come from Settings, not from here."
      >
        <Field label="Eyebrow">
          <Text
            value={contact.eyebrow}
            onChange={(e) => set('contact', { ...contact, eyebrow: e.target.value })}
          />
        </Field>

        <div className="space-y-4 rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-[0.75rem] leading-relaxed text-muted">
            The heading is three pieces because the page gives each its own colour: the opening is
            maroon, the middle carries in white, and the closing line takes the mustard sheen.
          </p>

          <Field label="Opening">
            <Text
              value={contact.titleAccent}
              onChange={(e) => set('contact', { ...contact, titleAccent: e.target.value })}
            />
          </Field>
          <Field label="Middle" hint="Usually starts with a space.">
            <Text
              value={contact.titleRest}
              onChange={(e) => set('contact', { ...contact, titleRest: e.target.value })}
            />
          </Field>
          <Field label="Closing line">
            <Text
              value={contact.titleSheen}
              onChange={(e) => set('contact', { ...contact, titleSheen: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Paragraph">
          <Area
            rows={3}
            value={contact.copy}
            onChange={(e) => set('contact', { ...contact, copy: e.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Main button">
            <Text
              value={contact.primaryCta}
              onChange={(e) => set('contact', { ...contact, primaryCta: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp button">
            <Text
              value={contact.secondaryCta}
              onChange={(e) => set('contact', { ...contact, secondaryCta: e.target.value })}
            />
          </Field>
        </div>
      </SectionCard>
    </div>
  )
}

/**
 * The icon beside a row.
 *
 * A menu rather than a text box: the site draws one of a fixed set and falls
 * back to a generic mark for anything else, so a typo here would be an icon
 * quietly going wrong on the live page rather than an error anybody sees.
 */
function IconPicker({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <Field label="Icon">
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {ICON_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
    </Field>
  )
}
