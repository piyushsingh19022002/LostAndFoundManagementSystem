import React from 'react';

/**
 * ItemManagementCard — Premium card component for managing user reports.
 *
 * Props:
 *   item: The item document (either Lost or Found)
 *   onEdit: Callback function to edit the item
 *   onDelete: Callback function to delete the item
 */
const ItemManagementCard = ({ item, onEdit, onDelete }) => {
  const isLost = item.category !== 'Found';
  const badgeColor = isLost ? '#F59E0B' : '#10B981';
  const dateStr = new Date(isLost ? item.date : item.dateFound).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div style={styles.card}>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} style={styles.image} />
      ) : (
        <div style={{ ...styles.placeholderImage, backgroundColor: isLost ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)' }}>
          {isLost ? '🎒' : '🔑'}
        </div>
      )}
      <div style={styles.content}>
        <div style={styles.header}>
          <span style={{ ...styles.badge, backgroundColor: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}30` }}>
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>
          <span style={{ 
            ...styles.statusBadge, 
            backgroundColor: item.status === 'lost' || item.status === 'found' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: item.status === 'lost' || item.status === 'found' ? '#f87171' : '#10b981'
          }}>
            {item.status.toUpperCase()}
          </span>
        </div>
        
        <h4 style={styles.title}>{item.title}</h4>
        <p style={styles.desc}>{item.description.slice(0, 120)}{item.description.length > 120 ? '...' : ''}</p>
        
        <div style={styles.footer}>
          <span style={styles.meta}>📍 {item.location}</span>
          <span style={styles.meta}>📅 {dateStr}</span>
        </div>
        
        <div style={styles.actions}>
          <button onClick={() => onEdit(item)} style={styles.btnEdit}>
            ✏️ Edit
          </button>
          <button onClick={() => onDelete(item)} style={styles.btnDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    height: '100%',
    boxShadow: 'var(--shadow-sm)',
  },
  image: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
  },
  content: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '0.65rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  statusBadge: {
    padding: '2px 10px',
    borderRadius: '9999px',
    fontSize: '0.62rem',
    fontWeight: '750',
    letterSpacing: '0.05em',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  desc: {
    margin: 0,
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    flex: 1,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '12px',
    marginTop: '4px',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
  },
  btnEdit: {
    flex: 1,
    padding: '8px 16px',
    borderRadius: '9999px',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  btnDelete: {
    flex: 1,
    padding: '8px 16px',
    borderRadius: '9999px',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    color: '#ef4444',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  }
};

export default ItemManagementCard;
