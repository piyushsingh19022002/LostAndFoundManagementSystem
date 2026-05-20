import React from 'react';

/**
 * ProfileSection — Profile metadata component.
 *
 * Props:
 *   user: User object containing name, email, role.
 */
const ProfileSection = ({ user }) => {
  if (!user) return null;

  return (
    <div style={styles.container}>
      <div style={styles.avatar}>
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div style={styles.info}>
        <h3 style={styles.name}>{user.name}</h3>
        <p style={styles.email}>📧 {user.email}</p>
        <div style={styles.roleContainer}>
          <span style={styles.badgeLabel}>Account Level:</span>
          <span style={styles.roleBadge}>{user.role || 'User'}</span>
        </div>
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
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    width: '100%',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #61dafb 0%, #3b82f6 100%)',
    color: '#111827',
    fontSize: '1.8rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  name: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  email: {
    margin: 0,
    fontSize: '0.88rem',
    color: '#9ca3af',
  },
  roleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  badgeLabel: {
    fontSize: '0.78rem',
    color: '#6b7280',
  },
  roleBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: '700',
    backgroundColor: 'rgba(97, 218, 251, 0.12)',
    color: '#61dafb',
    border: '1px solid rgba(97, 218, 251, 0.25)',
    textTransform: 'uppercase',
  }
};

export default ProfileSection;
