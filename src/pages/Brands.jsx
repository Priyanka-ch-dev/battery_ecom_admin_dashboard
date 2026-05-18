import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BrandsPage = () => {
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', slug: '' });
    const [logo, setLogo] = useState(null);
    
    const slugify = (text) => {
        return text.toString().toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setFormData({
            ...formData,
            name: val,
            slug: slugify(val)
        });
    };

    const handleSlugChange = (e) => {
        setFormData({
            ...formData,
            slug: e.target.value
        });
    };

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const res = await api.get('products/brands/');
            setBrands(res.data.results || res.data);
        } catch (err) {
            console.error('Failed to fetch brands:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (logo) {
                const fd = new FormData();
                fd.append('name', formData.name);
                fd.append('slug', formData.slug);
                fd.append('logo', logo);
                await api.post('products/brands/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('products/brands/', formData);
            }
            setFormData({ name: '', slug: '' });
            setLogo(null);
            fetchBrands();
            alert('Brand created successfully!');
        } catch (err) {
            console.error('Brand Create Error:', err.response?.data);
            const errorData = err.response?.data;
            let errorMessage = 'Failed to create brand.';
            if (errorData) {
                errorMessage = typeof errorData === 'object' 
                    ? Object.entries(errorData).map(([key, val]) => `${key}: ${val}`).join('\n')
                    : JSON.stringify(errorData);
            }
            alert(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this brand?')) {
            try {
                await api.delete(`products/brands/${id}/`);
                fetchBrands();
            } catch (err) {
                alert('Delete failed.');
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#000' }}>Manage Brands</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Create Form */}
                <div style={{ padding: '2rem', borderRadius: '12px', background: '#fff', border: '1px solid #eee', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Add New Brand</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Brand Name</label>
                            <input 
                                required 
                                value={formData.name} 
                                onChange={handleNameChange}
                                placeholder="e.g. Exide"
                                style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '12px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>System Slug (URL Key)</label>
                            <input 
                                required 
                                value={formData.slug} 
                                onChange={handleSlugChange}
                                style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '12px', background: '#f8f9fa' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Logo (Optional)</label>
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={e => setLogo(e.target.files[0])}
                            />
                        </div>
                        <button type="submit" style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                            Add Brand
                        </button>
                    </form>
                </div>

                {/* List Table */}
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1.25rem', textAlign: 'left' }}>Brand</th>
                                <th style={{ padding: '1.25rem', textAlign: 'left' }}>Slug</th>
                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></td></tr>
                            ) : brands.map(brand => (
                                <tr key={brand.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {brand.logo ? <img src={brand.logo} style={{ width: '30px', height: '30px', objectFit: 'contain' }} /> : <ImageIcon size={20} />}
                                        <span style={{ fontWeight: 600 }}>{brand.name}</span>
                                    </td>
                                    <td style={{ padding: '1.25rem', color: '#666' }}>{brand.slug}</td>
                                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(brand.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BrandsPage;
