import { useState, useEffect } from 'react';
import { getApiUrl } from '../../../config/api';
import './SEOManager.css';

const API_URL = getApiUrl();

const PAGES = ['Home', 'About', 'Rooms', 'Tours', 'Events', 'Gallery', 'Attractions', 'Blogs', 'Contact'];

const PAGE_ICONS = {
  Home: '🏠', About: '📖', Rooms: '🛏️', Tours: '🗺️',
  Events: '🎉', Gallery: '🖼️', Attractions: '🏔️', Blogs: '✍️', Contact: '📬'
};

const SEOManager = () => {
  const [selectedPage, setSelectedPage] = useState('Home');
  const [formData, setFormData] = useState({
    title: '', metaDescription: '', keywords: '', canonical: '', schema: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchSEO = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/seo/${selectedPage}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setFormData({
            title: data.data.title || '',
            metaDescription: data.data.metaDescription || '',
            keywords: data.data.keywords || '',
            canonical: data.data.canonical || '',
            schema: data.data.schema || ''
          });
        } else {
          setFormData({ title: '', metaDescription: '', keywords: '', canonical: '', schema: '' });
        }
      } catch {
        showToast('error', 'Failed to load SEO data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSEO();
  }, [selectedPage]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/seo/${selectedPage}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast('success', `SEO settings for "${selectedPage}" saved successfully!`);
      } else {
        showToast('error', 'Failed to save SEO settings. Please try again.');
      }
    } catch {
      showToast('error', 'Network error. Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const charCount = (str, max) => {
    const len = (str || '').length;
    // Removing strict limitation color coding for max description
    const color = '#10b981'; // always green
    return { len, max, color, pct: len > 0 ? 100 : 0 };
  };

  const titleStats = charCount(formData.title, 60);
  const descStats  = charCount(formData.metaDescription, 160);


  return (
    <div className="seo-manager">

      {/* ── Toast ── */}
      {toast && (
        <div className={`seo-toast seo-toast-${toast.type}`}>
          <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="seo-header">
        <div className="seo-header-icon">🔍</div>
        <div>
          <h2 className="seo-header-title">SEO Manager</h2>
          <p className="seo-header-sub">Manage meta tags, keywords & schema for each page</p>
        </div>
      </div>

      {/* ── Page Selector ── */}
      <div className="seo-page-selector">
        <p className="seo-selector-label">Select Page</p>
        <div className="seo-page-pills">
          {PAGES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPage(p)}
              className={`seo-page-pill ${selectedPage === p ? 'seo-page-pill--active' : ''}`}
            >
              <span className="pill-icon">{PAGE_ICONS[p]}</span>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className={`seo-form-card ${loading ? 'seo-form-card--loading' : ''}`}>
        {loading && <div className="seo-loading-bar" />}

        <div className="seo-form-card-header">
          <span className="seo-editing-badge">
            {PAGE_ICONS[selectedPage]} Editing: {selectedPage}
          </span>
          <span className="seo-status-dot" title="Live" />
        </div>

        <form onSubmit={handleSave} className="seo-form">

          {/* Row 1: Title + Keywords */}
          <div className="seo-form-row">
            <div className="seo-field">
              <div className="seo-label-row">
                <label className="seo-label" htmlFor="seo-title">
                  🏷️ SEO Title <span className="seo-required">*</span>
                </label>
                <span className="seo-char-counter" style={{ color: titleStats.color }}>
                  {titleStats.len}/{titleStats.max}
                </span>
              </div>
              <input
                id="seo-title"
                className="seo-input"
                type="text"
                required
                placeholder="e.g. Hotel Himalaya INN Khona — Luxury Stay in Nepal"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
              <div className="seo-progress-bar">
                <div
                  className="seo-progress-fill"
                  style={{ width: `${titleStats.pct}%`, background: titleStats.color }}
                />
              </div>
              <p className="seo-hint">Recommended: 50–60 characters for best Google display</p>
            </div>

            <div className="seo-field">
              <div className="seo-label-row">
                <label className="seo-label" htmlFor="seo-keywords">
                  🔑 Keywords
                </label>
                <span className="seo-hint-inline">comma separated</span>
              </div>
              <input
                id="seo-keywords"
                className="seo-input"
                type="text"
                placeholder="hotel nepal, himalaya inn, luxury stay khona"
                value={formData.keywords}
                onChange={e => setFormData({ ...formData, keywords: e.target.value })}
              />
              <p className="seo-hint">Separate keywords with commas. Aim for 5–10 relevant terms.</p>
            </div>
          </div>

          {/* Canonical URL — full width */}
          <div className="seo-field">
            <div className="seo-label-row">
              <label className="seo-label" htmlFor="seo-canonical">🔗 Canonical URL</label>
            </div>
            <div className="seo-input-icon-wrap">
              <span className="seo-input-prefix">https://</span>
              <input
                id="seo-canonical"
                className="seo-input seo-input--prefixed"
                type="text"
                placeholder="www.hotelhimalayainn.com/about"
                value={formData.canonical}
                onChange={e => setFormData({ ...formData, canonical: e.target.value })}
              />
            </div>
            <p className="seo-hint">Leave blank to use the default page URL. Use full URL to avoid duplicate content.</p>
          </div>

          {/* Meta Description — full width */}
          <div className="seo-field">
            <div className="seo-label-row">
              <label className="seo-label" htmlFor="seo-desc">📝 Meta Description</label>
              <span className="seo-char-counter" style={{ color: descStats.color }}>
                {descStats.len}/{descStats.max}
              </span>
            </div>
            <textarea
              id="seo-desc"
              className="seo-textarea"
              rows={3}
              placeholder="A short, compelling summary of this page shown in Google search results..."
              value={formData.metaDescription}
              onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
            />
            <div className="seo-progress-bar">
              <div
                className="seo-progress-fill"
                style={{ width: `${descStats.pct}%`, background: descStats.color }}
              />
            </div>
            <p className="seo-hint">Recommended: 150–160 characters. This appears directly in search engine results.</p>
          </div>

          {/* Schema JSON-LD — full width */}
          <div className="seo-field">
            <div className="seo-label-row">
              <label className="seo-label" htmlFor="seo-schema">⚙️ Schema JSON-LD</label>
              <span className="seo-badge-mono">JSON</span>
            </div>
            <textarea
              id="seo-schema"
              className="seo-textarea seo-textarea--mono"
              rows={6}
              placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Hotel",\n  "name": "Hotel Himalaya INN Khona"\n}`}
              value={formData.schema}
              onChange={e => setFormData({ ...formData, schema: e.target.value })}
              spellCheck={false}
            />
            <p className="seo-hint">Optional structured data markup. Must be valid JSON-LD. Helps Google understand your content better.</p>
          </div>

          {/* Search Preview */}
          {(formData.title || formData.metaDescription) && (
            <div className="seo-preview">
              <p className="seo-preview-label">🔍 Google Preview</p>
              <div className="seo-preview-card">
                <p className="seo-preview-url">
                  {formData.canonical || `https://www.hotelhimalayainn.com/${selectedPage.toLowerCase()}`}
                </p>
                <p className="seo-preview-title">{formData.title || 'Page Title'}</p>
                <p className="seo-preview-desc">
                  {formData.metaDescription || 'Meta description will appear here in search results...'}
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="seo-form-footer">
            <button
              type="button"
              className="seo-btn seo-btn--ghost"
              onClick={() => setFormData({ title: '', metaDescription: '', keywords: '', canonical: '', schema: '' })}
            >
              🗑️ Clear Fields
            </button>
            <button type="submit" className="seo-btn seo-btn--save" disabled={saving || loading}>
              {saving ? (
                <><span className="seo-btn-spinner" /> Saving…</>
              ) : (
                <>💾 Save SEO Settings</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SEOManager;
