import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, Mail, Shield, Loader2, UserCheck, UserX, Search } from 'lucide-react';
import api from '../services/api';

const SellersPage = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        business_name: '',
        gst_number: '',
        commission_rate: '0.00',
        phone_number: ''
    });
    const [createLoading, setCreateLoading] = useState(false);

    const fetchSellers = async (search = '', status = '') => {
        try {
            setLoading(true);
            let url = 'sellers/';
            const params = [];
            if (search) params.push(`search=${search}`);
            if (status) params.push(`status=${status}`);
            if (params.length > 0) url += `?${params.join('&')}`;

            const res = await api.get(url);
            const data = res.data.results || res.data;
            setSellers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch sellers:', err);
            setError('Failed to load seller applications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSellers(searchTerm, statusFilter);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.patch(`sellers/${id}/`, { status: newStatus });
            fetchSellers(); // Refresh the list
        } catch (err) {
            console.error('Status update failed:', err);
            alert(`Failed to update seller status. Check API logs.`);
        }
    };

    const handleCreateSeller = async (e) => {
        e.preventDefault();
        try {
            setCreateLoading(true);
            await api.post('sellers/manually_create_seller/', formData);
            setShowModal(false);
            setFormData({
                username: '',
                email: '',
                password: '',
                business_name: '',
                gst_number: '',
                commission_rate: '0.00',
                phone_number: ''
            });
            fetchSellers();
        } catch (err) {
            console.error('Failed to create seller:', err);
            const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Creation failed';
            alert(`Registration Error: ${errorMsg}`);
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Seller Moderation</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Approve or verify multi-vendor partnership applications.</p>
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  style={{ 
                    background: 'var(--purple-main)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 24px', 
                    borderRadius: '12px', 
                    fontWeight: 600, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(111, 66, 193, 0.3)'
                  }}>
                    <Store size={20} /> Add Seller
                </button>
            </div>

            {/* Filter Bar */}
            <div className="glass" style={{ padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', background: 'var(--card-bg)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9', padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <Search size={18} color="var(--text-main)" />
                    <input 
                      type="text" 
                      placeholder="Search by business name or email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                    />
                </div>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: '#f1f5f9', fontSize: '0.9rem', color: 'var(--text-main)', outline: 'none', minWidth: '180px', fontWeight: 600 }}
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
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

            <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--glass-border)' }}>
                            <tr>
                                <th style={{ padding: '1.25rem' }}>Business Profile</th>
                                <th style={{ padding: '1.25rem' }}>GST/Tax ID</th>
                                <th style={{ padding: '1.25rem' }}>Commission</th>
                                <th style={{ padding: '1.25rem' }}>Status</th>
                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                                        <Loader2 className="animate-spin" size={32} color="var(--primary-glow)" />
                                    </td>
                                </tr>
                            ) : sellers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        No seller profiles found.
                                    </td>
                                </tr>
                            ) : sellers.map((seller) => (
                                <tr key={seller.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row">
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 0, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Store size={20} color="var(--primary-glow)" />
                                            </div>
                                             <div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{seller.business_name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, marginTop: '2px' }}>
                                                    {seller.name || 'Individual Seller'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#3b589b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                    <Mail size={12} /> {seller.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                        {seller.gst || 'Not Provided'}
                                    </td>
                                    <td style={{ padding: '1.25rem', fontWeight: 600 }}>
                                        {seller.commission}%
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        {((seller.status || '').toUpperCase() === "PENDING" || !seller.status) && (
                                            <span className="status pending">Pending</span>
                                        )}
                                        {seller.status?.toUpperCase() === "APPROVED" && (
                                            <span className="status approved">Approved</span>
                                        )}
                                        {seller.status?.toUpperCase() === "REJECTED" && (
                                            <span className="status rejected">Rejected</span>
                                        )}
                                    </td>
                                     <td className="actions" style={{ padding: '1.25rem', textAlign: 'right' }}>
                                         <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                             <button 
                                               className="approve-btn"
                                               onClick={() => handleStatusUpdate(seller.id, 'APPROVED')}>
                                                 Approve
                                             </button>
                                             <button 
                                               className="reject-btn"
                                               onClick={() => handleStatusUpdate(seller.id, 'REJECTED')}>
                                                 Reject
                                             </button>
                                         </div>
                                     </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Add Seller Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="glass" style={{
                        background: 'var(--card-bg)',
                        padding: '2rem',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Quick Seller Registration</h2>
                            <button 
                              onClick={() => setShowModal(false)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSeller} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Business Name</label>
                                <input 
                                  required
                                  className="form-input"
                                  value={formData.business_name}
                                  onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                                  placeholder="e.g. Acme Battery Solutions"
                                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: '#000000', fontWeight: 500 }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Username (for Login)</label>
                                <input 
                                  required
                                  className="form-input"
                                  value={formData.username}
                                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                                  placeholder="johndoe"
                                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: '#000000', fontWeight: 500 }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
                                <input 
                                  required
                                  type="email"
                                  className="form-input"
                                  value={formData.email}
                                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                                  placeholder="john@example.com"
                                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: '#000000', fontWeight: 500 }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Temp Password</label>
                                <input 
                                  required
                                  type="password"
                                  className="form-input"
                                  value={formData.password}
                                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                                  placeholder="••••••••"
                                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: '#000000', fontWeight: 500 }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Phone Number</label>
                                <input 
                                  className="form-input"
                                  value={formData.phone_number}
                                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                  placeholder="+91 0000000000"
                                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: '#000000', fontWeight: 500 }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>GST Number</label>
                                <input 
                                  className="form-input"
                                  value={formData.gst_number}
                                  onChange={(e) => setFormData({...formData, gst_number: e.target.value})}
                                  placeholder="Optional"
                                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: '#000000', fontWeight: 500 }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Commission Rate (%)</label>
                                <input 
                                  type="number"
                                  step="0.01"
                                  className="form-input"
                                  value={formData.commission_rate}
                                  onChange={(e) => setFormData({...formData, commission_rate: e.target.value})}
                                  placeholder="5.00"
                                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#1a1a1a', color: '#fff' }}
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2', marginTop: '1rem', display: 'flex', gap: '10px' }}>
                                <button 
                                  type="submit"
                                  disabled={createLoading}
                                  style={{ 
                                    flex: 1,
                                    background: 'var(--purple-main)', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    fontWeight: 600,
                                    cursor: createLoading ? 'not-allowed' : 'pointer',
                                    opacity: createLoading ? 0.7 : 1
                                  }}>
                                    {createLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Seller Account'}
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setShowModal(false)}
                                  style={{ 
                                    flex: 1,
                                    background: 'none', 
                                    color: '#64748b', 
                                    border: '1px solid #e2e8f0', 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellersPage;
