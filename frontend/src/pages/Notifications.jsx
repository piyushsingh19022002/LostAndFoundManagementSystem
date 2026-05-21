import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';

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
      <div style={styles.loaderContainer}>
        <Loader size="50px" color="#61dafb" />
        <p style={styles.loaderText}>Loading notifications...</p>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* Header Block */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.titleText}>Notification Center</h1>
            <p style={styles.subtitleText}>
              Keep track of updates, claims, and activity related to your items.
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <button onClick={handleMarkAllAsRead} style={styles.markAllBtn}>
              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.alertIcon}>⚠️</span>
            <span style={styles.alertText}>{error}</span>
          </div>
        )}

        {/* Content Body */}
        {notifications.length === 0 ? (
          <div style={styles.nullCard}>
            <span style={styles.nullIcon}>🔔</span>
            <h3 style={styles.nullTitle}>Your inbox is quiet</h3>
            <p style={styles.nullMessage}>
              You don't have any notifications at the moment. When claim requests are made on your items or claim status updates occur, they will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {notifications.map((notification) => {
              const icon = getNotificationIcon(notification.type);
              const color = getNotificationColor(notification.type);

              return (
                <div
                  key={notification._id}
                  onClick={() => handleMarkAsRead(notification._id, notification.type)}
                  style={{
                    ...styles.card,
                    backgroundColor: notification.isRead ? 'rgba(31, 41, 55, 0.4)' : 'rgba(31, 41, 55, 0.75)',
                    borderColor: notification.isRead ? 'rgba(255, 255, 255, 0.05)' : 'rgba(97, 218, 251, 0.25)',
                    opacity: notification.isRead ? 0.7 : 1,
                  }}
                >
                  {/* Left Icon and Status Dot */}
                  <div style={styles.iconAndDot}>
                    {!notification.isRead && <span style={styles.unreadDot} />}
                    <div style={{ ...styles.iconWrapper, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                      <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                    </div>
                  </div>

                  {/* Notification Content Details */}
                  <div style={styles.details}>
                    <div style={styles.cardHeader}>
                      <h3 style={{ ...styles.cardTitle, color: notification.isRead ? '#d1d5db' : '#ffffff' }}>
                        {notification.title}
                      </h3>
                      <span style={styles.timeText}>{formatRelativeTime(notification.createdAt)}</span>
                    </div>
                    <p style={{ ...styles.cardMessage, color: notification.isRead ? '#9ca3af' : '#e5e7eb' }}>
                      {notification.message}
                    </p>
                    <span style={styles.actionPrompt}>
                      Click to view details &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '85vh',
    background: 'radial-gradient(circle at center, #1f2937 0%, #111827 100%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  wrapper: {
    maxWidth: '800px',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '32px',
  },
  headerLeft: {
    flex: 1,
    minWidth: '250px',
  },
  titleText: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 8px 0',
    letterSpacing: '-0.02em',
  },
  subtitleText: {
    fontSize: '0.95rem',
    color: '#9ca3af',
    margin: 0,
  },
  markAllBtn: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  alertIcon: {
    fontSize: '1.2rem',
  },
  alertText: {
    fontSize: '0.95rem',
    color: '#f3f4f6',
    fontWeight: '500',
  },
  nullCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '60px 40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
  nullIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  nullTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 12px 0',
  },
  nullMessage: {
    fontSize: '1rem',
    color: '#9ca3af',
    maxWidth: '500px',
    lineHeight: '1.6',
    margin: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    display: 'flex',
    gap: '20px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  iconAndDot: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    height: 'fit-content',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    position: 'absolute',
    left: '-12px',
    top: 'calc(50% - 4px)',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: 0,
  },
  timeText: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    whiteSpace: 'nowrap',
  },
  cardMessage: {
    fontSize: '0.95rem',
    lineHeight: '1.5',
    margin: 0,
  },
  actionPrompt: {
    fontSize: '0.8rem',
    color: '#61dafb',
    fontWeight: '600',
    marginTop: '4px',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '85vh',
    background: 'radial-gradient(circle at center, #1f2937 0%, #111827 100%)',
  },
  loaderText: {
    marginTop: '16px',
    color: '#9ca3af',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
};

export default Notifications;
