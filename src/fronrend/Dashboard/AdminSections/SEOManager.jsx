import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../../config/api';

const API_URL = getApiUrl();

const SEOManager = () => {
  const pages = ['Home', 'About', 'Rooms', 'Tours', 'Events', 'Gallery', 'Attractions', 'Blogs', 'Contact'];
  const [selectedPage, setSelectedPage] = useState('Home');
  const [formData, setFormData] = useState({
    title: '', metaDescription: '', keywords: '', canonical: '', schema: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const res = await fetch(`${API_URL}/api/seo/${selectedPage}`);
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
      } catch (err) {
        console.error(err);
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
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert(`SEO settings for ${selectedPage} saved!`);
      } else {
        alert('Failed to save SEO settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving SEO');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Global SEO Management</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Select Page to Manage</label>
        <div className="flex flex-wrap gap-2">
          {pages.map(p => (
            <button 
              key={p} 
              onClick={() => setSelectedPage(p)}
              className={`px-4 py-2 rounded font-semibold transition ${selectedPage === p ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold border-b pb-2 mb-2">Editing: {selectedPage}</h3>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SEO Title</label>
          <input required className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Keywords (comma separated)</label>
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
          <textarea className="w-full border p-2 rounded font-mono text-sm" rows="5" value={formData.schema} onChange={e => setFormData({ ...formData, schema: e.target.value })} placeholder='{"@context": "https://schema.org", "@type": "WebPage"}' />
        </div>
        
        <div className="md:col-span-2 flex justify-end mt-4">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-blue-700 transition">
            {saving ? 'Saving...' : 'Save SEO Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SEOManager;
