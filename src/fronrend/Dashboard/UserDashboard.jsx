import { useState, useEffect, useMemo, useCallback } from 'react'
import { FaTicketAlt, FaHistory, FaSuitcase } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import Components from '../componets/componets'
import './UserDashboard.css'
import { apiRequest } from '../../utils/apiClient'

const getBookingsCacheKey = (identifier) => `hotel_user_dashboard_bookings_${identifier || 'guest'}`
const buildBookingQuery = (userEmail, deviceId) => {
  const params = new URLSearchParams();
  if (userEmail) {
    params.set('email', userEmail);
    params.set('bookedByEmail', userEmail);
    params.set('guestEmail', userEmail);
  }
  if (deviceId) {
    params.set('deviceId', deviceId);
    params.set('bookedBy', deviceId);
  }
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

const normalizeTourBooking = (booking) => {
  const item = booking || {}
  const bookingId = item._id || item.id || `tour_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const normalizedId = bookingId.startsWith('tb_') ? bookingId.replace(/^tb_/, 'tour_') : bookingId
  const adults = Number(item.adults ?? item.adultCount ?? 0)
  const children = Number(item.children ?? item.childCount ?? 0)
  const tourPrice = Number(item.tourPrice ?? item.price ?? item.totalPrice ?? 0)
  const totalVal = Number(item.totalPrice ?? item.total ?? item.amount ?? (tourPrice ? Math.round(adults * tourPrice + children * tourPrice * 0.7) : 0))

  return {
    ...item,
    _id: normalizedId,
    tourTitle: item.tourName || item.tourTitle || item.tourId?.title || item.title || item.name || 'Tour Booking',
    tourCoverImage: item.tourCoverImage || item.tourId?.coverImage || item.coverImage || item.imageUrl || item.tourImage || '',
    date: item.travelDate || item.date || item.tourDate || '',
    fullName: item.bookedByName || item.fullName || item.bookedBy || '',
    phoneNumber: item.bookedByPhone || item.phoneNumber || item.phone || '',
    email: item.bookedByEmail || item.email || '',
    address: item.address || '',
    country: item.country || '',
    paymentMethod: item.paymentMethod || item.payment || 'pay_at_site',
    total: totalVal,
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
  const storedGuestEmail = typeof window !== 'undefined'
    ? (localStorage.getItem('hotel_guest_email') || localStorage.getItem('guest_email') || localStorage.getItem('hotel_user_email') || '')
    : ''
  const [lookupEmail, setLookupEmail] = useState(user?.email || storedGuestEmail)
  const activeEmail = user?.email || lookupEmail
  const bookingOwnerId = activeEmail || deviceId
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

  const bookingQuery = useMemo(() => buildBookingQuery(activeEmail, deviceId), [activeEmail, deviceId])

  const fetchBookings = useCallback(async () => {
    try {
      const query = bookingQuery ? `?${bookingQuery}` : ''
      const data = await apiRequest(`/api/bookings${query}`)
      const bookingsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : [])
      setBookings(bookingsArray)
      if (bookingsArray.length > 0) {
        localStorage.setItem(bookingsCacheKey, JSON.stringify(bookingsArray))
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }, [bookingQuery, bookingsCacheKey])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    const fetchEventBookings = async () => {
      const storedToken = token || localStorage.getItem('token');
      try {
        const endpoint = storedToken 
          ? '/api/events/my-bookings'
          : `/api/events/my-bookings-by-email?${bookingQuery}`;
        const data = await apiRequest(endpoint);
        const eventsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        setEventBookings(eventsArray);
      } catch (err) {
        console.error('Error fetching event bookings:', err);
      }
    };

    fetchEventBookings();
  }, [token, bookingQuery]);

  useEffect(() => {
    const fetchTourBookings = async () => {
      const storedToken = token || localStorage.getItem('token');
      try {
        const endpoint = storedToken
          ? '/api/tours/my-bookings'
          : `/api/tours/my-bookings-guest?${bookingQuery}`;
        const data = await apiRequest(endpoint);
        const toursArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        setTourBookings(toursArray.map(normalizeTourBooking));
      } catch (error) {
        console.error('Error fetching tour bookings:', error);
      }
    };
    fetchTourBookings();
  }, [token, bookingQuery]);

  return (
    <>
      <Components />
      <div className="user-dashboard-wrapper">
        <div className="user-dashboard-header">
          <div className="user-profile-summary">
            <div className="avatar" style={{ cursor: 'default' }}>{user?.name ? user.name[0].toUpperCase() : 'U'}</div>

            <div>
              <h1>Welcome{user?.name ? `, ${user.name}` : ''}</h1>
              <p>Manage your room reservations, event tickets, and tour bookings in your personal portal.</p>
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
                          <th>Booking ID</th>
                          <th>Guests</th>
                          <th>Check-in</th>
                          <th>Check-out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => {
                          const roomTitle = booking.roomName || booking.roomTitle || booking.title || 'Room';
                          const priceVal = booking.totalPrice ?? booking.roomPrice ?? booking.price ?? 0;
                          const code = booking.bookingId || booking.verificationCode || booking._id?.slice(-6) || '-';
                          const guestCount = booking.guests ?? booking.members ?? 1;
                          return (
                            <tr key={booking._id || booking.id || code}>
                              <td><strong>{roomTitle}</strong></td>
                              <td>Rs. {Number(priceVal).toLocaleString()}</td>
                              <td><code style={{ fontSize: '0.75rem', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{code}</code></td>
                              <td>{guestCount} guest(s)</td>
                              <td>{booking.checkIn}</td>
                              <td>{booking.checkOut}</td>
                            </tr>
                          );
                        })}
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
                              <strong>Address:</strong> {b.address || 'N/A'}{b.country ? `, ${b.country}` : ''}
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



