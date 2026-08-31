import { GalleryHero } from '@/components/gallery/GalleryHero'
import { AboutIntro } from '@/components/gallery/AboutIntro'
import { GalleryWall } from '@/components/gallery/GalleryWall'
import { GalleryDay } from '@/components/gallery/GalleryDay'
import { GuestWall } from '@/components/gallery/GuestWall'
import { CtaBand } from '@/components/common/CtaBand'
import { usePageMeta } from '@/lib/usePageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbs } from '@/lib/structuredData'
import { site } from '@/data/site'
import { aboutPage } from '@/data/pages'

export default function About() {
  usePageMeta(
    `About - ${site.legalName}`,
    'Who we are, the house itself and the guests who filled it - rooms, common spaces, rooftop mornings and bonfire nights at Roamigos.',
  )

  return (
    <>
      <JsonLd id="about-crumbs" data={breadcrumbs([{ name: 'About', path: '/about' }])} />

      <GalleryHero />
      <AboutIntro />
      <GalleryWall />
      <GalleryDay />
      <GuestWall />
      <CtaBand
        eyebrow={aboutPage.cta.eyebrow}
        title={
          <>
            {aboutPage.cta.titleLine1}
            <br />
            <span className="text-sheen">{aboutPage.cta.titleSheen}</span>
          </>
        }
        copy={aboutPage.cta.copy}
        chatPrompt={aboutPage.cta.chatPrompt}
      />
    </>
  )
}
