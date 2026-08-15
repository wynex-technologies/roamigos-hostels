import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/primitives'
import { LogoBadge } from '@/components/brand/Logo'
import { usePageMeta } from '@/lib/usePageMeta'
import { site } from '@/data/site'

export default function NotFound() {
  usePageMeta(`Page not found — ${site.legalName}`)

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <LogoBadge className="size-28 opacity-70" />
      <p className="mt-8 eyebrow">Error 404</p>
      <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3rem)] font-semibold">
        This trail leads nowhere
      </h1>
      <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-pretty">
        The page you were looking for has moved on. Let&apos;s get you back to a bed.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/" size="lg">
          Back to Home
        </ButtonLink>
        <ButtonLink to="/rooms" variant="secondary" size="lg">
          Browse Rooms
        </ButtonLink>
      </div>
    </Container>
  )
}
