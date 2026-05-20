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
  const badgeColor = isLost ? '#61dafb' : '#34d399';
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
        <div style={{ ...styles.placeholderImage, backgroundColor: isLost ? 'rgba(97, 218, 251, 0.05)' : 'rgba(52, 211, 153, 0.05)' }}>
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
            backgroundColor: item.status === 'lost' || item.status === 'found' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(52, 211, 153, 0.12)',
            color: item.status === 'lost' || item.status === 'found' ? '#f87171' : '#34d399'
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
    backgroundColor: 'rgba(31, 41, 55, 0.55)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease',
    height: '100%',
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
    padding: '4px 10px',
    borderRadius: '50px',
    fontSize: '0.72rem',
    fontWeight: '700',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.02em',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  desc: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: 1.5,
    flex: 1,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    color: '#64748b',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
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
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#f8fafc',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'center',
  },
  btnDelete: {
    flex: 1,
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'center',
  }
};

export default ItemManagementCard;
