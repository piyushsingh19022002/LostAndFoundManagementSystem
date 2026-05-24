import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import AnalyticsSkeleton from '../../components/ui/AnalyticsSkeleton';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiRefreshCw, FiAlertTriangle, FiUsers, FiPackage, FiFlag, FiTrendingUp } from 'react-icons/fi';
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
      setError(err.response?.data?.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, [range]);

  // Recharts tooltip style
  const tooltipStyle = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    fontSize: '12px',
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div>
            <p className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--accent-primary)] mb-1">// Executive Dashboard</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] uppercase">Business Intelligence</h1>
          </div>
        </div>
        <AnalyticsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="text-center p-10 max-w-sm border border-rose-500/20">
          <FiAlertTriangle className="text-rose-400 text-3xl mx-auto mb-4" />
          <h3 className="font-bold text-[var(--text-primary)] mb-2 uppercase text-sm">Analytics Failure</h3>
          <p className="text-xs text-rose-400 mb-6 font-mono">{error}</p>
          <Button variant="danger" onClick={fetchAllAnalytics} size="sm">Retry Fetch</Button>
        </Card>
      </div>
    );
  }

  const CLAIM_COLORS = {
    'Approved': '#10b981',
    'Pending': '#F59E0B',
    'Rejected': '#ef4444'
  };

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
      icon: FiUsers,
      colorClass: 'text-blue-400',
      bgClass: 'bg-blue-500/10 border-blue-500/20',
      desc: 'Registered accounts',
    },
    {
      title: 'Total Listings',
      value: dashboardData?.totalItems ?? 0,
      icon: FiPackage,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10 border-emerald-500/20',
      desc: 'Lost & Found database items',
    },
    {
      title: 'Active Reports',
      value: dashboardData?.activeReports ?? 0,
      icon: FiFlag,
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10 border-rose-500/20',
      desc: 'Pending or urgent flags',
    },
    {
      title: 'Claim Success Rate',
      value: `${dashboardData?.claimSuccessRate ?? 0}%`,
      icon: FiTrendingUp,
      colorClass: 'text-[var(--accent-primary)]',
      bgClass: 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20',
      desc: 'Approved vs total claims',
    },
  ];

  const rangeTabs = [
    { id: '7days', label: '7 Days' },
    { id: '30days', label: '30 Days' },
    { id: '12months', label: '12 Months' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--accent-primary)] mb-1">// Executive Dashboard</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] uppercase">Business Intelligence & Analytics</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Range Pill Tabs */}
          <div className="flex items-center gap-1 p-1 glass-panel rounded-full border border-border-subtle">
            {rangeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRange(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  range === tab.id
                    ? 'bg-[var(--accent-primary)] text-stone-950 shadow-[0_4px_12px_rgba(245,158,11,0.25)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={fetchAllAnalytics} className="flex items-center gap-2">
            <FiRefreshCw className="text-xs" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="flex flex-col gap-3 p-5 border border-border-subtle relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)]">{kpi.title}</span>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${kpi.bgClass}`}>
                  <Icon className={`text-sm ${kpi.colorClass}`} />
                </div>
              </div>
              <div className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">{kpi.value}</div>
              <p className="text-xs text-[var(--text-secondary)]">{kpi.desc}</p>
              {/* Bottom glow bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${kpi.colorClass} opacity-40`} style={{ background: 'currentColor' }} />
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Growth Chart - full width */}
        <Card className="lg:col-span-2 p-5 border border-border-subtle">
          <div className="mb-5">
            <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-primary)]">Platform Growth Trend</h3>
            <p className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">New registered signups over selected range</p>
          </div>
          <div className="min-h-[240px]">
            {loading ? (
              <div className="h-[240px] animate-pulse bg-slate-500/10 rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="New Users"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Claim Status Pie */}
        <Card className="p-5 border border-border-subtle">
          <div className="mb-5">
            <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-primary)]">Claim Status Distribution</h3>
            <p className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">Overview of claim approvals & lifecycle conversion</p>
          </div>
          <div className="min-h-[220px] flex items-center justify-center">
            {loading ? (
              <div className="h-[220px] w-full animate-pulse bg-slate-500/10 rounded-2xl" />
            ) : claimData?.summary?.total === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] italic">No claim requests submitted yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={claimData?.chartData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(claimData?.chartData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CLAIM_COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Moderation Bar Chart */}
        <Card className="p-5 border border-border-subtle">
          <div className="mb-5">
            <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-primary)]">Moderation & Safety Analytics</h3>
            <p className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">Distribution of content report statuses</p>
          </div>
          <div className="min-h-[220px] flex items-center justify-center">
            {loading ? (
              <div className="h-[220px] w-full animate-pulse bg-slate-500/10 rounded-2xl" />
            ) : moderationData?.summary?.total === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] italic">Clean slate! No flagged items or moderation reports.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={moderationData?.chartData || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" name="Reports" radius={[6, 6, 0, 0]}>
                    {(moderationData?.chartData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={REPORT_COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Footer Breakdown */}
      <div className="flex items-center justify-center gap-8 bg-slate-500/5 border border-border-subtle rounded-2xl px-6 py-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
          <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Lost Items logged:</span>
          <strong className="text-sm text-[var(--text-primary)]">{dashboardData?.itemBreakdown?.lost ?? 0}</strong>
        </div>
        <div className="w-px h-4 bg-border-subtle" />
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Found Items logged:</span>
          <strong className="text-sm text-[var(--text-primary)]">{dashboardData?.itemBreakdown?.found ?? 0}</strong>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
