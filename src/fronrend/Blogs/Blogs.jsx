import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../componets/SEO';
import Loader from '../componets/Loader';
import LazyImage from '../componets/LazyImage';
import './Blogs.css'; // Add CSS if needed

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/blogs`);
        const data = await res.json();
        if (data.success) {
          const published = data.data.filter(b => b.status === 'Published');
          setBlogs(published);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="blogs-page">
      <SEO page="Blogs" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Explore Our Blogs</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
              <Link to={`/blog/${blog.slug}`}>
                <LazyImage 
                  src={blog.featuredImage || blog.imageUrl} 
                  alt={blog.title} 
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/blog/${blog.slug}`}>
                  <h2 className="text-xl font-bold mb-2 text-gray-800 hover:text-blue-600 transition-colors">{blog.title}</h2>
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.shortDescription || blog.description}
                </p>
                <Link 
                  to={`/blog/${blog.slug}`} 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {blogs.length === 0 && (
          <p className="text-center text-gray-500">No blogs available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default Blogs;
