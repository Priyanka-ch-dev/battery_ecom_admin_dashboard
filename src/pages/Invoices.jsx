import React, { useState, useEffect } from 'react';
import {
    FileText, FileDown, Search, Loader2, AlertCircle, 
    User, Mail, Calendar, CreditCard, ShieldCheck, 
    ArrowRight, Filter, Download
} from 'lucide-react';
import api from '../services/api';
import OrderDetailModal from '../components/OrderDetailModal';

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            let url = 'invoices/';
            const params = new URLSearchParams();
            if (statusFilter) params.append('payment_status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await api.get(url);
            const data = res.data.results || res.data;
            setInvoices(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
            setError('Could not load invoice history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    const handleDownload = async (invoiceId) => {
        try {
            const response = await api.get(`invoices/${invoiceId}/download_pdf/`, {
                responseType: 'blob', // Important for handling binary data
            });
            
            // Create a blob from the response data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download PDF. Please check if you are logged in.');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInvoices();
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#000', letterSpacing: '-0.02em' }}>
                        Invoices & Billing
                    </h1>
                    <p style={{ color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
                        Manage seller-wise invoices and download professional PDFs.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <form onSubmit={handleSearch}>
                            <input 
                                type="text" 
                                placeholder="Search INV#, Email, Order..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '10px 16px 10px 40px',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.85rem',
                                    width: '280px',
                                    outline: 'none'
                                }}
                            />
                            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        </form>
                    </div>

                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.85rem',
                            background: '#fff',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                    </select>
                </div>
            </div>

            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Invoice Info</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Order & Seller</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Comm / Earnings</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '6rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <Loader2 className="animate-spin" size={40} color="var(--red-main)" />
                                            <span style={{ fontWeight: 600, color: '#64748b' }}>Generating audit trail...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '6rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
                                            <AlertCircle size={48} strokeWidth={1} />
                                            <span style={{ fontWeight: 600 }}>No invoices found matching your criteria</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : invoices.map((inv) => (
                                <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row-hover">
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--red-main)', fontSize: '0.95rem' }}>
                                            {inv.invoice_id}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} />
                                            {new Date(inv.invoice_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <button 
                                            onClick={() => setSelectedOrderId(inv.order)}
                                            style={{ 
                                                background: 'none', border: 'none', padding: 0,
                                                fontWeight: 700, color: '#000', fontSize: '0.85rem', 
                                                cursor: 'pointer', textAlign: 'left'
                                            }} 
                                            className="hover-text-red"
                                        >
                                            Order #{inv.order}
                                        </button>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                            <ShieldCheck size={12} /> {inv.seller_name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{inv.customer_name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Mail size={12} /> {inv.customer_email}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontWeight: 900, color: '#000', fontSize: '1rem' }}>₹{inv.total_amount}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Via {inv.payment_method}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>
                                            Comm: ₹{inv.commission_amount}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                                            Earn: ₹{inv.seller_amount}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ 
                                            display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', 
                                            background: inv.payment_status === 'PAID' ? '#dcfce7' : '#fef3c7', 
                                            color: inv.payment_status === 'PAID' ? '#166534' : '#92400e',
                                            fontWeight: 800, border: '1px solid currentColor'
                                        }}>
                                            {inv.payment_status}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => handleDownload(inv.id)}
                                            style={{ 
                                                background: '#000', color: '#fff', border: 'none', 
                                                padding: '8px 14px', borderRadius: '8px', fontSize: '0.75rem', 
                                                fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
                                                alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                                            }}
                                            className="hover-scale"
                                        >
                                            <FileDown size={14} />
                                            PDF
                                        </button>
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

export default InvoicesPage;
