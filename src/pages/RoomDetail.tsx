import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  Bath,
  BedDouble,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Users,
} from 'lucide-react'
import { getRoom, hostelAmenities, reviews, rooms } from '@/data/rooms'
import { site } from '@/data/site'
import { Gallery } from '@/components/room/Gallery'
import { BookingWidget, toDraft, useBookingState } from '@/components/room/BookingWidget'
import { RoomCard } from '@/components/rooms/RoomCard'
import { Container, Rating } from '@/components/ui/primitives'
import { buildWhatsAppUrl, bookingTotals } from '@/lib/whatsapp'
import { usePageMeta } from '@/lib/usePageMeta'
import { formatINR } from '@/lib/utils'

const goodToKnow = [
  { title: 'Check-in / Check-out', value: `${site.checkIn} / ${site.checkOut}`, icon: CalendarClock },
  { title: 'Cancellation', value: 'Free up to 24 hrs before check-in', icon: CheckCircle2 },
]

export default function RoomDetail() {
  const { slug = '' } = useParams()
  const room = getRoom(slug)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  if (!room) return <Navigate to="/rooms" replace />

  return <RoomDetailView key={room.slug} room={room} />
}

function RoomDetailView({ room }: { room: NonNullable<ReturnType<typeof getRoom>> }) {
  usePageMeta(
    `${room.name} — ${site.legalName}`,
    `${room.shortDescription} From ${formatINR(room.pricePerNight)} per night at ${site.legalName}.`,
  )

  const [booking, setBooking] = useBookingState(room)
  const isDorm = room.categories.includes('dorm')
  const CapacityIcon = isDorm ? BedDouble : Users

  const { nights } = bookingTotals(toDraft(room, booking))
  const ready = Boolean(booking.checkIn && booking.checkOut && nights > 0)

  const similar = rooms
    .filter((r) => r.id !== room.id && r.categories.some((c) => room.categories.includes(c)))
    .slice(0, 3)

  return (
    <>
      <Container className="pt-8 pb-24">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-[0.75rem] font-semibold tracking-wide text-muted uppercase"
        >
          <Link to="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <Link to="/rooms" className="transition-colors hover:text-primary">
            Rooms & Beds
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-heading">{room.name}</span>
        </nav>

        <div className="mt-6">
          <Gallery
            images={room.images}
            name={room.name}
            badge={room.badge}
            totalPhotos={room.totalPhotos}
          />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_23rem] lg:gap-14 xl:grid-cols-[1fr_25rem]">
          {/* Main column */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* The badge already sits on the gallery — repeating it here just adds noise. */}
              <h1 className="font-display text-[clamp(2rem,4.5vw,2.75rem)] leading-tight font-semibold">
                {room.name}
              </h1>
              <Rating value={room.rating} count={room.reviewCount} className="mt-2 shrink-0" />
            </div>

            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-pretty">
              {room.subtitle}
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-y border-line py-5">
              {room.highlights.map((highlight, i) => (
                <li
                  key={highlight}
                  className="inline-flex items-center gap-2 text-[0.875rem] font-semibold text-heading"
                >
                  {i === 0 ? (
                    <CapacityIcon className="size-4 text-accent" />
                  ) : i === 1 ? (
                    <Bath className="size-4 text-accent" />
                  ) : (
                    <span className="size-1.5 rotate-45 bg-mustard" aria-hidden />
                  )}
                  {highlight}
                </li>
              ))}
            </ul>

            {/* About */}
            <section className="mt-12">
              <h2 className="font-display text-[1.75rem] font-semibold">About this room</h2>
              <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-pretty">
                {room.about}
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {room.inclusions.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed">
                    <CheckCircle2 className="mt-0.5 size-[1.15rem] shrink-0 text-green-deep dark:text-green" />
                    <span className="text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Good to know */}
            <section className="mt-12 rounded-xl2 border border-line bg-surface-2 p-6 sm:p-7">
              <h2 className="inline-flex items-center gap-2 text-[0.6875rem] font-bold tracking-[0.22em] text-accent uppercase">
                <CircleHelp className="size-4" />
                Good to know
              </h2>
              <dl className="mt-6 grid gap-6 sm:grid-cols-3">
                {goodToKnow.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <item.icon className="mt-0.5 size-[1.15rem] shrink-0 text-accent" />
                    <div>
                      <dt className="text-[0.8125rem] text-muted">{item.title}</dt>
                      <dd className="mt-1 text-[0.9375rem] font-semibold text-heading text-pretty">
                        {item.value}
                      </dd>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <CapacityIcon className="mt-0.5 size-[1.15rem] shrink-0 text-accent" />
                  <div>
                    <dt className="text-[0.8125rem] text-muted">Max guests</dt>
                    <dd className="mt-1 text-[0.9375rem] font-semibold text-heading">
                      {room.maxGuestsNote}
                    </dd>
                  </div>
                </div>
              </dl>
            </section>

            {/* Amenities */}
            <section className="mt-12">
              <h2 className="font-display text-[1.75rem] font-semibold">Amenities</h2>
              <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {hostelAmenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="flex flex-col items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-5 text-center"
                  >
                    <span className="size-1.5 rotate-45 bg-mustard" aria-hidden />
                    <span className="text-[0.8125rem] font-semibold text-heading text-balance">
                      {amenity}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Reviews */}
            <section className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-display text-[1.75rem] font-semibold">What guests are saying</h2>
                <Rating value={room.rating} count={room.reviewCount} />
              </div>

              <ul className="mt-7 grid gap-5 sm:grid-cols-2">
                {reviews.map((review) => (
                  <li key={review.name} className="card-surface p-6">
                    <div className="flex items-center gap-3.5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-2 font-display text-lg font-semibold text-primary">
                        {review.name[0]}
                      </span>
                      <span>
                        <span className="block font-semibold text-heading">{review.name}</span>
                        <span className="text-[0.8125rem] text-muted">{review.date}</span>
                      </span>
                      <span className="ml-auto text-[0.8125rem] font-semibold text-heading">
                        {review.rating}/5
                      </span>
                    </div>
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-pretty">
                      {review.text}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <BookingWidget id="book" room={room} state={booking} setState={setBooking} />
          </aside>
        </div>

        {/* Similar rooms */}
        {similar.length > 0 && (
          <section className="mt-20 border-t border-line pt-14">
            <h2 className="font-display text-[1.75rem] font-semibold">You might also like</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <RoomCard key={item.id} room={item} />
              ))}
            </div>
          </section>
        )}
      </Container>

      {/* Mobile booking bar */}
      <div className="sticky bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur-xl lg:hidden">
        <div className="container-page flex items-center justify-between gap-4 py-3.5">
          <div>
            <p className="font-display text-xl font-semibold text-heading">
              {formatINR(room.pricePerNight)}
              <span className="text-[0.8125rem] font-normal text-muted">
                {' '}
                / {isDorm ? 'bed' : 'night'}
              </span>
            </p>
            <p className="text-[0.75rem] text-muted">
              {ready ? `${nights} ${nights === 1 ? 'night' : 'nights'} selected` : 'Pay at check-in'}
            </p>
          </div>

          {ready ? (
            <a
              href={buildWhatsAppUrl(toDraft(room, booking))}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-on-primary"
            >
              Book Now
            </a>
          ) : (
            <a
              href="#book"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-on-primary"
            >
              Select dates
            </a>
          )}
        </div>
      </div>
    </>
  )
}
