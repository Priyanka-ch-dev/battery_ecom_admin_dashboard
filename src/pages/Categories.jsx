import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CategoriesPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', slug: '', parent: '' });
    
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
            alert('Category created successfully!');
        } catch (err) {
            console.error('Category Create Error:', err.response?.data);
            const errorData = err.response?.data;
            let errorMessage = 'Failed to create category.';
            if (errorData) {
                errorMessage = typeof errorData === 'object' 
                    ? Object.entries(errorData).map(([key, val]) => `${key}: ${val}`).join('\n')
                    : JSON.stringify(errorData);
            }
            alert(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category?')) {
            try {
                await api.delete(`products/categories/${id}/`);
                fetchCategories();
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
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#000' }}>Manage Categories</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Create Form */}
                <div style={{ padding: '2rem', borderRadius: '12px', background: '#fff', border: '1px solid #eee', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Create New Category</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Category Name</label>
                            <input 
                                required 
                                value={formData.name} 
                                onChange={handleNameChange}
                                placeholder="e.g. Solar Batteries"
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
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px' }}>Parent Category (Optional)</label>
                            <select 
                                value={formData.parent} 
                                onChange={e => setFormData({...formData, parent: e.target.value})}
                                style={{ width: '100%', padding: '12px', border: '1px solid #ced4da', borderRadius: '12px' }}
                            >
                                <option value="">No Parent (Root)</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                            Create Category
                        </button>
                    </form>
                </div>

                {/* List Table */}
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '1.25rem', textAlign: 'left' }}>Category Name</th>
                                <th style={{ padding: '1.25rem', textAlign: 'left' }}>Slug</th>
                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></td></tr>
                            ) : categories.map(cat => (
                                <tr key={cat.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1.25rem', fontWeight: 700 }}>{cat.name}</td>
                                    <td style={{ padding: '1.25rem', color: '#666' }}>{cat.slug}</td>
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
        </div>
    );
};

export default CategoriesPage;
