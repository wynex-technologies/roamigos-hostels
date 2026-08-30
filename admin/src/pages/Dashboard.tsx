import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BedDouble, CalendarCheck, MessageSquare, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge, Card, ErrorNote, Loading, PageHeader } from '@/components/ui'
import { formatWhen, inr, type BookingRow } from '@/lib/db'

interface Counts {
  newBookings: number
  newEnquiries: number
  rooms: number
  offer: string | null
}

/**
 * What the desk needs at a glance.
 *
 * The four tiles are counted with `head: true`, which asks Postgres for the
 * number and returns no rows at all - the answer arrives in a header. Counting
 * by fetching the rows and reading `.length` is the same number for hundreds of
 * times the bytes, and this screen is the one people leave open.
 *
 * The recent list underneath is capped at five and takes only the columns it
 * prints.
 */
export default function Dashboard() {
  const [counts, setCounts] = useState<Counts | null>(null)
  const [recent, setRecent] = useState<BookingRow[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true

    async function load() {
      const [bookings, enquiries, rooms, offer, latest] = await Promise.all([
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'new'),
        supabase
          .from('enquiries')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'new'),
        supabase
          .from('rooms')
          .select('id', { count: 'exact', head: true })
          .eq('published', true),
        supabase.from('offers').select('name,code,discount_percent').eq('active', true).maybeSingle(),
        supabase
          .from('bookings')
          .select('id,guest_name,room_name,check_in,total,status,created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      if (!alive) return

      const failure = bookings.error ?? enquiries.error ?? rooms.error ?? latest.error
      if (failure) {
        setError(failure.message)
        return
      }

      setCounts({
        newBookings: bookings.count ?? 0,
        newEnquiries: enquiries.count ?? 0,
        rooms: rooms.count ?? 0,
        offer: offer.data
          ? `${offer.data.code ?? offer.data.name} - ${offer.data.discount_percent}%`
          : null,
      })
      setRecent((latest.data ?? []) as BookingRow[])
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  if (error) return <ErrorNote error={error} />
  if (!counts) return <Loading />

  const tiles = [
    {
      to: '/bookings',
      label: 'New bookings',
      value: String(counts.newBookings),
      icon: CalendarCheck,
      loud: counts.newBookings > 0,
    },
    {
      to: '/enquiries',
      label: 'New enquiries',
      value: String(counts.newEnquiries),
      icon: MessageSquare,
      loud: counts.newEnquiries > 0,
    },
    { to: '/rooms', label: 'Rooms live', value: String(counts.rooms), icon: BedDouble, loud: false },
    {
      to: '/offer',
      label: 'Campaign',
      value: counts.offer ?? 'None running',
      icon: Tag,
      loud: false,
    },
  ]

  return (
    <>
      <PageHeader title="Front desk" note="Everything waiting, and what the site is showing." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(({ to, label, value, icon: Icon, loud }) => (
          <Link key={label} to={to} className="card block p-5 transition-colors hover:border-line-strong">
            <div className="flex items-start justify-between">
              <Icon className="size-5 text-mustard" />
              <ArrowUpRight className="size-4 text-muted" />
            </div>
            <p
              className={`mt-4 font-display text-2xl font-semibold ${loud ? 'text-primary' : 'text-heading'}`}
            >
              {value}
            </p>
            <p className="mt-1 text-[0.8125rem] text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Latest bookings</h2>
          <Link to="/bookings" className="text-[0.8125rem] font-semibold text-primary">
            See all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nothing has come in yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="font-medium text-heading">{booking.guest_name}</span>
                <span className="text-sm text-muted">{booking.room_name ?? 'No room'}</span>
                <span className="ml-auto text-sm tabular-nums text-heading">
                  {inr.format(booking.total)}
                </span>
                <Badge tone={booking.status === 'new' ? 'warn' : 'neutral'}>{booking.status}</Badge>
                <span className="w-full text-[0.75rem] text-muted sm:w-auto">
                  {formatWhen(booking.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
