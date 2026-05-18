import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Trash2, Calendar, User, Phone, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const LeadsPage = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);

    const fetchLeads = async (search = '') => {
        try {
            setLoading(true);
            let url = 'leads/';
            if (search) {
                url += `?search=${search}`;
            }
            const res = await api.get(url);
            const data = res.data.results || res.data;
            setLeads(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch leads:', err);
            setError('Failed to load lead generation data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeads(searchTerm);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent opening detail modal
        if (window.confirm('Are you sure you want to permanently delete this lead?')) {
            try {
                await api.delete(`leads/${id}/`);
                if (selectedLead && selectedLead.id === id) {
                    setSelectedLead(null);
                }
                fetchLeads(searchTerm);
            } catch (err) {
                alert('Deletion failed.');
            }
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Lead Generation</h1>
                <p style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Track and manage customer leads generated across the platform.</p>
            </div>

            {/* Filter Bar */}
            <div className="glass" style={{ padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', background: '#f1f5f9', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <Search size={18} color="var(--text-main)" />
                    <input 
                      type="text" 
                      placeholder="Search by name, contact number, or submitter..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                    />
                </div>
                {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Clear Search
                    </button>
                )}
            </div>

            {/* Content Table & Detail View */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedLead ? '2fr 1fr' : '1fr', gap: '24px', transition: 'all 0.3s ease' }}>
                <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid #eee' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem' }}>Name</th>
                                    <th style={{ padding: '1.25rem' }}>Contact Number</th>
                                    <th style={{ padding: '1.25rem' }}>Date</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                                            <Loader2 className="animate-spin" size={32} color="var(--red-main)" />
                                        </td>
                                    </tr>
                                ) : leads.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                            No leads found.
                                        </td>
                                    </tr>
                                ) : leads.map((lead) => (
                                    <tr 
                                      key={lead.id} 
                                      onClick={() => setSelectedLead(lead)}
                                      style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selectedLead && selectedLead.id === lead.id ? 'rgba(211, 47, 47, 0.05)' : 'transparent' }} 
                                      className="table-row hover-nav"
                                    >
                                        <td style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                            {lead.name}
                                        </td>
                                        <td style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                                            {lead.contact_number}
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {new Date(lead.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                            <button 
                                              onClick={(e) => handleDelete(lead.id, e)}
                                              className="action-btn delete" 
                                              title="Delete Lead"
                                              style={{ padding: '8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side Lead Details Panel */}
                {selectedLead && (
                    <div className="glass" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)', alignSelf: 'start', position: 'sticky', top: '20px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Lead Details</h3>
                            <button 
                              onClick={() => setSelectedLead(null)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-dim)', fontWeight: 800 }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Lead Name</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700 }}>
                                    <User size={16} color="var(--red-main)" />
                                    {selectedLead.name}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Contact Number</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700 }}>
                                    <Phone size={16} color="var(--red-main)" />
                                    {selectedLead.contact_number}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Creation Date</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                    <Calendar size={14} />
                                    {new Date(selectedLead.created_at).toLocaleString()}
                                </div>
                            </div>

                            {selectedLead.updated_at && selectedLead.updated_at !== selectedLead.created_at && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Last Updated</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                        <Calendar size={14} />
                                        {new Date(selectedLead.updated_at).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <a 
                              href={`tel:${selectedLead.contact_number}`} 
                              style={{ flex: 1, textDecoration: 'none', background: 'var(--red-main)', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(211, 47, 47, 0.2)' }}
                            >
                                <Phone size={14} />
                                Call Client
                            </a>
                            <button 
                              onClick={(e) => handleDelete(selectedLead.id, e)}
                              style={{ border: '1px solid #f3f4f6', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadsPage;
