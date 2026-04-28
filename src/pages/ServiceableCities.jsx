import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const ServiceableCitiesPage = () => {
    const [serviceableCities, setServiceableCities] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        city: '',
        is_service_available: true
    });
    const [selectedState, setSelectedState] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [svcRes, stateRes] = await Promise.all([
                api.get('locations/serviceable-cities/'),
                api.get('locations/states/')
            ]);
            setServiceableCities(svcRes.data.results || svcRes.data);
            setStates(stateRes.data.results || stateRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCitiesForState = async (stateId) => {
        try {
            const res = await api.get(`locations/cities/?state_id=${stateId}`);
            setCities(res.data.results || res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStateChange = (e) => {
        const stateId = e.target.value;
        setSelectedState(stateId);
        setFormData({ ...formData, city: '' });
        if (stateId) {
            fetchCitiesForState(stateId);
        } else {
            setCities([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('locations/serviceable-cities/', formData);
            setIsModalOpen(false);
            setFormData({ city: '', is_service_available: true });
            setSelectedState('');
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data?.city ? "This city is already in the list." : "Failed to add city.";
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleAvailability = async (item) => {
        try {
            await api.patch(`locations/serviceable-cities/${item.id}/`, {
                is_service_available: !item.is_service_available
            });
            fetchData();
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Remove this city from serviceable list?')) {
            try {
                await api.delete(`locations/serviceable-cities/${id}/`);
                fetchData();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Service Availability</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage cities where you offer delivery and installation.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="glass" 
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'var(--grad-purple)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Add Serviceable City
                </button>
            </div>

            <div className="glass" style={{ borderRadius: '16px', background: 'white', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--glass-border)' }}>
                        <tr>
                            <th style={{ padding: '1.25rem' }}>City</th>
                            <th style={{ padding: '1.25rem' }}>State</th>
                            <th style={{ padding: '1.25rem' }}>Status</th>
                            <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="3" style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></td>
                            </tr>
                        ) : serviceableCities.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>No serviceable cities defined yet.</td>
                            </tr>
                        ) : serviceableCities.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1.25rem', fontWeight: 600 }}>{item.city_name}</td>
                                <td style={{ padding: '1.25rem', color: 'var(--text-dim)' }}>{item.state_name}</td>
                                <td style={{ padding: '1.25rem' }}>
                                    <div 
                                        onClick={() => toggleAvailability(item)}
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '6px', 
                                            padding: '4px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            background: item.is_service_available ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: item.is_service_available ? '#22c55e' : '#ef4444'
                                        }}
                                    >
                                        {item.is_service_available ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {item.is_service_available ? 'Service Available' : 'Service Suspended'}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                    <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <form onSubmit={handleSubmit} className="glass" style={{ width: '450px', padding: '2rem', borderRadius: '20px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Add Serviceable City</h2>
                            <X onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer' }} />
                        </div>

                        <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                            <label>Select State</label>
                            <select required value={selectedState} onChange={handleStateChange}>
                                <option value="">Select State</option>
                                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                            <label>Select City</label>
                            <select required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} disabled={!selectedState}>
                                <option value="">Select City</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                            <input 
                                type="checkbox" 
                                checked={formData.is_service_available} 
                                onChange={e => setFormData({ ...formData, is_service_available: e.target.checked })} 
                                id="is_available"
                            />
                            <label htmlFor="is_available" style={{ margin: 0 }}>Enable service for this city</label>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="action-btn">Cancel</button>
                            <button type="submit" disabled={submitting} style={{ padding: '0.75rem 2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Add City'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ServiceableCitiesPage;
