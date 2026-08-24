import { Hero } from '@/components/home/Hero'
import { PromoBanner } from '@/components/home/PromoBanner'
import { ValueProps } from '@/components/home/ValueProps'
import { Destinations } from '@/components/home/Destinations'
import { RoomsPreview } from '@/components/home/RoomsPreview'
import { MoreThanARoom } from '@/components/home/MoreThanARoom'
import { Experiences } from '@/components/home/Experiences'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { ContactBand } from '@/components/home/ContactBand'
import { usePageMeta } from '@/lib/usePageMeta'
import { site } from '@/data/site'

export default function Home() {
  usePageMeta(`${site.legalName} - Stay. Explore. Connect.`, site.description)

  return (
    <>
      <Hero />
      <ValueProps />
      <PromoBanner />
      <RoomsPreview />
      <Destinations />
      <MoreThanARoom />
      <Experiences />
      <WhyChooseUs />
      <ContactBand />
    </>
  )
}
