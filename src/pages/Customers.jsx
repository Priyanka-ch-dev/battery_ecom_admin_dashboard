import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Loader2, X, Check, Trash2, Package, Search } from 'lucide-react';
import api from '../services/api';
import OrderDetailModal from '../components/OrderDetailModal';

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [customerReviews, setCustomerReviews] = useState([]);
    const [customerAddresses, setCustomerAddresses] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                console.log('Fetching all users from API: users/');
                const res = await api.get('users/');
                const data = res.data.results || res.data;
                const customersOnly = Array.isArray(data) ? data.filter(u => u.role === 'CUSTOMER') : [];
                setCustomers(customersOnly);
                console.log('Customers loaded:', customersOnly);
            } catch (err) {
                console.error('Failed to fetch customers:', err);
                setError('Failed to load customer list.');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const handleCustomerClick = async (customer) => {
        setSelectedCustomer(customer);
        setDetailsLoading(true);
        try {
            console.log(`--- Loading Data for Customer ID: ${customer.id} ---`);

            // 1. Fetch Orders specifically for this user
            console.log(`Fetching Orders for user ${customer.id}: API orders/?user=${customer.id}`);
            const ordersRes = await api.get(`orders/?user=${customer.id}`);
            const userOrders = ordersRes.data.results || ordersRes.data;
            setCustomerOrders(Array.isArray(userOrders) ? userOrders : []);
            console.log('Orders found:', userOrders);

            // 2. Fetch Reviews specifically for this user
            console.log(`Fetching Reviews for user ${customer.id}: API products/reviews/?user=${customer.id}`);
            const reviewsRes = await api.get(`products/reviews/?user=${customer.id}`);
            const userReviews = reviewsRes.data.results || reviewsRes.data;
            setCustomerReviews(Array.isArray(userReviews) ? userReviews : []);
            console.log('Reviews found:', userReviews);

            // 3. Fetch Addresses specifically for this user
            console.log(`Fetching Addresses for user ${customer.id}: API users/addresses/?user=${customer.id}`);
            const addressRes = await api.get(`users/addresses/?user=${customer.id}`);
            const userAddresses = addressRes.data.results || addressRes.data;
            setCustomerAddresses(Array.isArray(userAddresses) ? userAddresses : []);
            console.log('Addresses found:', userAddresses);

        } catch (err) {
            console.error('Error fetching customer details:', err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleReviewAction = async (reviewId, action) => {
        try {
            if (action === 'approve') {
                console.log(`Approving Review: API products/reviews/${reviewId}/approve/`);
                await api.post(`products/reviews/${reviewId}/approve/`);
            } else if (action === 'reject') {
                console.log(`Rejecting/Deleting Review: API products/reviews/${reviewId}/`);
                await api.delete(`products/reviews/${reviewId}/`);
            }

            // Re-fetch reviews for the specific customer to update UI
            const reviewsRes = await api.get(`products/reviews/?user=${selectedCustomer.id}`);
            const userReviews = reviewsRes.data.results || reviewsRes.data;
            setCustomerReviews(Array.isArray(userReviews) ? userReviews : []);
        } catch (err) {
            console.error(`Failed to ${action} review:`, err);
            alert(`Failed to ${action} review.`);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Customer Directory</h1>
                <p style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Monitor user growth and account activity.</p>
            </div>

            {/* Search Bar */}
            <div className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--glass-border)' }}>
                <Search size={18} color="var(--text-main)" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#ffffff', padding: '8px 15px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                    <input
                        type="text"
                        placeholder="Search customers by name, email or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--glass-border)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem' }}>Customer Profile</th>
                                <th style={{ padding: '1.25rem' }}>Contact Information</th>
                                <th style={{ padding: '1.25rem' }}>Account Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '5rem', textAlign: 'center' }}>
                                        <Loader2 className="animate-spin" size={32} color="var(--primary-glow)" />
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        No customers found in the system.
                                    </td>
                                </tr>
                            ) : customers.filter(c =>
                                (c.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (c.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (c.username || '').toLowerCase().includes(searchTerm.toLowerCase())
                            ).length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        No customers match your search.
                                    </td>
                                </tr>
                            ) : customers.filter(c =>
                                (c.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (c.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (c.username || '').toLowerCase().includes(searchTerm.toLowerCase())
                            ).map((customer) => (
                                <tr key={customer.id} onClick={() => handleCustomerClick(customer)} className="table-row" style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer' }}>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '12px',
                                                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 700, fontSize: '1rem', color: 'white'
                                            }}>
                                                {customer.first_name ? customer.first_name[0] : customer.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{customer.first_name} {customer.last_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>ID: #{customer.id} | @{customer.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700 }}>
                                                <Mail size={14} color="var(--red-main)" /> {customer.email}
                                            </div>
                                            {customer.phone_number && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                                    <Phone size={14} /> {customer.phone_number}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem',
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            color: '#22c55e',
                                            display: 'inline-block', fontWeight: 600
                                        }}>
                                            {customer.role}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Customer Details */}
            {selectedCustomer && (
                <div className="modal-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                }}>
                    <div className="glass" style={{
                        width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column',
                        borderRadius: '24px', maxHeight: '90vh', overflow: 'hidden', background: '#ffffff',
                        border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', background: '#f8fafc' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#000' }}>Customer Profile Explorer</h2>
                            <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {detailsLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                    <Loader2 className="animate-spin" size={32} color="var(--primary-glow)" />
                                </div>
                            ) : (
                                <>
                                    {/* BASIC INFO */}
                                    <div>
                                        <h3 style={{ borderBottom: '2px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--red-main)', fontWeight: 800 }}>Basic Information</h3>
                                        <p style={{ marginBottom: '8px' }}><strong style={{ color: '#000' }}>Name:</strong> {selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                                        <p style={{ marginBottom: '8px' }}><strong style={{ color: '#000' }}>Email:</strong> {selectedCustomer.email}</p>
                                        <p style={{ marginBottom: '8px' }}><strong style={{ color: '#000' }}>Phone:</strong> {selectedCustomer.phone_number || 'N/A'}</p>
                                        <div>
                                            <strong>Address: </strong>
                                            {customerAddresses.length > 0 ? (
                                                customerAddresses.map(a => <div key={a.id} style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{a.line1}, {a.city}, {a.state} - {a.zipcode} ({a.address_type})</div>)
                                            ) : <span style={{ color: 'var(--text-dim)' }}>No addresses on file for this customer.</span>}
                                        </div>
                                    </div>

                                    {/* ORDERS */}
                                    <div>
                                        <h3 style={{ borderBottom: '2px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--red-main)', fontWeight: 800 }}>Purchase History</h3>
                                        {customerOrders.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {customerOrders.map(order => (
                                                    <div 
                                                        key={order.id} 
                                                        onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order.id); }}
                                                        style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                                        className="hover-nav"
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                            <strong className="hover-text-red">Order #{order.id}</strong>
                                                            <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)' }}>{order.status}</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                                            Total: <strong style={{ color: '#000' }}>₹{order.grand_total}</strong> | Items: {order.items?.length || 0}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p style={{ color: 'var(--text-dim)' }}>No orders found for this customer.</p>}
                                    </div>

                                    {/* REVIEWS */}
                                    <div>
                                        <h3 style={{ borderBottom: '2px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--red-main)', fontWeight: 800 }}>Submitted Feedback</h3>
                                        {customerReviews.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {customerReviews.map(review => (
                                                    <div key={review.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                                                <strong style={{ color: 'var(--primary-glow)' }}>Product ID: {review.product}</strong>
                                                                <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>★ {review.rating}/5</span>
                                                                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '8px', background: review.is_approved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: review.is_approved ? '#4ade80' : '#f87171' }}>
                                                                    {review.is_approved ? 'Approved' : 'Pending'}
                                                                </span>
                                                            </div>
                                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>"{review.comment}"</p>
                                                        </div>

                                                        {/* ACTION BUTTONS */}
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            {!review.is_approved && (
                                                                <button onClick={() => handleReviewAction(review.id, 'approve')} style={{ padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <Check size={16} /> Approve
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleReviewAction(review.id, 'reject')} style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Trash2 size={16} /> Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p style={{ color: 'var(--text-dim)' }}>No reviews found for this customer.</p>}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrderId && (
                <OrderDetailModal 
                    orderId={selectedOrderId} 
                    onClose={() => setSelectedOrderId(null)} 
                />
            )}

            <style>
                {`
                    .table-row:hover { background: rgba(0,0,0,0.02); }
                `}
            </style>
        </div>
    );
};

export default CustomersPage;
