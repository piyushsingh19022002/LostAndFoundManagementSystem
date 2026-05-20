/**
 * categories.js — Centralized category constants.
 *
 * Single source of truth for all item categories used across:
 *   - CategoryFilter component (chip UI)
 *   - SearchBar dropdown options
 *   - Backend controller validation
 *   - Any future form selects or filter dropdowns
 *
 * Adding a new category only requires updating this file.
 */

// Lost Item categories — what kind of thing was lost
export const LOST_ITEM_CATEGORIES = [
  { value: 'All',         label: 'All',         icon: '🗂️' },
  { value: 'Electronics', label: 'Electronics',  icon: '📱' },
  { value: 'Documents',   label: 'Documents',    icon: '📄' },
  { value: 'Bags',        label: 'Bags',         icon: '🎒' },
  { value: 'Accessories', label: 'Accessories',  icon: '⌚' },
  { value: 'Clothing',    label: 'Clothing',     icon: '👕' },
  { value: 'Keys',        label: 'Keys',         icon: '🔑' },
  { value: 'Pets',        label: 'Pets',         icon: '🐾' },
  { value: 'Other',       label: 'Other',        icon: '📦' },
];

// Found Item statuses — lifecycle of a found item report
export const FOUND_ITEM_STATUSES = [
  { value: 'all',      label: 'All',      icon: '🗂️' },
  { value: 'found',    label: 'Found',    icon: '🎁' },
  { value: 'claimed',  label: 'Claimed',  icon: '✅' },
  { value: 'returned', label: 'Returned', icon: '🔄' },
];

// Dropdown-compatible format (for SearchBar select element)
export const LOST_CATEGORY_OPTIONS = LOST_ITEM_CATEGORIES.map(({ value, label }) => ({
  value,
  label: value === 'All' ? 'All Categories' : label,
}));

export const FOUND_STATUS_OPTIONS = FOUND_ITEM_STATUSES.map(({ value, label }) => ({
  value,
  label: value === 'all' ? 'All Statuses' : label,
}));
