import Components from '../componets/componets'
import './Aboutus.css'
import background from '../../img/background.jpg'
import LastComponent from '../componets/LastComponents'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const CtaButton = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  return (
    <button className="btn-cta" onClick={() => navigate('/dashboard')}>
      Book Now
    </button>
  )
}

const AboutUs = () => {
  return (
    <div className='about_all_pages'>
      <Components />

      <main className="main_aboutus">
          <div className="aboutus_intro_img">
            <img
              src={background}
              alt="Hotel Himalaya INN Khona Khona INN Khona"
              className="aboutus_img"
            />
          </div>

        <p className="first_aboutus">About Us</p>

        <div className="aboutus_intro_hotel">
          <p>
            Hotel Himalaya INN <br />
              
            <span> Khona</span>
          </p>
        </div>

        <div className="aboutus_intro_first">
          <p>
            Hotel Himalaya INN Khona Khona INN Khona is more than just a place to stay. It is a peaceful retreat where you can escape the hustle and bustle of everyday life and immerse yourself in the beauty of nature. Our hotel is nestled in a serene location, surrounded by breathtaking landscapes that offer a perfect blend of tranquility and natural splendor.
          </p>
        </div>
      </main>

         <section className="features">
        <h2>Why Choose Us</h2>

        <div className="feature-container">

            <div className="feature-card">
                <div className="icon">🏨</div>
                <h3>Luxury Rooms</h3>
                <p>Elegant suites with premium amenities and comfort.</p>
            </div>

            <div className="feature-card">
                <div className="icon">🌄</div>
                <h3>Scenic Views</h3>
                <p>Enjoy stunning mountain and nature landscapes.</p>
            </div>

            <div className="feature-card">
                <div className="icon">⭐</div>
                <h3>Premium Service</h3>
                <p>Friendly staff dedicated to your satisfaction.</p>
            </div>

            <div className="feature-card">
                <div className="icon">🌿</div>
                <h3>Nature Friendly</h3>
                <p>Sustainable practices for a greener future.</p>
            </div>

        </div>
    </section>

    <section className="stats">
        <div className="stat-box">
            <h2>15+</h2>
            <p>Years Experience</p>
        </div>

        <div className="stat-box">
            <h2>5000+</h2>
            <p>Happy Guests</p>
        </div>

        <div className="stat-box">
            <h2>50+</h2>
            <p>Luxury Rooms</p>
        </div>

        <div className="stat-box">
            <h2>4.9★</h2>
            <p>Guest Rating</p>
        </div>
    </section>

      <section className="cta">
            <h2>Discover Luxury Like Never Before</h2>
          <p>Book your unforgettable stay with us today.</p>
          <CtaButton />
      </section>

    <footer>
      <LastComponent />
    </footer>

    </div>
  )
}

export default AboutUs
