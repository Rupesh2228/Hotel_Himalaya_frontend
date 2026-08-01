import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../componets/SEO';
import Loader from '../componets/Loader';
import LazyImage from '../componets/LazyImage';
import './Attractions.css'; // Optional CSS if needed

const Attractions = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/attractions`);
        const data = await res.json();
        if (data.success) {
          // Filter out drafts if they get sent by mistake
          const published = data.data.filter(a => a.status === 'Published');
          setAttractions(published);
        }
      } catch (err) {
        console.error('Error fetching attractions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttractions();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="attractions-page">
      <SEO page="Attractions" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Explore Our Attractions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map(attraction => (
            <div key={attraction._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
              <Link to={`/attractions/${attraction.slug}`}>
                <LazyImage 
                  src={attraction.featuredImage || attraction.imageUrl} 
                  alt={attraction.title} 
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/attractions/${attraction.slug}`}>
                  <h2 className="text-xl font-bold mb-2 text-gray-800 hover:text-blue-600 transition-colors">{attraction.title}</h2>
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {attraction.shortDescription || attraction.description}
                </p>
                <Link 
                  to={`/attractions/${attraction.slug}`} 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {attractions.length === 0 && (
          <p className="text-center text-gray-500">No attractions available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default Attractions;
