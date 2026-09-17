import { ContactHero } from '@/components/contact/ContactHero'
import { ContactChannels } from '@/components/contact/ContactChannels'
import { ContactForm } from '@/components/contact/ContactForm'
import { ContactVisit } from '@/components/contact/ContactVisit'
import { ContactFaq } from '@/components/contact/ContactFaq'
import { CtaBand } from '@/components/common/CtaBand'
import { usePageMeta } from '@/lib/usePageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbs, faqSchema } from '@/lib/structuredData'
import { site } from '@/data/site'
import { contactPage } from '@/data/pages'

export default function Contact() {
  usePageMeta(
    `Contact - ${site.legalName}`,
    `Talk to the Roamigos front desk in Guwahati - WhatsApp, phone, email or walk in. Directions from the airport, station and ISBT, plus answers to the questions we get most.`,
  )

  return (
    <>
      {/* The desk answers these six questions more than anything else, so they
          are marked up to be answerable straight from a search result. */}
      <JsonLd id="contact-faq" data={faqSchema()} />
      <JsonLd id="contact-crumbs" data={breadcrumbs([{ name: 'Contact', path: '/contact' }])} />

      <ContactHero />
      <ContactChannels />
      <ContactForm />
      <ContactVisit />
      <ContactFaq />
      <CtaBand
        eyebrow={contactPage.cta.eyebrow}
        title={
          <>
            {contactPage.cta.titleLine1}
            <br />
            <span className="text-sheen">{contactPage.cta.titleSheen}</span>
          </>
        }
        copy={contactPage.cta.copy}
        chatPrompt={contactPage.cta.chatPrompt}
      />
    </>
  )
}
