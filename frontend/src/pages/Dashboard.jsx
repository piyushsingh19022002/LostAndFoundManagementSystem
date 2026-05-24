import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import DashboardCard from '../components/DashboardCard';
import RecentActivity from '../components/RecentActivity';
import ProfileSection from '../components/ProfileSection';
import AnalyticsSkeleton from '../components/ui/AnalyticsSkeleton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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
      <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-16 overflow-hidden font-sans transition-colors duration-300">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Workspace Dashboard</h1>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest mt-1.5">// Assembling your personalized workspace...</p>
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
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-16 overflow-hidden font-sans transition-colors duration-300">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Workspace Dashboard</h1>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest mt-1.5">
              // Manage your reported lost and found items in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/add-lost-item" className="no-underline">
              <Button variant="primary" size="sm">Report Lost Item</Button>
            </Link>
            <Link to="/add-found-item" className="no-underline">
              <Button variant="secondary" size="sm">Report Found Item</Button>
            </Link>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex justify-between items-center bg-amber-500/5 border border-amber-500/25 text-amber-500 p-4 rounded-xl text-xs font-mono">
            <span>⚠️ {error}</span>
            <button onClick={fetchDashboardData} className="bg-amber-500 text-stone-950 border-none px-3 py-1.5 rounded-lg cursor-pointer font-bold">Retry</button>
          </div>
        )}

        {/* Action Feedbacks */}
        {actionMessage.text && (
          <div className={`border p-4 rounded-xl text-xs font-mono ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
          }`}>
            {actionMessage.text}
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex gap-2 p-1.5 bg-slate-950/20 border border-border-subtle rounded-full w-fit max-w-full overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-5 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('lost')} 
            className={`px-5 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'lost'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            My Lost Reports ({myLostItems.length})
          </button>
          <button 
            onClick={() => setActiveTab('found')} 
            className={`px-5 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'found'
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            My Found Reports ({myFoundItems.length})
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            {/* Statistics Cards */}
            <div className="flex flex-wrap gap-5">
              <DashboardCard 
                title="Lost Items Reported" 
                value={stats?.totalLostItems || 0} 
                icon="🎒" 
                description="Items you are looking for"
                accentColor="var(--accent-primary)"
              />
              <DashboardCard 
                title="Found Items Reported" 
                value={stats?.totalFoundItems || 0} 
                icon="🔑" 
                description="Items you recovered or found"
                accentColor="var(--accent-primary)"
              />
              <DashboardCard 
                title="Total Submissions" 
                value={(stats?.totalLostItems || 0) + (stats?.totalFoundItems || 0)} 
                icon="📊" 
                description="Overall platform contributions"
                accentColor="var(--accent-primary)"
              />
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 flex flex-col gap-8">
                <RecentActivity 
                  lostItems={stats?.recentLostItems || []} 
                  foundItems={stats?.recentFoundItems || []} 
                />
              </div>
              <div className="flex flex-col gap-8">
                <ProfileSection user={user} />
                <Card className="p-6">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 font-mono">// Quick Navigation</h4>
                  <div className="flex flex-col gap-3 font-mono">
                    <Link to="/lost-items" className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border-subtle hover:border-[var(--accent-primary)]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-900/10 transition-all duration-300 text-[10px] uppercase tracking-wider no-underline">
                      🌐 Public Lost Feed
                    </Link>
                    <Link to="/found-items" className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border-subtle hover:border-[var(--accent-primary)]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-900/10 transition-all duration-300 text-[10px] uppercase tracking-wider no-underline">
                      🌐 Public Found Feed
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lost' && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              {myLostItems.length === 0 ? (
                <div className="flex flex-col items-center text-center py-20 px-6 bg-[var(--bg-card)] border border-dashed border-border-subtle rounded-3xl">
                  <span className="text-4xl mb-4">🎒</span>
                  <h3 className="text-lg font-bold mb-2">No Lost Reports Yet</h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-sm">Have you misplaced an item? Report it so others can assist in locating it.</p>
                  <Link to="/add-lost-item" className="no-underline">
                    <Button variant="primary">Report Lost Item</Button>
                  </Link>
                </div>
              ) : (
                myLostItems.map(item => (
                  <div key={item._id} className="flex flex-wrap items-center justify-between p-5 bg-[var(--bg-card)] border border-border-subtle rounded-2xl gap-5 transition-all duration-300">
                    <div className="flex items-center gap-4 min-w-[280px]">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-xl object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl bg-slate-950/20 border border-border-subtle">🎒</div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">{item.title}</h4>
                        <p className="text-xs text-[var(--text-secondary)] mb-2 leading-relaxed max-w-md">{item.description.slice(0, 100)}{item.description.length > 100 ? '...' : ''}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">
                          <span>📍 {item.location}</span>
                          <span>•</span>
                          <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono ${
                            item.status === 'lost' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/15' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 font-mono">
                      <Link to={`/lost-items/${item._id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteLostItem(item._id)}>Delete</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'found' && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              {myFoundItems.length === 0 ? (
                <div className="flex flex-col items-center text-center py-20 px-6 bg-[var(--bg-card)] border border-dashed border-border-subtle rounded-3xl">
                  <span className="text-4xl mb-4">🔑</span>
                  <h3 className="text-lg font-bold mb-2">No Found Reports Yet</h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-sm">Found someone's property? List it here to help reunite it with its owner.</p>
                  <Link to="/add-found-item" className="no-underline">
                    <Button variant="secondary">Report Found Item</Button>
                  </Link>
                </div>
              ) : (
                myFoundItems.map(item => (
                  <div key={item._id} className="flex flex-wrap items-center justify-between p-5 bg-[var(--bg-card)] border border-border-subtle rounded-2xl gap-5 transition-all duration-300">
                    <div className="flex items-center gap-4 min-w-[280px]">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-xl object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl bg-slate-950/20 border border-border-subtle">🔑</div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">{item.title}</h4>
                        <p className="text-xs text-[var(--text-secondary)] mb-2 leading-relaxed max-w-md">{item.description.slice(0, 100)}{item.description.length > 100 ? '...' : ''}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">
                          <span>📍 {item.location}</span>
                          <span>•</span>
                          <span>📅 {new Date(item.dateFound).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono ${
                            item.status === 'found' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15' : 'bg-purple-500/10 text-purple-400 border border-purple-500/15'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 font-mono">
                      <Link to={`/found-items/${item._id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteFoundItem(item._id)}>Delete</Button>
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

export default Dashboard;
