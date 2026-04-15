import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, CheckCircle, Trash2, Loader2, AlertCircle, Clock, Search } from 'lucide-react';
import api from '../services/api';

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchReviews = async (search = '', status = '') => {
        try {
            setLoading(true);
            let url = 'reviews/';
            const params = [];
            if (search) params.push(`search=${search}`);
            if (status) params.push(`is_approved=${status}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const res = await api.get(url);
            // Handle paginated or simple response
            const data = res.data.results || res.data;
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            setError('Failed to load product reviews.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReviews(searchTerm, statusFilter);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]);

    const handleApprove = async (id) => {
        try {
            await api.post(`products/reviews/${id}/approve/`);
            fetchReviews(); // Refresh list
        } catch (err) {
            alert('Approval failed. Check permissions.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete/reject this review?')) {
            try {
                await api.delete(`products/reviews/${id}/`);
                fetchReviews();
            } catch (err) {
                alert('Deletion failed.');
            }
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Quality Control & Reviews</h1>
                <p style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Manage customer feedback and moderate product reviews.</p>
            </div>

            {/* Filter Bar */}
            <div className="glass" style={{ padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', background: '#f1f5f9', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <Search size={18} color="var(--text-main)" />
                    <input 
                      type="text" 
                      placeholder="Search by comment, email, or product..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                    />
                </div>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '0.9rem', outline: 'none', minWidth: '180px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="true">Approved Only</option>
                    <option value="false">Pending Only</option>
                </select>

                {(searchTerm || statusFilter) && (
                    <button 
                      onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid #eee' }}>
                            <tr>
                                <th style={{ padding: '1.25rem' }}>Rating</th>
                                <th style={{ padding: '1.25rem' }}>Review</th>
                                <th style={{ padding: '1.25rem' }}>Customer</th>
                                <th style={{ padding: '1.25rem' }}>Product</th>
                                <th style={{ padding: '1.25rem' }}>Date</th>
                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '5rem', textAlign: 'center' }}>
                                        <Loader2 className="animate-spin" size={32} color="var(--purple-main)" />
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        No reviews pending moderation.
                                    </td>
                                </tr>
                            ) : reviews.map((review) => (
                                <tr key={review.id} style={{ borderBottom: '1px solid #f3f4f6' }} className="table-row">
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? '#eab308' : 'none'} color={i < review.rating ? '#eab308' : '#cbd5e1'} />
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', maxWidth: '300px' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#000000', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                                            "{review.comment}"
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{review.user_email || 'Verified Buyer'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--purple-main)', fontWeight: 500 }}>
                                            {review.product_name ? `${review.product_name} (ID #${review.product})` : `ID #${review.product}`}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {!review.is_approved ? (
                                                <button 
                                                  onClick={() => handleApprove(review.id)}
                                                  className="action-btn" title="Approve Review"
                                                  style={{ padding: '8px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'none', cursor: 'pointer' }}>
                                                    <CheckCircle size={18} />
                                                </button>
                                            ) : (
                                                <div style={{ padding: '4px 10px', borderRadius: '12px', background: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 700 }}>APPROVED</div>
                                            )}
                                            <button 
                                              onClick={() => handleDelete(review.id)}
                                              className="action-btn delete" title="Delete Review"
                                              style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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

export default ReviewsPage;
