import { useState, useEffect } from 'react';
import Components from '../componets/componets';
import LastComponents from '../componets/LastComponents';
import { useAuth } from '../../context/AuthContext';
import './Events.css';

const API_URL = '';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    ticketsCount: 1,
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: user ? user.phone || '' : ''
  });
  const [bookingMessage, setBookingMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketBooking, setTicketBooking] = useState(null);
  const [ticketQrDataUrl, setTicketQrDataUrl] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) {
      setBookingForm((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || prev.phone || ''
      }));
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/events`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError('Could not load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (event) => {
    setSelectedEvent(event);
    setBookingForm({
      ticketsCount: 1,
      name: user ? user.name : '',
      email: user ? user.email : '',
      phone: user ? user.phone || '' : ''
    });
    setBookingMessage('');
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (bookingForm.ticketsCount > selectedEvent.availableSeats) {
      setBookingMessage('Not enough seats available.');
      return;
    }

    try {
      setIsSubmitting(true);
      setBookingMessage('');

      const headers = {
        'Content-Type': 'application/json',
      };
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/events/book`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventId: selectedEvent._id,
          ticketsCount: Number(bookingForm.ticketsCount),
          bookedByName: bookingForm.name,
          bookedByEmail: bookingForm.email,
          bookedByPhone: bookingForm.phone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      const qrPayload = {
        bookingId: data._id,
        eventTitle: data.eventTitle,
        guestName: data.bookedByName || bookingForm.name,
        guestEmail: data.bookedByEmail || bookingForm.email,
        guestPhone: data.bookedByPhone || bookingForm.phone || '',
        ticketsCount: data.ticketsCount,
        totalAmount: data.eventPrice * data.ticketsCount,
        bookedAt: data.createdAt
      };
      const qrUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), { width: 240, margin: 1 });

      setTicketBooking(data);
      setTicketQrDataUrl(qrUrl);
      setShowTicketModal(true);
      setBookingMessage('Successfully Booked! Enjoy your event.');
      setTimeout(() => {
        setShowBookingModal(false);
        fetchEvents();
      }, 1000);
    } catch (err) {
      console.error(err);
      setBookingMessage(err.message || 'Failed to book tickets. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="events-page">
      <Components />
      
      <section className="events-hero">
        <div className="hero-content">
          <h1>Exclusive himalaya Events & Gatherings</h1>
          <p>Unforgettable experiences nestled in the clouds. Join us for premium local concerts, bonfire nights, guided treks, and cultural culinary dining.</p>
        </div>
      </section>

      <main className="events-container">
        {loading ? (
          <div className="events-loading">
            <div className="spinner"></div>
            <p>Loading curated experiences...</p>
          </div>
        ) : error ? (
          <div className="events-error">
            <p>{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="no-events">
            <h3>No Upcoming Events</h3>
            <p>We are currently designing new experiences. Please check back soon!</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => {
              const isSoldOut = event.availableSeats <= 0;
              return (
                <div key={event._id} className="event-card">
                  <div className="event-image-wrapper">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="event-image" />
                    ) : (
                      <div className="event-placeholder-image">🏔️ {event.title}</div>
                    )}
                    <div className="event-price-badge">
                      {event.price > 0 ? `Rs. ${event.price}` : 'FREE'}
                    </div>
                  </div>
                  <div className="event-details">
                    <h2 className="event-title">{event.title}</h2>
                    <p className="event-desc">{event.description}</p>
                    
                    <div className="event-meta">
                      <div className="meta-item">
                        <span className="icon">📅</span>
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="meta-item">
                        <span className="icon">📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="meta-item">
                        <span className="icon">👥</span>
                        <span>{event.availableSeats} of {event.totalSeats} seats left</span>
                      </div>
                    </div>

                    <div className="event-payment-note">Cash payment accepted on site</div>

                    <button 
                      type="button" 
                      onClick={() => handleOpenBooking(event)} 
                      disabled={isSoldOut}
                      className={`book-button ${isSoldOut ? 'sold-out' : ''}`}
                    >
                      {isSoldOut ? 'Sold Out' : 'Book Event'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="booking-modal-content">
            <button type="button" className="close-modal" onClick={() => setShowBookingModal(false)}>&times;</button>
            <h2>Book Tickets for {selectedEvent.title}</h2>
            <p className="modal-event-details">📅 {selectedEvent.date} | 📍 {selectedEvent.location}</p>
            
            <form onSubmit={handleBookingSubmit} className="booking-modal-form">
              <div className="form-group">
                <label htmlFor="name-input">Full Name</label>
                <input 
                  id="name-input"
                  type="text" 
                  value={bookingForm.name} 
                  onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})} 
                  required 
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email-input">Email Address</label>
                <input 
                  id="email-input"
                  type="email" 
                  value={bookingForm.email} 
                  onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})} 
                  required 
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone-input">Phone Number</label>
                <input 
                  id="phone-input"
                  type="tel" 
                  value={bookingForm.phone} 
                  onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})} 
                  required 
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tickets-input">Number of Tickets</label>
                <input 
                  id="tickets-input"
                  type="number" 
                  min="1" 
                  max={selectedEvent.availableSeats}
                  value={bookingForm.ticketsCount} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setBookingForm({...bookingForm, ticketsCount: ''});
                      return;
                    }
                    const parsed = parseInt(val, 10);
                    if (isNaN(parsed)) return;
                    setBookingForm({...bookingForm, ticketsCount: Math.min(selectedEvent.availableSeats, Math.max(1, parsed))});
                  }}
                  required 
                />
                <span className="available-seats-hint">Max {selectedEvent.availableSeats} tickets available</span>
              </div>

              <div className="booking-summary">
                <div className="summary-row">
                  <span>Price per ticket:</span>
                  <span>Rs. {selectedEvent.price}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>Rs. {selectedEvent.price * bookingForm.ticketsCount}</span>
                </div>
              </div>

              {bookingMessage && (
                <div className={`booking-message ${bookingMessage.includes('Successfully') ? 'success' : 'error'}`}>
                  {bookingMessage}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="modal-submit-button">
                {isSubmitting ? 'Processing Booking...' : 'Confirm & Book'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showTicketModal && ticketBooking && (
        <div className="qr-modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="qr-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="close-modal" onClick={() => setShowTicketModal(false)}>&times;</button>
            <div className="qr-modal-header">
              <h3>{ticketBooking.eventTitle}</h3>
              <p>Your event ticket is ready</p>
            </div>
            <div className="qr-ticket-box">
              {ticketQrDataUrl ? <img src={ticketQrDataUrl} alt="Event QR code" className="qr-ticket-image" /> : <div className="qr-loading">Generating QR…</div>}
            </div>
            <p className="qr-ticket-help">Please scan this QR during the event for fast entry.</p>
            <div className="qr-ticket-meta">
              <span>Guest: {ticketBooking.bookedByName || bookingForm.name}</span>
              <span>Tickets: {ticketBooking.ticketsCount}</span>
            </div>
            <button
              type="button"
              className="modal-submit-button"
              onClick={() => {
                const link = document.createElement('a');
                link.href = ticketQrDataUrl;
                link.download = `${(ticketBooking.eventTitle || 'event').toLowerCase().replace(/\s+/g, '-')}-ticket.png`;
                link.click();
              }}
            >
              Download QR
            </button>
          </div>
        </div>
      )}

      <LastComponents />
    </div>
  );
};

export default Events;
