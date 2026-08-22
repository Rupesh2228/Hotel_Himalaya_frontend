import { useState, useEffect } from 'react';
import Components from '../componets/componets';
import LastComponents from '../componets/LastComponents';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
import SEO from '../componets/SEO';
import './Events.css';

const getAuthHeaders = () => { const token = localStorage.getItem('token'); return token ? { Authorization: `Bearer ${token}` } : {}; };


const API_URL = getApiUrl();

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
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

      // Fetch past events
      const pastRes = await fetch(`${API_URL}/api/past-events`);
      if (pastRes.ok) {
        const pastData = await pastRes.json();
        setPastEvents(pastData);
      }
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
          bookedByPhone: bookingForm.phone,
          deviceId: localStorage.getItem('hotel_device_id')
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      setTicketBooking(data);
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
      <SEO page="Events" />
      
      <section className="events-hero">
        <div className="hero-content">
          <h1>Exclusive Hotel Himalaya INN Khona Events & Gatherings</h1>
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
          <div className="events-list">
            {events.map((event) => {
              const isSoldOut = event.availableSeats <= 0;
              const soldOutPercent = event.totalSeats > 0
                ? Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100)
                : 0;
              return (
                <article key={event._id} className="event-medium-card">
                  {/* Left: Image */}
                  <div className="emc-image-col">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="emc-image" />
                    ) : (
                      <div className="emc-placeholder">🏔️</div>
                    )}
                    {isSoldOut && <div className="emc-sold-out-ribbon">Sold Out</div>}
                  </div>

                  {/* Right: Content */}
                  <div className="emc-content">
                    {/* Tag row */}
                    <div className="emc-tags">
                      <span className="emc-tag">
                        {event.price > 0 ? `Rs. ${event.price} / ticket` : 'FREE'}
                      </span>
                      {!isSoldOut && (
                        <span className="emc-tag emc-tag--seats">
                          {event.availableSeats} seats left
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="emc-title">{event.title}</h2>

                    {/* Description */}
                    <p className="emc-desc">{event.description}</p>

                    {/* Meta info row */}
                    <div className="emc-meta-row">
                      <span className="emc-meta-item">
                        <span className="emc-meta-icon">📅</span>
                        {event.date} &nbsp;·&nbsp; {event.time}
                      </span>
                      <span className="emc-meta-item">
                        <span className="emc-meta-icon">📍</span>
                        {event.location}
                      </span>
                    </div>

                    {/* Seat progress bar */}
                    {event.totalSeats > 0 && (
                      <div className="emc-progress-wrap">
                        <div className="emc-progress-bar">
                          <div
                            className={`emc-progress-fill ${soldOutPercent >= 90 ? 'emc-progress-fill--red' : soldOutPercent >= 60 ? 'emc-progress-fill--orange' : ''}`}
                            style={{ width: `${soldOutPercent}%` }}
                          />
                        </div>
                        <span className="emc-progress-label">
                          {event.totalSeats - event.availableSeats} / {event.totalSeats} booked
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="emc-footer">
                      <span className="emc-payment-note">💵 Cash on site</span>
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(event)}
                        disabled={isSoldOut}
                        className={`emc-book-btn ${isSoldOut ? 'emc-book-btn--disabled' : ''}`}
                      >
                        {isSoldOut ? 'Sold Out' : 'Book Now →'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {pastEvents.length > 0 && (
        <section className="past-events-section">
          <div className="past-events-header">
            <h2>Memories from Past Events</h2>
            <p>Take a look at some of the incredible experiences we've hosted recently.</p>
          </div>
          <div className="past-events-grid">
            {pastEvents.map((pe) => (
              <div key={pe._id} className="past-event-card horizontal-card">
                <div className="past-event-image-wrapper">
                  <img src={pe.imageUrl} alt={pe.title} className="past-event-image" />
                </div>
                <div className="past-event-details">
                  <span className="past-event-tag">Completed</span>
                  <h3 className="past-event-title">{pe.title}</h3>
                  <p className="past-event-desc">{pe.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


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
              <p>Your booking is confirmed</p>
            </div>
            <div className="qr-ticket-box booking-confirmation-box">
              <p>Thank you for booking. We look forward to seeing you at the event.</p>
            </div>
            <div className="qr-ticket-meta booking-confirmation-meta">
              <span>Guest: {ticketBooking.bookedByName || bookingForm.name}</span>
              <span>Tickets: {ticketBooking.ticketsCount}</span>
            </div>
            <button
              type="button"
              className="modal-submit-button"
              onClick={() => setShowTicketModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <LastComponents />
    </div>
  );
};

export default Events;

