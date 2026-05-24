import React from 'react';

/**
 * ProfileSection — Profile metadata component.
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
        <p style={styles.email}>// {user.email}</p>
        <div style={styles.roleContainer}>
          <span style={styles.badgeLabel}>Access Level:</span>
          <span style={styles.roleBadge}>{user.role || 'User'}</span>
        </div>
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
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    width: '100%',
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '1.5rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace",
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  name: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  email: {
    margin: 0,
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontFamily: "'JetBrains Mono', monospace",
  },
  roleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  badgeLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
  },
  roleBadge: {
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '0.62rem',
    fontWeight: '750',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)',
    textTransform: 'uppercase',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.05em',
  }
};

export default ProfileSection;
