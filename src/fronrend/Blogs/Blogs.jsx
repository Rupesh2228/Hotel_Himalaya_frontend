import { useEffect, useMemo, useState } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

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

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items]);

  if (loading) return <Loader fullScreen />;

  return (
   <>
    <Navbar />
    <div className="blogs-page">

      <SEO page="Blogs" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 rounded-3xl bg-white px-6 py-8 shadow-xl sm:px-10 sm:py-12">
          <div className="max-w-3xl">
            <span className="inline-block text-sm font-semibold uppercase tracking-[0.3em] text-blue-700 mb-4">Latest News</span>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">Blog Page</h1>
            <p className="text-lg leading-8 text-gray-600">
              Discover fresh stories, travel guides, hotel updates, and inspiring local experiences. Browse our latest posts and stay updated with the newest happenings around Hotel Himalaya.
            </p>
          </div>
        </div>

        <nav className="mb-8 text-sm text-gray-600" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-gray-900">Blogs</li>
          </ol>
        </nav>

        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {paginatedItems.map(item => {
            const linkPath = item.itemType === 'blog' ? `/blog/${item.slug}` : `/attractions/${item.slug}`;
            const badgeLabel = item.itemType === 'blog' ? 'Blog' : 'Attraction';
            const publishedAt = item.createdAt ? new Date(item.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }) : 'Unknown date';

            return (
              <article key={item._id} className="blog-card rounded-3xl bg-white shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                <Link to={linkPath} className="block overflow-hidden">
                  <div className="blog-card-image relative h-72 overflow-hidden">
                    <LazyImage
                      src={item.featuredImage || item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm">
                      {badgeLabel}
                    </span>
                  </div>
                </Link>
                <div className="p-6 sm:p-8">
                  <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
                    <span>By Admin</span>
                    <span>{publishedAt}</span>
                  </div>
                  <Link to={linkPath} className="block">
                    <h2 className="text-2xl font-semibold text-slate-900 hover:text-blue-600 transition-colors mb-3">
                      {item.title}
                    </h2>
                  </Link>
                  <p className="text-sm leading-7 text-slate-600 line-clamp-3 mb-6">
                    {item.shortDescription || item.description}
                  </p>
                  <Link to={linkPath} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                    Read More →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {items.length === 0 && (
          <p className="text-center text-gray-500">No content available at the moment.</p>
        )}

        {items.length > pageSize && (
          <div className="blog-pagination mt-12 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="page-button rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`page-button rounded-full px-4 py-2 text-sm transition ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="page-button rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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
