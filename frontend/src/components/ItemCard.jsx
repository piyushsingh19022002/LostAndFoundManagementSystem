import React from 'react';
import { Link } from 'react-router-dom';
import BookmarkButton from './BookmarkButton';

const ItemCard = ({ item, isFavorited = false, onBookmarkToggle }) => {
  const isLost = item.category === 'Lost';
  const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={styles.card}>
      {/* Bookmark Button */}
      <div style={styles.bookmarkWrapper}>
        <BookmarkButton
          itemId={item._id}
          itemModel="Item"
          initialIsFavorited={isFavorited}
          onToggle={onBookmarkToggle}
        />
      </div>

      {/* Category Badge */}
      <div style={styles.badgeContainer}>
        <span style={{
          ...styles.badge,
          backgroundColor: isLost ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
          color: isLost ? '#f87171' : '#34d399',
          border: `1px solid ${isLost ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
        }}>
          {item.category}
        </span>
        <span style={styles.dateBadge}>{formattedDate}</span>
      </div>

      {/* Image Preview or Dynamic Placeholder */}
      <div style={styles.imageSection}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} style={styles.image} loading="lazy" />
        ) : (
          <div style={styles.imagePlaceholder}>
            <span style={styles.placeholderIcon}>{isLost ? '🔍' : '🎁'}</span>
            <span style={styles.placeholderText}>No Image Provided</span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div style={styles.detailsContent}>
        <h3 style={styles.title}>{item.title}</h3>
        <p style={styles.description}>{item.description}</p>
        
        <div style={styles.metadataGrid}>
          <div style={styles.metaItem}>
            <span style={styles.metaIcon}>📍</span>
            <span style={styles.metaText}>{item.location}</span>
          </div>
          {item.user && (
            <div style={styles.metaItem}>
              <span style={styles.metaIcon}>👤</span>
              <span style={styles.metaText} title={item.user.email}>
                {item.user.name || 'Anonymous'}
              </span>
            </div>
          )}
        </div>

        {/* View Details Link */}
        <Link to={`/lost-items/${item._id}`} style={styles.actionBtn}>
          View Full Details
        </Link>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    height: '100%',
    position: 'relative',
  },
  bookmarkWrapper: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 15,
  },
  badgeContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    pointerEvents: 'none',
  },
  badge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backdropFilter: 'blur(8px)',
  },
  dateBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    color: '#e5e7eb',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  imageSection: {
    position: 'relative',
    width: '100%',
    height: '200px',
    backgroundColor: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  imagePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  placeholderIcon: {
    fontSize: '2.5rem',
  },
  placeholderText: {
    fontSize: '0.8rem',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailsContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 10px 0',
    lineHeight: '1.4',
  },
  description: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    margin: '0 0 20px 0',
    lineHeight: '1.6',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    height: '4.8em', // Ensures consistent heights for flex grid alignment
  },
  metadataGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '24px',
    marginTop: 'auto', // Pushes metadata to bottom of variable description heights
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  metaIcon: {
    fontSize: '1rem',
  },
  metaText: {
    fontSize: '0.85rem',
    color: '#d1d5db',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actionBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '700',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'background-color 0.2s, border-color 0.2s',
  }
};

export default ItemCard;
