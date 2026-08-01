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
    <div className="blogs-page bg-gray-50 min-h-screen pb-12">
      <SEO page="Blogs" />
      
      <div className="bg-blue-900 text-white py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Latest Blogs</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto px-4">Discover the latest updates, tips, and stories from Hotel Himalaya INN Khona.</p>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <div key={blog._id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-xl">
              <Link to={`/blog/${blog.slug}`}>
                <LazyImage 
                  src={blog.featuredImage} 
                  alt={blog.title} 
                  className="w-full h-56 object-cover"
                />
              </Link>
              <div className="p-6">
                <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
                <Link to={`/blog/${blog.slug}`}>
                  <h2 className="text-2xl font-bold mt-2 mb-3 text-gray-800 hover:text-blue-600 transition-colors">
                    {blog.title}
                  </h2>
                </Link>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {blog.shortDescription}
                </p>
                <Link 
                  to={`/blog/${blog.slug}`} 
                  className="text-blue-600 font-semibold hover:text-blue-800 flex items-center transition-colors"
                >
                  Read More
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {blogs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No blogs available at the moment. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
