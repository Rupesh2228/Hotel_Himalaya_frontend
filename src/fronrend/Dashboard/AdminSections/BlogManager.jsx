import { useState, useEffect } from 'react';
import slugify from 'slugify';
import { getApiUrl } from '../../../config/api';
import './Manager.css';

const API_URL = getApiUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: 'Bearer ' + token } : {};
};

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', featuredImage: '', gallery: '', shortDescription: '',
    fullDescription: '', seoTitle: '', metaDescription: '',
    keywords: '', canonical: '', schema: '', status: 'Published'
  });

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/blogs`);
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBlogs = async () => {
      await fetchBlogs();
    };
    loadBlogs();
  }, []);

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
      slug: (formData.slug || '').trim(),
      status: formData.status || 'Published',
      gallery: formData.gallery ? formData.gallery.split(',').map(s => s.trim()) : [],
    };
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `${API_URL}/api/blogs/${editingId}` : `${API_URL}/api/blogs`;
      
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setFormData({ title: '', slug: '', featuredImage: '', gallery: '', shortDescription: '', fullDescription: '', seoTitle: '', metaDescription: '', keywords: '', canonical: '', schema: '', status: 'Published' });
        setEditingId(null);
        fetchBlogs();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save blog');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving blog');
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setFormData({
      ...blog,
      gallery: blog.gallery ? blog.gallery.join(', ') : ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      const res = await fetch(`${API_URL}/api/blogs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading Blogs...</div>;

  return (
    <div className="mgr-wrapper">
      <div className="mgr-section-header">
        <div className="mgr-header-icon">✍️</div>
        <div>
          <h2 className="mgr-header-title">Blog Management</h2>
          <p className="mgr-header-sub">Create and edit blog posts.</p>
        </div>
      </div>

      <div className="mgr-form-card">
        <div className="mgr-form-card-header">
          <h3 className="mgr-form-card-title">{editingId ? 'Edit Blog' : 'Add New Blog'}</h3>
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
              <label className="mgr-label">Status</label>
              <select className="mgr-input" value={formData.status || 'Published'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
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
              <textarea required className="mgr-textarea" rows="2" value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} />
            </div>
            <div className="mgr-form-group mgr-col-full">
              <label className="mgr-label">Full Description (HTML allowed)</label>
              <textarea required className="mgr-textarea" rows="6" value={formData.fullDescription} onChange={e => setFormData({ ...formData, fullDescription: e.target.value })} />
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
              <textarea className="mgr-textarea font-mono text-sm" rows="3" value={formData.schema} onChange={e => setFormData({ ...formData, schema: e.target.value })} placeholder='{"@context": "https://schema.org", "@type": "BlogPosting"}' />
            </div>
          </div>
          
          <div className="mgr-actions">
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', slug: '', featuredImage: '', gallery: '', shortDescription: '', fullDescription: '', seoTitle: '', metaDescription: '', keywords: '', canonical: '', schema: '', status: 'Published' }); }} className="mgr-btn mgr-btn-secondary">Cancel</button>
            )}
            <button type="submit" className="mgr-btn mgr-btn--save">{editingId ? 'Update Blog' : 'Save Blog'}</button>
          </div>
        </form>
      </div>

      <h3 className="text-xl font-bold mb-4">Existing Blogs</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Title</th>
              <th className="py-2 px-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{blog.title}</td>
                <td className="py-2 px-4 border-b text-right space-x-2">
                  <button onClick={() => handleEdit(blog)} className="mgr-action-btn mgr-action-btn--edit">Edit</button>
                  <button onClick={() => handleDelete(blog._id)} className="mgr-action-btn mgr-action-btn--delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogManager;
