import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Pages
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import OrdersPage from './pages/Orders';
import ProductsPage from './pages/Products';
import CustomersPage from './pages/Customers';
import PaymentsPage from './pages/Payments';
import ReviewsPage from './pages/Reviews';
import InstallationRequestsPage from './pages/InstallationRequests';
import SellersPage from './pages/Sellers';
import CategoriesPage from './pages/Categories';
import BrandsPage from './pages/Brands';
import CouponsPage from './pages/Coupons';
import ContactSettingsPage from './pages/ContactSettings';

// Icons
import { LayoutDashboard, ShoppingBag, Box, CreditCard, Wrench, MessageSquare, LogOut, Users, Battery, Menu, X, Store, Search, Tag, Phone,PanelLeft,BatteryCharging,BatteryFull,BatteryIcon,ChevronLeft,ChevronRight,} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, isCollapsed, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }} onClick={onClick}>
      <div style={{ 
        padding: isCollapsed ? '0.6rem' : '0.5rem 1rem', 
        borderRadius: '10px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        gap: '12px',
        background: isActive ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
        color: isActive ? 'var(--red-main)' : 'var(--text-dim)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }} title={isCollapsed ? label : ''} className="hover-nav">
        <Icon size={18} style={{ minWidth: '18px', color: isActive ? 'var(--red-main)' : 'var(--text-dim)' }} />
        {!isCollapsed && <span style={{ fontWeight: isActive ? 800 : 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{label}</span>}
      </div>
    </Link>
  );
};

const Sidebar = ({ isCollapsed, isMobile, toggleSidebar }) => {
  const sidebarWidth = isCollapsed && !isMobile ? '80px' : '240px';

  return (
    <>
      <div style={{ 
          background: 'var(--sidebar-bg)', 
          borderRight: '1px solid var(--glass-border)', 
          width: sidebarWidth,
          minWidth: sidebarWidth,
          height: '100vh',
          position: isMobile ? 'fixed' : 'relative',
          left: isMobile && isCollapsed ? '-240px' : '0',
          top: 0,
          zIndex: 200,
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
      }}>
        {/* Header/Logo */}
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start', padding: isCollapsed && !isMobile ? '0' : '0 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', minWidth: '30px', borderRadius: '50%', background: 'var(--red-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Battery size={16} />
            </div>
            {(!isCollapsed || isMobile) && <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', color: '#000' }}>battery_ecom</h2>}
          </div>
        </div>

        {/* Profile */}
        {(!isCollapsed || isMobile) && (
          <div style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
               <div style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--red-main)' }}>
                   <img src="https://ui-avatars.com/api/?name=Admin&background=ff0000&color=fff" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
               <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                   <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>Administrator</div>
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Project Manager</div>
               </div>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: isCollapsed && !isMobile ? '0.5rem 0.6rem' : '0.5rem', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed && !isMobile} onClick={() => isMobile && toggleSidebar()} />
            <SidebarItem to="/orders" icon={Box} label="Orders" isCollapsed={isCollapsed && !isMobile} onClick={() => isMobile && toggleSidebar()} />
            <SidebarItem to="/products" icon={ShoppingBag} label="Products" isCollapsed={isCollapsed && !isMobile} onClick={() => isMobile && toggleSidebar()} />
            <SidebarItem to="/customers" icon={Users} label="Customers" isCollapsed={isCollapsed && !isMobile} onClick={() => isMobile && toggleSidebar()} />
            <SidebarItem to="/sellers" icon={Store} label="Sellers" isCollapsed={isCollapsed && !isMobile} onClick={() => isMobile && toggleSidebar()} />
            <SidebarItem to="/coupons" icon={Tag} label="Coupons" isCollapsed={isCollapsed && !isMobile} onClick={() => isMobile && toggleSidebar()} />
            <SidebarItem to="/payments" icon={CreditCard} label="Payments" isCollapsed={isCollapsed && !isMobile} onClick={() => isMobile && toggleSidebar()} />
            <SidebarItem to="/reviews" icon={MessageSquare} label="Reviews" isCollapsed={isCollapsed && !isMobile} onClick={() => isMobile && toggleSidebar()} />
            <SidebarItem to="/installations" icon={Wrench} label="Installations" isCollapsed={isCollapsed && !isMobile} onClick={() => isMobile && toggleSidebar()} />
            <SidebarItem to="/contact-settings" icon={Phone} label="Contact Settings" isCollapsed={isCollapsed && !isMobile} onClick={() => isMobile && toggleSidebar()} />
        </nav>
      </div>
      {isMobile && !isCollapsed && <div className="overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 150 }} onClick={toggleSidebar}></div>}
    </>
  );
};

const Header = ({ toggleSidebar,isCollapsed }) => {
  return (
    <header style={{ 
        background: 'var(--sidebar-bg)', 
        borderBottom: '1px solid var(--glass-border)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
        flexShrink: 0,
        zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-main)' }}>
          {/* <BatteryCharging size={22} /> */}{isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <img src="https://ui-avatars.com/api/?name=Admin&background=ff0000&color=fff" alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
        </div>
        <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4b5c' }}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex h-screen" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar isCollapsed={isSidebarCollapsed} isMobile={isMobile} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header toggleSidebar={toggleSidebar}
        isCollapsed={isSidebarCollapsed} />
        <div className="content-area" style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
           {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout><DashboardPage /></Layout>} />
            <Route path="/orders" element={<Layout><OrdersPage /></Layout>} />
            <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
            <Route path="/customers" element={<Layout><CustomersPage /></Layout>} />
            <Route path="/sellers" element={<Layout><SellersPage /></Layout>} />
            <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
            <Route path="/brands" element={<Layout><BrandsPage /></Layout>} />
            <Route path="/coupons" element={<Layout><CouponsPage /></Layout>} />
            <Route path="/payments" element={<Layout><PaymentsPage /></Layout>} />
            <Route path="/reviews" element={<Layout><ReviewsPage /></Layout>} />
            <Route path="/installations" element={<Layout><InstallationRequestsPage /></Layout>} />
            <Route path="/contact-settings" element={<Layout><ContactSettingsPage /></Layout>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
