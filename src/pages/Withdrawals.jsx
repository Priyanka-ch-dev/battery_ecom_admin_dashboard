import React, { useState, useEffect } from 'react';
import { IndianRupee, Clock, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../services/api';

const WithdrawalsPage = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, PAID, REJECTED
    
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [paymentData, setPaymentData] = useState({ payment_method: 'BANK_TRANSFER', transaction_id: '' });
    const [processing, setProcessing] = useState(false);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await api.get(`sellers/withdrawals/?status=${activeTab}`);
            setWithdrawals(res.data.results || res.data);
        } catch (err) {
            console.error('Failed to fetch withdrawals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [activeTab]);

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this withdrawal request?")) return;
        try {
            await api.patch(`sellers/withdrawals/${id}/reject/`);
            fetchWithdrawals();
        } catch (err) {
            alert('Failed to reject request: ' + (err.response?.data?.error || err.message));
        }
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.patch(`sellers/withdrawals/${selectedRequest.id}/mark_paid/`, paymentData);
            setShowModal(false);
            setPaymentData({ payment_method: 'BANK_TRANSFER', transaction_id: '' });
            fetchWithdrawals();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to record payment';
            alert('Error: ' + errorMsg);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#000', letterSpacing: '-0.02em' }}>Seller Settlements</h1>
                    <p style={{ color: '#64748b', fontWeight: 500, marginTop: '4px' }}>Review withdrawal requests and record online/offline payouts.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: '#f1f5f9', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                {['PENDING', 'PAID', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setActiveTab(status)}
                        style={{
                            padding: '8px 20px',
                            background: activeTab === status ? '#fff' : 'transparent',
                            color: activeTab === status ? '#000' : '#64748b',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: activeTab === status ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="glass" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>ID / Date</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Seller</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                            {activeTab === 'PAID' && <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment Info</th>}
                            {activeTab === 'PENDING' && <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '4rem', textAlign: 'center' }}>
                                    <Loader2 className="animate-spin" size={32} color="var(--red-main)" />
                                </td>
                            </tr>
                        ) : withdrawals.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>
                                    No {activeTab.toLowerCase()} requests found.
                                </td>
                            </tr>
                        ) : withdrawals.map((req) => (
                            <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row-hover">
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ fontWeight: 800 }}>#WTH-{req.id}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(req.requested_at).toLocaleDateString()}</div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#334155' }}>
                                    Seller ID: {req.seller}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: '#000', fontSize: '1.1rem' }}>
                                    ₹{req.amount}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        background: req.status === 'PENDING' ? '#FEF3C7' : req.status === 'PAID' ? '#D1FAE5' : '#FEE2E2',
                                        color: req.status === 'PENDING' ? '#D97706' : req.status === 'PAID' ? '#059669' : '#DC2626'
                                    }}>
                                        {req.status}
                                    </span>
                                </td>
                                {activeTab === 'PAID' && (
                                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: 700, color: '#0ea5e9' }}>{req.payment_method?.replace('_', ' ')}</div>
                                        {req.transaction_id && <div style={{ color: '#64748b' }}>Ref: {req.transaction_id}</div>}
                                    </td>
                                )}
                                {activeTab === 'PENDING' && (
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button 
                                                onClick={() => handleReject(req.id)}
                                                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #e2e8f0', color: '#dc2626', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                                Reject
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                                                style={{ padding: '6px 12px', background: 'linear-gradient(to right, #10b981, #059669)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle2 size={16} /> Pay
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payment Modal */}
            {showModal && selectedRequest && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
                }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Record Payment</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={24} color="#64748b" /></button>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Amount to Pay</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#000' }}>₹{selectedRequest.amount}</div>
                        </div>

                        <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Payment Method</label>
                                <select 
                                    value={paymentData.payment_method}
                                    onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 500, outline: 'none' }}
                                >
                                    <option value="BANK_TRANSFER">Bank Transfer (Online)</option>
                                    <option value="UPI">UPI (Online)</option>
                                    <option value="MANUAL_TRANSFER">Manual Bank Transfer (Offline)</option>
                                    <option value="CASH">Cash (Offline)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Transaction ID / Reference (Optional for Cash)</label>
                                <input 
                                    type="text"
                                    value={paymentData.transaction_id}
                                    onChange={(e) => setPaymentData({...paymentData, transaction_id: e.target.value})}
                                    placeholder="Enter reference number"
                                    required={paymentData.payment_method !== 'CASH'}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                                />
                            </div>

                            <div style={{ background: '#fffbeb', color: '#b45309', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '8px', marginTop: '10px' }}>
                                <AlertTriangle size={16} />
                                <span>Double-check transaction details. This action will deduct funds from the seller's available balance immediately.</span>
                            </div>

                            <button 
                                type="submit" 
                                disabled={processing}
                                style={{ 
                                    width: '100%', padding: '14px', background: 'var(--red-main)', color: '#fff', border: 'none', 
                                    borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: processing ? 'not-allowed' : 'pointer',
                                    marginTop: '1rem', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                                }}
                            >
                                {processing ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Payment & Mark Paid'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawalsPage;
