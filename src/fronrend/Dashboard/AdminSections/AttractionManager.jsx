import React, { useState, useEffect } from 'react';
import slugify from 'slugify';
import { getApiUrl } from '../../../config/api';

const API_URL = getApiUrl();

const AttractionManager = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
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

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Attraction' : 'Add New Attraction'}</h2>
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input required className="w-full border p-2 rounded" value={formData.title} onChange={handleTitleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input required className="w-full border p-2 rounded" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Featured Image URL</label>
          <input required className="w-full border p-2 rounded" value={formData.featuredImage || formData.imageUrl || ''} onChange={e => setFormData({ ...formData, featuredImage: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gallery URLs (comma separated)</label>
          <input className="w-full border p-2 rounded" value={formData.gallery} onChange={e => setFormData({ ...formData, gallery: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Short Description</label>
          <textarea required className="w-full border p-2 rounded" rows="2" value={formData.shortDescription || formData.description || ''} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Full Description (HTML allowed)</label>
          <textarea required className="w-full border p-2 rounded" rows="4" value={formData.fullDescription || formData.description || ''} onChange={e => setFormData({ ...formData, fullDescription: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="w-full border p-2 rounded" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
            <option>Draft</option>
            <option>Published</option>
          </select>
        </div>
        
        <div className="md:col-span-2 mt-4">
          <h3 className="text-xl font-bold border-b pb-2 mb-2">SEO Settings</h3>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SEO Title</label>
          <input className="w-full border p-2 rounded" value={formData.seoTitle} onChange={e => setFormData({ ...formData, seoTitle: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Keywords</label>
          <input className="w-full border p-2 rounded" value={formData.keywords} onChange={e => setFormData({ ...formData, keywords: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Canonical URL</label>
          <input className="w-full border p-2 rounded" value={formData.canonical} onChange={e => setFormData({ ...formData, canonical: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Meta Description</label>
          <textarea className="w-full border p-2 rounded" rows="2" value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Schema JSON-LD</label>
          <textarea className="w-full border p-2 rounded font-mono text-sm" rows="3" value={formData.schema} onChange={e => setFormData({ ...formData, schema: e.target.value })} placeholder='{"@context": "https://schema.org", "@type": "TouristAttraction"}' />
        </div>
        
        <div className="md:col-span-2 flex justify-end gap-2 mt-4">
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', slug: '', featuredImage: '', gallery: '', shortDescription: '', fullDescription: '', status: 'Draft', seoTitle: '', metaDescription: '', keywords: '', canonical: '', schema: '' }); }} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
          )}
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">{editingId ? 'Update' : 'Save'}</button>
        </div>
      </form>

      <h3 className="text-xl font-bold mb-4">Existing Attractions</h3>
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
            {attractions.map(attr => (
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
