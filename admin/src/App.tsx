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
import PageSettings from '@/pages/PageSettings'
import Settings from '@/pages/Settings'
import Profile from '@/pages/Profile'
import Users from '@/pages/Users'

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

  const isOwner = admin.role === 'owner'
  const can = (tab: string) => isOwner || admin.tabs?.includes(tab)

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        
        {can('Bookings') && <Route path="bookings" element={<Bookings />} />}
        {can('Enquiries') && <Route path="enquiries" element={<Enquiries />} />}
        {can('Rooms') && <Route path="rooms" element={<Rooms />} />}
        {can('Journal') && <Route path="blog" element={<Blog />} />}
        {can('Offer') && <Route path="offer" element={<Offer />} />}
        {can('FAQs') && <Route path="faqs" element={<Faqs />} />}
        {can('Page settings') && <Route path="pages" element={<PageSettings />} />}
        
        {isOwner && <Route path="users" element={<Users />} />}
        
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        
        {/* If a route isn't rendered above, this catch-all sends them to dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
