import { useState, useEffect } from 'react';
import slugify from 'slugify';
import { getApiUrl } from '../../../config/api';
import './Manager.css';

const API_URL = getApiUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: 'Bearer ' + token } : {};
};

const DragAndDropUploader = ({ value, onChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (files) => {
    setUploading(true);
    setError('');
    const uploadedUrls = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed (JPEG, PNG, WEBP, GIF).');
        continue;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: token ? { Authorization: 'Bearer ' + token } : {},
          body: formData,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || `Upload failed (${response.status})`);
        }
        if (data.url) uploadedUrls.push(data.url);
      } catch (err) {
        setError(err.message || 'Failed to upload image. Please try again.');
        setUploading(false);
        return;
      }
    }

    if (uploadedUrls.length > 0) {
      onChange(uploadedUrls[0]);
    }
    setUploading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(Array.from(e.target.files));
    }
  };

  const uniqueId = `dnd-${Math.random().toString(36).slice(2, 10)}`;
  return (
    <div className="dnd-uploader-container">
      <div
        className={`dnd-upload-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={uniqueId}
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <label htmlFor={uniqueId} className="dnd-upload-label">
          {uploading ? (
            <span>Uploading...</span>
          ) : (
            <>
              <span className="dnd-upload-icon">📁</span>
              <span>Drag & Drop image here or <strong>browse</strong></span>
            </>
          )}
        </label>
      </div>
      {error && <div className="dnd-error">{error}</div>}
      {value && (
        <div className="dnd-preview-grid">
          <div className="dnd-preview-item">
            <img src={value} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

const AttractionManager = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '', slug: '', featuredImage: '', shortDescription: '', fullDescription: ''
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);

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

  useEffect(() => {
    const loadAttractions = async () => {
      await fetchAttractions();
    };
    loadAttractions();
  }, []);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({ ...formData, title, slug: slugify(title, { lower: true, strict: true }) });
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', featuredImage: '', shortDescription: '', fullDescription: '' });
    setEditingId(null);
  };

  const handleEdit = (attraction) => {
    setEditingId(attraction._id);
    setFormData({
      title: attraction.title || '',
      slug: attraction.slug || (attraction.title ? slugify(attraction.title, { lower: true, strict: true }) : ''),
      featuredImage: attraction.featuredImage || attraction.imageUrl || '',
      shortDescription: attraction.shortDescription || attraction.subDescription || '',
      fullDescription: attraction.fullDescription || attraction.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const imageValue = formData.featuredImage;
    const payload = {
      title: formData.title,
      slug: formData.slug || slugify(formData.title || '', { lower: true, strict: true }),
      featuredImage: imageValue,
      imageUrl: imageValue,
      shortDescription: formData.shortDescription,
      subDescription: formData.shortDescription,
      fullDescription: formData.fullDescription,
      description: formData.fullDescription,
    };
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `${API_URL}/api/attractions/${editingId}` : `${API_URL}/api/attractions`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('success', editingId ? 'Attraction updated successfully!' : 'Attraction saved successfully!');
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
        headers: getAuthHeaders()
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
    ((a.shortDescription || a.subDescription || '')).toLowerCase().includes(normalizedSearch)
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
          <h3 className="mgr-form-card-title">{editingId ? '✏️ Edit Attraction' : '✨ Add New Attraction'}</h3>
          <span className={`mgr-mode-badge ${editingId ? 'mgr-mode-badge--edit' : 'mgr-mode-badge--new'}`}>{editingId ? 'Editing' : 'New'}</span>
        </div>

        <form onSubmit={handleSave} className="mgr-form">
          <div className="mgr-form-grid">

            {/* Title */}
            <div className="mgr-form-group">
              <label className="mgr-label">Title <span className="mgr-required">*</span></label>
              <input required className="mgr-input" placeholder="e.g. Phewa Lake" value={formData.title} onChange={handleTitleChange} />
            </div>

            {/* Image Upload */}
            <div className="mgr-form-group mgr-col-full">
              <label className="mgr-label">Image <span className="mgr-required">*</span></label>
              <DragAndDropUploader value={formData.featuredImage} onChange={(featuredImage) => setFormData({ ...formData, featuredImage })} />
            </div>

            {/* Short Description */}
            <div className="mgr-form-group mgr-col-full">
              <label className="mgr-label">Short Description <span className="mgr-required">*</span></label>
              <textarea required className="mgr-textarea" rows="2" placeholder="A brief summary shown on cards..." value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} />
            </div>

            {/* Full Description */}
            <div className="mgr-form-group mgr-col-full">
              <label className="mgr-label">Full Description <span className="mgr-required">*</span></label>
              <textarea required className="mgr-textarea" rows="5" placeholder="Full detail page content..." value={formData.fullDescription} onChange={e => setFormData({ ...formData, fullDescription: e.target.value })} />
            </div>
          </div>

          {/* Actions */}
          <div className="mgr-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" onClick={resetForm} style={{
              padding: '11px 22px', borderRadius: 12, border: '1.5px solid #e5e7eb',
              background: '#fff', color: '#6b7280', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13.5
            }}>
              {editingId ? '❌ Cancel' : '🗑️ Clear'}
            </button>
            <button type="submit" disabled={saving} style={{
              padding: '11px 28px', borderRadius: 12, border: 'none',
              background: saving ? '#e5e7eb' : (editingId ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #d4af37, #b8962e)'),
              color: saving ? '#9ca3af' : '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: 13.5, boxShadow: saving ? 'none' : (editingId ? '0 5px 18px rgba(37,99,235,0.35)' : '0 5px 18px rgba(212,175,55,0.35)'),
              transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8
            }}>
              {saving ? '⏳ Saving…' : (editingId ? '💾 Update Attraction' : '💾 Save Attraction')}
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
                          onClick={() => handleEdit(attr)}
                          className="mgr-action-btn mgr-action-btn--edit"
                        >
                          ✏️ Edit
                        </button>
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
