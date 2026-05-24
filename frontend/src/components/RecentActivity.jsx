import React from 'react';
import { Link } from 'react-router-dom';

/**
 * RecentActivity — Activity list displaying the user's latest reports.
 */
const RecentActivity = ({ lostItems = [], foundItems = [] }) => {
  // Combine and sort by createdAt
  const activities = [
    ...lostItems.map(item => ({ ...item, type: 'Lost' })),
    ...foundItems.map(item => ({ ...item, type: 'Found' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
   .slice(0, 5); // Display top 5 recent activities

  if (activities.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>⏰</span>
        <p style={styles.emptyText}>No recent activity yet. Your reports will appear here.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Recent Activity</h3>
      <div style={styles.list}>
        {activities.map((item) => {
          const isLost = item.type === 'Lost';
          const detailsPath = isLost ? `/lost-items/${item._id}` : `/found-items/${item._id}`;
          const badgeColor = isLost ? 'var(--accent-primary)' : 'var(--color-emerald-550)';
          const badgeBg = isLost ? 'var(--bg-secondary)' : 'rgba(16, 185, 129, 0.05)';
          const badgeBorder = isLost ? 'var(--border-subtle)' : 'rgba(16, 185, 129, 0.15)';
          const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={item._id} style={styles.activityItem}>
              <div style={styles.left}>
                <span style={{ ...styles.badge, backgroundColor: badgeBg, color: badgeColor, borderColor: badgeBorder }}>
                  {item.type}
                </span>
                <div style={styles.textContainer}>
                  <Link to={detailsPath} style={styles.itemTitle}>{item.title}</Link>
                  <span style={styles.location}>📍 {item.location}</span>
                </div>
              </div>
              <div style={styles.right}>
                <span style={styles.date}>{dateStr}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '20px',
    padding: '24px',
    width: '100%',
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
  },
  heading: {
    margin: '0 0 16px 0',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    transition: 'all 0.3s ease',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badge: {
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '0.62rem',
    fontWeight: '750',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: "'JetBrains Mono', monospace",
    border: '1px solid',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemTitle: {
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '0.88rem',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
    cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  location: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
  },
  date: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    fontFamily: "'JetBrains Mono', monospace",
  },
  emptyState: {
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '20px',
    padding: '40px 24px',
    textAlign: 'center',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  emptyIcon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '10px',
  },
  emptyText: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    margin: 0,
  }
};

export default RecentActivity;
