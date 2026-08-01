import { useState, useEffect } from 'react';
import { FaBed, FaUser, FaRegCalendarAlt, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
import './Rooms.css';
import Components from '../componets/componets';
import LastComponent from '../componets/LastComponents';
import SEO from '../componets/SEO';
import roomSingle from '../../img/home.jpg';

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
  bookedByName: '',
  phone: '',
  bookedByEmail: '',
  address: '',
  members: 1,
  checkIn: '',
  checkOut: '',
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

  const resolveRoomImage = (images) => {
    if (Array.isArray(images)) return images[0] || roomSingle;
    if (typeof images === 'string') {
      const urls = images.split(',').map((u) => u.trim()).filter(Boolean);
      return urls[0] || roomSingle;
    }
    return roomSingle;
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/rooms`);
        if (response.ok) {
          const data = await response.json();
          setRooms(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, bookedByEmail: user.email }));
    }
  }, [user?.email]);

  const openModal = (room) => {
    setSelectedRoom(room);
    setForm({ ...initialForm, members: 1 });
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
        roomTitle: selectedRoom.title,
        roomPrice: selectedRoom.price,
        totalMembers: selectedRoom.totalMembers,
        members: Number(form.members),
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        bookedBy: user?.email || deviceId,
        bookedByName: form.bookedByName,
        bookedByEmail: form.bookedByEmail,
        phone: form.phone,
        address: form.address,
      };

      const res = await fetch(`${getApiUrl()}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Booking failed. Please try again.');
      } else {
        setSuccess(data);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
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

      <section className="rooms-section" id="rooms">
        <div className="rooms-grid">
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
                <h2>Booking Confirmed!</h2>
                <p>Your booking for <strong>{success.roomTitle}</strong> has been received.</p>
                <div className="booking-success-code">
                  Verification Code: <strong>{success.verificationCode}</strong>
                </div>
                <p className="booking-success-note">Please save this code. You will need it at check-in.</p>
                <div className="booking-success-details">
                  <span>📅 Check-in: <strong>{success.checkIn}</strong></span>
                  <span>📅 Check-out: <strong>{success.checkOut}</strong></span>
                  <span>💰 Total: <strong>NPR {success.roomPrice}</strong></span>
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

                <form className="booking-form" onSubmit={handleSubmit}>
                  <div className="booking-form-row">
                    <div className="booking-field">
                      <label htmlFor="bookedByName">Full Name *</label>
                      <input
                        id="bookedByName"
                        type="text"
                        name="bookedByName"
                        placeholder="Your full name"
                        value={form.bookedByName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="booking-field">
                      <label htmlFor="phone">Phone Number *</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="e.g. +977 9800000000"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="booking-form-row">
                    <div className="booking-field">
                      <label htmlFor="bookedByEmail">Email *</label>
                      <input
                        id="bookedByEmail"
                        type="email"
                        name="bookedByEmail"
                        placeholder="your@email.com"
                        value={form.bookedByEmail}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="booking-field">
                      <label htmlFor="address">Address *</label>
                      <input
                        id="address"
                        type="text"
                        name="address"
                        placeholder="Your address"
                        value={form.address}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="booking-form-row">
                    <div className="booking-field">
                      <label htmlFor="members">Number of Guests *</label>
                      <input
                        id="members"
                        type="number"
                        name="members"
                        min="1"
                        max={selectedRoom.totalMembers || 10}
                        value={form.members}
                        onChange={handleChange}
                        required
                      />
                      <span className="booking-field-hint">Max: {selectedRoom.totalMembers || 10} guests</span>
                    </div>
                  </div>

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

                  {nights > 0 && (
                    <div className="booking-summary">
                      <span>{nights} night{nights > 1 ? 's' : ''} × NPR {selectedRoom.price}</span>
                      <strong>Total: NPR {totalPrice}</strong>
                    </div>
                  )}

                  {error && <p className="booking-error">{error}</p>}

                  <button type="submit" className="booking-submit-btn" disabled={loading}>
                    {loading ? 'Processing...' : 'Confirm Booking'}
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
