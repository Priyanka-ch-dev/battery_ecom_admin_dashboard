import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Package, User, MapPin, CreditCard, 
    Truck, Clock, AlertCircle, Loader2, IndianRupee, Shield, Camera
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
        const config = {
            'ASSIGNED': { bg: '#EFF6FF', color: '#2563EB', label: 'Order Assigned' },
            'SCHEDULED': { bg: '#F5F3FF', color: '#7C3AED', label: 'Scheduled' },
            'INSTALLATION_STARTED': { bg: '#ECFDF5', color: '#10B981', label: 'Started' },
            'IN_PROGRESS': { bg: '#FEF3C7', color: '#D97706', label: 'In Progress' },
            'CONTINUED_TOMORROW': { bg: '#FFF5F5', color: '#E53E3E', label: 'Paused - Continued Tomorrow' },
            'RESUMED': { bg: '#EBF8FF', color: '#3182CE', label: 'Resumed' },
            'COMPLETED': { bg: '#ECFDF5', color: '#10B981', label: 'Completed' },
            'AWAITING_CONFIRMATION': { bg: '#FEF3C7', color: '#D97706', label: 'Awaiting Customer' },
            'VERIFIED': { bg: '#ECFDF5', color: '#10B981', label: 'Verified' },
            'CLOSED': { bg: '#F3F4F6', color: '#6B7280', label: 'Closed Successfully' },
            
            // Legacy support
            'PENDING': { bg: '#FFFBEB', color: '#D97706', label: 'Pending' },
            'CONFIRMED': { bg: '#EFF6FF', color: '#2563EB', label: 'Confirmed' },
            'SHIPPED': { bg: '#F5F3FF', color: '#7C3AED', label: 'Shipped' },
            'OUT_FOR_DELIVERY': { bg: '#FEF3C7', color: '#D97706', label: 'Out for Delivery' },
            'DELIVERED': { bg: '#ECFDF5', color: '#10B981', label: 'Delivered' },
        };
        return config[status] || { bg: '#f1f5f9', color: '#475569' };
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

                    {/* Live Installation Progress & Admin Control Panel */}
                    <div className="glass" style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                                <Shield size={20} color="var(--purple-main)" /> Installation Control Panel & History
                            </h3>
                            {/* Admin Action Buttons */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {(order.status === 'COMPLETED' || order.status === 'AWAITING_CONFIRMATION') && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await api.patch(`orders/${order.id}/`, { status: 'VERIFIED' });
                                                setOrder(res.data);
                                                alert('Installation successfully verified!');
                                            } catch (err) {
                                                alert(err.response?.data?.error || 'Failed to verify installation.');
                                            }
                                        }}
                                        className="btn-purple"
                                        style={{ background: '#10B981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                                    >
                                        Verify Installation
                                    </button>
                                )}
                                {order.status === 'VERIFIED' && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await api.patch(`orders/${order.id}/`, { status: 'CLOSED' });
                                                setOrder(res.data);
                                                alert('Order closed successfully!');
                                            } catch (err) {
                                                alert(err.response?.data?.error || 'Failed to close order.');
                                            }
                                        }}
                                        className="btn-purple"
                                        style={{ background: '#4F46E5', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                                    >
                                        Close Order Successfully
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Before/After Evidence Photos */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '2rem' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '10px' }}>Before Installation Setup</div>
                                {order.before_image ? (
                                    <a href={order.before_image} target="_blank" rel="noreferrer">
                                        <img src={order.before_image} alt="Setup Before" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </a>
                                ) : (
                                    <div style={{ height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                        <Camera size={32} style={{ marginBottom: '8px' }} />
                                        <span>No Before Photo Uploaded</span>
                                    </div>
                                )}
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '10px' }}>After Completed Work</div>
                                {order.after_image ? (
                                    <a href={order.after_image} target="_blank" rel="noreferrer">
                                        <img src={order.after_image} alt="Work After" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </a>
                                ) : (
                                    <div style={{ height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                        <Camera size={32} style={{ marginBottom: '8px' }} />
                                        <span>No After Photo Uploaded</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Live Tracking Timeline */}
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Tracking History Timeline</div>
                            {(!order.tracking_history || order.tracking_history.length === 0) ? (
                                <div style={{ color: 'var(--text-dim)', fontSize: '13px', fontStyle: 'italic', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                    No timeline progress tracked yet.
                                </div>
                            ) : (
                                <div style={{ position: 'relative', borderLeft: '2px solid #e2e8f0', marginLeft: '12px', paddingLeft: '20px', paddingTop: '8px' }}>
                                    {order.tracking_history.map((log, index) => {
                                        const getStatusColor = (status) => {
                                            const config = {
                                                'ASSIGNED': { color: '#2563EB', label: 'Order Assigned' },
                                                'SCHEDULED': { color: '#7C3AED', label: 'Scheduled' },
                                                'INSTALLATION_STARTED': { color: '#10B981', label: 'Started' },
                                                'IN_PROGRESS': { color: '#D97706', label: 'In Progress' },
                                                'CONTINUED_TOMORROW': { color: '#E53E3E', label: 'Paused - Continued Tomorrow' },
                                                'RESUMED': { color: '#3182CE', label: 'Resumed' },
                                                'COMPLETED': { color: '#10B981', label: 'Completed' },
                                                'AWAITING_CONFIRMATION': { color: '#D97706', label: 'Awaiting Customer' },
                                                'VERIFIED': { color: '#10B981', label: 'Verified' },
                                                'CLOSED': { color: '#6B7280', label: 'Closed Successfully' }
                                            };
                                            return config[status] || { color: '#94A3B8', label: status };
                                        };
                                        const c = getStatusColor(log.status);
                                        return (
                                            <div key={log.id || index} style={{ position: 'relative', marginBottom: '24px' }}>
                                                {/* Timeline Node Pin */}
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '-29px',
                                                    top: '4px',
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '50%',
                                                    background: '#fff',
                                                    border: `3px solid ${c.color}`,
                                                    boxShadow: '0 0 0 4px #fff'
                                                }}></div>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                                                        <span style={{ fontWeight: 800, fontSize: '13px', color: '#111827' }}>
                                                            {log.status_display || c.label}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {log.notes && (
                                                        <p style={{
                                                            fontSize: '12px',
                                                            color: 'var(--text-dim)',
                                                            marginTop: '6px',
                                                            background: '#f8fafc',
                                                            padding: '8px 12px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e2e8f0',
                                                            lineHeight: 1.4
                                                        }}>
                                                            {log.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* {order.seller_earnings && order.seller_earnings.length > 0 && (
                        <div className="glass" style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid var(--glass-border)', marginTop: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Shield size={20} color="var(--purple-main)" /> Seller Earnings Breakdown
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {order.seller_earnings.map((earning, idx) => (
                                    <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px' }}>{earning.seller_name}</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>GROSS</div>
                                                <div style={{ fontWeight: 800 }}>₹{parseFloat(earning.gross).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>COMMISSION</div>
                                                <div style={{ fontWeight: 800, color: '#e11d48' }}>- ₹{parseFloat(earning.commission).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>DELIVERY</div>
                                                <div style={{ fontWeight: 800, color: '#059669' }}>+ ₹{parseFloat(earning.delivery).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>NET PAYOUT</div>
                                                <div style={{ fontWeight: 800, color: 'var(--purple-main)' }}>₹{parseFloat(earning.net).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Settlement Status:</span>
                                            <span style={{ 
                                                fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                                                background: earning.settlement_status === 'SETTLED' ? '#ecfdf5' : '#fffbeb',
                                                color: earning.settlement_status === 'SETTLED' ? '#059669' : '#d97706'
                                            }}>
                                                {earning.settlement_status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )} */}
                </div>
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
