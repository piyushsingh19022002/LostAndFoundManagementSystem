import React from 'react';

/**
 * DashboardCard — Premium stat card for the SaaS dashboard.
 */
const DashboardCard = ({ title, value, icon, description, accentColor = '#F59E0B' }) => {
  return (
    <div style={{
      ...styles.card,
      borderColor: 'var(--border-subtle)',
      boxShadow: `0 8px 32px rgba(0, 0, 0, 0.02), 0 0 1px ${accentColor}30`,
    }}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        <span style={{ ...styles.icon, backgroundColor: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}20` }}>
          {icon}
        </span>
      </div>
      <div style={{ ...styles.value, color: 'var(--text-primary)' }}>{value}</div>
      {description && <div style={styles.desc}>{description}</div>}
    </div>
  );
};

const styles = {
  card: {
    flex: 1,
    minWidth: '220px',
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '24px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    fontSize: '1rem',
  },
  value: {
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: 1,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '-0.02em',
  },
  desc: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    fontFamily: "'Space Grotesk', sans-serif",
  }
};

export default DashboardCard;
