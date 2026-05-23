import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import AnalyticsSkeleton from '../../components/ui/AnalyticsSkeleton';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const [range, setRange] = useState('30days');
  const [dashboardData, setDashboardData] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [claimData, setClaimData] = useState(null);
  const [moderationData, setModerationData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard metrics, claims analytics, moderation analytics, and user growth (with range parameter)
      const [dbRes, growthRes, claimsRes, modRes] = await Promise.all([
        API.get('/admin/analytics/dashboard'),
        API.get(`/admin/analytics/growth?range=${range}`),
        API.get('/admin/analytics/claims'),
        API.get('/admin/analytics/moderation')
      ]);

      setDashboardData(dbRes.data);
      setGrowthData(growthRes.data);
      setClaimData(claimsRes.data);
      setModerationData(modRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load business intelligence dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, [range]);

  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Platform Intelligence</h1>
            <p className="text-sm text-slate-400">Loading business intelligence dashboard analytics...</p>
          </div>
        </div>
        <AnalyticsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <span style={styles.errorIcon}>⚠️</span>
          <h3 style={{ margin: '10px 0', fontSize: '1.2rem', color: '#ffffff' }}>Analytics Failure</h3>
          <p style={{ color: '#ef4444', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</p>
          <button onClick={fetchAllAnalytics} style={styles.btnRetry}>Retry Fetch</button>
        </div>
      </div>
    );
  }

  // Claim Status Color Mapping
  const CLAIM_COLORS = {
    'Approved': '#10b981',
    'Pending': '#eab308',
    'Rejected': '#ef4444'
  };

  // Moderation Severity Color Mapping
  const REPORT_COLORS = {
    'Pending': '#6366f1',
    'Urgent': '#f43f5e',
    'Resolved': '#10b981',
    'Rejected': '#6b7280'
  };

  const kpis = [
    {
      title: 'Total Users',
      value: dashboardData?.totalUsers ?? 0,
      icon: '👥',
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      glow: 'rgba(59, 130, 246, 0.25)',
      desc: 'Registered accounts'
    },
    {
      title: 'Total Listings',
      value: dashboardData?.totalItems ?? 0,
      icon: '📦',
      color: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      glow: 'rgba(16, 185, 129, 0.25)',
      desc: 'Lost & Found database items'
    },
    {
      title: 'Active Reports',
      value: dashboardData?.activeReports ?? 0,
      icon: '🚨',
      color: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      glow: 'rgba(244, 63, 94, 0.25)',
      desc: 'Pending or urgent flags'
    },
    {
      title: 'Claim Success Rate',
      value: `${dashboardData?.claimSuccessRate ?? 0}%`,
      icon: '🤝',
      color: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
      glow: 'rgba(168, 85, 247, 0.25)',
      desc: 'Approved vs total claims'
    }
  ];

  return (
    <div style={styles.dashboardContainer}>
      {/* Header bar */}
      <header style={styles.header}>
        <div>
          <span style={styles.pretitle}>Executive Dashboard</span>
          <h1 style={styles.title}>Business Intelligence & Analytics</h1>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.filterContainer}>
            <label htmlFor="range-select" style={styles.filterLabel}>Time Range:</label>
            <select
              id="range-select"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              style={styles.select}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
          <button onClick={fetchAllAnalytics} style={styles.btnRefresh} title="Refresh Live Data">
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* KPI summaries */}
      <div style={styles.kpiGrid}>
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              ...styles.kpiCard,
              boxShadow: `0 8px 32px ${kpi.glow}`,
            }}
          >
            <div style={styles.kpiHeader}>
              <span style={styles.kpiTitle}>{kpi.title}</span>
              <span style={{ ...styles.kpiIconBadge, background: kpi.color }}>
                {kpi.icon}
              </span>
            </div>
            <div style={styles.kpiValue}>{kpi.value}</div>
            <p style={styles.kpiDesc}>{kpi.desc}</p>
            <div style={{ ...styles.glowBorder, background: kpi.color }}></div>
          </div>
        ))}
      </div>

      {/* Main charts layout */}
      <div style={styles.chartsGrid}>
        {/* User Growth Chart */}
        <div style={{ ...styles.chartWrapper, gridColumn: 'span 2' }}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Platform Growth Trend</h3>
            <span style={styles.chartSubtitle}>New registered signups over selected range</span>
          </div>
          <div style={styles.chartContainer}>
            {loading ? (
              <div style={styles.skeletonContainer}><div style={styles.pulseBar}></div></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="users" name="New Users" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Claim Request lifecycle status distribution */}
        <div style={styles.chartWrapper}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Claim Status Distribution</h3>
            <span style={styles.chartSubtitle}>Overview of claim approvals & lifecycle conversion</span>
          </div>
          <div style={styles.chartContainer}>
            {loading ? (
              <div style={styles.skeletonContainer}><div style={styles.pulseBar}></div></div>
            ) : claimData?.summary.total === 0 ? (
              <div style={styles.emptyState}>No claim requests submitted yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={claimData?.chartData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(claimData?.chartData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CLAIM_COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Moderation flagged severity status breakdowns */}
        <div style={styles.chartWrapper}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Moderation & Safety Analytics</h3>
            <span style={styles.chartSubtitle}>Distribution of content reports status</span>
          </div>
          <div style={styles.chartContainer}>
            {loading ? (
              <div style={styles.skeletonContainer}><div style={styles.pulseBar}></div></div>
            ) : moderationData?.summary.total === 0 ? (
              <div style={styles.emptyState}>Clean slate! No flagged items or moderation reports.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={moderationData?.chartData || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" name="Reports" radius={[4, 4, 0, 0]}>
                    {(moderationData?.chartData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={REPORT_COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Database breakdown footer */}
      <footer style={styles.footerBreakdown}>
        <div style={styles.breakdownItem}>
          <span style={styles.breakdownDotBlue}></span>
          <span style={styles.breakdownLabel}>Lost Items logged:</span>
          <strong style={styles.breakdownValue}>{dashboardData?.itemBreakdown?.lost ?? 0}</strong>
        </div>
        <div style={styles.breakdownDivider}></div>
        <div style={styles.breakdownItem}>
          <span style={styles.breakdownDotGreen}></span>
          <span style={styles.breakdownLabel}>Found Items logged:</span>
          <strong style={styles.breakdownValue}>{dashboardData?.itemBreakdown?.found ?? 0}</strong>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    animation: 'fadeIn 0.5s ease-out',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
  pretitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#f43f5e',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: '4px 0 0 0',
    background: 'linear-gradient(to right, #ffffff, #9ca3af)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  filterLabel: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    fontWeight: '600',
  },
  select: {
    padding: '10px 16px',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  btnRefresh: {
    padding: '10px 18px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
  },
  kpiCard: {
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
    boxSizing: 'border-box',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  kpiTitle: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    fontWeight: '700',
  },
  kpiIconBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  kpiValue: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: '1.1',
    marginBottom: '8px',
  },
  kpiDesc: {
    fontSize: '0.82rem',
    color: '#6b7280',
    margin: '0',
    lineHeight: '1.4',
  },
  glowBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    opacity: 0.8,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  chartWrapper: {
    background: 'rgba(17, 24, 39, 0.45)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '24px',
    boxSizing: 'border-box',
  },
  chartHeader: {
    marginBottom: '20px',
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 4px 0',
  },
  chartSubtitle: {
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  chartContainer: {
    minHeight: '240px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    color: '#6b7280',
    fontSize: '0.9rem',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  skeletonContainer: {
    width: '100%',
    height: '240px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '8px',
    padding: '20px',
  },
  pulseBar: {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.01) 25%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.01) 75%)',
    backgroundSize: '200% 100%',
    animation: 'loading-pulse 1.5s infinite',
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
    border: '3px solid rgba(244, 63, 94, 0.15)',
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
    transition: 'background 0.2s ease',
  },
  footerBreakdown: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    flexWrap: 'wrap',
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breakdownDotBlue: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
  },
  breakdownDotGreen: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
  },
  breakdownLabel: {
    fontSize: '0.85rem',
    color: '#9ca3af',
  },
  breakdownValue: {
    fontSize: '0.9rem',
    color: '#ffffff',
  },
  breakdownDivider: {
    width: '1px',
    height: '16px',
    backgroundColor: 'rgba(255,255,255,0.1)',
  }
};

// Add raw CSS animations for loading states
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes loading-pulse {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleEl);
}

export default Analytics;
