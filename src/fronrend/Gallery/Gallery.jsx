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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const [imagesRes, catsRes] = await Promise.all([
          fetch(`${API_URL}/api/gallery`),
          fetch(`${API_URL}/api/gallery/categories`)
        ]);
        
        const imagesData = imagesRes.ok ? await imagesRes.json() : [];
        const catsData = catsRes.ok ? await catsRes.json() : [];

        if (Array.isArray(imagesData) && imagesData.length) {
          setGalleryImages(imagesData);
        } else {
          setGalleryImages([]);
        }
        
        if (Array.isArray(catsData)) {
          setCategories(catsData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchGalleryData();
  }, []);

  const filteredImages = selectedCategory === 'ALL' 
    ? galleryImages 
    : galleryImages.filter(img => img.category?.name === selectedCategory || (selectedCategory === 'Uncategorized' && !img.category));
 
  return (
    <>
      <Components />

      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="gallery-overlay">
          <span className="gallery-tag">
            Discover Hotel Himalaya INN Khona
          </span>

          <h1 className="gallery-heading">Gallery</h1>

          <p>
            Explore the beauty, luxury, and warm Nepali hospitality
            of Hotel Himalaya INN Khona through our gallery collection.
          </p>
        </div>
      </section>

      {/* Gallery Filters */}
      <div className="gallery-filters">
        <button 
          className={`filter-btn ${selectedCategory === 'ALL' ? 'active' : ''}`} 
          onClick={() => setSelectedCategory('ALL')}
        >
          ALL
        </button>
        {categories.map(cat => (
          <button 
            key={cat._id}
            className={`filter-btn ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <section className="gallery-section">
        <div className="gallery-grid-new">
          {filteredImages.length > 0 ? filteredImages.map((img, index) => (
            <div className="gallery-card-new" key={index}>
              <img src={img.url || imgFallback} alt={img.title || `Gallery Image ${index}`} />
            </div>
          )) : (
            <p style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>No images found for this category.</p>
          )}
        </div>
      </section>

      {/* Experience Section */}
      <section className="experience-section">
        <h2>Experience Luxury & Comfort</h2>

        <p>
          Every corner of Hotel Himalaya INN Khona reflects elegance,
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