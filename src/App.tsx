import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Rooms from '@/pages/Rooms'
import RoomDetail from '@/pages/RoomDetail'
import About from '@/pages/About'
import Blog from '@/pages/Blog'
import Contact from '@/pages/Contact'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="rooms/:slug" element={<RoomDetail />} />
        <Route path="about" element={<About />} />
        {/* The page was published as /gallery first - keep the old address
            working for anything already linking to it. */}
        <Route path="gallery" element={<Navigate to="/about" replace />} />
        <Route path="blog" element={<Blog />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
