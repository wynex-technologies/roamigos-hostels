import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Rooms from '@/pages/Rooms'
import RoomDetail from '@/pages/RoomDetail'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="rooms/:slug" element={<RoomDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
