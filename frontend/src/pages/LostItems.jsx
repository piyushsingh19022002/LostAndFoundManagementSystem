import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { LOST_ITEM_CATEGORIES, LOST_CATEGORY_OPTIONS } from '../constants/categories';



const LostItems = () => {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Search + filter state — each drives the Axios query params
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [location, setLocation]     = useState('');

  // Debounce timer ref — avoids sending an API request on every keystroke
  const debounceRef = useRef(null);

  // Core fetch function — accepts current filter values
  const fetchItems = useCallback(async (searchVal, categoryVal, locationVal) => {
    try {
      setLoading(true);
      setError('');

      // Build query params object — only include non-empty values
      const params = {};
      if (searchVal.trim())                              params.search   = searchVal.trim();
      if (categoryVal && categoryVal !== 'All')          params.category = categoryVal;
      if (locationVal.trim())                            params.location = locationVal.trim();

      // Axios serialises the params object into: /lost-items?search=phone&location=Delhi
      const response = await API.get('/lost-items', { params });
      setItems(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced effect — fires 400 ms after the user stops typing
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchItems(search, category, location);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [search, category, location, fetchItems]);

  const hasActiveFilters = search.trim() !== '' || category !== 'All' || location.trim() !== '';

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>

        {/* Header Block */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Reported Lost & Found Items</h1>
            <p style={styles.subtitle}>
              Browse items reported by our community to help reunite them with their owners.
            </p>
          </div>
          <Link to="/add-lost-item" style={styles.createBtn}>
            + Report Lost Item
          </Link>
        </div>

        {/* Unified SearchBar Component */}
        <SearchBar
          search={search}
          onSearch={setSearch}
          location={location}
          onLocation={setLocation}
          filterValue={category}
          onFilter={setCategory}
          filterOptions={LOST_CATEGORY_OPTIONS}
          filterLabel="Category filter"
          placeholder="Search by title or description..."
          onClear={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Category Chip Filter Strip */}
        <CategoryFilter
          categories={LOST_ITEM_CATEGORIES}
          selected={category}
          onSelect={setCategory}
          accentColor="rgba(97, 218, 251, 0.15)"
          accentBorder="rgba(97, 218, 251, 0.5)"
          accentTextColor="#61dafb"
          label="Filter lost items by category"
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
            <Loader size="50px" color="#61dafb" />
            <p style={styles.loaderText}>Searching database...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={styles.errorAlert}>
            <span style={styles.alertIcon}>⚠️</span>
            <div>
              <h3 style={styles.alertTitle}>Unable to load feed</h3>
              <p style={styles.alertMessage}>{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📦</span>
            <h3 style={styles.emptyTitle}>No items found</h3>
            <p style={styles.emptyText}>
              {hasActiveFilters
                ? 'No items match your active search filters. Try adjusting or clearing them.'
                : 'No items have been reported yet. Be the first!'}
            </p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} style={styles.resetBtn}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Items Grid */}
        {!loading && !error && items.length > 0 && (
          <div style={styles.grid}>
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '90vh',
    background: 'radial-gradient(circle at top, #1f2937 0%, #111827 100%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    padding: '40px 20px',
  },
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '32px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 10px 0',
    letterSpacing: '-0.03em',
    background: 'linear-gradient(to right, #61dafb, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.05rem',
    color: '#9ca3af',
    margin: 0,
  },
  createBtn: {
    padding: '12px 24px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
  },
  resultsCount: {
    color: '#6b7280',
    fontSize: '0.88rem',
    margin: '-10px 0 20px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
  },
  loaderText: {
    marginTop: '16px',
    color: '#9ca3af',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  errorAlert: {
    display: 'flex',
    gap: '16px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    padding: '24px',
  },
  alertIcon: { fontSize: '2rem' },
  alertTitle: {
    margin: '0 0 6px 0',
    color: '#ef4444',
    fontSize: '1.15rem',
    fontWeight: '700',
  },
  alertMessage: {
    margin: 0,
    color: '#e5e7eb',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
  },
  emptyIcon: { fontSize: '4rem', marginBottom: '20px' },
  emptyTitle: { fontSize: '1.5rem', color: '#ffffff', margin: '0 0 10px 0' },
  emptyText: {
    fontSize: '0.95rem',
    color: '#9ca3af',
    maxWidth: '400px',
    margin: '0 0 24px 0',
    lineHeight: '1.6',
  },
  resetBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default LostItems;
