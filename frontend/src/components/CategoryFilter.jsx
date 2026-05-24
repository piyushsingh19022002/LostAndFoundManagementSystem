import React from 'react';

/**
 * CategoryFilter — Reusable horizontal chip-strip filter component.
 *
 * Renders a scrollable row of pill-shaped filter buttons. The selected chip
 * gets an accent background; all others remain in a ghost style. Tapping a
 * chip immediately lifts the new value to the parent via `onSelect`.
 *
 * Props:
 *   categories      {Array<{value, label, icon}>}   List of filter options
 *   selected        {string}                         Currently selected value
 *   onSelect        {(value: string) => void}        Called when a chip is clicked
 *   accentColor     {string}                         Active chip background (hex/hsl)
 *   accentTextColor {string}                         Active chip text colour
 *   label           {string}                         Accessible label for the strip
 */
const CategoryFilter = ({
  categories      = [],
  selected        = 'All',
  onSelect,
  accentColor     = 'var(--text-primary)',
  accentBorder    = 'var(--text-primary)',
  accentTextColor = 'var(--bg-primary)',
  label           = 'Filter by category',
}) => {
  if (!categories.length) return null;

  return (
    <div style={styles.wrapper} role="group" aria-label={label}>
      <div style={styles.strip}>
        {categories.map(({ value, label: chipLabel, icon }) => {
          const isActive = selected === value;
          return (
            <button
              key={value}
              id={`category-chip-${value.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelect && onSelect(value)}
              style={{
                ...styles.chip,
                borderColor: isActive ? accentBorder : 'var(--border-subtle)',
                backgroundColor: isActive ? accentColor : 'var(--bg-card)',
                color: isActive ? accentTextColor : 'var(--text-secondary)',
                ...(isActive
                  ? {
                      fontWeight: '700',
                      boxShadow: 'var(--shadow-sm)',
                      transform: 'translateY(-1px)',
                    }
                  : {}),
              }}
              aria-pressed={isActive}
              title={`Filter by ${chipLabel}`}
            >
              {icon && <span style={styles.chipIcon}>{icon}</span>}
              {chipLabel}
              {isActive && value !== 'All' && value !== 'all' && (
                <span
                  style={styles.activeIndicator}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect('All');
                  }}
                  title="Clear this filter"
                  role="button"
                  aria-label={`Clear ${chipLabel} filter`}
                >
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    width: '100%',
    marginBottom: '24px',
    overflowX: 'auto',
    // Hide scrollbar on webkit while keeping scroll functionality
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  strip: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',        // wraps on narrow viewports instead of horizontal scroll
    paddingBottom: '4px',    // prevents box-shadow clipping at bottom edge
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    borderRadius: '50px',          // pill shape
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    outline: 'none',
    letterSpacing: '0.02em',
    flexShrink: 0,
  },
  chipIcon: {
    fontSize: '0.95rem',
    lineHeight: 1,
  },
  activeIndicator: {
    marginLeft: '4px',
    fontSize: '0.7rem',
    opacity: 0.8,
    cursor: 'pointer',
    padding: '0 2px',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
  },
};

export default CategoryFilter;
