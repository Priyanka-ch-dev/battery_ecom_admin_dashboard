import React, { useState, useEffect } from 'react';
import {
    X, User, Mail, Phone, MapPin, Package,
    CreditCard, Truck, CheckCircle2, AlertCircle,
    IndianRupee, Calendar, Clock, Hash, Store, RefreshCcw
} from 'lucide-react';
import api from '../services/api';

const OrderDetailModal = ({ orderId, onClose }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const res = await api.get(`orders/${orderId}/`);
                setOrder(res.data);
            } catch (err) {
                console.error('Failed to fetch order details:', err);
                setError('Failed to load order details.');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrderDetails();
    }, [orderId]);

    if (!orderId) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px'
        }}>
            <div style={{
                background: '#fff', width: '100%', maxWidth: '900px',
                maxHeight: '90vh', borderRadius: '24px', overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative', animation: 'modalFadeIn 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 32px', borderBottom: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, background: '#fff', zIndex: 10
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#000', margin: 0 }}>
                            Order Details #{orderId}
                        </h2>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            marginTop: '8px', padding: '4px 12px', borderRadius: '20px',
                            background: '#f1f5f9', color: '#64748b', fontSize: '0.75rem', fontWeight: 700
                        }}>
                            <CheckCircle2 size={12} /> {order?.status_display || 'Loading...'}
                        </div>
                        {order?.is_exchange && (
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                marginLeft: '8px', padding: '4px 12px', borderRadius: '20px',
                                background: '#3b82f615', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 700
                            }}>
                                <RefreshCcw size={12} /> EXCHANGE ORDER
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} style={{
                        background: '#f1f5f9', border: 'none', width: '40px', height: '40px',
                        borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#64748b', transition: 'all 0.2s'
                    }} className="hover-scale">
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '100px', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--red-main)" />
                        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 600 }}>Gathering intelligence...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '100px', textAlign: 'center', color: '#ef4444' }}>
                        <AlertCircle size={48} style={{ margin: '0 auto' }} />
                        <p style={{ marginTop: '16px', fontWeight: 600 }}>{error}</p>
                    </div>
                ) : (
                    <div style={{ padding: '32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            {/* Customer Section */}
                            <section>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={16} /> Customer Intelligence
                                </h3>
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#000', marginBottom: '12px' }}>
                                        {order?.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : 'Anonymous'}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem' }}>
                                            <Mail size={14} /> {order?.customer?.email || 'N/A'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.9rem' }}>
                                            <Phone size={14} /> {order?.customer?.phone_number || 'N/A'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#475569', fontSize: '0.9rem', marginTop: '4px' }}>
                                            <MapPin size={14} style={{ marginTop: '3px' }} />
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#94a3b8' }}>SHIPPING ADDRESS</div>
                                                {order?.shipping_address || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Payment Section */}
                            <section>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CreditCard size={16} /> Payment Status
                                </h3>
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>CUSTOMER PAYMENT</span>
                                            <span style={{ 
                                                fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: '12px',
                                                background: (order?.customer_payment_status === 'PAID') ? '#22c55e15' : '#eab30815',
                                                color: (order?.customer_payment_status === 'PAID') ? '#22c55e' : '#eab308',
                                                border: `1px solid ${(order?.customer_payment_status === 'PAID') ? '#22c55e30' : '#eab30830'}`
                                            }}>
                                                {order?.customer_payment_status || 'PENDING'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>DELIVERY SUBMISSION</span>
                                            <span style={{ 
                                                fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: '12px',
                                                background: (order?.delivery_payment_status === 'VERIFIED') ? '#10b98115' : '#f59e0b15',
                                                color: (order?.delivery_payment_status === 'VERIFIED') ? '#10b981' : '#f59e0b',
                                                border: `1px solid ${(order?.delivery_payment_status === 'VERIFIED') ? '#10b98130' : '#f59e0b30'}`
                                            }}>
                                                {order?.delivery_payment_status || 'PENDING'}
                                            </span>
                                        </div>
                                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '4px' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>METHOD</div>
                                            <div style={{ fontWeight: 800, color: '#000' }}>{order?.payment_details?.method_display || 'N/A'}</div>
                                        </div>
                                    </div>
                                    {order.payment_details?.razorpay_payment_id && (
                                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '12px' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>GATEWAY TRANSACTION ID</div>
                                            <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#475569' }}>
                                                {order.payment_details.razorpay_payment_id}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Order Items */}
                        <section style={{ marginTop: '32px' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Package size={16} /> Cart Overview
                            </h3>
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <tr>
                                            <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b' }}>PRODUCT</th>
                                            <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>QTY</th>
                                            <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>PRICE</th>
                                            <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order?.items?.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: idx === (order?.items?.length || 0) - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <div style={{ fontWeight: 700, color: '#000' }}>{item.product_name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Store size={10} /> {item.seller_name}
                                                    </div>
                                                    {item.is_exchange && (
                                                        <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <RefreshCcw size={10} /> Exchange Applied (-₹{item.exchange_discount})
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                                                <td style={{ padding: '16px 20px', textAlign: 'right', color: '#64748b' }}>₹{item.price}</td>
                                                <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 800, color: '#000' }}>
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                                        <tr>
                                            <td colSpan="3" style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 700, color: '#64748b' }}>Grand Total</td>
                                            <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 900, color: 'var(--red-main)', fontSize: '1.25rem' }}>
                                                ₹{order?.grand_total || '0'}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </section>

                        {/* Seller/Earning Section */}
                        <section style={{ marginTop: '32px' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Truck size={16} /> Fulfillment & Earnings
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {order?.seller_earnings?.map((earning, idx) => (
                                    <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                                        <div style={{ fontWeight: 800, color: '#000', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                            {earning.seller_name}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#64748b' }}>Item Total:</span>
                                                <span style={{ fontWeight: 600 }}>₹{earning.gross}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#64748b' }}>Commission:</span>
                                                <span style={{ color: '#ef4444' }}>-₹{earning.commission.toFixed(2)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: '#64748b' }}>Delivery Fee:</span>
                                                <span style={{ color: '#ef4444' }}>-₹{earning.delivery_charge}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
                                                <div>
                                                    <span style={{ fontWeight: 700, color: '#000' }}>Net Earning:</span>
                                                    <span style={{ fontWeight: 900, color: '#22c55e', marginLeft: '8px' }}>₹{earning.net_earning.toFixed(2)}</span>
                                                </div>
                                                <span style={{ 
                                                    fontSize: '0.65rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px',
                                                    background: earning.settlement_status === 'SETTLED' ? '#10b98115' : '#eab30815',
                                                    color: earning.settlement_status === 'SETTLED' ? '#10b981' : '#eab308',
                                                    border: `1px solid ${earning.settlement_status === 'SETTLED' ? '#10b98120' : '#eab30820'}`
                                                }}>
                                                    {earning.settlement_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Delivery Section */}
                        <section style={{ marginTop: '32px' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={16} /> Delivery Schedule
                            </h3>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '40px' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>DATE</div>
                                    <div style={{ fontWeight: 800, color: '#000' }}>{order?.delivery_date || 'Not Scheduled'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>TIME SLOT</div>
                                    <div style={{ fontWeight: 800, color: '#000' }}>{order?.delivery_time || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>ASSIGNED DELIVERY</div>
                                    <div style={{ fontWeight: 800, color: '#000' }}>{order?.delivery_person || 'Waiting for assignment'}</div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailModal;

const Loader2 = ({ className, size, color }) => (
    <div className={className} style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    </div>
);
