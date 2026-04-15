import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Loader2, Save, X, Image as ImageIcon } from 'lucide-react';
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
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleNameChange = (val) => {
        setFormData({
            ...formData,
            name: val,
            slug: slugify(val)
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
        } catch (err) {
            alert('Failed to create brand. Check if slug is unique.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this brand? Products using it will be marked generic.')) {
            try {
                await api.delete(`products/brands/${id}/`);
                fetchBrands();
            } catch (err) {
                alert('Delete failed.');
            }
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#000' }}>Manage Brands</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Create Form */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '12px', height: 'fit-content', background: '#fff', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 800, color: '#000' }}>Add New Brand</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label>Brand Name</label>
                            <input 
                                required 
                                value={formData.name} 
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder="e.g. Exide"
                                style={{
                                    padding: '12px',
                                    background: '#fff',
                                    border: '1px solid #ced4da',
                                    borderRadius: '12px',
                                    color: 'var(--text-main)'
                                }}
                            />
                        </div>
                        <div className="input-group">
                            <label>Slug (URL key)</label>
                            <input 
                                required 
                                value={formData.slug} 
                                onChange={e => setFormData({...formData, slug: e.target.value})}
                                style={{
                                    padding: '12px',
                                    background: '#fff',
                                    border: '1px solid #ced4da',
                                    borderRadius: '12px',
                                    color: 'var(--text-main)'
                                }}
                            />
                        </div>
                        <div className="input-group">
                            <label>Logo (Optional)</label>
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={e => setLogo(e.target.files[0])}
                                style={{ fontSize: '0.85rem' }}
                            />
                        </div>
                        <button type="submit" className="glass" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--red-main)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                            <Plus size={18} /> Add Brand
                        </button>
                    </form>
                </div>

                {/* List Table */}
                <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: '#fff', border: '1px solid var(--glass-border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--glass-border)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 800, color: '#000' }}>Brand</th>
                                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 800, color: '#000' }}>System Slug</th>
                                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 800, color: '#000' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" color="var(--primary-glow)" /></td></tr>
                            ) : brands.length === 0 ? (
                                <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>No brands found.</td></tr>
                            ) : brands.map(brand => (
                                <tr key={brand.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {brand.logo ? <img src={brand.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={14} color="var(--text-dim)" />}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{brand.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>{brand.slug}</td>
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

            <style>
                {`
                    .input-group { display: flex; flex-direction: column; gap: 8px; }
                    .input-group label { font-size: 0.8rem; color: var(--text-dim); font-weight: 500; }
                `}
            </style>
        </div>
    );
};

export default BrandsPage;
