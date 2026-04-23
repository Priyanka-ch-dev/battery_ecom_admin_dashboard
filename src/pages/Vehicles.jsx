import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Loader2, ChevronRight } from 'lucide-react';
import api from '../services/api';

const VehiclesPage = () => {
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedMake, setSelectedMake] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMakeModalOpen, setIsMakeModalOpen] = useState(false);
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [makeFormData, setMakeFormData] = useState({ name: '' });
    const [modelFormData, setModelFormData] = useState({ name: '', make: '' });
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchMakes();
    }, []);

    const fetchMakes = async () => {
        try {
            setLoading(true);
            const res = await api.get('products/makes/');
            setMakes(res.data.results || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchModels = async (makeId) => {
        try {
            const res = await api.get(`products/models/?make_id=${makeId}`);
            setModels(res.data.results || res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMakeClick = (make) => {
        setSelectedMake(make);
        fetchModels(make.id);
    };

    const handleMakeSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`products/makes/${editingItem.id}/`, makeFormData);
            } else {
                await api.post('products/makes/', makeFormData);
            }
            setIsMakeModalOpen(false);
            fetchMakes();
        } catch (err) {
            alert('Operation failed');
        }
    };

    const handleModelSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...modelFormData, make: selectedMake.id };
            if (editingItem) {
                await api.put(`products/models/${editingItem.id}/`, payload);
            } else {
                await api.post('products/models/', payload);
            }
            setIsModelModalOpen(false);
            fetchModels(selectedMake.id);
        } catch (err) {
            alert('Operation failed');
        }
    };

    const handleDeleteMake = async (id) => {
        if (window.confirm('Delete this make and all its models?')) {
            await api.delete(`products/makes/${id}/`);
            fetchMakes();
            if (selectedMake?.id === id) setSelectedMake(null);
        }
    };

    const handleDeleteModel = async (id) => {
        if (window.confirm('Delete this model?')) {
            await api.delete(`products/models/${id}/`);
            fetchModels(selectedMake.id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Vehicle Management</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage Manufacturers and their Car Models.</p>
                </div>
                <button 
                    onClick={() => { setEditingItem(null); setMakeFormData({ name: '' }); setIsMakeModalOpen(true); }}
                    className="glass" 
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'var(--grad-purple)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Plus size={18} /> Add Manufacturer
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
                {/* Makes List */}
                <div className="glass" style={{ borderRadius: '16px', background: 'white', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', background: '#f8fafc', fontWeight: 700 }}>Manufacturers</div>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {makes.map(make => (
                            <div 
                                key={make.id} 
                                onClick={() => handleMakeClick(make)}
                                style={{ 
                                    padding: '1rem 1.25rem', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    background: selectedMake?.id === make.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                    borderLeft: selectedMake?.id === make.id ? '4px solid #3b82f6' : '4px solid transparent',
                                    borderBottom: '1px solid var(--glass-border)'
                                }}
                            >
                                <span style={{ fontWeight: selectedMake?.id === make.id ? 700 : 500 }}>{make.name}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingItem(make); setMakeFormData({ name: make.name }); setIsMakeModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteMake(make.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                    <ChevronRight size={18} color="var(--text-dim)" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Models List */}
                <div className="glass" style={{ borderRadius: '16px', background: 'white', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700 }}>Models {selectedMake ? `for ${selectedMake.name}` : ''}</span>
                        {selectedMake && (
                            <button 
                                onClick={() => { setEditingItem(null); setModelFormData({ name: '', make: selectedMake.id }); setIsModelModalOpen(true); }}
                                style={{ padding: '4px 12px', borderRadius: '6px', background: '#3b82f6', color: 'white', border: 'none', fontSize: '0.8rem', cursor: 'pointer' }}
                            >
                                + Add Model
                            </button>
                        )}
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                        {!selectedMake ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>Select a manufacturer to manage its models.</div>
                        ) : models.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>No models found for this manufacturer.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                {models.map(model => (
                                    <div key={model.id} className="glass" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>{model.name}</span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => { setEditingItem(model); setModelFormData({ name: model.name, make: selectedMake.id }); setIsModelModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit2 size={14} /></button>
                                            <button onClick={() => handleDeleteModel(model.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Make Modal */}
            {isMakeModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <form onSubmit={handleMakeSubmit} className="glass" style={{ width: '400px', padding: '2rem', borderRadius: '20px', background: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Edit Manufacturer' : 'Add Manufacturer'}</h2>
                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Name</label>
                            <input required value={makeFormData.name} onChange={e => setMakeFormData({ name: e.target.value })} placeholder="e.g. Maruti Suzuki" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsMakeModalOpen(false)} className="action-btn">Cancel</button>
                            <button type="submit" style={{ padding: '0.5rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Model Modal */}
            {isModelModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <form onSubmit={handleModelSubmit} className="glass" style={{ width: '400px', padding: '2rem', borderRadius: '20px', background: 'white' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingItem ? 'Edit Model' : 'Add Model'}</h2>
                        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Model Name</label>
                            <input required value={modelFormData.name} onChange={e => setModelFormData({ ...modelFormData, name: e.target.value })} placeholder="e.g. Swift" />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsModelModalOpen(false)} className="action-btn">Cancel</button>
                            <button type="submit" style={{ padding: '0.5rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default VehiclesPage;
