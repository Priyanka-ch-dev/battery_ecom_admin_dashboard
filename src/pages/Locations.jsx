import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Loader2, ChevronRight } from 'lucide-react';
import api from '../services/api';

const LocationsPage = () => {
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isStateModalOpen, setIsStateModalOpen] = useState(false);
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [stateFormData, setStateFormData] = useState({ name: '' });
    const [cityFormData, setCityFormData] = useState({ name: '', state: '' });
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchStates();
    }, []);

    const fetchStates = async () => {
        try {
            setLoading(true);
            const res = await api.get('locations/states/');
            setStates(res.data.results || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCities = async (stateId) => {
        try {
            const res = await api.get(`locations/cities/?state_id=${stateId}`);
            setCities(res.data.results || res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStateClick = (state) => {
        setSelectedState(state);
        fetchCities(state.id);
    };

    const handleStateSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`locations/states/${editingItem.id}/`, stateFormData);
            } else {
                await api.post('locations/states/', stateFormData);
            }
            setIsStateModalOpen(false);
            fetchStates();
        } catch (err) {
            alert('Operation failed');
        }
    };

    const handleCitySubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...cityFormData, state: selectedState.id };
            if (editingItem) {
                await api.put(`locations/cities/${editingItem.id}/`, payload);
            } else {
                await api.post('locations/cities/', payload);
            }
            setIsCityModalOpen(false);
            fetchCities(selectedState.id);
        } catch (err) {
            alert('Operation failed');
        }
    };

    const handleDeleteState = async (id) => {
        if (window.confirm('Delete this state and all its cities?')) {
            await api.delete(`locations/states/${id}/`);
            fetchStates();
            if (selectedState?.id === id) setSelectedState(null);
        }
    };

    const handleDeleteCity = async (id) => {
        if (window.confirm('Delete this city?')) {
            await api.delete(`locations/cities/${id}/`);
            fetchCities(selectedState.id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Location Management</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage States and Cities for store availability.</p>
                </div>
                <button 
                    onClick={() => { setEditingItem(null); setStateFormData({ name: '' }); setIsStateModalOpen(true); }}
                    className="glass" 
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'var(--grad-purple)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Add State
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
                {/* States List */}
                <div className="glass" style={{ borderRadius: '16px', background: 'white', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', background: '#f8fafc', fontWeight: 700 }}>States</div>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {states.map(state => (
                            <div 
                                key={state.id} 
                                onClick={() => handleStateClick(state)}
                                style={{ 
                                    padding: '1rem 1.25rem', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    background: selectedState?.id === state.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                    borderLeft: selectedState?.id === state.id ? '4px solid #3b82f6' : '4px solid transparent',
                                    borderBottom: '1px solid var(--glass-border)'
                                }}
                            >
                                <span style={{ fontWeight: selectedState?.id === state.id ? 700 : 500 }}>{state.name}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingItem(state); setStateFormData({ name: state.name }); setIsStateModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteState(state.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                    <ChevronRight size={18} color="var(--text-dim)" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cities List */}
                <div className="glass" style={{ borderRadius: '16px', background: 'white', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700 }}>Cities {selectedState ? `in ${selectedState.name}` : ''}</span>
                        {selectedState && (
                            <button 
                                onClick={() => { setEditingItem(null); setCityFormData({ name: '', state: selectedState.id }); setIsCityModalOpen(true); }}
                                style={{ padding: '4px 12px', borderRadius: '6px', background: '#3b82f6', color: 'white', border: 'none', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                                + Add City
                            </button>
                        )}
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                        {!selectedState ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>Select a state to manage its cities.</div>
                        ) : cities.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>No cities found for this state.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                {cities.map(city => (
                                    <div key={city.id} className="glass" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>{city.name}</span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => { setEditingItem(city); setCityFormData({ name: city.name, state: selectedState.id }); setIsCityModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                            <button onClick={() => handleDeleteCity(city.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* State Modal */}
            {isStateModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <form onSubmit={handleStateSubmit} className="glass" style={{ width: '400px', padding: '2rem', borderRadius: '20px', background: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Edit State' : 'Add State'}</h2>
                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>State Name</label>
                            <input required value={stateFormData.name} onChange={e => setStateFormData({ name: e.target.value })} placeholder="e.g. Maharashtra" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsStateModalOpen(false)} className="action-btn">Cancel</button>
                            <button type="submit" style={{ padding: '0.5rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* City Modal */}
            {isCityModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <form onSubmit={handleCitySubmit} className="glass" style={{ width: '400px', padding: '2rem', borderRadius: '20px', background: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Edit City' : 'Add City'}</h2>
                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>City Name</label>
                            <input required value={cityFormData.name} onChange={e => setCityFormData({ ...cityFormData, name: e.target.value })} placeholder="e.g. Mumbai" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsCityModalOpen(false)} className="action-btn">Cancel</button>
                            <button type="submit" style={{ padding: '0.5rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LocationsPage;
