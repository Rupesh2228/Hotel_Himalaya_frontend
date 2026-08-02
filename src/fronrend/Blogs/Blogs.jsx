import { useEffect, useMemo, useState } from 'react';
import Navbar from '../componets/componets';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../componets/SEO';
import Loader from '../componets/Loader';
import LazyImage from '../componets/LazyImage';
import { getApiUrl, DEFAULT_LIVE_BACKEND_URL } from '../../config/api';
import './Blogs.css'; // Add CSS if needed

const Blogs = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');
  const pageSize = 8;

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

        try {
          blogsData = await fetchJson(`${backendUrl}/api/blogs`);
        } catch (firstError) {
          if (backendUrl !== DEFAULT_LIVE_BACKEND_URL) {
            blogsData = await fetchJson(`${DEFAULT_LIVE_BACKEND_URL}/api/blogs`);
          } else {
            throw firstError;
          }
        }

        const blogItems = [];
        if (blogsData?.success) {
          const publishedBlogs = blogsData.data
            .filter(b => b.status === 'Published')
            .map(b => ({ ...b, itemType: 'blog' }));
          blogItems.push(...publishedBlogs);
        }

        blogItems.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setItems(blogItems);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error fetching or processing blog data:', err);
        setError('Unable to load blogs. Please check your backend configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter(item => item.itemType === activeFilter);
  }, [items, activeFilter]);

  const blogCount = useMemo(() => items.filter(i => i.itemType === 'blog').length, [items]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [currentPage, filteredItems]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  if (loading) return <Loader fullScreen />;

  return (
    <>
      <Navbar />
      <div className="blogs-page">
        <SEO page="Blogs" />
        <div className="blogs-container">

          {/* Header */}
          <div className="blogs-header">
            <span className="blogs-eyebrow">Latest News</span>
            <h1 className="blogs-title">Blog &amp; Articles</h1>
            <p className="blogs-subtitle">
              Discover fresh stories, travel guides, hotel updates, and inspiring local experiences from Hotel Himalaya.
            </p>
          </div>

          {/* Breadcrumb */}
          <nav className="blogs-breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li className="sep">/</li>
              <li className="current">Blogs</li>
            </ol>
          </nav>

          {error && <div className="blogs-error">{error}</div>}

          {/* Category Filter Tabs */}
          {!error && items.length > 0 && (
            <div className="blogs-tabs" role="tablist" aria-label="Content filter">
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'all'}
                className={`blogs-tab ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All <span className="blogs-tab-count">{items.length}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === 'blog'}
                className={`blogs-tab ${activeFilter === 'blog' ? 'active' : ''}`}
                onClick={() => handleFilterChange('blog')}
              >
                Blog <span className="blogs-tab-count">{blogCount}</span>
              </button>
              
      
            </div>
          )}

          {/* List */}
          <div className="blogs-list">
            {paginatedItems.map(item => {
              const linkPath = item.itemType === 'blog' ? `/blog/${item.slug}` : `/attractions/${item.slug}`;
              const badgeLabel = item.itemType === 'blog' ? 'Blog' : 'Attraction';
              const publishedAt = item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'Unknown date';

              return (
                <article
                  key={item._id}
                  className="blog-row blog-row-clickable"
                  onClick={() => navigate(linkPath)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(linkPath)}
                >
                  <div className="blog-row-thumb">
                    <LazyImage
                      src={item.featuredImage || item.imageUrl}
                      alt={item.title}
                      className="blog-row-img"
                    />
                  </div>

                  <div className="blog-row-content">
                    <div className="blog-row-meta">
                      <span className="blog-row-badge">{badgeLabel}</span>
                      <span className="blog-row-dot">·</span>
                      <span className="blog-row-date">{publishedAt}</span>
                    </div>

                    <h2 className="blog-row-title">{item.title}</h2>

                    <p className="blog-row-excerpt">
                      {item.shortDescription || item.description}
                    </p>

                    <span className="blog-row-readmore">Read More →</span>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredItems.length === 0 && !error && (
            <p className="blogs-empty">
              {items.length === 0
                ? 'No content available at the moment.'
                : `No ${activeFilter === 'all' ? '' : activeFilter} items found.`}
            </p>
          )}

          {filteredItems.length > pageSize && (
            <div className="blog-pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="page-button"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="page-button"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blogs;