import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FiUsers, FiPackage, FiSearch, FiMessageSquare, FiRefreshCw, FiAlertTriangle, FiArrowRight, FiShield, FiActivity } from 'react-icons/fi';

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] animate-spin" />
        <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">// Gathering platform intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="text-center p-10 max-w-sm border border-rose-500/20">
          <FiAlertTriangle className="text-rose-400 text-3xl mx-auto mb-4" />
          <h3 className="font-bold text-[var(--text-primary)] mb-2 uppercase text-sm">Error Loading Dashboard</h3>
          <p className="text-xs text-rose-400 mb-6 font-mono">{error}</p>
          <Button variant="danger" onClick={fetchAnalytics} size="sm">Retry</Button>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers ?? 0,
      icon: FiUsers,
      colorClass: 'text-blue-400',
      bgClass: 'bg-blue-500/10 border-blue-500/20',
      desc: 'Active accounts on the platform',
      link: '/admin/users',
    },
    {
      title: 'Lost Item Reports',
      value: analytics?.totalLostItems ?? 0,
      icon: FiPackage,
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10 border-rose-500/20',
      desc: 'Items reported missing by users',
      link: '/admin/items',
    },
    {
      title: 'Found Item Listings',
      value: analytics?.totalFoundItems ?? 0,
      icon: FiSearch,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10 border-emerald-500/20',
      desc: 'Recovered items awaiting claims',
      link: '/admin/items',
    },
    {
      title: 'Claim Requests',
      value: analytics?.totalClaims ?? 0,
      icon: FiMessageSquare,
      colorClass: 'text-[var(--accent-primary)]',
      bgClass: 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20',
      desc: 'Submitted claims for item returns',
      link: '/admin',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--accent-primary)] mb-1">// SaaS Platform Control Room</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] uppercase">System Analytics</h1>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchAnalytics} className="flex items-center gap-2">
          <FiRefreshCw className="text-xs" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="flex flex-col gap-4 p-5 border border-border-subtle hover:scale-[1.01] transition-premium cursor-pointer" onClick={() => navigate(card.link)}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)]">{card.title}</span>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${card.bgClass}`}>
                  <Icon className={`text-sm ${card.colorClass}`} />
                </div>
              </div>
              <div className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">{card.value}</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{card.desc}</p>
              <Link
                to={card.link}
                className={`flex items-center gap-1 text-[10px] font-bold font-mono uppercase tracking-widest ${card.colorClass} hover:underline`}
                onClick={(e) => e.stopPropagation()}
              >
                Manage Details
                <FiArrowRight className="text-xs" />
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)] mb-4">// Administrative Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="flex items-start gap-4 p-5 border border-border-subtle cursor-pointer hover:border-[var(--accent-primary)]/30 transition-premium"
            onClick={() => navigate('/admin/users')}
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <FiUsers className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase mb-1">User Operations</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Manage accounts, update authorization roles, or delete problematic users.</p>
            </div>
          </Card>

          <Card
            className="flex items-start gap-4 p-5 border border-border-subtle cursor-pointer hover:border-[var(--accent-primary)]/30 transition-premium"
            onClick={() => navigate('/admin/items')}
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
              <FiShield className="text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase mb-1">Moderation Center</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Review and moderate user posts, delete spam, duplicate, or abusive entries.</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Platform Status Footer */}
      <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl px-5 py-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse flex-shrink-0" />
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Platform Operational</span>
          <p className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">Role-Based Access Control (RBAC) active. Secure logging of administrative events enabled.</p>
        </div>
        <FiActivity className="text-emerald-400 ml-auto flex-shrink-0" />
      </div>
    </div>
  );
};

export default AdminDashboard;
