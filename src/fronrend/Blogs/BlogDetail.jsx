import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../componets/SEO';
import Loader from '../componets/Loader';
import { getApiUrl, DEFAULT_LIVE_BACKEND_URL } from '../../config/api';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      const apiUrl = getApiUrl();
      const backendUrl = apiUrl || DEFAULT_LIVE_BACKEND_URL;

      const fetchJson = async (url) => {
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }
        return response.json();
      };

      try {
        try {
          const data = await fetchJson(`${backendUrl}/api/blogs/slug/${slug}`);
          setBlog(data.data);
        } catch (firstError) {
          if (backendUrl !== DEFAULT_LIVE_BACKEND_URL) {
            const data = await fetchJson(`${DEFAULT_LIVE_BACKEND_URL}/api/blogs/slug/${slug}`);
            setBlog(data.data);
          } else {
            throw firstError;
          }
        }
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
    <div className="attraction_detail_page">
      <SEO customSEO={customSEO} />
      <div className="detail_wrapper">
    
        <div className="detail_hero">
          <div className="detail_image">
            <img src={blog.featuredImage || blog.imageUrl} alt={blog.title} />
            <div className="detail_image_overlay"></div>
          </div>

          <div className="detail_content">
            <span className="detail_tag">Blog Post</span>
            <h1 className="detail_title">{blog.title}</h1>
            <p className="detail_subtitle">{new Date(blog.createdAt).toLocaleDateString()}</p>
            
            <div className="detail_text" dangerouslySetInnerHTML={{ __html: blog.fullDescription || blog.description }} />
            
            {(blog.gallery && blog.gallery.length > 0) || (blog.images && blog.images.length > 0) ? (
              <div className="detail_gallery">
                {(blog.gallery || blog.images).map((src, index) => (
                  <div className="detail_thumb" key={index}>
                    <img src={src} alt={`${blog.title} ${index + 1}`} />
                  </div>
                ))}
              </div>
            ) : null}
            <button className="detail_cta_btn" onClick={() => navigate('/blogs')}>
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
