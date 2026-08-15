import { Hero } from '@/components/home/Hero'
import { ValueProps } from '@/components/home/ValueProps'
import { RoomsPreview } from '@/components/home/RoomsPreview'
import { MoreThanARoom } from '@/components/home/MoreThanARoom'
import { Experiences } from '@/components/home/Experiences'
import { TravelReads } from '@/components/home/TravelReads'
import { ContactBand } from '@/components/home/ContactBand'
import { usePageMeta } from '@/lib/usePageMeta'
import { site } from '@/data/site'

export default function Home() {
  usePageMeta(`${site.legalName} — Stay. Explore. Connect.`, site.description)

  return (
    <>
      <Hero />
      <ValueProps />
      <RoomsPreview />
      <MoreThanARoom />
      <Experiences />
      <TravelReads />
      <ContactBand />
    </>
  )
}
