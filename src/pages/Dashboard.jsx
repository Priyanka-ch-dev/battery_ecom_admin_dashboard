import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, IndianRupee, ShoppingCart, Search, Users, 
  AlertCircle, Loader2, ChevronRight, Store 
} from 'lucide-react';
import api from '../services/api';

const StatCard = ({ label, value, icon: Icon, trend, trendValue, bgColor, borderColor, iconColor, loading }) => (
  <div className={`stat-card glass`} style={{
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '16px',
    padding: '1.75rem',
    background: bgColor || '#fff',
    border: `1px solid ${borderColor || 'var(--glass-border)'}`,
    color: 'var(--text-main)',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#000' }}>{label}</span>
      <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', border: `1px solid ${borderColor || 'var(--glass-border)'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={iconColor || 'var(--red-main)'} />
      </div>
    </div>

    {loading ? (
      <div className="skeleton" style={{ height: '2.5rem', width: '60%', borderRadius: '4px' }}></div>
    ) : (
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#000', letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 800, color: iconColor || 'var(--red-main)', background: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>{trendValue}</span>
          <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{trend}</span>
        </div>
      </div>
    )}
  </div>
);

const SearchBadge = ({ label, values, icon: Icon, loading }) => (
  <div className="stat-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--glass-border)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(211, 47, 47, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color="#d32f2f" />
      </div>
      <span style={{ color: '#000', fontSize: '1rem', fontWeight: 800 }}>{label}</span>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {loading ? (
        [1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '16px' }}></div>)
      ) : (
        values?.map((v, idx) => (
          <span key={idx} className="search-term-pill" style={{
            padding: '8px 16px',
            background: 'rgba(211, 47, 47, 0.03)',
            border: '1px solid rgba(211, 47, 47, 0.08)',
            borderRadius: '12px',
            fontSize: '0.85rem',
            color: '#d32f2f',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            cursor: 'default',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <TrendingUp size={12} stopColor="#d32f2f" />
            {v}
          </span>
        ))
      )}
    </div>
  </div>
);

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, ordersRes, sellersRes] = await Promise.all([
          api.get('reports/summary/'),
          api.get('orders/?ordering=-created_at'),
          api.get('sellers/?status=APPROVED')
        ]);

        setData(statsRes.data);
        const ordersData = ordersRes.data.results || ordersRes.data;
        setOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
        setSellers(sellersRes.data.results || sellersRes.data);
        setError(null);
      } catch (err) {
        console.error('Fetch Failed', err);
        setError('Connection Failed. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignSeller = async (orderId, sellerId) => {
    if (!sellerId) return;
    try {
      await api.post(`orders/${orderId}/assign_seller/`, { seller_id: sellerId });
      // Refresh orders immediately to show updated assignment
      const ordersRes = await api.get('orders/?ordering=-created_at');
      const ordersData = ordersRes.data.results || ordersRes.data;
      setOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
    } catch (err) {
      console.error('Assignment failed:', err);
      alert('Failed to assign seller.');
    }
  };

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <AlertCircle size={48} color="#fe7c96" />
      <div style={{ color: '#fe7c96', fontWeight: 600 }}>{error}</div>
      <button onClick={() => window.location.reload()} className="btn-purple">Retry Connection</button>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Executive Overview</h1>
        <p style={{ color: 'var(--text-dim)' }}>Performance analytics for <span className="text-gradient-purple" style={{ fontWeight: 600 }}>battery_ecom_admin</span></p>
      </div>

      {/* Top Metrics Cards */}
      <div className="card-grid" style={{ marginBottom: '2.5rem' }}>
        <StatCard
          label="Lifetime Sales"
          value={`₹${data?.metrics?.lifetime_sales?.toLocaleString() || '0.00'}`}
          trendValue={`₹${data?.metrics?.sales_today?.toLocaleString() || '0'}`}
          trend="earned today"
          icon={IndianRupee}
          bgColor="rgba(211, 47, 47, 0.15)"
          borderColor="rgba(211, 47, 47, 0.4)"
          iconColor="#b71c1c"
          loading={loading}
        />
        <StatCard
          label="Avg Order Value"
          value={`₹${data?.metrics?.avg_order_value || '0.00'}`}
          trendValue={`₹${data?.metrics?.avg_order_value || '0.00'}`}
          trend="Overall Average"
          icon={TrendingUp}
          bgColor="rgba(25, 118, 210, 0.15)"
          borderColor="rgba(25, 118, 210, 0.4)"
          iconColor="#0d47a1"
          loading={loading}
        />
        <StatCard
          label="Total Orders"
          value={data?.metrics?.total_orders || '0'}
          trendValue={data?.metrics?.orders_today || '0'}
          trend="placed today"
          icon={ShoppingCart}
          bgColor="rgba(56, 142, 60, 0.15)"
          borderColor="rgba(56, 142, 60, 0.4)"
          iconColor="#1b5e20"
          loading={loading}
        />
        <StatCard
          label="Total Sellers"
          value={data?.metrics?.total_sellers || '0'}
          trendValue={data?.metrics?.sellers_today || '0'}
          trend="joined today"
          icon={Store}
          bgColor="rgba(255, 152, 0, 0.15)"
          borderColor="rgba(255, 152, 0, 0.4)"
          iconColor="#e65100"
          loading={loading}
        />

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <SearchBadge
          label="Last Search Terms"
          values={data?.last_search_terms}
          icon={Search}
          loading={loading}
        />
        <SearchBadge
          label="Top Search Terms"
          values={data?.top_search_terms}
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {/* Recent Orders Section */}
      <div className="glass" style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', marginBottom: '2.5rem', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>Recent Orders</h3>
          <Link to="/orders" style={{ fontSize: '0.85rem', color: 'var(--red-main)', textDecoration: 'none', fontWeight: 800 }}>View All Orders</Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.2fr 1.5fr 1.5fr 1.2fr 1fr 40px', padding: '12px 0', borderBottom: '2px solid #f8fafc', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Order ID</span>
            <span>Customer Email</span>
            <span>Amount</span>
            <span>Assigned To</span>
            <span>Assign Seller</span>
            <span>Status</span>
            <span>Date</span>
            <span></span>
          </div>

          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '50px', margin: '10px 0', borderRadius: '8px' }}></div>)
          ) : orders.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No recent orders found.</div>
          ) : orders.map(order => (
            <div key={order.id} className="modern-table-row" style={{
              display: 'grid', gridTemplateColumns: '1fr 2fr 1.2fr 1.5fr 1.5fr 1.2fr 1fr 40px',
              padding: '16px 12px', borderRadius: '12px', alignItems: 'center', fontSize: '0.9rem',
              transition: 'background 0.2s ease',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <span style={{ fontWeight: 800, color: '#000' }}>#{order.id}</span>
              <span style={{ color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '10px', fontWeight: 600 }}>{order.user_email}</span>
              <span style={{ fontWeight: 800, color: '#d32f2f' }}>₹{parseFloat(order.grand_total).toLocaleString()}</span>
              <span style={{ fontSize: '0.85rem', color: '#000', fontWeight: 700 }}>{order.delivery_person_name || 'Unassigned'}</span>

              {/* Quick Assign Dropdown */}
              <div style={{ paddingRight: '10px' }}>
                <select
                  value={order.delivery_person || ''}
                  onChange={(e) => handleAssignSeller(order.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    color: '#000',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Choose Seller...</option>
                  {sellers.map(s => <option key={s.id} value={s.user}>{s.business_name}</option>)}
                </select>
              </div>

              <div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  background: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '#ecfdf5' : (order.status === 'CANCELLED' ? '#fff1f2' : '#fffbeb'),
                  color: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '#059669' : (order.status === 'CANCELLED' ? '#e11d48' : '#d97706'),
                  border: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '1px solid #10b98133' : (order.status === 'CANCELLED' ? '1px solid #f43f5e33' : '1px solid #f59e0b33')
                }}>
                  {order.status}
                </span>
              </div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <Link to="/orders" style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={20} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Best Seller Products */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>Best Seller Products</h3>
          <div style={{ width: '100%', height: 280 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Loader2 className="animate-spin" color="#d32f2f" /></div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={data?.best_sellers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="product__name" stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', color: '#000' }}
                    itemStyle={{ color: '#000' }}
                    cursor={{ fill: 'rgba(211, 47, 47, 0.05)' }}
                  />
                  <Bar dataKey="sales" fill="var(--red-main)" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Most Viewed Products */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '16px', background: '#fff', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>Most Viewed Product</h3>
          <div style={{ width: '100%', height: 280 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Loader2 className="animate-spin" color="#0288d1" /></div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={data?.most_viewed} layout="vertical" margin={{ left: 40, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#64748b"
                    fontSize={11}
                    width={100}
                    tickLine={false}
                    axisLine={false}
                    fontWeight={700}
                  />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: 'rgba(2, 136, 209, 0.05)' }}
                  />
                  <Bar dataKey="view_count" fill="#0288d1" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* New Customers Growth */}
        <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', gridColumn: 'span 2', background: '#fff', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000' }}>User Acquisition Strategy</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, background: '#f8fafc', padding: '4px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#388e3c' }}></div>
                Active Growth
              </div>
            </div>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Loader2 className="animate-spin" color="#388e3c" /></div>
            ) : (
              <ResponsiveContainer>
                <AreaChart data={data?.customer_growth}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#388e3c" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#388e3c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#388e3c" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <style>
          {`
                    .modern-table-row:hover {
                        background: #f8fafc !important;
                        cursor: pointer;
                        transform: translateX(4px);
                    }
                    .search-term-pill:hover {
                        background: rgba(211, 47, 47, 0.08) !important;
                        border-color: rgba(211, 47, 47, 0.2) !important;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(211, 47, 47, 0.1);
                    }
                    .modern-table-row {
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    .skeleton {
                        background: #f1f5f9;
                        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                        background-size: 200% 100%;
                        animation: skeleton-loading 1.5s infinite;
                    }
                    @keyframes skeleton-loading {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                `}
        </style>
      </div>
    </div>
  );
};

export default DashboardPage;
