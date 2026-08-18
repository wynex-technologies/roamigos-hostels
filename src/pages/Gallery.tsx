import { GalleryHero } from '@/components/gallery/GalleryHero'
import { GalleryWall } from '@/components/gallery/GalleryWall'
import { GalleryDay } from '@/components/gallery/GalleryDay'
import { GuestWall } from '@/components/gallery/GuestWall'
import { CtaBand } from '@/components/common/CtaBand'
import { usePageMeta } from '@/lib/usePageMeta'
import { site } from '@/data/site'

export default function Gallery() {
  usePageMeta(
    `Gallery — ${site.legalName}`,
    'Rooms, common spaces, rooftop mornings and bonfire nights at Roamigos — plus everything worth seeing within a day of the front door.',
  )

  return (
    <>
      <GalleryHero />
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
        copy="Pick a bed, send one message, and the desk confirms within minutes. No prepayment, no forms — you pay when you walk in."
        chatPrompt="Hi Roamigos! I saw the gallery and I'd like to check availability."
      />
    </>
  )
}
