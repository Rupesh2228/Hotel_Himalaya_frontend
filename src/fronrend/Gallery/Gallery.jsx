import Components from "../componets/componets";
import LastComponent from "../componets/LastComponents";
import "./Gallery.css";

import { useEffect, useState } from 'react';
import imgFallback from "../../img/images.jpg";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getApiUrl } from '../../config/api'

const API_URL = getApiUrl();

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/gallery`);
        if (!res.ok) throw new Error('Failed to fetch gallery');
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          setGalleryImages(data.map(d => d.url));
        } else {
          setGalleryImages([imgFallback, imgFallback, imgFallback]);
        }
      } catch (err) {
        console.error(err);
        setGalleryImages([imgFallback, imgFallback, imgFallback]);
      }
    };

    fetchImages();
  }, []);
 
  return (
    <>
      <Components />

      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="gallery-overlay">
          <span className="gallery-tag">
            Discover Hotel Khokana
          </span>

          <h1 className="gallery-heading">Gallery</h1>

          <p>
            Explore the beauty, luxury, and warm Nepali hospitality
            of Hotel Khokana through our gallery collection.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="gallery-section">
        <div className="gallery-grid">
          {galleryImages.map((img, index) => (
            <div className="gallery-card" key={index}>
              <img src={img} alt={`Hotel Gallery ${index}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Experience Section */}
      <section className="experience-section">
        <h2>Experience Luxury & Comfort</h2>

        <p>
          Every corner of Hotel Khokana reflects elegance,
          culture, and hospitality. From luxurious rooms to
          unforgettable dining experiences.
        </p>

        <button className="btn-cta" onClick={() => navigate(user ? '/dashboard' : '/login')}>Book Your Stay</button>
      </section>
      <div className="gallery_footer">
        <LastComponent />
      </div>
    </>
  );
};

export default Gallery;