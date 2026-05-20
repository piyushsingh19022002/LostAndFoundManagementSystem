import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import FoundItemCard from '../components/FoundItemCard';

const FoundItems = () => {
  const [items, setItems]               = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all found items once on mount
  useEffect(() => {
    const fetchFoundItems = async () => {
      try {
        setLoading(true);
        const response = await API.get('/found-items');
        setItems(response.data);
        setFilteredItems(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load found items feed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFoundItems();
  }, []);

  // Client-side filter — runs whenever search or status filter changes
  useEffect(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((item) => item.status === statusFilter);
    }

    setFilteredItems(result);
  }, [searchQuery, statusFilter, items]);

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>🎁 Found Items</h1>
          <p style={styles.pageSubtitle}>
            Browse items that others have found — yours might be here
          </p>
        </div>
        <Link to="/add-found-item" style={styles.addBtn}>
          + Report Found Item
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div style={styles.controlsBar}>
        <input
          type="text"
          placeholder="Search by title, description, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Statuses</option>
          <option value="found">Found</option>
          <option value="claimed">Claimed</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <p style={styles.resultsCount}>
          {filteredItems.length} report{filteredItems.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Loading State */}
      {loading && (
        <div style={styles.loaderContainer}>
          <Loader size="48px" color="#10b981" />
          <p style={styles.loaderText}>Loading found items...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div style={styles.errorAlert}>
          <span>⚠️</span>
          <div>
            <h3 style={styles.alertTitle}>Failed to Load Feed</h3>
            <p style={styles.alertMsg}>{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredItems.length === 0 && (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📦</span>
          <h3 style={styles.emptyTitle}>No found items match your search</h3>
          <p style={styles.emptySubtitle}>Try adjusting your filters or be the first to report one!</p>
          <Link to="/add-found-item" style={styles.emptyBtn}>
            Report a Found Item
          </Link>
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && filteredItems.length > 0 && (
        <div style={styles.grid}>
          {filteredItems.map((item) => (
            <FoundItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '85vh',
    background: 'radial-gradient(circle at 70% 20%, #064e3b 0%, #111827 55%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    padding: '40px 32px',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: '6px 0 0',
  },
  addBtn: {
    display: 'inline-block',
    padding: '12px 24px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
  },
  controlsBar: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  searchInput: {
    flex: 1,
    minWidth: '260px',
    padding: '12px 18px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    color: '#ffffff',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
  },
  filterSelect: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  resultsCount: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '80px',
    gap: '16px',
  },
  loaderText: {
    color: '#9ca3af',
    fontSize: '0.95rem',
  },
  errorAlert: {
    display: 'flex',
    gap: '16px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '480px',
    fontSize: '1.5rem',
  },
  alertTitle: {
    margin: '0 0 6px',
    color: '#ef4444',
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  alertMsg: {
    margin: 0,
    color: '#e5e7eb',
    fontSize: '0.9rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '80px',
    gap: '12px',
    textAlign: 'center',
  },
  emptyIcon: { fontSize: '4rem' },
  emptyTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#e5e7eb',
    margin: 0,
  },
  emptySubtitle: {
    color: '#6b7280',
    fontSize: '0.95rem',
    margin: 0,
  },
  emptyBtn: {
    marginTop: '12px',
    padding: '12px 24px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '700',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
};

export default FoundItems;
