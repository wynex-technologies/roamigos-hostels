import { GalleryHero } from '@/components/gallery/GalleryHero'
import { AboutIntro } from '@/components/gallery/AboutIntro'
import { GalleryWall } from '@/components/gallery/GalleryWall'
import { GalleryDay } from '@/components/gallery/GalleryDay'
import { GuestWall } from '@/components/gallery/GuestWall'
import { CtaBand } from '@/components/common/CtaBand'
import { usePageMeta } from '@/lib/usePageMeta'
import { site } from '@/data/site'

export default function About() {
  usePageMeta(
    `About - ${site.legalName}`,
    'Who we are, the house itself and the guests who filled it - rooms, common spaces, rooftop mornings and bonfire nights at Roamigos.',
  )

  return (
    <>
      <GalleryHero />
      <AboutIntro />
      <GalleryWall />
      <GalleryDay />
      <GuestWall />
      <CtaBand
        eyebrow="Seen enough?"
        title={
          <>
            The next photograph on this wall
            <br />
            <span className="text-sheen">could be yours.</span>
          </>
        }
        copy="Pick a bed, send one message, and the desk confirms within minutes. No prepayment, no forms - you pay when you walk in."
        chatPrompt="Hi Roamigos! I was reading about the hostel and I'd like to check availability."
      />
    </>
  )
}
