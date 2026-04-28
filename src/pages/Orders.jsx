import React, { useState, useEffect } from 'react';
import { Package, Truck, User, Calendar, CreditCard, Loader2, AlertCircle, ExternalLink, ChevronDown, Search } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import OrderDetailModal from '../components/OrderDetailModal';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const fetchData = async (search = '', status = '') => {
        try {
            setLoading(true);
            let query = `orders/`;
            const params = [];
            if (search) params.push(`search=${search}`);
            if (status) params.push(`status=${status}`);
            if (params.length > 0) query += `?${params.join('&')}`;

            const [ordersRes, sellersRes] = await Promise.all([
                api.get(query),
                api.get('sellers/?status=APPROVED')
            ]);
            
            setOrders(ordersRes.data.results || ordersRes.data);
            setSellers(sellersRes.data.results || sellersRes.data);
        } catch (err) {
            console.error('Failed to fetch orders or sellers:', err);
            setError('Failed to load order management data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData(searchTerm, statusFilter);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    const handleAssignSeller = async (orderId, sellerId) => {
        if (!sellerId) return;
        try {
            await api.post(`orders/${orderId}/assign_seller/`, { seller_id: sellerId });
            alert('Seller assigned successfully!');
            fetchData(); // Refresh list to see updated status/seller
        } catch (err) {
            console.error('Assignment failed:', err);
            alert('Failed to assign seller. Please check permissions.');
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.post(`orders/${orderId}/update_status/`, { status: newStatus });
            alert('Order status updated!');
            fetchData();
        } catch (err) {
            console.error('Status update failed:', err);
            alert('Failed to update order status.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return '#22c55e';
            case 'PENDING': return '#eab308';
            case 'CANCELLED': return '#ef4444';
            case 'ASSIGNED': return '#3b82f6';
            case 'SHIPPED': return '#8b5cf6';
            default: return 'var(--text-dim)';
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Order Management</h1>
                <p style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Monitor transactions and dispatch delivery personnel.</p>
            </div>

            {/* Filter Bar */}
            <div className="glass" style={{ padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', background: '#f1f5f9', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <Search size={18} color="var(--text-main)" />
                    <input 
                      type="text" 
                      placeholder="Search by ID or customer email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.9rem', fontWeight: 500 }}
                    />
                </div>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', outline: 'none', minWidth: '180px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
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
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--glass-border)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem' }}>Order Info</th>
                                <th style={{ padding: '1.25rem' }}>Customer</th>
                                <th style={{ padding: '1.25rem' }}>Amount</th>
                                <th style={{ padding: '1.25rem' }}>Status</th>
                                <th style={{ padding: '1.25rem' }}>Assign Seller (Delivery)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                                        <Loader2 className="animate-spin" size={32} color="var(--primary-glow)" />
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        No orders found in the system.
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order.id} 
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                    style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer' }} 
                                    className="table-row"
                                >
                                    <td style={{ padding: '1.25rem' }}>
                                        <div 
                                            style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}
                                            className="hover-text-red"
                                        >
                                            <Package size={16} color="var(--red-main)" />
                                            #ORD-{order.id}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                            {new Date(order.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{order.customer_name || 'Verified Buyer'}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>{order.shipping_address?.substring(0, 30)}...</div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ color: 'var(--red-main)', fontWeight: 800, fontSize: '1.1rem' }}>₹{order.grand_total}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>via {order.payment_method?.toUpperCase() || 'COD'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }} onClick={(e) => e.stopPropagation()}>
                                        <select 
                                            value={order.status}
                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                            style={{ 
                                                padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', 
                                                background: `${getStatusColor(order.status)}22`, 
                                                color: getStatusColor(order.status),
                                                fontWeight: 700,
                                                border: `1px solid ${getStatusColor(order.status)}44`,
                                                cursor: 'pointer',
                                                outline: 'none'
                                            }}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="CONFIRMED">CONFIRMED</option>
                                            <option value="ASSIGNED">ASSIGNED</option>
                                            <option value="SHIPPED">SHIPPED</option>
                                            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                            <option value="DELIVERED">DELIVERED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '1.25rem', minWidth: '240px' }} onClick={(e) => e.stopPropagation()}>
                                        {order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'ASSIGNED' ? (
                                            <div style={{ position: 'relative', width: '100%' }}>
                                                <select 
                                                  value={order.delivery_person || ''}
                                                  onChange={(e) => handleAssignSeller(order.id, e.target.value)}
                                                  style={{ 
                                                    width: '100%', 
                                                    padding: '10px 14px', 
                                                    background: 'rgba(255,255,255,0.08)', 
                                                    border: '1px solid var(--glass-border)', 
                                                    borderRadius: '12px',
                                                    color: 'black',
                                                    fontSize: '0.9rem',
                                                    appearance: 'none',
                                                    cursor: 'pointer',
                                                    outline: 'none',
                                                    transition: 'all 0.2s ease'
                                                  }}
                                                >
                                                    <option value="">Choose Seller...</option>
                                                    {sellers.map(seller => (
                                                        <option key={seller.id} value={seller.user}>
                                                            {seller.seller_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                                    <Truck size={14} color="var(--text-dim)" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} /> {order.delivery_person_name || 'N/A'}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrderId && (
                <OrderDetailModal 
                    orderId={selectedOrderId} 
                    onClose={() => setSelectedOrderId(null)} 
                />
            )}
        </div>
    );
};

export default OrdersPage;
