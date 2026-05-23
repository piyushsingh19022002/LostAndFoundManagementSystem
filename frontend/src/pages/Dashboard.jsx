import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import DashboardCard from '../components/DashboardCard';
import RecentActivity from '../components/RecentActivity';
import ProfileSection from '../components/ProfileSection';
import AnalyticsSkeleton from '../components/ui/AnalyticsSkeleton';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // State definitions
  const [stats, setStats] = useState(null);
  const [myLostItems, setMyLostItems] = useState([]);
  const [myFoundItems, setMyFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | lost | found
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' }); // toast message

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch statistics, my lost items, and my found items concurrently
      const [statsRes, lostRes, foundRes] = await Promise.all([
        API.get('/auth/dashboard-stats'),
        API.get('/lost-items/my-items'),
        API.get('/found-items/my-items'),
      ]);

      setStats(statsRes.data);
      setMyLostItems(lostRes.data);
      setMyFoundItems(foundRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Delete handler for lost items
  const handleDeleteLostItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lost item report?')) return;
    try {
      const res = await API.delete(`/lost-items/${id}`);
      setActionMessage({ text: res.data.message || 'Report deleted successfully', type: 'success' });
      // Refresh data
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting lost item:', err);
      setActionMessage({ text: err.response?.data?.message || 'Failed to delete report', type: 'error' });
    }
    // Auto-clear message after 4s
    setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
  };

  // Delete handler for found items
  const handleDeleteFoundItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this found item report?')) return;
    try {
      const res = await API.delete(`/found-items/${id}`);
      setActionMessage({ text: res.data.message || 'Report deleted successfully', type: 'success' });
      // Refresh data
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting found item:', err);
      setActionMessage({ text: err.response?.data?.message || 'Failed to delete report', type: 'error' });
    }
    // Auto-clear message after 4s
    setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
  };

  if (loading) {
    return (
      <div style={styles.dashboardWrapper}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.welcomeText}>Workspace Dashboard</h1>
              <p style={styles.subtext}>Assembling your personalized workspace...</p>
            </div>
          </div>
          <div className="mt-8">
            <AnalyticsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardWrapper}>
      {/* Background decoration */}
      <div style={styles.bgBlob}></div>
      <div style={styles.bgBlob2}></div>

      {/* Main Container */}
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.welcomeText}>Workspace Dashboard</h1>
            <p style={styles.subtext}>Manage your reported lost and found items in one place.</p>
          </div>
          <div style={styles.actionHeaderGroup}>
            <Link to="/add-lost-item" style={styles.btnPrimary}>➕ Report Lost Item</Link>
            <Link to="/add-found-item" style={styles.btnSecondary}>🔍 Report Found Item</Link>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️ {error}</span>
            <button onClick={fetchDashboardData} style={styles.retryBtn}>Retry</button>
          </div>
        )}

        {/* Action Feedbacks */}
        {actionMessage.text && (
          <div style={{
            ...styles.toast,
            backgroundColor: actionMessage.type === 'success' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            borderColor: actionMessage.type === 'success' ? '#34d399' : '#ef4444',
            color: actionMessage.type === 'success' ? '#34d399' : '#ef4444',
          }}>
            {actionMessage.text}
          </div>
        )}

        {/* Tab Selection */}
        <div style={styles.tabBar}>
          <button 
            onClick={() => setActiveTab('overview')} 
            style={{ ...styles.tabButton, ...(activeTab === 'overview' ? styles.tabButtonActive : {}) }}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('lost')} 
            style={{ ...styles.tabButton, ...(activeTab === 'lost' ? styles.tabButtonActive : {}) }}
          >
            My Lost Reports ({myLostItems.length})
          </button>
          <button 
            onClick={() => setActiveTab('found')} 
            style={{ ...styles.tabButton, ...(activeTab === 'found' ? styles.tabButtonActive : {}) }}
          >
            My Found Reports ({myFoundItems.length})
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === 'overview' && (
          <div style={styles.tabContent}>
            {/* Statistics Cards */}
            <div style={styles.statsGrid}>
              <DashboardCard 
                title="Lost Items Reported" 
                value={stats?.totalLostItems || 0} 
                icon="🎒" 
                description="Items you are looking for"
                accentColor="#61dafb"
              />
              <DashboardCard 
                title="Found Items Reported" 
                value={stats?.totalFoundItems || 0} 
                icon="🔑" 
                description="Items you recovered or found"
                accentColor="#34d399"
              />
              <DashboardCard 
                title="Total Submissions" 
                value={(stats?.totalLostItems || 0) + (stats?.totalFoundItems || 0)} 
                icon="📊" 
                description="Overall platform contributions"
                accentColor="#a78bfa"
              />
            </div>

            {/* Layout Grid */}
            <div style={styles.layoutGrid}>
              <div style={styles.mainCol}>
                <RecentActivity 
                  lostItems={stats?.recentLostItems || []} 
                  foundItems={stats?.recentFoundItems || []} 
                />
              </div>
              <div style={styles.sideCol}>
                <ProfileSection user={user} />
                <div style={styles.quickNavigationBox}>
                  <h4 style={styles.boxTitle}>Quick Navigation</h4>
                  <div style={styles.navigationLinks}>
                    <Link to="/lost-items" style={styles.navLinkItem}>🌐 Public Lost Feed</Link>
                    <Link to="/found-items" style={styles.navLinkItem}>🌐 Public Found Feed</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lost' && (
          <div style={styles.tabContent}>
            <div style={styles.reportsList}>
              {myLostItems.length === 0 ? (
                <div style={styles.emptyTabState}>
                  <h3>No Lost Reports Yet</h3>
                  <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Have you misplaced an item? Report it so others can assist in locating it.</p>
                  <Link to="/add-lost-item" style={styles.btnPrimary}>Report Lost Item</Link>
                </div>
              ) : (
                myLostItems.map(item => (
                  <div key={item._id} style={styles.reportRow}>
                    <div style={styles.reportRowLeft}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} style={styles.reportThumb} />
                      ) : (
                        <div style={{ ...styles.reportThumbPlaceholder, backgroundColor: 'rgba(97, 218, 251, 0.1)' }}>🎒</div>
                      )}
                      <div>
                        <h4 style={styles.reportRowTitle}>{item.title}</h4>
                        <p style={styles.reportRowDesc}>{item.description.slice(0, 100)}{item.description.length > 100 ? '...' : ''}</p>
                        <div style={styles.reportMeta}>
                          <span>📍 {item.location}</span>
                          <span>•</span>
                          <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span style={{ 
                            ...styles.statusBadge, 
                            backgroundColor: item.status === 'lost' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                            color: item.status === 'lost' ? '#f87171' : '#34d399'
                          }}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.reportRowActions}>
                      <Link to={`/lost-items/${item._id}`} style={styles.actionBtnView}>View</Link>
                      <button onClick={() => handleDeleteLostItem(item._id)} style={styles.actionBtnDelete}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'found' && (
          <div style={styles.tabContent}>
            <div style={styles.reportsList}>
              {myFoundItems.length === 0 ? (
                <div style={styles.emptyTabState}>
                  <h3>No Found Reports Yet</h3>
                  <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Found someone's property? List it here to help reunite it with its owner.</p>
                  <Link to="/add-found-item" style={styles.btnSecondary}>Report Found Item</Link>
                </div>
              ) : (
                myFoundItems.map(item => (
                  <div key={item._id} style={styles.reportRow}>
                    <div style={styles.reportRowLeft}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} style={styles.reportThumb} />
                      ) : (
                        <div style={{ ...styles.reportThumbPlaceholder, backgroundColor: 'rgba(52, 211, 153, 0.1)' }}>🔑</div>
                      )}
                      <div>
                        <h4 style={styles.reportRowTitle}>{item.title}</h4>
                        <p style={styles.reportRowDesc}>{item.description.slice(0, 100)}{item.description.length > 100 ? '...' : ''}</p>
                        <div style={styles.reportMeta}>
                          <span>📍 {item.location}</span>
                          <span>•</span>
                          <span>📅 {new Date(item.dateFound).toLocaleDateString()}</span>
                          <span>•</span>
                          <span style={{ 
                            ...styles.statusBadge, 
                            backgroundColor: item.status === 'found' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(167, 139, 250, 0.15)',
                            color: item.status === 'found' ? '#34d399' : '#a78bfa'
                          }}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.reportRowActions}>
                      <Link to={`/found-items/${item._id}`} style={styles.actionBtnView}>View</Link>
                      <button onClick={() => handleDeleteFoundItem(item._id)} style={styles.actionBtnDelete}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  dashboardWrapper: {
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: '40px 20px',
    overflow: 'hidden',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  bgBlob: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '40vw',
    height: '40vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(97,218,251,0.08) 0%, rgba(97,218,251,0) 70%)',
    pointerEvents: 'none',
  },
  bgBlob2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '45vw',
    height: '45vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, rgba(52,211,153,0) 70%)',
    pointerEvents: 'none',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '20px',
  },
  welcomeText: {
    fontSize: '2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  subtext: {
    color: '#94a3b8',
    marginTop: '6px',
    fontSize: '0.95rem',
  },
  actionHeaderGroup: {
    display: 'flex',
    gap: '12px',
  },
  btnPrimary: {
    backgroundColor: '#0284c7',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    border: 'none',
    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  btnSecondary: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    color: '#34d399',
    padding: '12px 20px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    border: '1px solid rgba(52, 211, 153, 0.3)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  errorBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#f87171',
    padding: '14px 20px',
    borderRadius: '12px',
    fontSize: '0.92rem',
  },
  retryBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  toast: {
    border: '1px solid',
    padding: '14px 20px',
    borderRadius: '12px',
    fontSize: '0.92rem',
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    gap: '8px',
  },
  tabButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '12px 18px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    position: 'relative',
    bottom: '-1px',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s ease',
  },
  tabButtonActive: {
    color: '#61dafb',
    borderBottom: '2px solid #61dafb',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  statsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    }
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  quickNavigationBox: {
    backgroundColor: 'rgba(31, 41, 55, 0.65)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px',
  },
  boxTitle: {
    margin: '0 0 16px 0',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  navigationLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  navLinkItem: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.92rem',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    transition: 'all 0.15s ease',
    ':hover': {
      color: '#61dafb',
      backgroundColor: 'rgba(97, 218, 251, 0.08)',
      transform: 'translateX(4px)',
    }
  },
  reportsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyTabState: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    gap: '20px',
    flexWrap: 'wrap',
  },
  reportRowLeft: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flex: 1,
    minWidth: '280px',
  },
  reportThumb: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  reportThumbPlaceholder: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
  },
  reportRowTitle: {
    margin: '0 0 4px 0',
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  reportRowDesc: {
    margin: '0 0 8px 0',
    fontSize: '0.88rem',
    color: '#94a3b8',
    lineHeight: 1.4,
  },
  reportMeta: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontSize: '0.78rem',
    color: '#64748b',
    flexWrap: 'wrap',
  },
  statusBadge: {
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '700',
  },
  reportRowActions: {
    display: 'flex',
    gap: '10px',
  },
  actionBtnView: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#f8fafc',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.15s ease',
  },
  actionBtnDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    backgroundColor: '#0f172a',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(97, 218, 251, 0.1)',
    borderTop: '4px solid #61dafb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};

export default Dashboard;
