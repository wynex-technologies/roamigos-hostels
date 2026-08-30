import { BlogHero } from '@/components/blog/BlogHero'
import { BlogLead } from '@/components/blog/BlogLead'
import { BlogStories } from '@/components/blog/BlogStories'
import { CtaBand } from '@/components/common/CtaBand'
import { usePageMeta } from '@/lib/usePageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { blogSchema, breadcrumbs } from '@/lib/structuredData'
import { blogPosts } from '@/data/blog'
import { site } from '@/data/site'

export default function Blog() {
  usePageMeta(
    `The Journal - ${site.legalName}`,
    'Northeast field notes from the Roamigos front desk: Guwahati in 48 hours, the Nongriat trek, the Majuli ferry, and how to eat your way through Assam.',
    // The lead story is what the page is about, so it is what a share of it shows.
    { image: blogPosts.find((post) => post.featured)?.image },
  )

  return (
    <>
      <JsonLd id="blog" data={blogSchema()} />
      <JsonLd id="blog-crumbs" data={breadcrumbs([{ name: 'The Journal', path: '/blog' }])} />

      <BlogHero />
      <BlogLead />
      <BlogStories />
      <CtaBand
        eyebrow="Stop reading, start going"
        title={
          <>
            Every one of these started
            <br />
            <span className="text-sheen">with a bed for the night.</span>
          </>
        }
        copy="Book the bed, and the desk will plan the rest with you - shared cabs, ferry timings and the safari slot nobody else got."
        chatPrompt="Hi Roamigos! I read the journal and I'd like help planning a trip."
      />
    </>
  )
}
