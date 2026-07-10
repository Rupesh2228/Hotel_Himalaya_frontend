import { useState, useCallback, useEffect } from 'react'
import { FaHeart, FaRegHeart, FaTicketAlt, FaStar, FaHistory, FaCalendarPlus, FaSignOutAlt, FaSuitcase } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Components from '../componets/componets'
import Loader from '../componets/Loader'
import './UserDashboard.css'
import { getApiUrl } from '../../config/api'

const API_URL = `${getApiUrl()}/api/reviews`
const ROOMS_API_URL = `${getApiUrl()}/api/rooms`
const BOOKINGS_API_URL = `${getApiUrl()}/api/bookings`
const EVENT_BOOKINGS_API_URL = `${getApiUrl()}/api/events/my-bookings`
const getBookingsCacheKey = (identifier) => `hotel_user_dashboard_bookings_${identifier || 'guest'}`
const parseBookingDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
const isBookingConflict = (existingBooking, nextCheckIn, nextCheckOut, roomId) => {
  if (existingBooking.roomId !== roomId) return false
  const existingCheckIn = parseBookingDate(existingBooking.checkIn)
  const existingCheckOut = parseBookingDate(existingBooking.checkOut)
  const newCheckIn = parseBookingDate(nextCheckIn)
  const newCheckOut = parseBookingDate(nextCheckOut)

  if (!existingCheckIn || !existingCheckOut || !newCheckIn || !newCheckOut) return false
  return existingCheckIn <= newCheckOut && newCheckIn <= existingCheckOut
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
  const bookingId = booking?._id || booking?.id || `tour_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  if (bookingId.startsWith('tb_')) {
    return { ...booking, _id: bookingId.replace(/^tb_/, 'tour_') }
  }
  return { ...booking, _id: bookingId }
}

const isLegacyGoogleReview = (review) =>
  /google review/i.test(review?.author || '') ||
  /welcome to hotel hi khokana/i.test(review?.text || '')

const getDeviceId = () => {
  let id = localStorage.getItem('hotel_device_id')
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('hotel_device_id', id)
  }
  return id
}

const UserDashboard = () => {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('book-room')
  const [reviews, setReviews] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [memberCount, setMemberCount] = useState(1)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const deviceId = getDeviceId();
  const bookingOwnerId = user?.email || deviceId;
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
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const selectedRoom = rooms.find((room) => room._id === selectedRoomId)
  const recommendedRooms = rooms.filter((room) => Number(room.totalMembers || 0) >= memberCount)
  const formatRoomPrice = (room) => `Rs. ${Number(room?.roomPrice || room?.price || 0).toLocaleString()}`

  // Fetch reviews from API on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [reviewsResponse, roomsResponse] = await Promise.all([
          fetch(API_URL),
          fetch(ROOMS_API_URL),
        ])

        if (reviewsResponse.ok) {
          const data = await reviewsResponse.json()
          setReviews(data.filter((review) => !isLegacyGoogleReview(review)))
        }

        if (roomsResponse.ok) {
          const data = await roomsResponse.json()
          setRooms(data)
          if (data.length > 0) {
            setSelectedRoomId((currentSelectedRoomId) => currentSelectedRoomId || data[0]._id)
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${BOOKINGS_API_URL}?bookedBy=${encodeURIComponent(bookingOwnerId)}`)
        if (response.ok) {
          const data = await response.json()
          setBookings(data)
          localStorage.setItem(bookingsCacheKey, JSON.stringify(data))
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      }
    }

    fetchBookings()
  }, [bookingOwnerId, bookingsCacheKey])

  useEffect(() => {
    const fetchEventBookings = async () => {
      const storedToken = token || localStorage.getItem('token');
      if (!storedToken) return;
      try {
        const response = await fetch(EVENT_BOOKINGS_API_URL, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setEventBookings(data);
        }
      } catch (error) {
        console.error('Error fetching event bookings:', error);
      }
    };
    fetchEventBookings();
  }, [token]);

  useEffect(() => {
    const fetchTourBookings = () => {
      try {
        const stored = localStorage.getItem('himalaya_tour_bookings');
        if (stored) {
          const allBookings = JSON.parse(stored);
          const normalizedBookings = allBookings.map(normalizeTourBooking);
          if (JSON.stringify(allBookings) !== JSON.stringify(normalizedBookings)) {
            localStorage.setItem('himalaya_tour_bookings', JSON.stringify(normalizedBookings));
          }
          const userEmail = user?.email || '';
          const filtered = normalizedBookings.filter(b => b.bookedBy === userEmail || b.email === userEmail);
          setTourBookings(filtered);
        }
      } catch (error) {
        console.error('Error loading tour bookings:', error);
      }
    };
    fetchTourBookings();
  }, [user]);



  const handleRoomBooking = async (e) => {
    e.preventDefault()

    if (!selectedRoomId || !checkIn || !checkOut) {
      alert('Please select a room and fill in the booking dates.')
      return
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedCheckIn = parseBookingDate(checkIn);
    if (!parsedCheckIn || parsedCheckIn < today) {
      alert('Check-in date cannot be in the past.');
      return;
    }
    const parsedCheckOut = parseBookingDate(checkOut);
    if (!parsedCheckOut || parsedCheckOut <= parsedCheckIn) {
      alert('Check-out date must be after the check-in date.');
      return;
    }

    if (!selectedRoom) {
      alert('Please choose a valid room.')
      return
    }

    const existingBookings = bookings
    const conflictingBooking = existingBookings.find((booking) =>
      isBookingConflict(booking, checkIn, checkOut, selectedRoom._id)
    )

    if (conflictingBooking) {
      alert(`This room is already booked for the selected time.\nRoom: ${conflictingBooking.title}\nCode: ${conflictingBooking.verificationCode || '-'}\nStatus: ${getBookingStatus(conflictingBooking)}`)
      return
    }

    if (memberCount > Number(selectedRoom.totalMembers || 0)) {
      const message = recommendedRooms.length > 0
        ? `Selected room allows only ${selectedRoom.totalMembers || 1} members. Recommended rooms:\n${recommendedRooms.map((room) => `- ${room.title} (up to ${room.totalMembers || 1} members)`).join('\n')}`
        : `Selected room allows only ${selectedRoom.totalMembers || 1} members and no other rooms fit this group.`
      alert(message)
      return
    }

    try {
      const cIn = new Date(checkIn);
      const cOut = new Date(checkOut);
      const days = Math.ceil(Math.abs(cOut - cIn) / (1000 * 60 * 60 * 24)) || 1;
      const computedTotalPrice = selectedRoom.price * days;

      const response = await fetch(BOOKINGS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom._id,
          roomTitle: selectedRoom.title,
          roomPrice: computedTotalPrice,
          totalMembers: selectedRoom.totalMembers,
          members: memberCount,
          checkIn,
          checkOut,
          bookedBy: bookingOwnerId,
          bookedByName: user?.name || 'Guest',
          bookedByEmail: user?.email || '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          alert(`This room is already booked for the selected time.\nRoom: ${data?.booking?.roomTitle || data?.booking?.title || selectedRoom.title}\nCode: ${data?.booking?.verificationCode || '-'}\nStatus: ${data?.booking?.status || 'Booked'}`)
          return
        }
        throw new Error(data?.error || 'Failed to book room')
      }

      setBookings((currentBookings) => [data, ...currentBookings])
      localStorage.setItem(bookingsCacheKey, JSON.stringify([data, ...bookings]))
      alert(`Room booked successfully!\nRoom: ${selectedRoom.title}\nPrice: ${formatRoomPrice(selectedRoom)}\nVerification Code: ${data.verificationCode}\nMembers: ${memberCount}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}`)

      setCheckIn('')
      setCheckOut('')
      setMemberCount(1)
    } catch (error) {
      alert(error.message || 'Failed to book room')
    }
  }



  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('You must be logged in to submit a review')
      return
    }

    if (!reviewText.trim() || !rating) {
      alert('Please write a review and select a rating')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: user.name || user.email,
          email: user.email,
          rating: Number(rating),
          text: reviewText.trim(),
        })
      })

      if (!response.ok) throw new Error('Failed to submit review')
      
      const newReview = await response.json()
      setReviews([newReview, ...reviews])
      setReviewText('')
      setRating(5)
      alert('Thank you — your review has been submitted')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLove = useCallback(async (reviewId) => {
    if (!user) {
      alert('Please login to react to reviews.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/${reviewId}/love`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: user.email })
      })

      if (response.ok) {
        const updatedReview = await response.json()
        setReviews(prev => prev.map(r => r._id === reviewId ? updatedReview : r))
      }
    } catch (error) {
      console.error('Error updating review:', error)
    }
  }, [user])
  return (
    <>
      <Components />
      <div className="user-dashboard-wrapper">
        <div className="user-dashboard-header">
          <div className="user-profile-summary">
            <div className="avatar" style={{ cursor: 'default' }}>{user?.name ? user.name[0].toUpperCase() : 'U'}</div>

            <div>
              <h1>Welcome, {user?.name || 'Guest'}</h1>
              <p>Manage your reservations, tickets, and feedback in your personal portal.</p>
            </div>
          </div>
        </div>

        <div className="user-dashboard-layout">
          {/* Sidebar / Tabs Nav */}
          <aside className="user-dashboard-tabs">
            {/* Tab buttons */}
            {[
              { id: 'book-room', label: 'Book a Room', icon: <FaCalendarPlus /> },
              { id: 'my-bookings', label: 'Room Bookings', icon: <FaHistory /> },
              { id: 'event-bookings', label: 'Event Tickets', icon: <FaTicketAlt /> },
              { id: 'tour-bookings', label: 'Tour Bookings', icon: <FaSuitcase /> },
              { id: 'reviews', label: 'Reviews & Feedback', icon: <FaStar /> },
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

            <button 
              type="button" 
              onClick={() => { logout(); navigate('/'); }} 
              className="sidebar-logout-btn"
              style={{ marginTop: '24px' }}
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </aside>

          {/* Tab Content */}
          <main className="user-dashboard-content">
            {activeTab === 'book-room' && (
              <section className="tab-pane">
                <h2>🏨 Book a Luxury Room</h2>
                <form className="form-container" onSubmit={handleRoomBooking}>
                  <div className="form-group">
                    <label>Select Room</label>
                    <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)}>
                      <option value="">Choose a room</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.title} - {formatRoomPrice(room)} - up to {room.totalMembers || 1} guests
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Number of Guests</label>
                    <input
                      type="number"
                      min="1"
                      value={memberCount}
                      onChange={(e) => setMemberCount(Number(e.target.value))}
                    />
                  </div>

                  {selectedRoom && memberCount > Number(selectedRoom.totalMembers || 0) && (
                    <div className="alert-box-warning" style={{ marginBottom: 12, textAlign: 'left' }}>
                      Selected room only fits {selectedRoom.totalMembers || 1} guests.
                      <div style={{ marginTop: 8 }}>
                        Try these rooms instead:
                        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                          {recommendedRooms.length > 0 ? (
                            recommendedRooms.map((room) => (
                              <li key={room._id}>{room.title} - {formatRoomPrice(room)} - up to {room.totalMembers || 1} guests</li>
                            ))
                          ) : (
                            <li>No room fits this guest count right now.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Check-in Date</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]} 
                      value={checkIn} 
                      onChange={(e) => setCheckIn(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Check-out Date</label>
                    <input 
                      type="date" 
                      min={checkIn || new Date().toISOString().split('T')[0]} 
                      value={checkOut} 
                      onChange={(e) => setCheckOut(e.target.value)} 
                    />
                  </div>

                  {selectedRoom && checkIn && checkOut && (
                    (() => {
                      const cIn = new Date(checkIn);
                      const cOut = new Date(checkOut);
                      if (cOut > cIn) {
                        const days = Math.ceil(Math.abs(cOut - cIn) / (1000 * 60 * 60 * 24)) || 1;
                        const totalPrice = (selectedRoom.price || selectedRoom.roomPrice || 0) * days;
                        return (
                          <div className="price-estimate-box">
                            ⏳ Stay Duration: <strong>{days} {days === 1 ? 'Night' : 'Nights'}</strong><br/>
                            💵 Total Price: <strong>Rs. {totalPrice.toLocaleString()}</strong>
                          </div>
                        );
                      }
                      return null;
                    })()
                  )}

                  <button className="btn gold" type="submit">Complete Reservation</button>
                </form>
              </section>
            )}

            {activeTab === 'my-bookings' && (
              <section className="tab-pane">
                <h2>📋 Booked Rooms History</h2>
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
                <h2>🎟️ My Event Tickets</h2>
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
                          <span className={`event-ticket-badge ${b.status === 'Booked' ? 'active' : 'pending'}`}>
                            {b.status}
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
                <h2>🏔️ My Tour Bookings</h2>
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
                              <strong>Lead Traveler:</strong> {b.fullName}
                            </div>
                            <div className="tour-booking-detail-item">
                              <strong>Payment:</strong> {b.paymentMethod === 'pay_at_site' ? 'Pay at Site' : b.paymentMethod || 'Pay at Site'}
                            </div>
                            <div className="tour-booking-detail-item">
                              <strong>Contact:</strong> {b.phoneNumber || 'N/A'}
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

            {activeTab === 'reviews' && (
              <section className="tab-pane">
                <h2>⭐ Share Your Experience</h2>
                <form className="form-container" onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label>Your Rating</label>
                    <select value={rating} onChange={(e) => setRating(e.target.value)}>
                      {[5,4,3,2,1].map((r) => (
                        <option key={r} value={r}>{r} ⭐ {r === 5 ? 'Excellent' : r === 4 ? 'Very Good' : r === 3 ? 'Good' : r === 2 ? 'Fair' : 'Poor'}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Your Review</label>
                    <textarea placeholder="Tell us about your experience at Hotel himalaya Inn..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} />
                  </div>
                  <button className="btn gold" type="submit" disabled={submitting}>
                    {submitting ? '⏳ Submitting...' : '✓ Submit Review'}
                  </button>
                </form>

                <div className="reviews-section-divider">
                  <h3>💬 Guest Reviews ({reviews.length})</h3>
                  {loading ? (
                    <Loader message="Loading reviews..." />
                  ) : reviews.length === 0 ? (
                    <div className="empty-state">No reviews yet. Be the first to share your experience!</div>
                  ) : (
                    <div className="user-reviews-grid">
                      {reviews.map((r) => {
                        const isLoved = (r.lovedBy || []).includes(user?.email || deviceId)
                        const loveCount = (r.lovedBy || []).length || 0

                        return (
                          <div key={r._id} className="review-card">
                            <div className="review-header">
                              <div>
                                <strong>{r.author}</strong>
                              </div>
                              <span className="review-rating">
                                {'⭐'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                              </span>
                            </div>
                            <div className="review-text">{r.text}</div>
                            <div className="review-footer-row">
                              <div className="review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                              <button
                                className={`dash-love-btn ${isLoved ? 'loved' : ''}`}
                                onClick={() => handleLove(r._id)}
                                aria-label={isLoved ? 'Unlike this review' : 'Love this review'}
                              >
                                {isLoved ? <FaHeart /> : <FaRegHeart />}
                                <span className="dash-love-count">{loveCount > 0 ? loveCount : ''}</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

export default UserDashboard
