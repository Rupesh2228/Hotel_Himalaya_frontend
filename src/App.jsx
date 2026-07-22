import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Loader from './fronrend/componets/Loader'
import { useAuth } from './context/AuthContext'

const Home = lazy(() => import('./fronrend/Home/Home'))
const AboutUs = lazy(() => import('./fronrend/About_us/Aboutus'))
const Service = lazy(() => import('./fronrend/Service/Service'))
const Contact = lazy(() => import('./fronrend/Contact/Contact'))
const Gallery = lazy(() => import('./fronrend/Gallery/Gallery'))
const Events = lazy(() => import('./fronrend/Events/Events'))
const Login_Booking = lazy(() => import('./fronrend/Login_Booling/Login_Booking'))
const AdminDashboard = lazy(() => import('./fronrend/Dashboard/AdminDashboard'))
const UserDashboard = lazy(() => import('./fronrend/Dashboard/UserDashboard'))
const AttractionDetail = lazy(() => import('./fronrend/Attraction/AttractionDetail'))
const ToursList = lazy(() => import('./fronrend/Tours/ToursList'))
const TourDetails = lazy(() => import('./fronrend/Tours/TourDetails'))
const NotFound = lazy(() => import('./fronrend/componets/NotFound'))
const ServerError = lazy(() => import('./fronrend/componets/ServerError'))

const AdminRoute = () => {
  const { user, loading, refreshUser } = useAuth()
  const userId = user?.id || user?._id
  const [checkingRole, setCheckingRole] = useState(false)
  const [freshUser, setFreshUser] = useState(null)

  useEffect(() => {
    let mounted = true

    const checkRole = async () => {
      if (!userId) return
      setCheckingRole(true)
      const latestUser = await refreshUser()
      if (mounted) {
        setFreshUser(latestUser)
        setCheckingRole(false)
      }
    }

    checkRole()
    return () => {
      mounted = false
    }
  }, [userId, refreshUser])

  const currentUser = freshUser || user

  if (loading || checkingRole) return <Loader fullScreen message="Checking access..." />
  if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />
  if (currentUser?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <AdminDashboard />
}

const DashboardRoute = () => {
  const { user, loading, refreshUser } = useAuth()
  const userId = user?.id || user?._id
  const [checkingRole, setCheckingRole] = useState(false)
  const [freshUser, setFreshUser] = useState(null)

  useEffect(() => {
    let mounted = true

    const checkRole = async () => {
      if (!userId) return
      setCheckingRole(true)
      const latestUser = await refreshUser()
      if (mounted) {
        setFreshUser(latestUser)
        setCheckingRole(false)
      }
    }

    checkRole()
    return () => {
      mounted = false
    }
  }, [userId, refreshUser])

  const currentUser = freshUser || user

  if (loading || checkingRole) return <Loader fullScreen message="Opening dashboard..." />
  if (!user) return <Navigate to="/login" state={{ from: '/dashboard' }} replace />
  if (currentUser?.role === 'admin') return <Navigate to="/admin" replace />
  return <UserDashboard />
}

function App() {
  return (
    <div>
      <Suspense fallback={<Loader fullScreen message="Loading Hotel Himalaya INN Khona Khona INN Khona..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Service />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/events" element={<Events />} />
          <Route path="/tours" element={<ToursList />} />
          <Route path="/tours/:slug" element={<TourDetails />} />
          <Route path="/login" element={<Login_Booking />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/attraction/:id" element={<AttractionDetail />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
