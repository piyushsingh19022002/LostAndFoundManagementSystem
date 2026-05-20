import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import FoundItemCard from '../components/FoundItemCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { FOUND_ITEM_STATUSES, FOUND_STATUS_OPTIONS } from '../constants/categories';

const FoundItems = () => {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Filter states — each drives the backend query params
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [location, setLocation] = useState('');

  const debounceRef = useRef(null);

  // Fetch found items with optional server-side filters
  const fetchFoundItems = useCallback(async (searchVal, statusVal, locationVal) => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (searchVal.trim())                 params.search   = searchVal.trim();
      if (statusVal && statusVal !== 'all') params.status   = statusVal;
      if (locationVal.trim())               params.location = locationVal.trim();

      const response = await API.get('/found-items', { params });
      setItems(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load found items feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 400 ms debounce — batches rapid filter changes into a single API call
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchFoundItems(search, status, location);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, status, location, fetchFoundItems]);

  const hasActiveFilters = search.trim() !== '' || status !== 'all' || location.trim() !== '';

  const handleClear = () => {
    setSearch('');
    setStatus('all');
    setLocation('');
  };

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

      {/* Reusable SearchBar */}
      <SearchBar
        search={search}
        onSearch={setSearch}
        location={location}
        onLocation={setLocation}
        filterValue={status}
        onFilter={setStatus}
        filterOptions={FOUND_STATUS_OPTIONS}
        filterLabel="Status filter"
        placeholder="Search by title or description..."
        onClear={handleClear}
        hasActiveFilters={hasActiveFilters}
        accentColor="#10b981"
      />

      {/* Status Chip Filter Strip */}
      <CategoryFilter
        categories={FOUND_ITEM_STATUSES}
        selected={status}
        onSelect={setStatus}
        accentColor="rgba(16, 185, 129, 0.15)"
        accentBorder="rgba(16, 185, 129, 0.5)"
        accentTextColor="#34d399"
        label="Filter found items by status"
      />

      {/* Results Count */}
      {!loading && !error && (
        <p style={styles.resultsCount}>
          {items.length} report{items.length !== 1 ? 's' : ''} found
          {hasActiveFilters && ' (filtered)'}
        </p>
      )}

      {/* Loading State */}
      {loading && (
        <div style={styles.loaderContainer}>
          <Loader size="48px" color="#10b981" />
          <p style={styles.loaderText}>Searching database...</p>
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
      {!loading && !error && items.length === 0 && (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📦</span>
          <h3 style={styles.emptyTitle}>
            {hasActiveFilters ? 'No items match your search' : 'No found items yet'}
          </h3>
          <p style={styles.emptySubtitle}>
            {hasActiveFilters
              ? 'Try adjusting your filters or clearing them.'
              : 'Be the first to report a found item!'}
          </p>
          {hasActiveFilters ? (
            <button onClick={handleClear} style={styles.emptyBtn}>Clear Filters</button>
          ) : (
            <Link to="/add-found-item" style={styles.emptyBtn}>Report a Found Item</Link>
          )}
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && items.length > 0 && (
        <div style={styles.grid}>
          {items.map((item) => (
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
    marginBottom: '28px',
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  pageSubtitle: { fontSize: '1rem', color: '#6b7280', margin: '6px 0 0' },
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
  resultsCount: { color: '#6b7280', fontSize: '0.88rem', marginBottom: '8px' },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '80px',
    gap: '16px',
  },
  loaderText: { color: '#9ca3af', fontSize: '0.95rem' },
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
  alertTitle: { margin: '0 0 6px', color: '#ef4444', fontSize: '1.1rem', fontWeight: '700' },
  alertMsg: { margin: 0, color: '#e5e7eb', fontSize: '0.9rem' },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '80px',
    gap: '12px',
    textAlign: 'center',
  },
  emptyIcon: { fontSize: '4rem' },
  emptyTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#e5e7eb', margin: 0 },
  emptySubtitle: { color: '#6b7280', fontSize: '0.95rem', margin: 0 },
  emptyBtn: {
    marginTop: '12px',
    padding: '12px 24px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
};

export default FoundItems;
