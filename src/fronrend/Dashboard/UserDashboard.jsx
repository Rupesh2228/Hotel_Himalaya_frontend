import { useState, useEffect, useMemo } from 'react'
import { FaTicketAlt, FaHistory, FaSuitcase } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import Components from '../componets/componets'
import './UserDashboard.css'
import { getApiUrl } from '../../config/api'

const BOOKINGS_API_URL = `${getApiUrl()}/api/bookings`
const EVENT_BOOKINGS_API_URL = `${getApiUrl()}/api/events/my-bookings`
const getBookingsCacheKey = (identifier) => `hotel_user_dashboard_bookings_${identifier || 'guest'}`
const buildBookingQuery = (userEmail, deviceId) => {
  const params = new URLSearchParams();
  if (userEmail) params.set('bookedByEmail', userEmail);
  if (deviceId) params.set('bookedBy', deviceId);
  return params.toString();
}
const parseBookingDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
const getBookingStatus = (booking) => {
  const today = new Date()
  const checkIn = parseBookingDate(booking.checkIn)
  const checkOut = parseBookingDate(booking.checkOut)

  if (!checkIn || !checkOut) return 'Pending'
  if (booking.verified) return 'Verified'
  if (today > checkOut) return 'Completed'
  return 'Booked'
}

const getTourBookingStatusLabel = (status) => {
  if (status === 'Confirmed') return 'Confirmed'
  if (status === 'Pending') return 'Pending'
  return 'Not Confirmed'
}

const getTourBookingStatusClass = (status) => {
  if (status === 'Confirmed') return 'confirmed'
  if (status === 'Pending') return 'pending'
  return 'rejected'
}

const getEventBookingStatusClass = (status) => {
  const normalized = String(status || 'Upcoming').toLowerCase()
  if (normalized === 'ongoing') return 'ongoing'
  if (normalized === 'completed') return 'completed'
  return 'upcoming'
}

const normalizeTourBooking = (booking) => {
  const item = booking || {}
  const bookingId = item._id || item.id || `tour_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const normalizedId = bookingId.startsWith('tb_') ? bookingId.replace(/^tb_/, 'tour_') : bookingId
  const adults = Number(item.adults ?? item.adultCount ?? 0)
  const children = Number(item.children ?? item.childCount ?? 0)
  const tourPrice = Number(item.tourPrice ?? item.price ?? item.totalPrice ?? 0)
  const calculatedTotal = tourPrice
    ? Math.round(adults * tourPrice + children * tourPrice * 0.7)
    : 0

  return {
    ...item,
    _id: normalizedId,
    tourTitle: item.tourTitle || item.title || item.name || 'Tour Booking',
    tourCoverImage: item.tourCoverImage || item.coverImage || item.imageUrl || item.tourImage || '',
    date: item.date || item.travelDate || item.tourDate || '',
    fullName: item.fullName || item.bookedByName || item.bookedBy || '',
    phoneNumber: item.phoneNumber || item.bookedByPhone || item.phone || '',
    email: item.email || item.bookedByEmail || '',
    address: item.address || '',
    paymentMethod: item.paymentMethod || item.payment || 'pay_at_site',
    total: Number(item.total ?? item.amount ?? item.totalPrice ?? calculatedTotal),
    adults,
    children,
    status: item.status || 'Pending',
    createdAt: item.createdAt || item.bookedAt || new Date().toISOString(),
  }
}

const getDeviceId = () => {
  let id = localStorage.getItem('hotel_device_id')
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('hotel_device_id', id)
  }
  return id
}

const UserDashboard = () => {
  const { user, token } = useAuth()

  const [activeTab, setActiveTab] = useState('my-bookings')
  const deviceId = getDeviceId()
  const bookingOwnerId = user?.email || deviceId
  const bookingsCacheKey = getBookingsCacheKey(bookingOwnerId)
  const [bookings, setBookings] = useState(() => {
    try {
      const cachedBookings = localStorage.getItem(bookingsCacheKey)
      return cachedBookings ? JSON.parse(cachedBookings) : []
    } catch (error) {
      console.error('Error loading cached bookings:', error)
      return []
    }
  })
  const [eventBookings, setEventBookings] = useState([])
  const [tourBookings, setTourBookings] = useState([])
  const formatRoomPrice = (room) => `Rs. ${Number(room?.roomPrice || room?.price || 0).toLocaleString()}`

  const bookingQuery = useMemo(() => buildBookingQuery(user?.email, deviceId), [user?.email, deviceId])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const query = bookingQuery ? `?${bookingQuery}` : ''
        const storedToken = token || localStorage.getItem('token');
        const headers = storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {};

        const response = await fetch(`${BOOKINGS_API_URL}${query}`, {
          headers: {
            ...headers,
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store'
        })
        if (response.ok) {
          const data = await response.json()
          const bookingsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : [])
          setBookings(bookingsArray)
          localStorage.setItem(bookingsCacheKey, JSON.stringify(bookingsArray))
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      }
    }

    fetchBookings()
  }, [bookingQuery, bookingsCacheKey])

  useEffect(() => {
    const fetchEventBookings = async () => {
      const storedToken = token || localStorage.getItem('token');
      if (!storedToken) return;
      try {
        const response = await fetch(EVENT_BOOKINGS_API_URL, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          // Safely set eventBookings in case API returns nested data array
          const eventsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
          setEventBookings(eventsArray);
        }
      } catch (error) {
        console.error('Error fetching event bookings:', error);
      }
    };
    fetchEventBookings();
  }, [token]);

  useEffect(() => {
    const fetchTourBookings = async () => {
      const storedToken = token || localStorage.getItem('token');
      if (!storedToken) return;
      try {
        const response = await fetch(`${getApiUrl()}/api/tours/my-bookings`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Cache-Control': 'no-cache'
          },
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          const toursArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
          setTourBookings(toursArray.map(normalizeTourBooking));
        }
      } catch (error) {
        console.error('Error fetching tour bookings:', error);
      }
    };
    fetchTourBookings();
  }, [token]);



  // Guest fetchers: when no token present, fetch bookings by email/deviceId using public endpoints
  useEffect(() => {
    // Only run for guests (no token)
    const storedToken = token || localStorage.getItem('token');
    if (storedToken) return;
    const fetchGuestEventBookings = async () => {
      try {
        const params = new URLSearchParams();
        if (user?.email) params.set('email', user.email);
        if (deviceId) params.set('deviceId', deviceId);
        if (!params.toString()) return;
        const url = `${getApiUrl()}/api/events/my-bookings-by-email` + `?${params.toString()}`;
        const resp = await fetch(url, { cache: 'no-store' });
        const data = await resp.json();
        const eventsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        setEventBookings(eventsArray);
      } catch (err) {
        console.error('Error fetching guest event bookings:', err);
      }
    };
    fetchGuestEventBookings();
  }, [user?.email, deviceId, token]);

  useEffect(() => {
    const storedToken = token || localStorage.getItem('token');
    if (storedToken) return;
    const fetchGuestTourBookings = async () => {
      try {
        const params = new URLSearchParams();
        if (user?.email) params.set('email', user.email);
        if (deviceId) params.set('deviceId', deviceId);
        if (!params.toString()) return;
        const url = `${getApiUrl()}/api/tours/my-bookings-guest` + `?${params.toString()}`;
        const resp = await fetch(url, { cache: 'no-store' });
        const data = await resp.json();
        const toursArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        setTourBookings(toursArray.map(normalizeTourBooking));
      } catch (err) {
        console.error('Error fetching guest tour bookings:', err);
      }
    };
    fetchGuestTourBookings();
  }, [user?.email, deviceId, token]);

  return (    <>
      <Components />
      <div className="user-dashboard-wrapper">
        <div className="user-dashboard-header">
          <div className="user-profile-summary">
            <div className="avatar" style={{ cursor: 'default' }}>{user?.name ? user.name[0].toUpperCase() : 'U'}</div>

            <div>
              <h1>Welcome</h1>
              <p>Manage your reservations, tickets, and feedback in your personal portal.</p>
            </div>
          </div>
        </div>

        <div className="user-dashboard-layout">
          {/* Sidebar / Tabs Nav */}
          <aside className="user-dashboard-tabs">
            {/* Tab buttons */}
            {[
             
              { id: 'my-bookings', label: 'Room Bookings', icon: <FaHistory /> },
              { id: 'event-bookings', label: 'Event Tickets', icon: <FaTicketAlt /> },
              { id: 'tour-bookings', label: 'Tour Bookings', icon: <FaSuitcase /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}

          </aside>

          {/* Tab Content */}
          <main className="user-dashboard-content">
            {activeTab === 'my-bookings' && (
              <section className="tab-pane">
                <h2> Booked Rooms History</h2>
                {bookings.length === 0 ? (
                  <div className="empty-state">No rooms booked yet. Your bookings will appear here with room details.</div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Room</th>
                          <th>Price</th>
                          <th>Code</th>
                          <th>Status</th>
                          <th>Guests</th>
                          <th>Check-in</th>
                          <th>Check-out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking._id || booking.id}>
                            <td><strong>{booking.roomTitle || booking.title}</strong></td>
                            <td>{formatRoomPrice(booking)}</td>
                            <td><span className="verification-code">{booking.verificationCode || '-'}</span></td>
                            <td>
                              <span className={`badge ${booking.verified ? 'badge-completed' : 'badge-active'}`}>
                                {booking.verified ? 'Verified Successfully' : `Booked - ${booking.status || getBookingStatus(booking)}`}
                              </span>
                            </td>
                            <td>{booking.members} of {booking.totalMembers || 1}</td>
                            <td>{booking.checkIn}</td>
                            <td>{booking.checkOut}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'event-bookings' && (
              <section className="tab-pane">
                <h2> My Event Tickets</h2>
                {eventBookings.length === 0 ? (
                  <div className="empty-state">No events booked yet. Discover and book exciting experiences on the <a href="/events" style={{ color: '#d4af37', textDecoration: 'underline' }}>Events Page</a>!</div>
                ) : (
                  <div className="event-ticket-list">
                    {eventBookings.map((b) => (
                      <div className="event-ticket-card" key={b._id}>
                        <div className="event-ticket-header">
                          <div>
                            <div className="event-ticket-title">{b.eventTitle}</div>
                            <div className="event-ticket-subtitle">Booked on {new Date(b.createdAt).toLocaleDateString()}</div>
                          </div>
                          <span className={`event-ticket-badge ${getEventBookingStatusClass(b.status)}`}>
                            {b.status || 'Upcoming'}
                          </span>
                        </div>

                        <div className="event-ticket-details">
                          <div><strong>Guest:</strong> {b.bookedByName || user?.name || 'Guest'}</div>
                          <div><strong>Phone:</strong> {b.bookedByPhone || user?.phone || 'Not provided'}</div>
                          <div><strong>Tickets:</strong> {b.ticketsCount}</div>
                          <div><strong>Total:</strong> Rs. {(b.eventPrice || 0) * (b.ticketsCount || 1)}</div>
                          <div><strong>Price each:</strong> Rs. {b.eventPrice || 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'tour-bookings' && (
              <section className="tab-pane">
                <h2> My Tour Bookings</h2>
                {tourBookings.length === 0 ? (
                  <div className="empty-state">
                    No tours booked yet. Explore our breathtaking packages on the{' '}
                    <a href="/tours" style={{ color: '#d4af37', textDecoration: 'underline' }}>
                      Tours Page
                    </a>!
                  </div>
                ) : (
                  <div className="tour-booking-list">
                    {tourBookings.map((b) => (
                      <div className="tour-booking-card" key={b._id}>
                        {b.tourCoverImage && (
                          <img src={b.tourCoverImage} alt={b.tourTitle} className="tour-booking-img" />
                        )}
                        <div className="tour-booking-content">
                          <div className="tour-booking-header">
                            <div>
                              <h3 className="tour-booking-title">{b.tourTitle}</h3>
                              <div className="tour-booking-subtitle">
                                Booked on {new Date(b.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <span className={`tour-booking-badge ${getTourBookingStatusClass(b.status)}`}>
                              {getTourBookingStatusLabel(b.status)}
                            </span>
                          </div>

                          <div className="tour-booking-details">
                            <div className="tour-booking-detail-item">
                              <strong>Date:</strong> {b.date || 'Not specified'}
                            </div>
                            <div className="tour-booking-detail-item">
                              <strong>Adults:</strong> {b.adults}
                            </div>
                            <div className="tour-booking-detail-item">
                              <strong>Children:</strong> {b.children}
                            </div>
                            <div className="tour-booking-detail-item">
                              <strong>Lead Traveler:</strong> {b.fullName || b.bookedByName || user?.name || 'Guest'}
                            </div>
                            <div className="tour-booking-detail-item">
                              <strong>Email:</strong> {b.email || b.bookedByEmail || user?.email || 'N/A'}
                            </div>
                            <div className="tour-booking-detail-item">
                              <strong>Payment:</strong> {b.paymentMethod === 'pay_at_site' ? 'Pay at Site' : b.paymentMethod || 'Pay at Site'}
                            </div>
                            <div className="tour-booking-detail-item">
                              <strong>Contact:</strong> {b.phoneNumber || b.bookedByPhone || 'N/A'}
                            </div>
                            <div className="tour-booking-detail-item">
                              <strong>Address:</strong> {b.address || 'N/A'}
                            </div>
                          </div>

                          <div className="tour-booking-footer">
                            <span className="tour-booking-total">Total: Rs. {b.total}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

          </main>
        </div>
      </div>
    </>
  )
}

export default UserDashboard



