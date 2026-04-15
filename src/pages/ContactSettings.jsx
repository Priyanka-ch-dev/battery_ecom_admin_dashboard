import React, { useState, useEffect } from 'react';
import { Save, Loader2, Phone, Mail, Building, Clock, MapPin } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ContactSettingsPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        company_name: '',
        email: '',
        phone: '',
        address: '',
        support_hours: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('contact/');
                // Check if object is not empty
                if (res.data && Object.keys(res.data).length > 0) {
                    setFormData({
                        company_name: res.data.company_name || '',
                        email: res.data.email || '',
                        phone: res.data.phone || '',
                        address: res.data.address || '',
                        support_hours: res.data.support_hours || ''
                    });
                }
            } catch (err) {
                console.error("Failed to load contact settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await api.put('contact/', formData);
            setMessage('Contact settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error("Failed to update settings", err);
            setMessage('Error updating settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (user?.role !== 'ADMIN') {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>You do not have permission to view this page.</div>;
    }

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><Loader2 className="animate-spin" size={32} color="var(--primary-glow)" /></div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Contact Information Settings</h1>
                <p style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Global support and reach-out details for the platform.</p>
            </div>

            {message && (
                <div style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    marginBottom: '1.5rem',
                    background: message.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    color: message.includes('Error') ? '#ef4444' : '#22c55e',
                    border: `1px solid ${message.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
                }}>
                    {message}
                </div>
            )}

            <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', background: '#ffffff', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    
                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000', fontWeight: 800 }}><Building size={16} color="var(--red-main)" /> Company Identity</label>
                        <input 
                            required 
                            type="text" 
                            value={formData.company_name} 
                            onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                            placeholder="e.g. Battery Hub Inc." 
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /> Support Email</label>
                            <input 
                                required 
                                type="email" 
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                placeholder="support@example.com"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> Support Phone</label>
                            <input 
                                required 
                                type="text" 
                                value={formData.phone} 
                                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                placeholder="+1 234 567 8900"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> Support Hours</label>
                        <input 
                            required 
                            type="text" 
                            value={formData.support_hours} 
                            onChange={(e) => setFormData({...formData, support_hours: e.target.value})} 
                            placeholder="Mon - Fri, 9:00 AM to 6:00 PM"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> Physical Address</label>
                        <textarea 
                            required 
                            rows="4" 
                            value={formData.address} 
                            onChange={(e) => setFormData({...formData, address: e.target.value})} 
                            placeholder="123 Example Street, City, Country"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="submit" disabled={saving} style={{ 
                            padding: '1rem 2.5rem', 
                            borderRadius: '12px', 
                            background: 'var(--red-main)', 
                            border: 'none', 
                            color: 'white', 
                            fontWeight: 800, 
                            cursor: saving ? 'not-allowed' : 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            opacity: saving ? 0.7 : 1,
                            boxShadow: '0 4px 15px rgba(211, 47, 47, 0.3)'
                        }}>
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                            {saving ? 'UPDATING...' : 'SAVE CONFIGURATION'}
                        </button>
                    </div>

                </form>
            </div>

            <style>
                {`
                    .input-group label {
                        font-size: 0.85rem;
                        color: var(--text-dim);
                        font-weight: 600;
                        margin-bottom: 8px;
                    }
                    .input-group input, .input-group textarea {
                        padding: 14px 16px;
                        background: #fff;
                        border: 1px solid rgba(0,0,0,0.1);
                        border-radius: 12px;
                        color: var(--text-main);
                        outline: none;
                        transition: border-color 0.2s, box-shadow 0.2s;
                        font-size: 0.95rem;
                    }
                    .input-group input:focus, .input-group textarea:focus { 
                        border-color: var(--primary-glow);
                        box-shadow: 0 0 0 3px rgba(182, 109, 255, 0.1);
                    }
                `}
            </style>
        </div>
    );
};

export default ContactSettingsPage;
