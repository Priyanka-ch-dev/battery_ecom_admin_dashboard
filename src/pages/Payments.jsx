import React, { useState, useEffect } from 'react';
import { CreditCard, IndianRupee, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle, Hash, Smartphone } from 'lucide-react';
import api from '../services/api';

const PaymentsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const res = await api.get('payments/');
                const data = res.data.results || res.data;
                setTransactions(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch payments:', err);
                setError('Failed to load transaction history.');
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return '#22c55e';
            case 'PENDING': return '#eab308';
            case 'FAILED': return '#ef4444';
            case 'REFUNDED': return '#3b82f6';
            default: return 'var(--text-dim)';
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#000' }}>Financial Ledger</h1>
                <p style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Auditing all platform transactions and payment statuses.</p>
            </div>

            <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: '#fff', border: '1px solid var(--glass-border)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--glass-border)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem', fontWeight: 800, color: '#000' }}>Transaction Identifier</th>
                                <th style={{ padding: '1.25rem', fontWeight: 800, color: '#000' }}>Ref Order</th>
                                <th style={{ padding: '1.25rem', fontWeight: 800, color: '#000' }}>Channel</th>
                                <th style={{ padding: '1.25rem', fontWeight: 800, color: '#000' }}>Gross Amount</th>
                                <th style={{ padding: '1.25rem', fontWeight: 800, color: '#000' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                                        <Loader2 className="animate-spin" size={32} color="var(--primary-glow)" />
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        No financial records found.
                                    </td>
                                </tr>
                            ) : transactions.map((tx) => (
                                <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row">
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
                                            <Hash size={14} color="var(--red-main)" />
                                            {tx.transaction_id || `TXN-${tx.id}`}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                            {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'Processing Date Recorded'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            #ORD-{tx.order}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                                            {tx.payment_method === 'COD' ? <Smartphone size={16} color="var(--text-dim)" /> : <CreditCard size={16} color="var(--text-dim)" />}
                                            {tx.payment_method || 'DIGITAL_GW'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#000', fontSize: '1rem' }}>
                                            <IndianRupee size={16} color="var(--red-main)" />
                                            {tx.amount || '0.00'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ 
                                            display: 'flex', alignItems: 'center', gap: '6px', 
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', 
                                            background: `${getStatusColor(tx.status)}22`, 
                                            color: getStatusColor(tx.status),
                                            fontWeight: 700, border: `1px solid ${getStatusColor(tx.status)}44`
                                        }}>
                                            {tx.status}
                                            {tx.status === 'PAID' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
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

export default PaymentsPage;
