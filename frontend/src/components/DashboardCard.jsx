import React from 'react';

/**
 * DashboardCard — Premium stat card for the SaaS dashboard.
 *
 * Props:
 *   title: The label of the card (e.g., "Total Lost Reports")
 *   value: The numeric metric to display
 *   icon: Emoji or element representing the stat
 *   description: A sub-text descriptor
 *   accentColor: Border/shadow/text highlights
 */
const DashboardCard = ({ title, value, icon, description, accentColor = '#61dafb' }) => {
  return (
    <div style={{
      ...styles.card,
      borderColor: `${accentColor}33`, // 20% opacity
      boxShadow: `0 4px 20px rgba(0, 0, 0, 0.25), 0 0 15px ${accentColor}11`,
    }}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        <span style={{ ...styles.icon, backgroundColor: `${accentColor}1a`, color: accentColor }}>
          {icon}
        </span>
      </div>
      <div style={{ ...styles.value, color: '#ffffff' }}>{value}</div>
      {description && <div style={styles.desc}>{description}</div>}
    </div>
  );
};

const styles = {
  card: {
    flex: 1,
    minWidth: '220px',
    backgroundColor: 'rgba(31, 41, 55, 0.65)',
    backdropFilter: 'blur(12px)',
    border: '1px solid',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#9ca3af',
    fontWeight: '600',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    fontSize: '1.2rem',
  },
  value: {
    fontSize: '2.25rem',
    fontWeight: '800',
    lineHeight: 1,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  desc: {
    fontSize: '0.78rem',
    color: '#6b7280',
  }
};

export default DashboardCard;
