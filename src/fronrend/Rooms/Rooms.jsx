import { useState, useEffect, useCallback } from 'react';
import { FaBed, FaUser, FaRegCalendarAlt, FaTimes, FaCheckCircle, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
import './Rooms.css';
import Components from '../componets/componets';
import LastComponent from '../componets/LastComponents';
import SEO from '../componets/SEO';
import roomSingle from '../../img/home.jpg';
import { apiRequest } from '../../utils/apiClient';
import { RoomCardSkeleton } from '../componets/SkeletonLoader';
import { ApiErrorCard, StaleRefreshWarning } from '../componets/ErrorState';

const today = new Date().toISOString().split('T')[0];

const getDeviceId = () => {
  let id = localStorage.getItem('hotel_device_id');
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('hotel_device_id', id);
  }
  return id;
};

const initialForm = {
  guestName: '',
  phone: '',
  guestEmail: '',
  guests: 1,
  checkIn: '',
  checkOut: '',
  specialRequest: '',
};

const Rooms = () => {
  const { user } = useAuth();
  const [deviceId] = useState(() => getDeviceId());
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const resolveRoomImage = (images) => {
    if (Array.isArray(images)) return images[0] || roomSingle;
    if (typeof images === 'string') {
      const urls = images.split(',').map((u) => u.trim()).filter(Boolean);
      return urls[0] || roomSingle;
    }
    return roomSingle;
  };

  const [roomsError, setRoomsError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRooms = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setRoomsLoading(true);
    }
    try {
      const data = await apiRequest('/api/rooms');
      const roomsArray = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setRooms(roomsArray);
      localStorage.setItem('himalaya_rooms_db', JSON.stringify(roomsArray));
      setRoomsError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      if (rooms.length === 0) {
        setRoomsError(err.message || 'Unable to connect to the server');
      }
    } finally {
      setRoomsLoading(false);
      setIsRefreshing(false);
    }
  }, [rooms.length]);

  useEffect(() => {
    const stored = localStorage.getItem('himalaya_rooms_db');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRooms(parsed);
        setRoomsLoading(false);
      } catch {
        // ignore malformed cache
      }
    }
    fetchRooms(!!stored);
  }, [fetchRooms]);

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, guestEmail: user.email }));
    }
    if (user?.name) {
      setForm((prev) => ({ ...prev, guestName: user.name }));
    }
  }, [user?.email, user?.name]);

  const openModal = (room) => {
    setSelectedRoom(room);
    setForm({
      ...initialForm,
      guests: 1,
      guestEmail: user?.email || '',
      guestName: user?.name || '',
    });
    setError('');
    setSuccess(null);
  };

  const closeModal = () => {
    setSelectedRoom(null);
    setError('');
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset checkout if it becomes invalid after changing checkin
      if (name === 'checkIn' && updated.checkOut && updated.checkOut <= value) {
        updated.checkOut = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!form.guestName?.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!form.guestEmail?.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!form.phone?.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!form.checkIn || !form.checkOut) {
      setError('Please select check-in and check-out dates.');
      return;
    }
    if (form.checkIn >= form.checkOut) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        roomId: selectedRoom._id,
        // New field names
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.trim(),
        phone: form.phone.trim(),
        guests: Number(form.guests) || 1,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        specialRequest: form.specialRequest?.trim() || '',
        // Legacy field aliases for backward compatibility
        bookedByName: form.guestName.trim(),
        bookedByEmail: form.guestEmail.trim(),
        members: Number(form.guests) || 1,
        bookedBy: user?.email || deviceId,
      };

      const data = await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Update local storage cache so User Dashboard displays the new booking immediately
      try {
        const bookingOwnerId = user?.email || deviceId;
        const cacheKey = `hotel_user_dashboard_bookings_${bookingOwnerId}`;
        const stored = localStorage.getItem(cacheKey);
        const list = stored ? JSON.parse(stored) : [];
        localStorage.setItem(cacheKey, JSON.stringify([data, ...list.filter((b) => b._id !== data._id && b.bookingId !== data.bookingId)]));
      } catch (_) {}

      setSuccess(data);
    } catch (err) {
      console.error('Booking error:', err);
      const errDetails = err?.details;
      if (errDetails && Array.isArray(errDetails.errors) && errDetails.errors.length > 0) {
        setError(errDetails.errors.map((e) => e.msg || e.message).join('. '));
      } else if (errDetails && (errDetails.error || errDetails.message)) {
        setError(errDetails.error || errDetails.message);
      } else {
        setError(err.message || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate nights
  const nights =
    form.checkIn && form.checkOut
      ? Math.max(1, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24)))
      : 0;
  const totalPrice = nights && selectedRoom ? nights * selectedRoom.price : 0;

  return (
    <>
      <Components />
      <SEO page="Rooms" />

      {/* Hero Section */}
      <section className="rooms-hero">
        <h1 className="rooms-title">Luxury Rooms at Hotel Himalaya</h1>
        <p className="rooms-description">
          Experience comfort, elegance, and warm Nepali hospitality at Hotel Himalaya. Our beautifully designed rooms provide modern amenities, peaceful surroundings, and stunning views.
        </p>
      </section>

      <section className="rooms-section" id="rooms" style={{ position: 'relative' }}>
        {roomsError && rooms.length > 0 && (
          <StaleRefreshWarning 
            message="⚠️ Connection error. Showing cached rooms list." 
            onRetry={() => fetchRooms(true)} 
          />
        )}

        {roomsLoading && rooms.length === 0 ? (
          <RoomCardSkeleton count={3} />
        ) : roomsError && rooms.length === 0 ? (
          <ApiErrorCard 
            title="Unable to load rooms" 
            message={roomsError} 
            onRetry={() => fetchRooms(false)} 
          />
        ) : rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
            No rooms available at the moment. Please check back soon.
          </div>
        ) : (
          <div className="rooms-grid" style={{ opacity: isRefreshing ? 0.7 : 1, transition: 'opacity 0.2s' }}>
            {rooms.map((room) => (
              <article key={room._id} className="room-card">
                <div className="room-image-wrapper">
                  <img src={resolveRoomImage(room.images)} alt={room.title || 'Hotel Room'} className="room-image" />
                </div>
                <div className="room-card-body">
                  <h3>{room.title}</h3>
                  <p className="room-subtitle">{room.description}</p>
                  <div className="room-meta">
                    <span className="room-meta-pill"><FaBed /> Bed</span>
                    <span className="room-meta-pill"><FaUser /> {room.totalMembers || 2} Guests</span>
                  </div>
                  <div className="room-footer">
                    <p className="room-price">NPR {room.price} <span>/ night</span></p>
                    <div className="room-actions">
                      <button type="button" className="room-book-btn" onClick={() => openModal(room)}>
                        Book Now <FaRegCalendarAlt size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="last-finished_footer">
        <LastComponent />
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="booking-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="booking-modal">
            <button className="booking-modal-close" onClick={closeModal} type="button" aria-label="Close">
              <FaTimes />
            </button>

            {success ? (
              <div className="booking-success">
                <FaCheckCircle className="booking-success-icon" />
                <h2>Booking Submitted!</h2>
                <p>Your booking request for <strong>{success.roomName || success.roomTitle || selectedRoom.title}</strong> has been received.</p>

                {success.bookingId && (
                  <div className="booking-success-code">
                    Booking ID: <strong>{success.bookingId}</strong>
                  </div>
                )}
                {success.verificationCode && (
                  <div className="booking-success-code" style={{ marginTop: '0.5rem' }}>
                    Verification Code: <strong>{success.verificationCode}</strong>
                  </div>
                )}

                <p className="booking-success-note">
                  ✉️ A confirmation email has been sent to <strong>{success.guestEmail || form.guestEmail}</strong>. Your booking is currently <strong>Pending</strong> and will be confirmed by our team shortly.
                </p>

                <div className="booking-success-details">
                  <span>📅 Check-in: <strong>{success.checkIn}</strong></span>
                  <span>📅 Check-out: <strong>{success.checkOut}</strong></span>
                  <span>👥 Guests: <strong>{success.guests || form.guests}</strong></span>
                  <span>💰 Total: <strong>NPR {(success.totalPrice || totalPrice).toLocaleString()}</strong></span>
                </div>

                <button className="booking-close-btn" onClick={closeModal} type="button">Done</button>
              </div>
            ) : (
              <>
                <div className="booking-modal-header">
                  <h2>Book Room</h2>
                  <p className="booking-room-name">{selectedRoom.title}</p>
                  <p className="booking-room-price">NPR {selectedRoom.price} / night</p>
                </div>

                <form className="booking-form" onSubmit={handleSubmit} noValidate>
                  {/* Row 1: Name + Phone */}
                  <div className="booking-form-row">
                    <div className="booking-field">
                      <label htmlFor="guestName"><FaUser size={11} /> Guest Full Name *</label>
                      <input
                        id="guestName"
                        type="text"
                        name="guestName"
                        placeholder="Your full name"
                        value={form.guestName}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="booking-field">
                      <label htmlFor="phone"><FaPhone size={11} /> Phone Number *</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="e.g. +977 9800000000"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email + Guests */}
                  <div className="booking-form-row">
                    <div className="booking-field">
                      <label htmlFor="guestEmail"><FaEnvelope size={11} /> Email Address *</label>
                      <input
                        id="guestEmail"
                        type="email"
                        name="guestEmail"
                        placeholder="your@email.com"
                        value={form.guestEmail}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div className="booking-field">
                      <label htmlFor="guests"><FaUser size={11} /> Number of Guests *</label>
                      <input
                        id="guests"
                        type="number"
                        name="guests"
                        min="1"
                        max={selectedRoom.totalMembers || 10}
                        value={form.guests}
                        onChange={handleChange}
                        required
                      />
                      <span className="booking-field-hint">Max: {selectedRoom.totalMembers || 10} guests</span>
                    </div>
                  </div>

                  {/* Row 3: Dates */}
                  <div className="booking-form-row">
                    <div className="booking-field">
                      <label htmlFor="checkIn">Check-in Date *</label>
                      <input
                        id="checkIn"
                        type="date"
                        name="checkIn"
                        min={today}
                        value={form.checkIn}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="booking-field">
                      <label htmlFor="checkOut">Check-out Date *</label>
                      <input
                        id="checkOut"
                        type="date"
                        name="checkOut"
                        min={form.checkIn || today}
                        value={form.checkOut}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Row 4: Special Request */}
                  <div className="booking-form-row">
                    <div className="booking-field" style={{ flex: '1 1 100%' }}>
                      <label htmlFor="specialRequest">Special Request <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span></label>
                      <textarea
                        id="specialRequest"
                        name="specialRequest"
                        placeholder="Any special requests or requirements? (early check-in, dietary needs, room preferences…)"
                        value={form.specialRequest}
                        onChange={handleChange}
                        rows={3}
                        maxLength={500}
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      />
                      <span className="booking-field-hint">{form.specialRequest.length}/500 characters</span>
                    </div>
                  </div>

                  {/* Price Summary */}
                  {nights > 0 && (
                    <div className="booking-summary">
                      <span>{nights} night{nights > 1 ? 's' : ''} × NPR {selectedRoom.price.toLocaleString()}</span>
                      <strong>Total: NPR {totalPrice.toLocaleString()}</strong>
                    </div>
                  )}

                  {error && <p className="booking-error" role="alert">{error}</p>}

                  <button type="submit" className="booking-submit-btn" disabled={loading}>
                    {loading ? (
                      <span>Processing<span style={{ animation: 'pulse 1s infinite' }}>…</span></span>
                    ) : (
                      <>Confirm Booking <FaCheckCircle size={14} /></>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Rooms;
