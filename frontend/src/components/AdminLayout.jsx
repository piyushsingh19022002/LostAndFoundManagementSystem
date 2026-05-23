import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div style={styles.container}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.brandContainer}>
          <span style={styles.brandIcon}>🛡️</span>
          <h2 style={styles.brandTitle}>Admin Panel</h2>
        </div>
        
        <nav style={styles.nav}>
          <NavLink 
            to="/admin" 
            end
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <span style={styles.navIcon}>📊</span> Overview
          </NavLink>
          <NavLink 
            to="/admin/users" 
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <span style={styles.navIcon}>👥</span> Users
          </NavLink>
          <NavLink 
            to="/admin/items" 
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <span style={styles.navIcon}>🔍</span> Items
          </NavLink>
        </nav>

        <div style={styles.footerContainer}>
          <Link to="/dashboard" style={styles.backBtn}>
            &larr; Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '85vh',
    background: 'radial-gradient(circle at 70% 20%, #111827 0%, #030712 100%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    color: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  sidebar: {
    width: '260px',
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    padding: '30px 20px',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  brandIcon: {
    fontSize: '1.8rem',
  },
  brandTitle: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.02em',
    background: 'linear-gradient(to right, #f43f5e, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: '#9ca3af',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    color: '#f43f5e',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    boxShadow: '0 4px 15px rgba(244, 63, 94, 0.1)',
  },
  navIcon: {
    fontSize: '1.1rem',
  },
  footerContainer: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
  },
  backBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '10px 16px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '700',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.2s ease',
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
  },
};

export default AdminLayout;
