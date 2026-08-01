import React, { useState, useEffect } from 'react';
import slugify from 'slugify';
import { getApiUrl } from '../../../config/api';
import './Manager.css';

const API_URL = getApiUrl();

const AttractionManager = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '', slug: '', featuredImage: '', gallery: '', shortDescription: '',
    fullDescription: '', status: 'Draft', seoTitle: '', metaDescription: '',
    keywords: '', canonical: '', schema: ''
  });

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/attractions`);
      const data = await res.json();
      if (data.success) {
        setAttractions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({ 
      ...formData, 
      title, 
      slug: slugify(title, { lower: true, strict: true }) 
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      gallery: formData.gallery ? formData.gallery.split(',').map(s => s.trim()) : [],
    };
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `${API_URL}/api/attractions/${editingId}` : `${API_URL}/api/attractions`;
      
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` // Adjust based on your auth implementation
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setFormData({ title: '', slug: '', featuredImage: '', gallery: '', shortDescription: '', fullDescription: '', status: 'Draft', seoTitle: '', metaDescription: '', keywords: '', canonical: '', schema: '' });
        setEditingId(null);
        fetchAttractions();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save attraction');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving attraction');
    }
  };

  const handleEdit = (attraction) => {
    setEditingId(attraction._id);
    setFormData({
      ...attraction,
      gallery: attraction.gallery ? attraction.gallery.join(', ') : ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attraction?')) return;
    try {
      const res = await fetch(`${API_URL}/api/attractions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (res.ok) fetchAttractions();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading Attractions...</div>;

  const normalizedSearch = String(searchTerm || '').trim().toLowerCase();
  const filteredAttractions = attractions.filter(a => {
    if (activeTab === 'published' && a.status !== 'Published') return false;
    if (activeTab === 'drafts' && a.status !== 'Draft') return false;
    if (!normalizedSearch) return true;
    return (a.title || '').toLowerCase().includes(normalizedSearch) || (a.shortDescription || '').toLowerCase().includes(normalizedSearch);
  });

  return (
    <div className="mgr-wrapper">
      <div className="mgr-section-header">
        <div className="mgr-header-icon">📍</div>
        <div>
          <h2 className="mgr-header-title">Attractions Management</h2>
          <p className="mgr-header-sub">Manage local attractions and places of interest.</p>
        </div>
      </div>

      {/* Navbar inside attraction places */}
      <div className="attraction-nav">
        <div className="attraction-nav-left">
          <button type="button" className={`attraction-nav-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Attractions</button>
          <button type="button" className={`attraction-nav-item ${activeTab === 'published' ? 'active' : ''}`} onClick={() => setActiveTab('published')}>Published</button>
          <button type="button" className={`attraction-nav-item ${activeTab === 'drafts' ? 'active' : ''}`} onClick={() => setActiveTab('drafts')}>Drafts</button>
        </div>
        <div className="attraction-nav-right">
        </div>
      </div>

      <div className="mgr-form-card">
        <div className="mgr-form-card-header">
          <h3 className="mgr-form-card-title">{editingId ? 'Edit Attraction' : 'Add New Attraction'}</h3>
          {editingId && <span className="mgr-mode-badge mgr-mode-badge--edit">Editing</span>}
        </div>
        <form onSubmit={handleSave} className="mgr-form">
          <div className="mgr-form-grid">
            <div className="mgr-form-group">
              <label className="mgr-label">Title</label>
              <input required className="mgr-input" value={formData.title} onChange={handleTitleChange} />
            </div>
            <div className="mgr-form-group">
              <label className="mgr-label">Slug</label>
              <input required className="mgr-input" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
            </div>
            <div className="mgr-form-group">
              <label className="mgr-label">Featured Image URL</label>
              <input required className="mgr-input" value={formData.featuredImage} onChange={e => setFormData({ ...formData, featuredImage: e.target.value })} />
            </div>
            <div className="mgr-form-group">
              <label className="mgr-label">Gallery URLs (comma separated)</label>
              <input className="mgr-input" value={formData.gallery} onChange={e => setFormData({ ...formData, gallery: e.target.value })} />
            </div>
            <div className="mgr-form-group mgr-col-full">
              <label className="mgr-label">Short Description</label>
              <textarea required className="mgr-textarea" rows="2" value={formData.shortDescription || formData.description || ''} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} />
            </div>
            <div className="mgr-form-group mgr-col-full">
              <label className="mgr-label">Full Description (HTML allowed)</label>
              <textarea required className="mgr-textarea" rows="4" value={formData.fullDescription || formData.description || ''} onChange={e => setFormData({ ...formData, fullDescription: e.target.value })} />
            </div>
            <div className="mgr-form-group">
              <label className="mgr-label">Status</label>
              <select className="mgr-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option>Draft</option>
                <option>Published</option>
              </select>
            </div>

            <div className="mgr-section-divider">
              <span className="mgr-section-divider-label">SEO Settings</span>
              <div className="mgr-section-divider-line"></div>
            </div>

            <div className="mgr-form-group">
              <label className="mgr-label">SEO Title</label>
              <input className="mgr-input" value={formData.seoTitle} onChange={e => setFormData({ ...formData, seoTitle: e.target.value })} />
            </div>
            <div className="mgr-form-group">
              <label className="mgr-label">Keywords</label>
              <input className="mgr-input" value={formData.keywords} onChange={e => setFormData({ ...formData, keywords: e.target.value })} />
            </div>
            <div className="mgr-form-group">
              <label className="mgr-label">Canonical URL</label>
              <input className="mgr-input" value={formData.canonical} onChange={e => setFormData({ ...formData, canonical: e.target.value })} />
            </div>
            <div className="mgr-form-group">
              <label className="mgr-label">Meta Description</label>
              <textarea className="mgr-textarea" rows="3" value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} />
            </div>
            <div className="mgr-form-group mgr-col-full">
              <label className="mgr-label">Schema JSON-LD</label>
              <textarea className="mgr-textarea font-mono text-sm" rows="3" value={formData.schema} onChange={e => setFormData({ ...formData, schema: e.target.value })} placeholder='{"@context": "https://schema.org", "@type": "TouristAttraction"}' />
            </div>
          </div>
          
          <div className="mgr-actions">
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', slug: '', featuredImage: '', gallery: '', shortDescription: '', fullDescription: '', status: 'Draft', seoTitle: '', metaDescription: '', keywords: '', canonical: '', schema: '' }); }} className="mgr-btn mgr-btn-secondary">Cancel</button>
            )}
            <button type="submit" className="mgr-btn mgr-btn-primary">{editingId ? 'Update Attraction' : 'Save Attraction'}</button>
          </div>
        </form>
      </div>

      <h3 className="text-xl font-bold mb-4">Existing Attractions ({filteredAttractions.length})</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Title</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttractions.map(attr => (
              <tr key={attr._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{attr.title}</td>
                <td className="py-2 px-4 border-b">{attr.status}</td>
                <td className="py-2 px-4 border-b text-right space-x-2">
                  <button onClick={() => handleEdit(attr)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(attr._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttractionManager;
