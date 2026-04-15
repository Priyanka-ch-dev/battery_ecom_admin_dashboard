import React, { useState, useEffect } from 'react';
import { Wrench, MapPin, Calendar, User, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const InstallationRequestsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await api.get('installations/');
            const data = res.data.results || res.data;
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch installations:', err);
            setError('Failed to load installation requests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return '#22c55e';
            case 'PENDING': return '#eab308';
            case 'CANCELLED': return '#ef4444';
            default: return 'var(--primary-glow)';
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Service & Installations</h1>
                <p style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Track incoming battery installation and maintenance requests.</p>
            </div>

            <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '1.25rem' }}>Service ID</th>
                                <th style={{ padding: '1.25rem' }}>Customer</th>
                                <th style={{ padding: '1.25rem' }}>Schedule</th>
                                <th style={{ padding: '1.25rem' }}>Vehicle Info</th>
                                <th style={{ padding: '1.25rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center' }}>
                                        <Loader2 className="animate-spin" size={32} color="var(--primary-glow)" />
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                        No installation requests found.
                                    </td>
                                </tr>
                            ) : bookings.map((booking) => (
                                <tr key={booking.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                            <Wrench size={16} color="var(--red-main)" />
                                            #{booking.id}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{booking.user_email || 'Verified Buyer'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={12} /> {booking.location || 'Doorstep Service'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                            <Calendar size={14} color="var(--text-dim)" />
                                            {booking.scheduled_date || 'TBD'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                            <Clock size={12} /> {booking.scheduled_time || 'General Slot'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.875rem' }}>
                                        {booking.vehicle_name || 'Vehicle Attached'}
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ 
                                            display: 'flex', alignItems: 'center', gap: '6px', 
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', 
                                            background: `${getStatusColor(booking.status)}1A`,
                                            color: getStatusColor(booking.status),
                                            fontWeight: 600, textTransform: 'uppercase'
                                        }}>
                                            {booking.status === 'COMPLETED' && <CheckCircle2 size={12} />}
                                            {booking.status}
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

export default InstallationRequestsPage;
