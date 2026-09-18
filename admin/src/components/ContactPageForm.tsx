import { type ContactContent } from '@shared/page-content'
import type { useMediaCleanup } from '@/lib/media'
import { ImageField } from './ImageField'
import { SectionCard } from './PageFields'
import { Area, Field, Text } from './ui'

type Media = ReturnType<typeof useMediaCleanup>

export function ContactPageForm({
  value,
  onChange,
  media,
}: {
  value: ContactContent
  onChange: (next: ContactContent) => void
  media: Media
}) {
  const set = <K extends keyof ContactContent>(key: K, next: ContactContent[K]) =>
    onChange({ ...value, [key]: next })

  const hero = value.hero
  const channels = value.channels
  const form = value.form
  const visit = value.visit
  const faq = value.faq
  const cta = value.cta

  const image = {
    folder: 'pages' as const,
    onUploaded: media.trackUpload,
    onRemoved: media.trackRemoval,
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
      {/* ------------------------------------------------------------ hero -- */}
      <SectionCard title="Hero" note="The opening section with the desk photo.">
        <Field label="Eyebrow">
          <Text
            value={hero.eyebrow}
            onChange={(e) => set('hero', { ...hero, eyebrow: e.target.value })}
          />
        </Field>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Heading, first line">
            <Text
              value={hero.heading.line1}
              onChange={(e) => set('hero', { ...hero, heading: { ...hero.heading, line1: e.target.value } })}
            />
          </Field>
          <Field label="Before accent">
            <Text
              value={hero.heading.lead}
              onChange={(e) => set('hero', { ...hero, heading: { ...hero.heading, lead: e.target.value } })}
            />
          </Field>
          <Field label="Accent word">
            <Text
              value={hero.heading.accent}
              onChange={(e) => set('hero', { ...hero, heading: { ...hero.heading, accent: e.target.value } })}
            />
          </Field>
        </div>

        <Field label="Paragraph">
          <Area
            rows={3}
            value={hero.copy}
            onChange={(e) => set('hero', { ...hero, copy: e.target.value })}
          />
        </Field>

        <Field label="Live status note">
          <Text
            value={hero.status}
            onChange={(e) => set('hero', { ...hero, status: e.target.value })}
          />
        </Field>

        <ImageField
          label="Desk Photograph"
          value={hero.image}
          onChange={(img) => set('hero', { ...hero, image: img })}
          dimensions="900 x 600"
          alt={hero.imageAlt ?? ''}
          onAltChange={(next) => set('hero', { ...hero, imageAlt: next })}
          {...image}
        />
      </SectionCard>

      {/* ------------------------------------------------------------ channels -- */}
      <SectionCard title="Contact Channels" note="The section introducing the contact methods.">
        <Field label="Eyebrow">
          <Text
            value={channels.eyebrow}
            onChange={(e) => set('channels', { ...channels, eyebrow: e.target.value })}
          />
        </Field>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Heading, first line">
            <Text
              value={channels.heading.line1}
              onChange={(e) => set('channels', { ...channels, heading: { ...channels.heading, line1: e.target.value } })}
            />
          </Field>
          <Field label="Before accent">
            <Text
              value={channels.heading.lead}
              onChange={(e) => set('channels', { ...channels, heading: { ...channels.heading, lead: e.target.value } })}
            />
          </Field>
          <Field label="Accent word">
            <Text
              value={channels.heading.accent}
              onChange={(e) => set('channels', { ...channels, heading: { ...channels.heading, accent: e.target.value } })}
            />
          </Field>
        </div>

        <Field label="Paragraph">
          <Area
            rows={2}
            value={channels.copy}
            onChange={(e) => set('channels', { ...channels, copy: e.target.value })}
          />
        </Field>
      </SectionCard>

      {/* ------------------------------------------------------------ form -- */}
      <SectionCard title="Contact Form" note="The form that opens WhatsApp.">
        <Field label="Eyebrow">
          <Text
            value={form.eyebrow}
            onChange={(e) => set('form', { ...form, eyebrow: e.target.value })}
          />
        </Field>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Heading, first line">
            <Text
              value={form.heading.line1}
              onChange={(e) => set('form', { ...form, heading: { ...form.heading, line1: e.target.value } })}
            />
          </Field>
          <Field label="Before accent">
            <Text
              value={form.heading.lead}
              onChange={(e) => set('form', { ...form, heading: { ...form.heading, lead: e.target.value } })}
            />
          </Field>
          <Field label="Accent word">
            <Text
              value={form.heading.accent}
              onChange={(e) => set('form', { ...form, heading: { ...form.heading, accent: e.target.value } })}
            />
          </Field>
        </div>

        <Field label="Paragraph">
          <Area
            rows={3}
            value={form.copy}
            onChange={(e) => set('form', { ...form, copy: e.target.value })}
          />
        </Field>

        <Field label="Privacy Guarantee">
          <Area
            rows={2}
            value={form.guarantee}
            onChange={(e) => set('form', { ...form, guarantee: e.target.value })}
          />
        </Field>
      </SectionCard>

      {/* ------------------------------------------------------------ visit -- */}
      <SectionCard title="Getting Here" note="The section introducing the routes.">
        <Field label="Eyebrow">
          <Text
            value={visit.eyebrow}
            onChange={(e) => set('visit', { ...visit, eyebrow: e.target.value })}
          />
        </Field>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Heading, first line">
            <Text
              value={visit.heading.line1}
              onChange={(e) => set('visit', { ...visit, heading: { ...visit.heading, line1: e.target.value } })}
            />
          </Field>
          <Field label="Before accent">
            <Text
              value={visit.heading.lead}
              onChange={(e) => set('visit', { ...visit, heading: { ...visit.heading, lead: e.target.value } })}
            />
          </Field>
          <Field label="Accent word">
            <Text
              value={visit.heading.accent}
              onChange={(e) => set('visit', { ...visit, heading: { ...visit.heading, accent: e.target.value } })}
            />
          </Field>
        </div>

        <Field label="Paragraph">
          <Area
            rows={2}
            value={visit.copy}
            onChange={(e) => set('visit', { ...visit, copy: e.target.value })}
          />
        </Field>

        <div className="mt-8 space-y-6">
          <h3 className="font-semibold text-heading">Routes</h3>
          {visit.routes.map((route, i) => (
            <div key={route.key} className="space-y-4 rounded-xl border border-line p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <Text
                    value={route.title}
                    onChange={(e) => {
                      const copy = [...visit.routes]
                      copy[i] = { ...route, title: e.target.value }
                      set('visit', { ...visit, routes: copy })
                    }}
                  />
                </Field>
                <Field label="Place">
                  <Text
                    value={route.place}
                    onChange={(e) => {
                      const copy = [...visit.routes]
                      copy[i] = { ...route, place: e.target.value }
                      set('visit', { ...visit, routes: copy })
                    }}
                  />
                </Field>
                <Field label="Distance">
                  <Text
                    value={route.distance}
                    onChange={(e) => {
                      const copy = [...visit.routes]
                      copy[i] = { ...route, distance: e.target.value }
                      set('visit', { ...visit, routes: copy })
                    }}
                  />
                </Field>
                <Field label="Time">
                  <Text
                    value={route.time}
                    onChange={(e) => {
                      const copy = [...visit.routes]
                      copy[i] = { ...route, time: e.target.value }
                      set('visit', { ...visit, routes: copy })
                    }}
                  />
                </Field>
              </div>
              <Field label="Note">
                <Area
                  rows={2}
                  value={route.note}
                  onChange={(e) => {
                    const copy = [...visit.routes]
                    copy[i] = { ...route, note: e.target.value }
                    set('visit', { ...visit, routes: copy })
                  }}
                />
              </Field>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ------------------------------------------------------------ faq -- */}
      <SectionCard title="FAQs" note="The header for the FAQ section.">
        <Field label="Eyebrow">
          <Text
            value={faq.eyebrow}
            onChange={(e) => set('faq', { ...faq, eyebrow: e.target.value })}
          />
        </Field>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Heading, first line">
            <Text
              value={faq.heading.line1}
              onChange={(e) => set('faq', { ...faq, heading: { ...faq.heading, line1: e.target.value } })}
            />
          </Field>
          <Field label="Before accent">
            <Text
              value={faq.heading.lead}
              onChange={(e) => set('faq', { ...faq, heading: { ...faq.heading, lead: e.target.value } })}
            />
          </Field>
          <Field label="Accent word">
            <Text
              value={faq.heading.accent}
              onChange={(e) => set('faq', { ...faq, heading: { ...faq.heading, accent: e.target.value } })}
            />
          </Field>
        </div>
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
          hint="Prefilled into the chat when somebody taps the button here."
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
