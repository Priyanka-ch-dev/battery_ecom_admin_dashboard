import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Store, Mail, Phone, MapPin, 
    Shield, CreditCard, FileText, ExternalLink, 
    Loader2, AlertCircle, Building2, User 
} from 'lucide-react';
import api from '../services/api';

const SellerProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [seller, setSeller] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSellerDetail = async () => {
            try {
                setLoading(true);
                const res = await api.get(`sellers/profiles/${id}/`);
                setSeller(res.data);
                fetchSellerOrders();
            } catch (err) {
                console.error('Failed to fetch seller detail:', err);
                setError('Could not load seller profile.');
            } finally {
                setLoading(false);
            }
        };

        const fetchSellerOrders = async () => {
            try {
                setOrdersLoading(true);
                const res = await api.get(`sellers/profiles/${id}/orders/`);
                setOrders(res.data.results || res.data);
            } catch (err) {
                console.error('Failed to fetch seller orders:', err);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchSellerDetail();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={40} color="var(--purple-main)" />
        </div>
    );

    if (error || !seller) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
            <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
            <p>{error || 'Seller not found.'}</p>
            <button onClick={() => navigate('/sellers')} className="btn-purple" style={{ marginTop: '1rem' }}>Back to Sellers</button>
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <button 
                    onClick={() => navigate('/sellers')}
                    style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex' }}
                >
                    <ChevronLeft size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(111, 66, 193, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-main)' }}>
                        <Store size={32} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{seller.business_name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--purple-main)' }}>Seller ID: #{seller.id}</span>
                            <span>•</span>
                            <span style={{ 
                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                                background: seller.status === 'APPROVED' ? '#ecfdf5' : (seller.status === 'PENDING' && seller.has_been_approved ? '#fef3c7' : '#fffbeb'),
                                color: seller.status === 'APPROVED' ? '#059669' : (seller.status === 'PENDING' && seller.has_been_approved ? '#d97706' : '#d97706')
                            }}>
                                {seller.status === 'PENDING' && seller.has_been_approved ? 'RE-VERIFICATION PENDING' : seller.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Left Column: Basic Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass" style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User size={20} color="var(--purple-main)" /> Personal Details
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <InfoItem icon={User} label="Full Name" value={seller.seller_name} />
                            <InfoItem icon={Mail} label="Email Address" value={seller.email} />
                            <InfoItem icon={Phone} label="Phone Number" value={seller.user?.phone_number || 'N/A'} />
                            <InfoItem icon={MapPin} label="Business Address" value={seller.business_address || 'N/A'} />
                        </div>
                    </div>

                    <div className="glass" style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CreditCard size={20} color="#059669" /> Bank Information
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <InfoItem label="Bank Name" value={seller.bank_name} />
                            <InfoItem label="Account Name" value={seller.bank_account_name} />
                            <InfoItem label="Account Number" value={seller.bank_account_number} />
                            <InfoItem label="IFSC Code" value={seller.bank_ifsc} />
                            <InfoItem label="Account Type" value={seller.bank_account_type} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Business Docs & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass" style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Shield size={20} color="var(--purple-main)" /> Business Identification
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, background: '#f1f5f9', padding: '6px 16px', borderRadius: '20px' }}>
                                    Commission: {seller.commission}%
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                                    Fixed: ₹{seller.commission_amt}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 700 }}>GST NUMBER</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>{seller.gst_number || 'N/A'}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 700 }}>PAN NUMBER</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>{seller.pan_number || 'N/A'}</div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={18} /> Verified Documents
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            <DocPreview label="PAN Card Copy" url={seller.pan_card_copy} />
                            <DocPreview label="Aadhaar Copy" url={seller.aadhaar_card_copy} />
                            <DocPreview label="License Copy" url={seller.shop_license_copy} />
                            <DocPreview label="Bank Passbook" url={seller.bank_passbook_copy} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Section */}
            <div className="glass" style={{ background: '#fff', borderRadius: '24px', padding: '2rem', border: '1px solid var(--glass-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginTop: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={24} color="var(--purple-main)" /> Assigned Orders
                    </h3>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                        {orders.length} Orders Found
                    </div>
                </div>

                {ordersLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--purple-main)" />
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '20px', color: 'var(--text-dim)' }}>
                        <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p style={{ fontWeight: 600 }}>No orders have been assigned to this seller yet.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Order ID</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Customer</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Products</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Amount</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Payment</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Delivery Status</th>
                                    <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="order-row">
                                        <td style={{ padding: '1.25rem 1rem', fontWeight: 800, color: 'var(--purple-main)' }}>#{order.id}</td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <div style={{ fontWeight: 700 }}>{order.customer_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{order.user_email}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', maxWidth: '250px' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                                {order.items?.map((item, idx) => (
                                                    <span key={item.id}>
                                                        {item.product_detail?.name || 'Product'} (x{item.quantity})
                                                        {idx < order.items.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', fontWeight: 700 }}>₹{order.grand_total}</td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <span style={{ 
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800,
                                                background: ['SUCCESS', 'PAID'].includes(order.payment_status) ? '#ecfdf5' : '#fffbeb',
                                                color: ['SUCCESS', 'PAID'].includes(order.payment_status) ? '#059669' : '#d97706'
                                            }}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <span style={{ 
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800,
                                                background: order.status === 'DELIVERED' ? '#ecfdf5' : '#eff6ff',
                                                color: order.status === 'DELIVERED' ? '#059669' : '#3b82f6'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <style>{`
                    .order-row:hover { background: #f8fafc; cursor: pointer; }
                `}</style>
            </div>
        </div>
    );
};

const InfoItem = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {Icon && <Icon size={16} color="var(--text-dim)" style={{ marginTop: '2px' }} />}
        <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{value || 'Not Provided'}</div>
        </div>
    </div>
);

const DocPreview = ({ label, url }) => (
    <div 
        onClick={() => url && window.open(url, '_blank')}
        style={{ 
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px',
            cursor: url ? 'pointer' : 'default', opacity: url ? 1 : 0.5,
            transition: 'all 0.2s ease'
        }}
        className="doc-preview-card"
    >
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px' }}>{label}</div>
        <div style={{ height: '80px', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} color="#94a3b8" />
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple-main)', textAlign: 'center', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            {url ? <><ExternalLink size={12} /> View Doc</> : 'Missing'}
        </div>
        <style>{`.doc-preview-card:hover { border-color: var(--purple-main); transform: translateY(-2px); }`}</style>
    </div>
);

export default SellerProfilePage;
