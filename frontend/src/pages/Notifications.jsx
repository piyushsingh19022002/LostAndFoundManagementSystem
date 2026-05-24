import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notifications');
      setNotifications(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to retrieve notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  };

  const handleMarkAsRead = async (id, type) => {
    try {
      // Mark as read in backend
      await API.put(`/notifications/${id}/read`);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );

      // Route to correct page based on type
      if (type === 'claim_created') {
        navigate('/received-claims');
      } else if (type === 'claim_approved' || type === 'claim_rejected') {
        navigate('/my-claims');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'claim_created':
        return '📨';
      case 'claim_approved':
        return '🎉';
      case 'claim_rejected':
        return '❌';
      case 'system':
      default:
        return '⚙️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'claim_created':
        return '#61dafb'; // cyan
      case 'claim_approved':
        return '#34d399'; // green
      case 'claim_rejected':
        return '#f87171'; // red
      case 'system':
      default:
        return '#fbbf24'; // yellow
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
        <Loader size="50px" color="var(--accent-primary)" />
        <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Loading notifications...</p>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-16 transition-colors duration-300">
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        
        {/* Header Block */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] uppercase">Notification Center</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Keep track of updates, claims, and activity related to your items.
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
              Mark All as Read
            </Button>
          )}
        </div>

        {error && (
          <div className="flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 font-mono text-xs text-amber-500">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Content Body */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 px-6 bg-[var(--bg-card)] border border-dashed border-border-subtle rounded-3xl">
            <span className="text-4xl mb-4">🔔</span>
            <h3 className="text-lg font-bold mb-2">Your inbox is quiet</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
              You don't have any notifications at the moment. When claim requests are made on your items or claim status updates occur, they will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((notification) => {
              const icon = getNotificationIcon(notification.type);
              const color = getNotificationColor(notification.type);

              return (
                <Card
                  key={notification._id}
                  onClick={() => handleMarkAsRead(notification._id, notification.type)}
                  className={`flex gap-5 p-5 cursor-pointer relative items-start transition-all duration-300 ${
                    notification.isRead 
                      ? 'opacity-60 border-border-subtle' 
                      : 'border-[var(--accent-primary)]/45 hover:border-[var(--accent-primary)]/60 shadow-[0_4px_20px_var(--glow-color)]'
                  }`}
                >
                  {/* Left Icon and Status Dot */}
                  <div className="flex items-center relative h-fit pt-0.5">
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] absolute -left-6 top-1/2 -translate-y-1/2 animate-pulse" />
                    )}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-slate-950/20 border border-border-subtle">
                      {icon}
                    </div>
                  </div>

                  {/* Notification Content Details */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {notification.title}
                      </h3>
                      <span className="text-[9px] font-mono text-[var(--text-secondary)] uppercase tracking-wider">{formatRelativeTime(notification.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {notification.message}
                    </p>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors mt-1 block">
                      // Click to view details &rarr;
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Notifications;
