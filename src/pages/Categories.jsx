import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Loader2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CategoriesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', slug: '', parent: '' });
    
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

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get('products/categories/');
            setCategories(res.data.results || res.data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('products/categories/', formData);
            setFormData({ name: '', slug: '', parent: '' });
            fetchCategories();
        } catch (err) {
            alert('Failed to create category. Check if slug is unique.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category? Products using it will become uncategorized.')) {
            try {
                await api.delete(`products/categories/${id}/`);
                fetchCategories();
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
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#000' }}>Manage Categories</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Create Form */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '12px', height: 'fit-content', background: '#fff', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 800, color: '#000' }}>Create New Category</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label>Category Name</label>
                            <input 
                                required 
                                value={formData.name} 
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder="e.g. Inverter Batteries"
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
                            <label>Parent Category (Optional)</label>
                            <select 
                                value={formData.parent} 
                                onChange={e => setFormData({...formData, parent: e.target.value})}
                                style={{
                                    padding: '12px',
                                    background: '#fff',
                                    border: '1px solid #ced4da',
                                    borderRadius: '12px',
                                    color: 'var(--text-main)'
                                }}
                            >
                                <option value="">No Parent (Root)</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="glass" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--red-main)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                            <Save size={18} /> Create Category
                        </button>
                    </form>
                </div>

                {/* List Table */}
                <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: '#fff', border: '1px solid var(--glass-border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--glass-border)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 800, color: '#000' }}>Category Name</th>
                                <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 800, color: '#000' }}>System Slug</th>
                                <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 800, color: '#000' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" color="var(--primary-glow)" /></td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>No categories found.</td></tr>
                            ) : categories.map(cat => (
                                <tr key={cat.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1.25rem', fontWeight: 700, color: '#000' }}>{cat.name}</td>
                                    <td style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>{cat.slug}</td>
                                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                        <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
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

export default CategoriesPage;
