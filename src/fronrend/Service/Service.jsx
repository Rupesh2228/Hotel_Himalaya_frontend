import { useState, useCallback, useEffect } from 'react';
import { FaBed, FaLeaf, FaWifi, FaBell, FaFire, FaBuilding, FaHeart, FaRegHeart, FaStar, FaUser } from "react-icons/fa";
import "./Service.css";
import Components from "../componets/componets";
import background from "../../img/background.jpg";
import LastComponent from '../componets/LastComponents';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';

const API_URL = `${getApiUrl()}/api/reviews`;

const isLegacyGoogleReview = (review) =>
  /google review/i.test(review?.author || '') ||
  /welcome to hotel hi khokana/i.test(review?.text || '');

// Generate or retrieve a simple device ID so same browser can't love twice
const getDeviceId = () => {
  let id = localStorage.getItem('hotel_device_id')
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('hotel_device_id', id)
  }
  return id
}


// ── Reviews List Component ──
const ReviewsList = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deviceId] = useState(() => getDeviceId());
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [author, setAuthor] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [submissionState, setSubmissionState] = useState({ loading: false, error: '', success: '' });

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.filter((review) => !isLegacyGoogleReview(review)));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (user) {
      setAuthor(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!reviewText.trim()) {
      setSubmissionState({ loading: false, error: 'Please enter your review.', success: '' });
      return;
    }

    setSubmissionState({ loading: true, error: '', success: '' });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: author.trim() || 'Guest',
          email: email.trim(),
          rating,
          text: reviewText.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to submit review.');
      }

      const createdReview = await response.json();
      setReviews((prevReviews) => [createdReview, ...prevReviews]);
      setReviewText('');
      setRating(0);
      setSubmissionState({ loading: false, error: '', success: 'Thank you! Your review has been submitted.' });
    } catch (err) {
      console.error('Review submit error:', err);
      setSubmissionState({ loading: false, error: 'Failed to submit review. Please try again later.', success: '' });
    }
  };

  const handleLove = useCallback(async (reviewId) => {
    const identifier = user?.email || deviceId;
    if (!identifier) {
     alert('Cannot react to reviews at this time.');
     return;
    }

    try {
      const response = await fetch(`${API_URL}/${reviewId}/love`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      if (response.ok) {
        const updatedReview = await response.json();
        setReviews(prev => prev.map(r => r._id === reviewId ? updatedReview : r));
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  }, [user, deviceId]);

  return (
    <div className="reviews-content">
      <div className="review-form-card service-review-card">
        <div className="review-form-header">
          <h3>Share your experience</h3>
          <p>Help other guests by leaving your honest feedback about our services.</p>
        </div>

        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-form-row">
            <label htmlFor="review-author">Name</label>
            <input
              id="review-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="review-form-row">
            <label htmlFor="review-email">Email (optional)</label>
            <input
              id="review-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
            />
          </div>

          <div className="review-form-row rating-row">
            <label>Rating</label>
            <div className="rating-picker">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={value <= rating ? 'star-btn active' : 'star-btn'}
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value > 1 ? 's' : ''}`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>

          <div className="review-form-row">
            <label htmlFor="review-text">Review</label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your stay"
              rows={5}
            />
          </div>

          {submissionState.error && <p className="review-error">{submissionState.error}</p>}
          {submissionState.success && <p className="review-success">{submissionState.success}</p>}

          <button type="submit" className="review-submit-btn" disabled={submissionState.loading}>
            {submissionState.loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="reviews-loading">
          <div className="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet — be the first to leave one!</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((r) => {
            const isLoved = (r.lovedBy || []).includes(user?.email || deviceId);
            const loveCount = (r.lovedBy || []).length || 0;

            return (
              <div key={r._id} className="review-card service-review-card">
                <div className="service-review-header">
                  <div className="review-author-info">
                    <div className="review-avatar guest-avatar">
                      {(r.author || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{r.author || 'Guest'}</strong>
                      <span className="guest-badge">
                        <FaUser /> Guest Review
                      </span>
                    </div>
                  </div>
                  <span className="service-review-stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <FaStar key={s} className={s <= r.rating ? 'star-filled' : 'star-empty'} />
                    ))}
                  </span>
                </div>

                <p className="service-review-text">{r.text}</p>

                <div className="service-review-footer">
                  <span className="service-review-date">
                    {new Date(r.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <button
                    className={`love-react-btn ${isLoved ? 'loved' : ''}`}
                    onClick={() => handleLove(r._id)}
                    aria-label={isLoved ? 'Unlike this review' : 'Love this review'}
                    title={isLoved ? 'Unlike' : 'Love this review'}
                  >
                    {isLoved ? <FaHeart /> : <FaRegHeart />}
                    <span className="love-count">{loveCount > 0 ? loveCount : ''}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Service = () => {
  return (
    <>
      <Components />

      {/* Header Section */}
      <section className="service-hero">
        <div className="service-overlay">
          <p className="service-subtitle">WHAT WE OFFER</p>

          <h1 className="service-title">Our Services</h1>

          <div className="hero-divider">
            <span>❖</span>
          </div>

          <p className="service-description">
            At Hotel Himalaya INN Khona Khona INN Khona, we go beyond comfort. Discover a range of
            services designed to make your stay relaxing, memorable and truly
            exceptional.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-heading">
          <p>EXCEPTIONAL EXPERIENCE</p>
          <h2>Luxury & Comfort Services</h2>

          <div className="hero-divider">
            <span>❖</span>
          </div>
        </div>

        <div className="services-grid">
          {/* Room */}
          <div className="service-card room-card">
            <div className="icon">
              <FaBed className="service-icon" />
            </div>

            <h3>Comfortable Rooms</h3>

            <p>
              Spacious, clean and well-maintained rooms designed for maximum
              comfort and relaxation.
            </p>
          </div>

          {/* Environment */}
          <div className="service-card environment-card">
            <div className="icon">
              <FaLeaf className="service-icon" />
            </div>

            <h3>Fresh Environment</h3>

            <p>
              Experience peaceful village surroundings with fresh air and
              beautiful natural scenery.
            </p>
          </div>

          {/* WiFi */}
          <div className="service-card wifi-card">
            <div className="icon">
              <FaWifi className="service-icon" />
            </div>

            <h3>Free WiFi</h3>

            <p>
              Stay connected with high-speed internet access available
              throughout the hotel.
            </p>
          </div>

                    {/* Reception */}
          <div className="service-card reception-card">
            <div className="icon">
              <FaBell className="service-icon" />
            </div>

            <h3>24/7 Reception</h3>

            <p>
              Our friendly reception team is available around the clock to
              assist guests.
            </p>
          </div>

          {/* BBQ */}
          <div className="service-card bbq-card">
            <div className="icon">
              <FaFire className="service-icon" />
            </div>

            <h3>BBQ Area</h3>

            <p>
              Enjoy outdoor gatherings and delicious barbecue experiences with
              family and friends.
            </p>
          </div>

              <div className="service-card hall-card">
  <div className="icon">
    <FaBuilding className="service-icon" />
  </div>

  <h3>Event Hall</h3>

  <p>
    Spacious hall suitable for weddings, meetings, cultural programs,
    celebrations, and special events.
  </p>
</div>
        </div>

  
      </section>

      <section className="reviews-section" id="reviews">
        <div className="section-heading">
          <p>GUEST REVIEWS</p>
          <h2>What Our Guests Say</h2>
          <div className="hero-divider"><span>❖</span></div>
          <p className="reviews-subtitle">
            Real feedback from our valued guests
          </p>
        </div>
        
        <ReviewsList />
      </section>

      <div className="last-service-card">
        <div className='last-img-service'>
           <img src={background} alt="Last Service" />
        </div>
        <div className='margin_last-service-content'>
            <div className='last-service-content'>
          <h2>Experience Unmatched Hospitality at Hotel Himalaya INN khona</h2>

           </div>
          <p className='hotel_des'>
          At Hotel Himalaya INN Khona, we are dedicated to providing an unforgettable hospitality experience that combines comfort, warmth, and exceptional service. Nestled in a peaceful and culturally rich environment, our hotel offers guests the perfect place to relax, unwind, and create lasting memories. From our comfortable and well-appointed rooms to our carefully designed facilities, every aspect of our hotel is focused on ensuring a pleasant and enjoyable stay. Our commitment goes beyond providing accommodation. We take pride in delivering personalized service through our friendly and attentive staff, who are always ready to assist with your needs and make you feel at home. 
          </p>
       
      </div>
       </div>
       <div className="last-finished_footer">
        <LastComponent />
       </div>
    </>
  );
};

export default Service;