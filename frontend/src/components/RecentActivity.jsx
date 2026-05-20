import React from 'react';
import { Link } from 'react-router-dom';

/**
 * RecentActivity — Activity list displaying the user's latest reports.
 *
 * Props:
 *   lostItems: Array of user's lost reports
 *   foundItems: Array of user's found reports
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
          const badgeColor = isLost ? '#61dafb' : '#34d399';
          const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={item._id} style={styles.activityItem}>
              <div style={styles.left}>
                <span style={{ ...styles.badge, backgroundColor: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}33` }}>
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
    backgroundColor: 'rgba(31, 41, 55, 0.65)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
  },
  heading: {
    margin: '0 0 16px 0',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.01em',
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
    borderRadius: '10px',
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background-color 0.2s ease',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '50px',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  itemTitle: {
    color: '#f3f4f6',
    fontWeight: '600',
    fontSize: '0.92rem',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
    cursor: 'pointer',
    ':hover': {
      color: '#61dafb',
    }
  },
  location: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
  },
  date: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  emptyState: {
    backgroundColor: 'rgba(31, 41, 55, 0.65)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '40px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '10px',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    margin: 0,
  }
};

export default RecentActivity;
