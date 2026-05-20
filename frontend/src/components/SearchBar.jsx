import React from 'react';

/**
 * SearchBar — Reusable search + filter component.
 *
 * Props:
 *   search        {string}   Current search text value
 *   onSearch      {fn}       Called with new search string on input change
 *   location      {string}   Current location filter value
 *   onLocation    {fn}       Called with new location string on input change
 *   filterValue   {string}   Currently selected filter dropdown value
 *   onFilter      {fn}       Called with new filter value on dropdown change
 *   filterOptions {Array}    [ { value, label } ] list for the dropdown
 *   filterLabel   {string}   Accessible label for the filter select (default: 'Filter')
 *   placeholder   {string}   Search input placeholder text
 *   onClear       {fn}       Optional — called when the Clear Filters button is clicked
 *   hasActiveFilters {bool}  When true, the Clear button appears
 *   accentColor   {string}   Optional tint colour for focus rings (default: '#61dafb')
 */
const SearchBar = ({
  search        = '',
  onSearch,
  location      = '',
  onLocation,
  filterValue   = '',
  onFilter,
  filterOptions = [],
  filterLabel   = 'Filter',
  placeholder   = 'Search items...',
  onClear,
  hasActiveFilters = false,
  accentColor   = '#61dafb',
}) => {
  return (
    <div style={styles.wrapper}>
      {/* ── Search Text Input ── */}
      <div style={styles.searchGroup}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          id="search-input"
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearch && onSearch(e.target.value)}
          style={styles.searchInput}
          autoComplete="off"
        />
        {/* Inline clear button for search text */}
        {search && (
          <button
            onClick={() => onSearch && onSearch('')}
            style={styles.inlineClear}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Location Input ── */}
      <div style={styles.locationGroup}>
        <span style={styles.locationIcon}>📍</span>
        <input
          id="location-input"
          type="text"
          placeholder="Filter by location..."
          value={location}
          onChange={(e) => onLocation && onLocation(e.target.value)}
          style={styles.locationInput}
          autoComplete="off"
        />
      </div>

      {/* ── Category / Status Dropdown ── */}
      {filterOptions.length > 0 && (
        <div style={styles.selectWrapper}>
          <label htmlFor="filter-select" style={styles.srOnly}>{filterLabel}</label>
          <select
            id="filter-select"
            value={filterValue}
            onChange={(e) => onFilter && onFilter(e.target.value)}
            style={styles.filterSelect}
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Clear All Filters ── */}
      {hasActiveFilters && onClear && (
        <button onClick={onClear} style={styles.clearBtn}>
          ✕ Clear
        </button>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '12px',
    padding: '14px 20px',
    marginBottom: '28px',
  },
  searchGroup: {
    display: 'flex',
    alignItems: 'center',
    flex: 2,
    minWidth: '220px',
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '8px 14px',
  },
  searchIcon: {
    marginRight: '10px',
    fontSize: '1rem',
    opacity: 0.6,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  inlineClear: {
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '0 0 0 6px',
    lineHeight: 1,
    flexShrink: 0,
  },
  locationGroup: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '180px',
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '8px 14px',
  },
  locationIcon: {
    marginRight: '8px',
    fontSize: '0.9rem',
    opacity: 0.6,
    flexShrink: 0,
  },
  locationInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  selectWrapper: {
    flexShrink: 0,
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  filterSelect: {
    padding: '9px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    outline: 'none',
    cursor: 'pointer',
  },
  clearBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#f87171',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    whiteSpace: 'nowrap',
  },
};

export default SearchBar;
