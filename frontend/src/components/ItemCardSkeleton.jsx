import React from 'react';

const ItemCardSkeleton = () => {
  return (
    <div style={styles.card}>
      {/* Shimmer effect overlay */}
      <div style={styles.shimmerWrapper}>
        <div style={styles.shimmer}></div>
      </div>
      
      {/* Floating Badges */}
      <div style={styles.badgeContainer}>
        <div style={styles.badgePlaceholder}></div>
        <div style={styles.datePlaceholder}></div>
      </div>

      {/* Image section placeholder */}
      <div style={styles.imagePlaceholder}></div>

      {/* Details content placeholders */}
      <div style={styles.content}>
        <div style={styles.titlePlaceholder}></div>
        <div style={styles.linePlaceholder}></div>
        <div style={styles.linePlaceholderShort}></div>
        
        <div style={styles.metadataGrid}>
          <div style={styles.metaItem}>
            <div style={styles.iconPlaceholder}></div>
            <div style={styles.textPlaceholder}></div>
          </div>
          <div style={styles.metaItem}>
            <div style={styles.iconPlaceholder}></div>
            <div style={styles.textPlaceholder}></div>
          </div>
        </div>

        <div style={styles.btnPlaceholder}></div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    minHeight: '410px',
  },
  shimmerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.06), transparent)',
    animation: 'shimmer 1.5s infinite',
  },
  badgeContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  badgePlaceholder: {
    width: '70px',
    height: '24px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  datePlaceholder: {
    width: '90px',
    height: '24px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  imagePlaceholder: {
    width: '100%',
    height: '200px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  content: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '12px',
  },
  titlePlaceholder: {
    width: '70%',
    height: '20px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: '10px',
  },
  linePlaceholder: {
    width: '100%',
    height: '12px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  linePlaceholderShort: {
    width: '85%',
    height: '12px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: '15px',
  },
  metadataGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: 'auto',
    marginBottom: '20px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconPlaceholder: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  textPlaceholder: {
    width: '40%',
    height: '12px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  btnPlaceholder: {
    width: '100%',
    height: '42px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
};

export default ItemCardSkeleton;
