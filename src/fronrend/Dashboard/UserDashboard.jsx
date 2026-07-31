import { useState, useEffect } from 'react'
import { FaTicketAlt, FaHistory, FaCalendarPlus, FaSuitcase } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import Components from '../componets/componets'
import './UserDashboard.css'
import { getApiUrl } from '../../config/api'

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

const getEventBookingStatusClass = (status) => {
  const normalized = String(status || 'Upcoming').toLowerCase()
  if (normalized === 'ongoing') return 'ongoing'
  if (normalized === 'completed') return 'completed'
  return 'upcoming'
}

const normalizeTourBooking = (booking) => {
  const bookingId = booking?._id || booking?.id || `tour_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  if (bookingId.startsWith('tb_')) {
    return { ...booking, _id: bookingId.replace(/^tb_/, 'tour_') }
  }
  return { ...booking, _id: bookingId }
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
  
  const getTodayStr = () => new Date().toISOString().split('T')[0]
  const getTomorrowStr = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  const [activeTab, setActiveTab] = useState('book-room')
  const [rooms, setRooms] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memberCount, setMemberCount] = useState(1)
  const [checkIn, setCheckIn] = useState(getTodayStr())
  const [checkOut, setCheckOut] = useState(getTomorrowStr())
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
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
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const selectedRoom = rooms.find((room) => room._id === selectedRoomId)
  const recommendedRooms = rooms.filter((room) => Number(room.totalMembers || 0) >= memberCount)
  const formatRoomPrice = (room) => `Rs. ${Number(room?.roomPrice || room?.price || 0).toLocaleString()}`

  const fetchAllBookings = async () => {
    try {
      const response = await fetch(BOOKINGS_API_URL)
      if (response.ok) {
        const data = await response.json()
        // Support both array responses and { data: [...] } shape
        const bookingsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : [])
        setAllBookings(bookingsArray)
      }
    } catch (error) {
      console.error('Error fetching all bookings:', error)
    }
  }

  // Fetch reviews from API on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [roomsResponse, bookingsResponse] = await Promise.all([
          fetch(ROOMS_API_URL),
          fetch(BOOKINGS_API_URL)
        ])

        if (roomsResponse.ok) {
          const data = await roomsResponse.json()
          // Rooms endpoint may return { data: [...], pagination } — accept either
          const roomsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : [])
          setRooms(roomsArray)
          if (roomsArray.length > 0) {
            setSelectedRoomId((currentSelectedRoomId) => currentSelectedRoomId || roomsArray[0]._id)
          }
        }

        if (bookingsResponse.ok) {
          const data = await bookingsResponse.json()
          const bookingsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : [])
          setAllBookings(bookingsArray)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }
    fetchDashboardData()
  }, [])

  const checkRoomAvailability = (roomId) => {
    if (!checkIn || !checkOut) return true;
    
    const targetCheckIn = parseBookingDate(checkIn);
    const targetCheckOut = parseBookingDate(checkOut);
    if (!targetCheckIn || !targetCheckOut || targetCheckOut <= targetCheckIn) return true;

    // Filter bookings for this room that are verified or status !== 'Cancelled'
    const conflicts = allBookings.filter(b => {
      if (b.roomId !== roomId) return false;
      if (b.status === 'Cancelled') return false;
      
      const existingCheckIn = parseBookingDate(b.checkIn);
      const existingCheckOut = parseBookingDate(b.checkOut);
      if (!existingCheckIn || !existingCheckOut) return false;
      
      // Overlap condition
      return existingCheckIn < targetCheckOut && targetCheckIn < existingCheckOut;
    });

    return conflicts.length === 0;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${BOOKINGS_API_URL}?bookedBy=${encodeURIComponent(bookingOwnerId)}`)
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
    
    console.log('[ROOM-BOOKING] Form submission started')
    console.log('[ROOM-BOOKING] Selected room:', selectedRoom)
    console.log('[ROOM-BOOKING] Check-in:', checkIn, 'Check-out:', checkOut)

    const errors = {}

    if (!selectedRoomId) errors.room = 'Please select a room.'
    if (!checkIn) errors.checkIn = 'Check-in date is required.'
    if (!checkOut) errors.checkOut = 'Check-out date is required.'

    if (fullName.trim().length < 2) errors.fullName = 'Full Name must be at least 2 characters.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.'
    if (phone && !/^\+?[0-9\s\-()]{7,15}$/.test(phone)) errors.phone = 'Please enter a valid phone number.'

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsedCheckIn = parseBookingDate(checkIn);
    if (checkIn && (!parsedCheckIn || parsedCheckIn < today)) {
      errors.checkIn = 'Check-in date cannot be in the past.'
    }

    const parsedCheckOut = parseBookingDate(checkOut);
    if (checkIn && checkOut && (!parsedCheckOut || parsedCheckOut <= parsedCheckIn)) {
      errors.checkOut = 'Check-out date must be after the check-in date.'
    }

    if (!selectedRoom) {
      errors.room = 'Please choose a valid room.'
    }

    if (Object.keys(errors).length > 0) {
      console.log('[ROOM-BOOKING] Validation errors:', errors)
      setFormErrors(errors)
      return
    }

    setFormErrors({})

    const existingBookings = bookings
    const conflictingBooking = existingBookings.find((booking) =>
      isBookingConflict(booking, checkIn, checkOut, selectedRoom._id)
    )

    if (conflictingBooking) {
      console.log('[ROOM-BOOKING] Room conflict detected:', conflictingBooking)
      alert(`This room is already booked for the selected time.\nRoom:`)
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
      setSubmitting(true)
      console.log('[ROOM-BOOKING] Sending booking request to API...')
      
      const cIn = new Date(checkIn);
      const cOut = new Date(checkOut);
      const days = Math.ceil(Math.abs(cOut - cIn) / (1000 * 60 * 60 * 24)) || 1;
      const computedTotalPrice = selectedRoom.price * days;

      const bookingPayload = {
        roomId: selectedRoom._id,
        roomTitle: selectedRoom.title,
        roomPrice: computedTotalPrice,
        totalMembers: selectedRoom.totalMembers,
        members: memberCount,
        checkIn,
        checkOut,
        bookedBy: bookingOwnerId,
        bookedByName: fullName || user?.name || 'Guest',
        bookedByEmail: email || user?.email || '',
        phone: phone || '',
      }
      
      console.log('[ROOM-BOOKING] Payload:', bookingPayload)

      const response = await fetch(BOOKINGS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      })

      console.log('[ROOM-BOOKING] Response status:', response.status)
      const data = await response.json()
      console.log('[ROOM-BOOKING] Response data:', data)

      if (!response.ok) {
        if (response.status === 409) {
          alert(`This room is already booked for the selected time.\nRoom`)
          return
        }
        throw new Error(data?.error || 'Failed to book room')
      }

      setBookings((currentBookings) => [data, ...currentBookings])
      localStorage.setItem(bookingsCacheKey, JSON.stringify([data, ...bookings]))
      fetchAllBookings()
      setIsModalOpen(false)
      alert(`Room booked successfully!\nRoom: ${selectedRoom.title}\nPrice: ${formatRoomPrice(selectedRoom)}\nMembers: ${memberCount}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}`)

      setCheckIn(getTodayStr())
      setCheckOut(getTomorrowStr())
      setMemberCount(1)
      setPhone('')
      if (!user) {
        setFullName('')
        setEmail('')
      }
      
      console.log('[ROOM-BOOKING] Booking completed successfully')
    } catch (error) {
      console.error('[ROOM-BOOKING] Error:', error)
      alert(error.message || 'Failed to book room')
    } finally {
      setSubmitting(false)
    }
  }




  return (
    <>
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
              { id: 'book-room', label: 'Book a Room', icon: <FaCalendarPlus /> },
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
            {activeTab === 'book-room' && (
              <section className="tab-pane">
                <h2>🏨 Browse & Book Rooms</h2>
                


                {/* Rooms Grid */}
                <div className="rooms-booking-grid">
                  {rooms.map((room) => {
                    const isAvailable = checkRoomAvailability(room._id);
                    const roomCover = room.images && room.images.length > 0 ? room.images[0] : null;
                    
                    return (
                      <div className="room-booking-card" key={room._id}>
                        <div className="room-booking-img-wrapper">
                          {roomCover ? (
                            <img src={roomCover} alt={room.title} className="room-booking-img" />
                          ) : (
                            <div className="room-booking-img-placeholder">
                              <span>🏨 {room.title}</span>
                            </div>
                          )}
                          <span className={`room-availability-badge ${isAvailable ? 'available' : 'booked'}`}>
                            {isAvailable ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                        
                        <div className="room-booking-details-box">
                          <div className="room-booking-header-row">
                            <h3 className="room-booking-title">{room.title}</h3>
                            <span className="room-booking-price-tag">Rs. {Number(room.price).toLocaleString()} <small>/ night</small></span>
                          </div>
                          
                          <p className="room-booking-desc">{room.description || 'Enjoy premium stay options, comfort, and state-of-the-art facilities.'}</p>
                          
                          <div className="room-booking-specs">
                            <span>👥 Max Guests: {room.totalMembers || 2}</span>
                            <span>🔑 Floor: 1</span>
                          </div>
                          
                          {isAvailable ? (
                            <button 
                              type="button" 
                              className="btn-book-room-action"
                              onClick={() => {
                                setSelectedRoomId(room._id);
                                setIsModalOpen(true);
                              }}
                            >
                              Book Room
                            </button>
                          ) : (
                            <div className="room-unavailable-msg">Room is not available</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Booking Modal */}
                {isModalOpen && selectedRoom && (
                  <div className="booking-modal-overlay">
                    <div className="booking-modal-content">
                      <div className="booking-modal-header">
                        <h3>Book {selectedRoom.title}</h3>
                        <button type="button" className="close-modal-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                      </div>
                      
                      <form className="booking-modal-form" onSubmit={handleRoomBooking}>
                        <div className="modal-summary-box">
                          <p><strong>Price per night:</strong> Rs. {Number(selectedRoom.price).toLocaleString()}</p>
                          <p><strong>Selected Dates:</strong> {checkIn} to {checkOut}</p>
                          
                          {(() => {
                            const cIn = new Date(checkIn);
                            const cOut = new Date(checkOut);
                            if (cOut > cIn) {
                              const days = Math.ceil(Math.abs(cOut - cIn) / (1000 * 60 * 60 * 24)) || 1;
                              const totalPrice = (selectedRoom.price || 0) * days;
                              return (
                                <p className="modal-total-estimate">
                                  Stay Duration: <strong>{days} {days === 1 ? 'Night' : 'Nights'}</strong><br/>
                                  Total Price: <strong>Rs. {totalPrice.toLocaleString()}</strong>
                                </p>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        <div className="form-group">
                          <label>Check-in Date</label>
                          <input
                            className={formErrors.checkIn ? 'input-error' : ''}
                            type="date"
                            min={getTodayStr()}
                            value={checkIn}
                            onChange={(e) => {
                              setCheckIn(e.target.value);
                              setFormErrors(prev => ({...prev, checkIn: ''}));
                            }}
                            required
                          />
                          {formErrors.checkIn && <span className="error-text">{formErrors.checkIn}</span>}
                        </div>

                        <div className="form-group">
                          <label>Check-out Date</label>
                          <input
                            className={formErrors.checkOut ? 'input-error' : ''}
                            type="date"
                            min={checkIn || getTodayStr()}
                            value={checkOut}
                            onChange={(e) => {
                              setCheckOut(e.target.value);
                              setFormErrors(prev => ({...prev, checkOut: ''}));
                            }}
                            required
                          />
                          {formErrors.checkOut && <span className="error-text">{formErrors.checkOut}</span>}
                        </div>

                        <div className="form-group">
                          <label>Full Name</label>
                          <input
                            className={formErrors.fullName ? 'input-error' : ''}
                            type="text"
                            value={fullName}
                            onChange={(e) => {
                              setFullName(e.target.value);
                              setFormErrors(prev => ({...prev, fullName: ''}));
                            }}
                            required
                          />
                          {formErrors.fullName && <span className="error-text">{formErrors.fullName}</span>}
                        </div>

                        <div className="form-group">
                          <label>Email Address</label>
                          <input
                            className={formErrors.email ? 'input-error' : ''}
                            type="email"
                            placeholder="e.g. user@example.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setFormErrors(prev => ({...prev, email: ''}));
                            }}
                            required
                          />
                          {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                        </div>

                        <div className="form-group">
                          <label>Phone Number</label>
                          <input
                            className={formErrors.phone ? 'input-error' : ''}
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              setFormErrors(prev => ({...prev, phone: ''}));
                            }}
                            required
                          />
                          {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                        </div>

                        <div className="form-group">
                          <label>Number of Guests</label>
                          <input
                            type="number"
                            min="1"
                            max={selectedRoom.totalMembers || 10}
                            value={memberCount}
                            onChange={(e) => setMemberCount(Number(e.target.value))}
                          />
                        </div>

                        <div className="modal-actions">
                          <button className="btn cancel-btn" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                          <button className="btn gold confirm-btn" type="submit" disabled={submitting}>
                            {submitting ? 'Booking...' : 'Confirm Reservation'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </section>
            )}

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

          </main>
        </div>
      </div>
    </>
  )
}

export default UserDashboard
