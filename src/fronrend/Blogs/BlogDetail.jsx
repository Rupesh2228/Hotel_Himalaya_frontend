import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../componets/SEO';
import Loader from '../componets/Loader';
import { getApiUrl } from '../../config/api';

const API_URL = getApiUrl();

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${API_URL}/api/blogs/slug/${slug}`);
        if (!res.ok) throw new Error('Failed to load blog');
        const data = await res.json();
        setBlog(data.data);
      } catch (err) {
        console.error(err);
        setError('Unable to load blog details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) return <Loader fullScreen />;

  if (error || !blog) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl text-gray-800 mb-4">{error || 'Blog not found.'}</h2>
        <button 
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
          onClick={() => navigate('/blogs')}
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  const customSEO = {
    title: blog.seoTitle || blog.title,
    metaDescription: blog.metaDescription || blog.shortDescription,
    keywords: blog.keywords,
    canonical: blog.canonical || `${window.location.origin}/blog/${blog.slug}`,
    schema: blog.schema
  };

  return (
    <div className="blog-detail-page bg-gray-50 min-h-screen pb-16">
      <SEO customSEO={customSEO} />
      
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        <img 
          src={blog.featuredImage} 
          alt={blog.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end pb-12">
          <div className="container mx-auto px-4 text-white">
            <span className="text-sm font-semibold tracking-wide uppercase mb-2 block">
              {new Date(blog.createdAt).toLocaleDateString()}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold max-w-4xl leading-tight">
              {blog.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 md:-mt-16 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-12 max-w-4xl mx-auto">
          {/* Main Content */}
          <div 
            className="prose prose-lg md:prose-xl max-w-none text-gray-700" 
            dangerouslySetInnerHTML={{ __html: blog.fullDescription }} 
          />

          {/* Gallery */}
          {blog.gallery && blog.gallery.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {blog.gallery.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`Gallery item ${idx + 1}`} 
                    className="w-full h-40 md:h-48 object-cover rounded-lg shadow cursor-pointer hover:opacity-90 transition"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t text-center">
            <button 
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-lg transition"
            >
              <svg className="w-5 h-5 mr-2 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
              View All Blogs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
