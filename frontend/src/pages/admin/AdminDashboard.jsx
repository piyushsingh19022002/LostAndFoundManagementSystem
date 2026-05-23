import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '16px', color: '#9ca3af' }}>Gathering platform intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <span style={styles.errorIcon}>⚠️</span>
          <h3 style={{ margin: '10px 0', fontSize: '1.2rem' }}>Error Loading Dashboard</h3>
          <p style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</p>
          <button onClick={fetchAnalytics} style={styles.btnRetry}>Retry</button>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers ?? 0,
      icon: '👥',
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      glow: 'rgba(59, 130, 246, 0.3)',
      desc: 'Active accounts on the platform',
      link: '/admin/users'
    },
    {
      title: 'Lost Item Reports',
      value: analytics?.totalLostItems ?? 0,
      icon: '📦',
      color: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      glow: 'rgba(244, 63, 94, 0.3)',
      desc: 'Items reported missing by users',
      link: '/admin/items'
    },
    {
      title: 'Found Item Listings',
      value: analytics?.totalFoundItems ?? 0,
      icon: '🔍',
      color: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      glow: 'rgba(16, 185, 129, 0.3)',
      desc: 'Recovered items awaiting claims',
      link: '/admin/items'
    },
    {
      title: 'Claim Requests',
      value: analytics?.totalClaims ?? 0,
      icon: '🤝',
      color: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)',
      glow: 'rgba(234, 179, 8, 0.3)',
      desc: 'Submitted claims for item returns',
      link: '/admin'
    }
  ];

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <div>
          <span style={styles.pretitle}>SaaS Platform Control Room</span>
          <h1 style={styles.title}>System Analytics</h1>
        </div>
        <button onClick={fetchAnalytics} style={styles.btnRefresh} title="Refresh Statistics">
          🔄 Refresh
        </button>
      </header>

      {/* Grid of cards */}
      <div style={styles.grid}>
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            style={{
              ...styles.card,
              boxShadow: `0 8px 30px ${card.glow}`,
            }}
          >
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>{card.title}</span>
              <span style={styles.cardIcon}>{card.icon}</span>
            </div>
            <div style={styles.cardValue}>{card.value}</div>
            <p style={styles.cardDesc}>{card.desc}</p>
            <Link to={card.link} style={styles.cardAction}>
              Manage Details &rarr;
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <section style={styles.actionsSection}>
        <h2 style={styles.sectionTitle}>Administrative Operations</h2>
        <div style={styles.actionGrid}>
          <div style={styles.actionCard} onClick={() => navigate('/admin/users')}>
            <span style={styles.actionIcon}>👥</span>
            <div>
              <h3 style={styles.actionHeader}>User Operations</h3>
              <p style={styles.actionDesc}>Manage accounts, update authorization roles, or delete problematic users.</p>
            </div>
          </div>

          <div style={styles.actionCard} onClick={() => navigate('/admin/items')}>
            <span style={styles.actionIcon}>🛡️</span>
            <div>
              <h3 style={styles.actionHeader}>Moderation Center</h3>
              <p style={styles.actionDesc}>Review and moderate user posts, delete spam, duplicate, or abusive entries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Server Health Status indicator */}
      <footer style={styles.healthContainer}>
        <div style={styles.healthHeader}>
          <span style={styles.healthPulse}></span>
          <span style={{ fontWeight: '600', color: '#10b981' }}>Platform Operational</span>
        </div>
        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>
          Role-Based Access Control (RBAC) active. Secure logging of administrative events enabled.
        </p>
      </footer>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    animation: 'fadeIn 0.5s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '35px',
  },
  pretitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#f43f5e',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: '4px 0 0 0',
    background: 'linear-gradient(to right, #ffffff, #9ca3af)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  btnRefresh: {
    padding: '10px 18px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  card: {
    background: 'rgba(17, 24, 39, 0.65)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, border-color 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  cardTitle: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    fontWeight: '600',
  },
  cardIcon: {
    fontSize: '1.4rem',
  },
  cardValue: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: '1.1',
    marginBottom: '8px',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#6b7280',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
  },
  cardAction: {
    marginTop: 'auto',
    color: '#f43f5e',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '700',
    transition: 'opacity 0.2s ease',
  },
  actionsSection: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#ffffff',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  actionCard: {
    background: 'rgba(17, 24, 39, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionIcon: {
    fontSize: '1.8rem',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
  },
  actionHeader: {
    fontSize: '1rem',
    fontWeight: '700',
    margin: '0 0 6px 0',
  },
  actionDesc: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    margin: 0,
    lineHeight: '1.5',
  },
  loadingContainer: {
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(244, 63, 94, 0.1)',
    borderTop: '3px solid #f43f5e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    minHeight: '400px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    background: 'rgba(17, 24, 39, 0.7)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    maxWidth: '400px',
  },
  errorIcon: {
    fontSize: '2rem',
  },
  btnRetry: {
    padding: '8px 20px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
  },
  healthContainer: {
    background: 'rgba(16, 185, 129, 0.03)',
    border: '1px solid rgba(16, 185, 129, 0.08)',
    borderRadius: '10px',
    padding: '16px',
    marginTop: '20px',
  },
  healthHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  healthPulse: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 10px #10b981',
    animation: 'pulse 2s infinite',
  },
};

export default AdminDashboard;
