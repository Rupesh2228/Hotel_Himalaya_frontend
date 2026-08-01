import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SEO from '../componets/SEO';
import Loader from '../componets/Loader';
import { getApiUrl, DEFAULT_LIVE_BACKEND_URL } from '../../config/api';
import "./BlogDetails.css"; // Add CSS if needed

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
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <Loader fullScreen />;

  if (error || !blog) {
    return (
      <div className="blog_detail_page">
        <div className="blog_detail_notfound">
          <h2>{error || 'Blog not found.'}</h2>
          <button className="blog_detail_back_btn" onClick={() => navigate('/blogs')}>
            Back to Blogs
          </button>
        </div>
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

  const publishedAt = blog.createdAt ? new Date(blog.createdAt).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'Unknown date';

  const galleryImages = blog.gallery && blog.gallery.length > 0
    ? blog.gallery
    : (blog.images && blog.images.length > 0 ? blog.images : []);

  return (
    <div className="blog_detail_page">
      <SEO customSEO={customSEO} />
      <div className="blog_detail_container">

        {/* Breadcrumb */}
        <div className="blog_detail_breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <Link to="/blogs">Blog · Literature</Link>
          <span className="sep">/</span>
          <span className="current">{blog.title}</span>
        </div>

        {/* Title + meta */}
        <h1 className="blog_detail_title">{blog.title}</h1>
        <div className="blog_detail_meta">
          <span className="blog_detail_tag">Blog Post</span>
          <span className="dot">·</span>
          <span className="blog_detail_date">{publishedAt}</span>
        </div>

        {/* Hero image */}
        {(blog.featuredImage || blog.imageUrl) && (
          <div className="blog_detail_hero">
            <img src={blog.featuredImage || blog.imageUrl} alt={blog.title} />
          </div>
        )}

        {/* Body */}
        <div
          className="blog_detail_text"
          dangerouslySetInnerHTML={{ __html: blog.fullDescription || blog.description }}
        />

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div className="blog_detail_gallery">
            {galleryImages.map((src, index) => (
              <div className="blog_detail_thumb" key={index}>
                <img src={src} alt={`${blog.title} ${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="blog_detail_footer">
          <button className="blog_detail_back_btn" onClick={() => navigate('/blogs')}>
            ← Back to Blogs
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;