import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import Components from '../componets/componets'
import LastComponents from '../componets/LastComponents'
import SEO from '../componets/SEO'
import { subscribeToAttractionChanges } from '../Attraction/attractionEvents'
import { AttractionCardSkeleton } from '../componets/SkeletonLoader'
import { ApiErrorCard, StaleRefreshWarning } from '../componets/ErrorState'
import home from '../../img/home.jpg'
import { apiRequest } from '../../utils/apiClient'

const Home = () => {
  const navigate = useNavigate()
  const [attractions, setAttractions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchAttractions = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const data = await apiRequest('/api/attractions');
      // Unwrap backend pagination payload if necessary
      const attractionsArray = Array.isArray(data)
        ? data
        : (Array.isArray(data?.data) ? data.data : []);
      
      setAttractions(attractionsArray);
      localStorage.setItem('himalaya_attractions_db', JSON.stringify(attractionsArray));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch attractions:', err);
      // Only set UI error state if we have absolutely no cache data
      if (attractions.length === 0) {
        setError(err.message || 'Unable to connect to server');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [attractions.length]);

  useEffect(() => {
    const stored = localStorage.getItem('himalaya_attractions_db');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAttractions(parsed);
        setLoading(false);
      } catch {
        // ignore malformed cache
      }
    }

    // Trigger either background refresh or initial load
    fetchAttractions(!!stored);

    const unsubscribe = subscribeToAttractionChanges((updatedAttractions) => {
      setAttractions(Array.isArray(updatedAttractions) ? updatedAttractions : []);
    });

    return () => unsubscribe();
  }, [fetchAttractions]);

  return (
    <div className="home_page">
      <Components />
      <SEO page="Home" />

      <main className="home_hero">
        <div className="hero_container">
          <h1 className="welcome">Welcome to Hotel Himalaya INN Khona </h1>

          <div className="intro_row">
            <div className="intro_img">
              <img src={home} alt="Hotel Himalaya INN Khona Khona INN Khona" />
            </div>

            <p className="intro_text">
              Step into a world where luxury meets nature, where every moment is designed to bring comfort, peace, and unforgettable memories. Our hotel offers a perfect escape from the busy rhythm of everyday life, surrounded by breathtaking natural beauty, elegant architecture, and a calming atmosphere that instantly makes you feel at home.
              <br /><br />
              Wake up to refreshing views, enjoy beautifully designed spaces filled with warmth and sophistication, and experience a level of hospitality created to make every guest feel special. Whether you are seeking a peaceful retreat, a romantic getaway, or simply a place to relax and recharge, our hotel provides the perfect balance of modern luxury and natural serenity.
              <br /><br />
              From tranquil surroundings and premium accommodations to relaxing lounges and exceptional service, every detail is thoughtfully crafted to give you a truly unforgettable experience.
            </p>
          </div>
        </div>
      </main>

      <section className="attractions_section">
        <div className="attractions_container">
          <h2 className="attractions_title">Explore Nearby Attractions</h2>
          
          {/* Stale refresh indicator */}
          {error && attractions.length > 0 && (
            <StaleRefreshWarning 
              message="⚠️ Connection error. Displaying offline attractions info." 
              onRetry={() => fetchAttractions(true)} 
            />
          )}

          {loading && attractions.length === 0 ? (
            <AttractionCardSkeleton count={3} />
          ) : error && attractions.length === 0 ? (
            <ApiErrorCard 
              title="Unable to load attractions" 
              message={error} 
              onRetry={() => fetchAttractions(false)} 
            />
          ) : attractions.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
              No nearby attractions listed at the moment.
            </div>
          ) : (
            <div className="attractions_grid" style={{ opacity: isRefreshing ? 0.7 : 1, transition: 'opacity 0.2s' }}>
              {attractions.map(a => (
                <div className="attraction_card" key={a._id}>
                  <div className="attraction_card_image">
                    <img src={a.imageUrl || a.featuredImage} alt={a.title} />
                  </div>
                  <div className="attraction_card_body">
                    <div className="attraction_card_info">
                      <h3 className="attraction_card_name">{a.title}</h3>
                      <p className="attraction_card_desc">{a.subDescription || a.description || a.shortDescription}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/attraction/${a._id}`)}
                      className="attraction_card_btn"
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      Explore More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="stats_section">
        <div className="stats_grid">
          <div className="stat_box">
            <h2>15+</h2>
            <p>Years Experience</p>
          </div>

          <div className="stat_box">
            <h2>5000+</h2>
            <p>Happy Guests</p>
          </div>

          <div className="stat_box">
            <h2>50+</h2>
            <p>Luxury Rooms</p>
          </div>

          <div className="stat_box">
            <h2>4.9 Star</h2>
            <p>Guest Rating</p>
          </div>
        </div>
      </section>

      <section className="cta_section">
        <div className="cta_box">
          <h2>Discover Luxury Like Never Before</h2>
          <p>Book your unforgettable stay with us today.</p>
          <button
            className="btn-cta"
            onClick={() => navigate('/dashboard')}
          >
            Book Now
          </button>
        </div>
      </section>

      <footer className="home_footer">
        <LastComponents />
      </footer>
    </div>
  )
}

export default Home
