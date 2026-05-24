import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import FoundItemCard from '../components/FoundItemCard';
import ItemCardSkeleton from '../components/ItemCardSkeleton';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { FOUND_ITEM_STATUSES, FOUND_STATUS_OPTIONS } from '../constants/categories';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';

const FoundItems = () => {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);

  // Fetch all bookmarks to highlight already saved listings on mount
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const res = await API.get('/favorites');
      setFavorites(res.data || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleBookmarkToggle = (itemId, isFav) => {
    if (isFav) {
      setFavorites(prev => [...prev, { item: { _id: itemId } }]);
    } else {
      setFavorites(prev => prev.filter(f => f.item?._id !== itemId && f.item !== itemId));
    }
  };

  // Filter states — each drives the backend query params
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [location, setLocation] = useState('');

  // Pagination states
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const LIMIT = 9; // Grid-friendly size (3 columns x 3 rows)

  const debounceRef = useRef(null);

  // Fetch found items with optional server-side filters and pagination parameters
  const fetchFoundItems = useCallback(async (searchVal, statusVal, locationVal, pageVal) => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: pageVal,
        limit: LIMIT
      };
      if (searchVal.trim())                 params.search   = searchVal.trim();
      if (statusVal && statusVal !== 'all') params.status   = statusVal;
      if (locationVal.trim())               params.location = locationVal.trim();

      const response = await API.get('/found-items', { params });
      setItems(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load found items feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 300 ms debounce — batches rapid filter changes into a single API call
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchFoundItems(search, status, location, page);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, status, location, page, fetchFoundItems]);

  const hasActiveFilters = search.trim() !== '' || status !== 'all' || location.trim() !== '';

  const handleClear = () => {
    setSearch('');
    setStatus('all');
    setLocation('');
    setPage(1);
  };

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1); // Reset to page 1 on filter updates
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] uppercase">🎁 Found Items</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
              Browse items that others have found — yours might be here
            </p>
          </div>
          <Link to="/add-found-item" className="no-underline">
            <Button variant="primary" size="sm">+ Report Found Item</Button>
          </Link>
        </div>

        {/* Reusable SearchBar */}
        <SearchBar
          search={search}
          onSearch={handleFilterChange(setSearch)}
          location={location}
          onLocation={handleFilterChange(setLocation)}
          filterValue={status}
          onFilter={handleFilterChange(setStatus)}
          filterOptions={FOUND_STATUS_OPTIONS}
          filterLabel="Status filter"
          placeholder="Search by title or description..."
          onClear={handleClear}
          hasActiveFilters={hasActiveFilters}
          accentColor="var(--accent-primary)"
        />

        {/* Status Chip Filter Strip */}
        <CategoryFilter
          categories={FOUND_ITEM_STATUSES}
          selected={status}
          onSelect={handleFilterChange(setStatus)}
          accentColor="var(--accent-primary)"
          accentBorder="var(--accent-primary)"
          accentTextColor="var(--bg-primary)"
          label="Filter found items by status"
        />

        {/* Results Count */}
        {!loading && !error && (
          <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest -mt-4">
            {totalItems} report{totalItems !== 1 ? 's' : ''} found
            {hasActiveFilters && ' (filtered)'}
          </p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <ItemCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex gap-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 font-mono text-xs text-amber-500">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-bold text-sm mb-1 font-sans">Unable to load feed</h3>
              <p className="text-[var(--text-primary)] font-sans">{error}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 px-6 bg-[var(--bg-card)] border border-dashed border-border-subtle rounded-3xl">
            <span className="text-4xl mb-4">📦</span>
            <h3 className="text-lg font-bold mb-2">No items found</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-sm">
              {hasActiveFilters
                ? 'No items match your active search filters. Try adjusting or clearing them.'
                : 'No found items have been listed yet.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClear}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Grid display */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <FoundItemCard
                  key={item._id}
                  item={item}
                  isFavorited={favorites.some(f => f.item?._id === item._id || f.item === item._id)}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 flex-wrap font-mono">
                <Button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                  aria-label="Previous Page"
                >
                  &larr; Prev
                </Button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = page === pageNum;
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      variant={isActive ? 'primary' : 'outline'}
                      size="sm"
                      aria-label={`Page ${pageNum}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                  aria-label="Next Page"
                >
                  Next &rarr;
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FoundItems;
