import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ItemCard from '../components/ItemCard';
import ItemCardSkeleton from '../components/ItemCardSkeleton';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { LOST_ITEM_CATEGORIES, LOST_CATEGORY_OPTIONS } from '../constants/categories';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';

const LostItems = () => {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

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

  // Search + filter state — each drives the Axios query params
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [location, setLocation]     = useState('');

  // Pagination state
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const LIMIT = 9; // Grid-friendly size (3 columns x 3 rows)

  // Debounce timer ref — avoids sending an API request on every keystroke
  const debounceRef = useRef(null);

  // Core fetch function — accepts current filter values
  const fetchItems = useCallback(async (searchVal, categoryVal, locationVal, pageVal) => {
    try {
      setLoading(true);
      setError('');

      // Build query params object — only include non-empty values
      const params = {
        page: pageVal,
        limit: LIMIT
      };
      if (searchVal.trim())                              params.search   = searchVal.trim();
      if (categoryVal && categoryVal !== 'All')          params.category = categoryVal;
      if (locationVal.trim())                            params.location = locationVal.trim();

      // Axios serialises the params object
      const response = await API.get('/lost-items', { params });
      setItems(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced effect — fires 300 ms after user updates state
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchItems(search, category, location, page);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search, category, location, page, fetchItems]);

  const hasActiveFilters = search.trim() !== '' || category !== 'All' || location.trim() !== '';

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('');
    setPage(1);
  };

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1); // Reset back to page 1 on filter changes
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">

        {/* Header Block */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] uppercase">Reported Lost & Found Items</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
              Browse items reported by our community to help reunite them with their owners.
            </p>
          </div>
          <Link to="/add-lost-item" className="no-underline">
            <Button variant="primary" size="sm">+ Report Lost Item</Button>
          </Link>
        </div>

        {/* Unified SearchBar Component */}
        <SearchBar
          search={search}
          onSearch={handleFilterChange(setSearch)}
          location={location}
          onLocation={handleFilterChange(setLocation)}
          filterValue={category}
          onFilter={handleFilterChange(setCategory)}
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
          onSelect={handleFilterChange(setCategory)}
          accentColor="var(--accent-primary)"
          accentBorder="var(--accent-primary)"
          accentTextColor="var(--bg-primary)"
          label="Filter lost items by category"
        />

        {/* Results Count */}
        {!loading && !error && (
          <p className="text-[10px] text-[var(--text-secondary)] font-mono uppercase tracking-widest -mt-4">
            {totalItems} report{totalItems !== 1 ? 's' : ''} found
            {hasActiveFilters && ' (filtered)'}
          </p>
        )}

        {/* Loading State - Grid of Skeleton Cards */}
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
              <h3 className="font-bold text-sm mb-1">Unable to load feed</h3>
              <p className="text-[var(--text-primary)]">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 px-6 bg-[var(--bg-card)] border border-dashed border-border-subtle rounded-3xl">
            <span className="text-4xl mb-4">📦</span>
            <h3 className="text-lg font-bold mb-2">No items found</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-sm">
              {hasActiveFilters
                ? 'No items match your active search filters. Try adjusting or clearing them.'
                : 'No items have been reported yet. Be the first!'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Items Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <ItemCard
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

export default LostItems;
