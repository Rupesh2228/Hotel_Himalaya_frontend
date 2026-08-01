import { useEffect, useState } from 'react';
import Navbar from '../componets/componets';
import { Link } from 'react-router-dom';
import SEO from '../componets/SEO';
import Loader from '../componets/Loader';
import LazyImage from '../componets/LazyImage';
import { getApiUrl } from '../../config/api';
import './Blogs.css'; // Add CSS if needed

const Blogs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = getApiUrl();
        
        // Fetch both blogs and attractions
        const [blogsRes, attractionsRes] = await Promise.all([
          fetch(`${apiUrl}/api/blogs`),
          fetch(`${apiUrl}/api/attractions`)
        ]);
        
        const blogsData = await blogsRes.json();
        const attractionsData = await attractionsRes.json();
        
        let combined = [];

        if (blogsData.success) {
          const publishedBlogs = blogsData.data
            .filter(b => b.status === 'Published')
            .map(b => ({ ...b, itemType: 'blog' }));
          combined = [...combined, ...publishedBlogs];
        }

        if (attractionsData.success) {
          const publishedAttractions = attractionsData.data
            .filter(a => a.status === 'Published')
            .map(a => ({ ...a, itemType: 'attraction' }));
          combined = [...combined, ...publishedAttractions];
        }
        
        // Optionally sort by date here if they have a createdAt field
        combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setItems(combined);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
   <>
    <Navbar />
    <div className="blogs-page">

      <SEO page="Blogs" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Explore Our Blogs & Attractions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(item => {
            const linkPath = item.itemType === 'blog' ? `/blog/${item.slug}` : `/attractions/${item.slug}`;
            const badgeLabel = item.itemType === 'blog' ? 'Blog' : 'Attraction';
            
            return (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 relative">
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                  {badgeLabel}
                </div>
                <Link to={linkPath}>
                  <LazyImage 
                    src={item.featuredImage || item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={linkPath}>
                    <h2 className="text-xl font-bold mb-2 text-gray-800 hover:text-blue-600 transition-colors">{item.title}</h2>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {item.shortDescription || item.description}
                  </p>
                  <Link 
                    to={linkPath} 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        {items.length === 0 && (
          <p className="text-center text-gray-500">No content available at the moment.</p>
        )}
      </div>
    </div>
    </>
  );
};

export default Blogs;
