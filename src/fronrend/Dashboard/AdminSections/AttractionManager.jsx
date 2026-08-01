import React, { useState, useEffect } from 'react';
import slugify from 'slugify';
import { getApiUrl } from '../../../config/api';
import './Manager.css';

const API_URL = getApiUrl();

const AttractionManager = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '', slug: '', featuredImage: '', gallery: '', shortDescription: '',
    fullDescription: '', seoTitle: '', metaDescription: '',
    keywords: '', canonical: '', schema: ''
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAttractions();
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
  };

  const fetchAttractions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/attractions`);
      const data = await res.json();
      if (data.success) setAttractions(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({ ...formData, title, slug: slugify(title, { lower: true, strict: true }) });
  };

  const resetForm = () => {
    setFormData({
      title: '', slug: '', featuredImage: '', gallery: '', shortDescription: '',
      fullDescription: '', seoTitle: '', metaDescription: '',
      keywords: '', canonical: '', schema: ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...formData,
      gallery: formData.gallery ? formData.gallery.split(',').map(s => s.trim()) : [],
    };
    try {
      const res = await fetch(`${API_URL}/api/attractions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('success', 'Attraction saved successfully!');
        resetForm();
        fetchAttractions();
      } else {
        const errorData = await res.json();
        showToast('error', errorData.error || 'Failed to save attraction');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error. Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attraction?')) return;
    try {
      const res = await fetch(`${API_URL}/api/attractions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        showToast('success', 'Attraction deleted.');
        fetchAttractions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const normalizedSearch = String(searchTerm || '').trim().toLowerCase();
  const filteredAttractions = attractions.filter(a =>
    !normalizedSearch ||
    (a.title || '').toLowerCase().includes(normalizedSearch) ||
    (a.shortDescription || '').toLowerCase().includes(normalizedSearch)
  );

  return (
    <div className="mgr-wrapper">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderRadius: 14, fontWeight: 700,
          background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: toast.type === 'success' ? '#065f46' : '#991b1b',
          border: `1.5px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', maxWidth: 360
        }}>
          <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span style={{ flex: 1 }}>{toast.msg}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 16, lineHeight: 1, padding: '2px 4px', borderRadius: 6,
              color: 'inherit', opacity: 0.6, marginLeft: 4
            }}
            aria-label="Close"
          >✕</button>
        </div>
      )}

      {/* Header */}
      <div className="mgr-section-header">
        <div className="mgr-header-icon">🏔️</div>
        <div>
          <h2 className="mgr-header-title">Attractions Management</h2>
          <p className="mgr-header-sub">Add and manage local attractions and places of interest.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="mgr-form-card">
        <div className="mgr-form-card-header">
          <h3 className="mgr-form-card-title">✨ Add New Attraction</h3>
          <span className="mgr-mode-badge mgr-mode-badge--new">New</span>
        </div>

        <form onSubmit={handleSave} className="mgr-form">
          <div className="mgr-form-grid">

            {/* Title */}
            <div className="mgr-form-group">
              <label className="mgr-label">Title <span className="mgr-required">*</span></label>
              <input required className="mgr-input" placeholder="e.g. Phewa Lake" value={formData.title} onChange={handleTitleChange} />
            </div>

            {/* Slug */}
            <div className="mgr-form-group">
              <label className="mgr-label">Slug</label>
              <input required className="mgr-input" placeholder="auto-generated" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
            </div>

            {/* Featured Image */}
            <div className="mgr-form-group">
              <label className="mgr-label">Featured Image URL <span className="mgr-required">*</span></label>
              <input required className="mgr-input" placeholder="https://..." value={formData.featuredImage} onChange={e => setFormData({ ...formData, featuredImage: e.target.value })} />
            </div>

            {/* Gallery */}
            <div className="mgr-form-group">
              <label className="mgr-label">Gallery URLs <span style={{ fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0 }}>(comma separated)</span></label>
              <input className="mgr-input" placeholder="url1, url2, url3" value={formData.gallery} onChange={e => setFormData({ ...formData, gallery: e.target.value })} />
            </div>

            {/* Short Description */}
            <div className="mgr-form-group mgr-col-full">
              <label className="mgr-label">Short Description <span className="mgr-required">*</span></label>
              <textarea required className="mgr-textarea" rows="2" placeholder="A brief summary shown on cards..." value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} />
            </div>

            {/* Full Description */}
            <div className="mgr-form-group mgr-col-full">
              <label className="mgr-label">Full Description <span style={{ fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0 }}>(HTML allowed)</span></label>
              <textarea required className="mgr-textarea" rows="5" placeholder="Full detail page content..." value={formData.fullDescription} onChange={e => setFormData({ ...formData, fullDescription: e.target.value })} />
            </div>

            {/* SEO Divider */}
            <div className="mgr-section-divider">
              <span className="mgr-section-divider-label">🔍 SEO Settings</span>
              <div className="mgr-section-divider-line"></div>
            </div>

            <div className="mgr-form-group">
              <label className="mgr-label">SEO Title</label>
              <input className="mgr-input" placeholder="Custom title for Google" value={formData.seoTitle} onChange={e => setFormData({ ...formData, seoTitle: e.target.value })} />
            </div>

            <div className="mgr-form-group">
              <label className="mgr-label">Keywords</label>
              <input className="mgr-input" placeholder="comma separated" value={formData.keywords} onChange={e => setFormData({ ...formData, keywords: e.target.value })} />
            </div>

            <div className="mgr-form-group">
              <label className="mgr-label">Canonical URL</label>
              <input className="mgr-input" placeholder="https://..." value={formData.canonical} onChange={e => setFormData({ ...formData, canonical: e.target.value })} />
            </div>

            <div className="mgr-form-group">
              <label className="mgr-label">Meta Description</label>
              <textarea className="mgr-textarea" rows="3" value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} />
            </div>

            <div className="mgr-form-group mgr-col-full">
              <label className="mgr-label">Schema JSON-LD</label>
              <textarea className="mgr-textarea mgr-textarea--mono" rows="3" value={formData.schema} onChange={e => setFormData({ ...formData, schema: e.target.value })} placeholder='{"@context": "https://schema.org", "@type": "TouristAttraction"}' />
            </div>
          </div>

          {/* Actions */}
          <div className="mgr-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={resetForm} style={{
              padding: '11px 22px', borderRadius: 12, border: '1.5px solid #e5e7eb',
              background: '#fff', color: '#6b7280', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13.5
            }}>
              🗑️ Clear
            </button>
            <button type="submit" disabled={saving} style={{
              padding: '11px 28px', borderRadius: 12, border: 'none',
              background: saving ? '#e5e7eb' : 'linear-gradient(135deg, #d4af37, #b8962e)',
              color: saving ? '#9ca3af' : '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: 13.5, boxShadow: saving ? 'none' : '0 5px 18px rgba(212,175,55,0.35)',
              transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8
            }}>
              {saving ? '⏳ Saving…' : '💾 Save Attraction'}
            </button>
          </div>
        </form>
      </div>

      {/* Attractions List */}
      <div className="mgr-list-card">
        <div className="mgr-list-card-header">
          <div className="mgr-list-card-title">
            🏔️ All Attractions
            <span className="mgr-count-badge">{filteredAttractions.length}</span>
          </div>
          <input
            className="attraction-search"
            placeholder="🔍 Search attractions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ minWidth: 220 }}
          />
        </div>

        {loading ? (
          <div className="mgr-loading">
            <div className="mgr-spinner" />
            Loading Attractions...
          </div>
        ) : filteredAttractions.length === 0 ? (
          <div className="mgr-empty">
            <div className="mgr-empty-icon">🏔️</div>
            {searchTerm ? 'No attractions match your search.' : 'No attractions added yet.'}
          </div>
        ) : (
          <div className="mgr-table-wrap">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th>Attraction</th>
                  <th>Short Description</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttractions.map(attr => (
                  <tr key={attr._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {attr.featuredImage && (
                          <img
                            src={attr.featuredImage}
                            alt={attr.title}
                            style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{attr.title}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{attr.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <span style={{ fontSize: 13, color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {attr.shortDescription || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="mgr-table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleDelete(attr._id)}
                          className="mgr-action-btn mgr-action-btn--delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttractionManager;
