import React, { useState, useEffect } from 'react';
import {
    CreditCard, IndianRupee, ArrowUpRight, ArrowDownRight,
    Loader2, AlertCircle, Hash, Smartphone, User,
    Truck, CheckCircle2, MoreVertical, ExternalLink
} from 'lucide-react';
import api from '../services/api';
import OrderDetailModal from '../components/OrderDetailModal';

const PaymentsPage = () => {
    const [activeTab, setActiveTab] = useState('cod');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const fetchPayments = async (type) => {
        try {
            setLoading(true);
            const res = await api.get(`payments/?type=${type}`);
            const data = res.data.results || res.data;
            setTransactions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch payments:', err);
            setError('Failed to load transaction history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments(activeTab);
    }, [activeTab]);

    const updateStatus = async (orderId, type, statusVal) => {
        try {
            setProcessingId(`${orderId}-${type}`);
            await api.patch(`orders/${orderId}/update_payment_status/`, { 
                update_type: type, 
                status: statusVal 
            });
            fetchPayments(activeTab);
        } catch (err) {
            console.error('Update failed:', err);
            alert('Status update failed.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSettleSeller = async (sellerId, orderId) => {
        if (!sellerId) return alert('No seller linked to this order.');
        try {
            setProcessingId(`${orderId}-settle`);
            await api.post('settlements/', { 
                seller: sellerId,
                transactions: [orderId] 
            });
            fetchPayments(activeTab);
            alert('Settlement processed successfully!');
        } catch (err) {
            console.error('Settlement failed:', err);
            const msg = err.response?.data?.detail || err.response?.data?.[0] || 'Settlement failed.';
            alert(msg);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusColor = (status, type) => {
        if (type === 'customer') {
            switch (status) {
                case 'PAID': return '#22c55e';
                case 'COLLECTED': return '#3b82f6';
                case 'PENDING': return '#eab308';
                default: return '#64748b';
            }
        } else {
            switch (status) {
                case 'VERIFIED': return '#10b981';
                case 'SUBMITTED': return '#8b5cf6';
                case 'PENDING': return '#f59e0b';
                default: return '#64748b';
            }
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                border: 'none',
                background: activeTab === id ? '#fff' : 'transparent',
                color: activeTab === id ? '#000' : '#64748b',
                fontWeight: 700,
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderBottom: activeTab === id ? '3px solid var(--red-main)' : '3px solid transparent',
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#000', letterSpacing: '-0.02em' }}>
                        Dual-Track Payment Audit
                    </h1>
                    <p style={{ color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
                        Independently verify customer collection and delivery person submission.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <TabButton id="cod" label="Cash on Delivery" icon={Smartphone} />
                <TabButton id="online" label="Online Payments" icon={CreditCard} />
            </div>

            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Order ID</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Delivery Person</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Method</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Transaction Details</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Delivery Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Seller/Delivery Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" style={{ padding: '6rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <Loader2 className="animate-spin" size={40} color="var(--red-main)" />
                                            <span style={{ fontWeight: 600, color: '#64748b' }}>Refreshing ledger...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ padding: '6rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
                                            <AlertCircle size={48} strokeWidth={1} />
                                            <span style={{ fontWeight: 600 }}>No records found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions?.map((tx) => (
                                <tr key={tx?.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row-hover">
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <button 
                                            onClick={() => setSelectedOrderId(tx?.order)}
                                            style={{ 
                                                background: 'none', border: 'none', padding: 0,
                                                fontWeight: 800, color: '#000', fontSize: '0.95rem', 
                                                cursor: 'pointer', textAlign: 'left', display: 'block'
                                            }} 
                                            className="hover-text-red"
                                        >
                                            #ORD-{tx?.order || 'N/A'}
                                        </button>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{tx?.created_at ? new Date(tx.created_at).toLocaleDateString() : 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div 
                                            onClick={() => setSelectedOrderId(tx?.order)}
                                            style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                                            className="hover-text-red"
                                        >
                                            {tx?.customer_email || 'Anonymous'}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ID: {tx?.customer_id}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            <Truck size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                            {tx?.delivery_person_name || 'Unassigned'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: 900, color: '#000' }}>₹{tx?.amount || 0}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ 
                                            fontSize: '0.75rem', fontWeight: 700, color: tx?.method === 'COD' ? '#D97706' : '#2563EB',
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}>
                                            {tx?.method === 'COD' ? <Smartphone size={14} /> : <CreditCard size={14} />}
                                            {tx?.payment_method_display || tx?.method}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.5 }}>
                                            {tx?.razorpay_order_id && <div><span style={{ fontWeight: 700 }}>Order:</span> {tx.razorpay_order_id}</div>}
                                            {tx?.razorpay_payment_id && <div><span style={{ fontWeight: 700 }}>Payment:</span> {tx.razorpay_payment_id}</div>}
                                            {tx?.transaction_id && <div><span style={{ fontWeight: 700 }}>Txn ID:</span> {tx.transaction_id}</div>}
                                            {!tx?.razorpay_order_id && !tx?.transaction_id && <span>-</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', 
                                            background: tx?.customer_payment_status === 'SUCCESS' || tx?.customer_payment_status === 'PAID' ? '#dcfce7' : 
                                                        tx?.customer_payment_status === 'FAILED' ? '#fee2e2' : '#fef3c7', 
                                            color: tx?.customer_payment_status === 'SUCCESS' || tx?.customer_payment_status === 'PAID' ? '#166534' : 
                                                   tx?.customer_payment_status === 'FAILED' ? '#991b1b' : '#92400e',
                                            fontWeight: 800, border: '1px solid currentColor'
                                        }}>
                                            {tx?.customer_payment_status || 'PENDING'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', 
                                            background: tx?.delivery_payment_status === 'VERIFIED' ? '#dcfce7' : '#f1f5f9', 
                                            color: tx?.delivery_payment_status === 'VERIFIED' ? '#166534' : '#475569',
                                            fontWeight: 800, border: '1px solid currentColor'
                                        }}>
                                            {tx?.delivery_payment_status || 'PENDING'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {tx?.customer_payment_status === 'PENDING' && (
                                                <button 
                                                    onClick={() => updateStatus(tx?.order, 'customer', 'COLLECTED')}
                                                    disabled={processingId === `${tx?.order}-customer`}
                                                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', minWidth: '110px' }}
                                                >
                                                    {processingId === `${tx?.order}-customer` ? '...' : 'Mark Collected'}
                                                </button>
                                            )}
                                            {(tx?.customer_payment_status === 'COLLECTED' || tx?.customer_payment_status === 'PENDING') && tx?.method === 'COD' && (
                                                <button 
                                                    onClick={() => updateStatus(tx?.order, 'customer', 'SUCCESS')}
                                                    disabled={processingId === `${tx?.order}-customer`}
                                                    style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', minWidth: '110px' }}
                                                >
                                                    {processingId === `${tx?.order}-customer` ? '...' : 'Mark Success'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                                            {tx?.delivery_payment_status === 'PENDING' && tx?.method === 'COD' && (
                                                <button 
                                                    onClick={() => updateStatus(tx?.order, 'delivery', 'SUBMITTED')}
                                                    disabled={processingId === `${tx?.order}-delivery`}
                                                    style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', minWidth: '110px' }}
                                                >
                                                    {processingId === `${tx?.order}-delivery` ? '...' : 'Mark Submitted'}
                                                </button>
                                            )}
                                            {tx?.delivery_payment_status === 'SUBMITTED' && (
                                                <button 
                                                    onClick={() => updateStatus(tx?.order, 'delivery', 'VERIFIED')}
                                                    disabled={processingId === `${tx?.order}-delivery`}
                                                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', minWidth: '110px' }}
                                                >
                                                    {processingId === `${tx?.order}-delivery` ? '...' : 'Verify Payment'}
                                                </button>
                                            )}
                                            {tx?.delivery_payment_status === 'VERIFIED' && tx?.seller_settlement_status === 'PENDING' && (
                                                <button 
                                                    onClick={() => handleSettleSeller(tx?.seller_id, tx?.order)}
                                                    disabled={processingId === `${tx?.order}-settle`}
                                                    style={{ background: '#000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', minWidth: '110px' }}
                                                >
                                                    {processingId === `${tx?.order}-settle` ? '...' : 'Pay Seller'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrderId && (
                <OrderDetailModal 
                    orderId={selectedOrderId} 
                    onClose={() => setSelectedOrderId(null)} 
                />
            )}
        </div>
    );
};

export default PaymentsPage;
