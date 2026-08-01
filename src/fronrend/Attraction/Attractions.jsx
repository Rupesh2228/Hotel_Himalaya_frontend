import React, { useEffect, useState } from 'react';
import SEO from '../componets/SEO';
import Loader from '../componets/Loader';
import Navbar from '../componets/componets';
import { AttractionCard } from './components';
import './Attractions.css';

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
    <>
      <Navbar />
      <div className="attractions-page">
        <SEO page="Attractions" />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Explore Our Attractions</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {attractions.map(attraction => (
              <AttractionCard key={attraction._id} attraction={attraction} />
            ))}
          </div>

          {attractions.length === 0 && (
            <p className="text-center text-gray-500">No attractions available at the moment.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Attractions;
