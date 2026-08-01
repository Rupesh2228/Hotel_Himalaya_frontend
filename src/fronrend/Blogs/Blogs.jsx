import { useEffect, useState } from 'react';
import Navbar from '../componets/componets';
import { Link } from 'react-router-dom';
import SEO from '../componets/SEO';
import Loader from '../componets/Loader';
import LazyImage from '../componets/LazyImage';
import { getApiUrl, DEFAULT_LIVE_BACKEND_URL } from '../../config/api';
import './Blogs.css'; // Add CSS if needed

const Blogs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = getApiUrl();
      const backendUrl = apiUrl || DEFAULT_LIVE_BACKEND_URL;

      const fetchJson = async (url) => {
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(`Unexpected non-JSON response from ${url}`);
        }
      };

      try {
        let blogsData;
        let attractionsData;

        try {
          [blogsData, attractionsData] = await Promise.all([
            fetchJson(`${backendUrl}/api/blogs`),
            fetchJson(`${backendUrl}/api/attractions`)
          ]);
        } catch (firstError) {
          if (backendUrl !== DEFAULT_LIVE_BACKEND_URL) {
            [blogsData, attractionsData] = await Promise.all([
              fetchJson(`${DEFAULT_LIVE_BACKEND_URL}/api/blogs`),
              fetchJson(`${DEFAULT_LIVE_BACKEND_URL}/api/attractions`)
            ]);
          } else {
            throw firstError;
          }
        }

        const combined = [];

        if (blogsData?.success) {
          const publishedBlogs = blogsData.data
            .filter(b => b.status === 'Published')
            .map(b => ({ ...b, itemType: 'blog' }));
          combined.push(...publishedBlogs);
        }

        if (attractionsData?.success) {
          const publishedAttractions = attractionsData.data
            .filter(a => a.status === 'Published')
            .map(a => ({ ...a, itemType: 'attraction' }));
          combined.push(...publishedAttractions);
        }

        combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setItems(combined);
      } catch (err) {
        console.error('Error fetching or processing blog data:', err);
        setError('Unable to load blogs. Please check your backend configuration.');
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
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
            {error}
          </div>
        )}
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
