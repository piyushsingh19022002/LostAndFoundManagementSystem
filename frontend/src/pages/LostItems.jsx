import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

const LostItems = () => {
  // 1. Component States
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Searching States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // 2. Fetch Items on Mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await API.get('/lost-items');
        setItems(response.data);
        setFilteredItems(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching items:', err);
        setError(err.response?.data?.message || 'Failed to fetch items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // 3. Search and Filtering Handler
  useEffect(() => {
    let result = [...items];

    // Filter by Category
    if (categoryFilter !== 'All') {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Filter by Search Term
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) ||
        item.description.toLowerCase().includes(lowerSearch) ||
        item.location.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredItems(result);
  }, [searchTerm, categoryFilter, items]);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* Header Block */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Reported Lost & Found Items</h1>
            <p style={styles.subtitle}>Browse items reported by our community to help reunite them with their owners.</p>
          </div>
          <Link to="/add-lost-item" style={styles.createBtn}>
            + Report New Item
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div style={styles.filterBar}>
          <div style={styles.searchGroup}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by title, location or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="All">All Categories</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
          </div>
        </div>

        {/* Async States and Feed Rendering */}
        {loading ? (
          <div style={styles.loaderContainer}>
            <Loader size="50px" color="#61dafb" />
            <p style={styles.loaderText}>Fetching latest reports...</p>
          </div>
        ) : error ? (
          <div style={styles.errorAlert}>
            <span style={styles.alertIcon}>⚠️</span>
            <div>
              <h3 style={styles.alertTitle}>Unable to load feed</h3>
              <p style={styles.alertMessage}>{error}</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📦</span>
            <h3 style={styles.emptyTitle}>No lost items found</h3>
            <p style={styles.emptyText}>
              {searchTerm || categoryFilter !== 'All' 
                ? 'No items match your active search filters.' 
                : 'All items are currently resolved or none have been reported yet.'}
            </p>
            {(searchTerm || categoryFilter !== 'All') && (
              <button 
                onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }} 
                style={styles.resetBtn}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Premium stylesheet matching custom dashboard styles
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
    marginBottom: '40px',
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
    transition: 'transform 0.15s, box-shadow 0.2s',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px 24px',
    marginBottom: '40px',
  },
  searchGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '8px 16px',
    flex: 1,
    maxWidth: '500px',
    minWidth: '280px',
  },
  searchIcon: {
    marginRight: '10px',
    color: '#9ca3af',
  },
  searchInput: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.95rem',
    width: '100%',
    outline: 'none',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  filterLabel: {
    color: '#9ca3af',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  filterSelect: {
    padding: '8px 16px',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
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
  alertIcon: {
    fontSize: '2rem',
  },
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
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    color: '#ffffff',
    margin: '0 0 10px 0',
  },
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
    transition: 'background-color 0.2s',
  }
};

export default LostItems;
