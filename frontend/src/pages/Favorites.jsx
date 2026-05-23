import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ItemCard from '../components/ItemCard';
import FoundItemCard from '../components/FoundItemCard';
import Loader from '../components/Loader';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/favorites');
      setFavorites(res.data || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.response?.data?.message || 'Failed to load bookmarked items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFromGrid = (itemId) => {
    // Instantly filter out the unfavorited item from state to provide reactive UI updates
    setFavorites((prev) => prev.filter((fav) => fav.item?._id !== itemId));
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader size="50px" color="#f43f5e" />
        <p style={{ marginTop: '16px', color: '#9ca3af' }}>Opening your saved bookmarks...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* Header Section */}
        <header style={styles.header}>
          <div>
            <span style={styles.pretitle}>Personal Dashboard</span>
            <h1 style={styles.title}>Bookmarked Listings</h1>
            <p style={styles.subtitle}>
              Keep track of reported items you are watching or claiming.
            </p>
          </div>
          {favorites.length > 0 && (
            <div style={styles.countBadge}>
              {favorites.length} Saved Item{favorites.length !== 1 ? 's' : ''}
            </div>
          )}
        </header>

        {/* Global Error Banner */}
        {error && (
          <div style={styles.errorAlert}>
            <span>⚠️</span>
            <div>
              <h3 style={styles.alertTitle}>Load Error</h3>
              <p style={styles.alertMsg}>{error}</p>
              <button onClick={fetchFavorites} style={styles.retryBtn}>Retry</button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && favorites.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIconWrapper}>
              <span style={styles.emptyIcon}>❤️</span>
            </div>
            <h2 style={styles.emptyTitle}>Your Bookmarks Shelf is Empty</h2>
            <p style={styles.emptyText}>
              Bookmark items while searching to revisit them quickly. You can save both lost reports and found listings.
            </p>
            <div style={styles.ctaRow}>
              <Link to="/lost-items" style={styles.btnLost}>
                🔍 Browse Lost Items
              </Link>
              <Link to="/found-items" style={styles.btnFound}>
                🎁 Browse Found Items
              </Link>
            </div>
          </div>
        ) : (
          /* Favorites Grid */
          <div style={styles.grid}>
            {favorites.map((fav) => {
              const item = fav.item;
              if (!item) return null;

              if (fav.itemModel === 'Item') {
                return (
                  <ItemCard
                    key={fav._id}
                    item={item}
                    isFavorited={true}
                    onBookmarkToggle={handleRemoveFromGrid}
                  />
                );
              } else {
                return (
                  <FoundItemCard
                    key={fav._id}
                    item={item}
                    isFavorited={true}
                    onBookmarkToggle={handleRemoveFromGrid}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '85vh',
    background: 'radial-gradient(circle at 80% 20%, #1f2937 0%, #111827 100%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  wrapper: {
    maxWidth: '1200px',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '35px',
    gap: '20px',
    flexWrap: 'wrap',
  },
  pretitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#f43f5e',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: '800',
    margin: '4px 0 8px 0',
    background: 'linear-gradient(to right, #ffffff, #9ca3af)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#9ca3af',
    margin: 0,
  },
  countBadge: {
    padding: '8px 16px',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    border: '1px solid rgba(244, 63, 94, 0.25)',
    borderRadius: '20px',
    color: '#f43f5e',
    fontSize: '0.85rem',
    fontWeight: '700',
    alignSelf: 'center',
    boxShadow: '0 4px 15px rgba(244, 63, 94, 0.08)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px',
    animation: 'fadeIn 0.5s ease-out',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    background: 'radial-gradient(circle at 80% 20%, #1f2937 0%, #111827 100%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  errorAlert: {
    display: 'flex',
    gap: '16px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.18)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '30px',
    color: '#e5e7eb',
  },
  alertTitle: {
    margin: '0 0 4px 0',
    color: '#ef4444',
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  alertMsg: {
    margin: '0 0 16px 0',
    fontSize: '0.9rem',
    color: '#d1d5db',
  },
  retryBtn: {
    padding: '6px 16px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
    maxWidth: '600px',
    margin: '40px auto 0 auto',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.25)',
  },
  emptyIconWrapper: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px auto',
  },
  emptyIcon: {
    fontSize: '2.2rem',
  },
  emptyTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 10px 0',
  },
  emptyText: {
    fontSize: '0.95rem',
    color: '#9ca3af',
    lineHeight: '1.6',
    margin: '0 0 30px 0',
  },
  ctaRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnLost: {
    padding: '12px 24px',
    borderRadius: '8px',
    backgroundColor: '#61dafb',
    color: '#0b1329',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '700',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 15px rgba(97, 218, 251, 0.2)',
  },
  btnFound: {
    padding: '12px 24px',
    borderRadius: '8px',
    backgroundColor: '#34d399',
    color: '#064e3b',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '700',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 15px rgba(52, 211, 153, 0.2)',
  },
};

export default Favorites;
