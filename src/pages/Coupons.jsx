import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Loader2, Save, X, Edit2, Tag, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CouponsPage = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('');

    // Using discount_type to handle percent/amount cleanly in UI, then map to backend fields
    const [formData, setFormData] = useState({ 
        code: '', 
        discount_type: 'percent', 
        discount_value: '', 
        valid_from: '', 
        valid_to: '', 
        active: true 
    });

    const fetchCoupons = async (search = '', active = '') => {
        try {
            setLoading(true);
            let url = 'cart/coupons/';
            const params = [];
            if (search) params.push(`search=${search}`);
            if (active) params.push(`active=${active}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const res = await api.get(url);
            setCoupons(res.data.results || res.data);
        } catch (err) {
            console.error('Failed to fetch coupons:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCoupons(searchTerm, activeFilter);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, activeFilter]);

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                code: coupon.code,
                discount_type: coupon.discount_percent ? 'percent' : 'amount',
                discount_value: coupon.discount_percent || coupon.discount_amount || '',
                valid_from: coupon.valid_from ? coupon.valid_from.substring(0, 16) : '',
                valid_to: coupon.valid_to ? coupon.valid_to.substring(0, 16) : '',
                active: coupon.active
            });
        } else {
            setEditingCoupon(null);
            setFormData({ code: '', discount_type: 'percent', discount_value: '', valid_from: '', valid_to: '', active: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                code: formData.code.toUpperCase(),
                discount_percent: formData.discount_type === 'percent' ? parseFloat(formData.discount_value) : null,
                discount_amount: formData.discount_type === 'amount' ? parseFloat(formData.discount_value) : null,
                valid_from: new Date(formData.valid_from).toISOString(),
                valid_to: new Date(formData.valid_to).toISOString(),
                active: formData.active
            };

            if (editingCoupon) {
                await api.put(`cart/coupons/${editingCoupon.id}/`, payload);
            } else {
                await api.post('cart/coupons/', payload);
            }
            setIsModalOpen(false);
            fetchCoupons();
        } catch (err) {
            console.error('Submit Error:', err.response?.data);
            alert('Failed to save coupon. Please check data.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this coupon?')) {
            try {
                await api.delete(`cart/coupons/${id}/`);
                fetchCoupons();
            } catch (err) {
                alert('Delete failed.');
            }
        }
    };

    const toggleActive = async (coupon) => {
        try {
            const payload = { ...coupon, active: !coupon.active };
            await api.patch(`cart/coupons/${coupon.id}/`, { active: !coupon.active });
            fetchCoupons();
        } catch (err) {
            alert('Status update failed.');
        }
    };

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateString));
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Coupons & Promotions</h1>
                    <p style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Manage discount codes and promotional campaigns.</p>
                </div>
                <button 
                  onClick={() => handleOpenModal()}
                  className="glass" 
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '12px', 
                    background: 'var(--red-main)', 
                    border: 'none', 
                    color: 'white', 
                    fontWeight: 800, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(211, 47, 47, 0.3)'
                  }}>
                    <Plus size={18} /> Create Coupon
                </button>
            </div>

            {/* Filter Bar */}
            <div className="glass" style={{ padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', background: '#f1f5f9', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <Search size={18} color="var(--text-main)" />
                    <input 
                      type="text" 
                      placeholder="Search by coupon code..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                    />
                </div>
                
                <select 
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', outline: 'none', minWidth: '180px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                </select>

                {(searchTerm || activeFilter) && (
                    <button 
                      onClick={() => { setSearchTerm(''); setActiveFilter(''); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* List Table */}
            <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--glass-border)' }}>
                        <tr>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 800, color: '#000' }}>Coupon Code</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 800, color: '#000' }}>Discount % / ₹</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 800, color: '#000' }}>Valid From</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 800, color: '#000' }}>Valid To</th>
                            <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 800, color: '#000' }}>Status</th>
                            <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 800, color: '#000' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" color="var(--primary-glow)" /></td></tr>
                        ) : coupons.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>No coupons found.</td></tr>
                        ) : coupons.map(coupon => (
                            <tr key={coupon.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1.25rem', fontWeight: 800, color: 'var(--red-main)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Tag size={16} /> {coupon.code}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    {coupon.discount_percent ? `${coupon.discount_percent}%` : `₹${coupon.discount_amount}`}
                                </td>
                                <td style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                                    {formatDate(coupon.valid_from)}
                                </td>
                                <td style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                                    {formatDate(coupon.valid_to)}
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    <button 
                                        onClick={() => toggleActive(coupon)}
                                        style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.7rem', 
                                        background: coupon.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: coupon.active ? '#22c55e' : '#ef4444',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}>
                                        {coupon.active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button onClick={() => handleOpenModal(coupon)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(coupon.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" style={{ 
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' 
                }}>
                    <form onSubmit={handleSubmit} className="glass" style={{ 
                        width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column',
                        borderRadius: '24px', maxHeight: '90vh', overflow: 'hidden', position: 'relative' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>{editingCoupon ? 'Edit Coupon' : 'New Coupon'}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Coupon Code</label>
                                    <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER2024" />
                                </div>
                                <div className="input-group">
                                    <label>Discount Type</label>
                                    <select required value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}>
                                        <option value="percent">Percentage (%)</option>
                                        <option value="amount">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Discount Value</label>
                                    <input required type="number" step="0.01" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} placeholder="e.g. 10" />
                                </div>
                                <div className="input-group">
                                    <label>Valid From</label>
                                    <input required type="datetime-local" value={formData.valid_from} onChange={e => setFormData({...formData, valid_from: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Valid To</label>
                                    <input required type="datetime-local" value={formData.valid_to} onChange={e => setFormData({...formData, valid_to: e.target.value})} />
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                    <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} style={{ width: 'auto' }} />
                                    <label style={{ margin: 0 }}>Is Active</label>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: '#fff' }}>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'transparent', border: '1px solid #ced4da', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                            <button type="submit" style={{ 
                                padding: '0.75rem 2rem', borderRadius: '12px', background: 'var(--grad-purple)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: '0 4px 15px rgba(218, 140, 255, 0.3)'
                            }}>
                                <Save size={18} /> {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <style>
                {`
                    .input-group { display: flex; flex-direction: column; gap: 8px; }
                    .input-group label { font-size: 0.8rem; color: var(--text-dim); font-weight: 500; }
                    .input-group input, .input-group select {
                        padding: 12px;
                        background: #fff;
                        border: 1px solid #ced4da;
                        border-radius: 12px;
                        color: var(--text-main);
                        outline: none;
                        transition: border-color 0.2s;
                    }
                    .input-group input:focus, .input-group select:focus { border-color: var(--purple-main); }
                `}
            </style>
        </div>
    );
};

export default CouponsPage;
