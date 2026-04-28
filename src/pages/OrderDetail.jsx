import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Package, User, MapPin, CreditCard, 
    Truck, Clock, AlertCircle, Loader2, IndianRupee 
} from 'lucide-react';
import api from '../services/api';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);
                const res = await api.get(`orders/${id}/`);
                setOrder(res.data);
            } catch (err) {
                console.error('Failed to fetch order detail:', err);
                setError('Could not load order details.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={40} color="var(--red-main)" />
        </div>
    );

    if (error || !order) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
            <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
            <p>{error || 'Order not found.'}</p>
            <button onClick={() => navigate('/orders')} className="btn-purple" style={{ marginTop: '1rem' }}>Back to Orders</button>
        </div>
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'DELIVERED': return { bg: '#ecfdf5', color: '#059669' };
            case 'CANCELLED': return { bg: '#fff1f2', color: '#e11d48' };
            case 'PENDING': return { bg: '#fffbeb', color: '#d97706' };
            default: return { bg: '#f1f5f9', color: '#475569' };
        }
    };

    const statusStyle = getStatusStyle(order.status);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => navigate('/orders')}
                    style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex' }}
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Order #ORD-{order.id}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                        <Clock size={14} /> Placed on {new Date(order.created_at || Date.now()).toLocaleString()}
                        <span style={{ 
                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                            background: statusStyle.bg, color: statusStyle.color, marginLeft: '8px'
                        }}>
                            {order.status_display || order.status}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column: Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass" style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Package size={20} color="var(--red-main)" /> Order Items
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {order.items?.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: idx !== order.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                                        {item.product_image ? (
                                            <img src={item.product_image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                <Package size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontWeight: 800, fontSize: '1rem', color: '#000' }}>{item.product_name}</h4>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                            Seller: <span style={{ fontWeight: 700, color: '#000' }}>{item.seller_name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
                                            <div style={{ fontSize: '0.9rem' }}>
                                                <span style={{ fontWeight: 800, color: '#000' }}>₹{parseFloat(item.price).toLocaleString()}</span>
                                                <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>x {item.quantity}</span>
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--red-main)' }}>
                                                ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <IndianRupee size={20} color="var(--red-main)" /> Payment Summary
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Subtotal</span>
                                <span style={{ fontWeight: 600 }}>₹{parseFloat(order.subtotal || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Tax (GST 18%)</span>
                                <span style={{ fontWeight: 600 }}>₹{parseFloat(order.tax || 0).toLocaleString()}</span>
                            </div>
                            {parseFloat(order.discount || 0) > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#059669' }}>
                                    <span>Discount</span>
                                    <span style={{ fontWeight: 600 }}>- ₹{parseFloat(order.discount).toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                <span style={{ color: 'var(--text-dim)' }}>Shipping Fee</span>
                                <span style={{ fontWeight: 600 }}>₹{parseFloat(order.shipping_fee || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ height: '1px', background: '#f1f5f9', margin: '8px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                                <span style={{ fontWeight: 800 }}>Total Amount</span>
                                <span style={{ fontWeight: 800, color: 'var(--red-main)' }}>₹{parseFloat(order.grand_total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Shipping */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass" style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User size={18} color="var(--red-main)" /> Customer Details
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--red-main)' }}>
                                {order.customer?.first_name?.[0] || 'U'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{order.customer?.first_name} {order.customer?.last_name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{order.customer?.email}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <MapPin size={14} /> Shipping Address
                            </div>
                            <div style={{ color: '#475569', lineHeight: '1.5' }}>{order.shipping_address}</div>
                        </div>
                    </div>

                    <div className="glass" style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CreditCard size={18} color="var(--red-main)" /> Payment Information
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Method</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#000' }}>{order.payment_details?.method_display || 'COD'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Status</span>
                            <span style={{ 
                                fontSize: '0.8rem', fontWeight: 800, 
                                color: order.payment_details?.status === 'PAID' ? '#059669' : '#d97706' 
                            }}>
                                {order.payment_details?.status_display || 'PENDING'}
                            </span>
                        </div>
                    </div>

                    <div className="glass" style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Truck size={18} color="var(--red-main)" /> Delivery Assignment
                        </h3>
                        {order.delivery_person ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Truck size={18} color="#2563eb" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{order.delivery_person_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Assigned Personnel</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem', border: '2px dashed #e2e8f0', borderRadius: '12px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                No seller assigned yet.
                                <div onClick={() => navigate('/orders')} style={{ color: 'var(--red-main)', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}>Go to Orders to Assign</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
