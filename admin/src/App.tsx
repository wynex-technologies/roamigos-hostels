import { Route, Routes } from 'react-router-dom'
import { Shell } from '@/components/Shell'
import { Loading } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { isConfigured } from '@/lib/supabase'
import Login from '@/pages/Login'
import NoAccess from '@/pages/NoAccess'
import Setup from '@/pages/Setup'
import Dashboard from '@/pages/Dashboard'
import Bookings from '@/pages/Bookings'
import Enquiries from '@/pages/Enquiries'
import Rooms from '@/pages/Rooms'
import Blog from '@/pages/Blog'
import Offer from '@/pages/Offer'
import Faqs from '@/pages/Faqs'
import Settings from '@/pages/Settings'
import Profile from '@/pages/Profile'

/**
 * Three gates before any screen renders, in this order: the panel has to be
 * pointed at a project, somebody has to be signed in, and that somebody has to
 * be on the allowlist. Each one has its own screen, so a failure says which of
 * the three it was rather than showing an empty panel.
 */
export default function App() {
  const { session, admin, loading } = useAuth()

  if (!isConfigured) return <Setup />
  if (loading) return <Loading />
  if (!session) return <Login />
  if (!admin) return <NoAccess />

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="blog" element={<Blog />} />
        <Route path="offer" element={<Offer />} />
        <Route path="faqs" element={<Faqs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
