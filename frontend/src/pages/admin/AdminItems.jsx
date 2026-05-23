import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & search states
  const [filterType, setFilterType] = useState('all'); // all | lost | found
  const [searchQuery, setSearchQuery] = useState('');
  
  // Deletion modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/admin/items');
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching admin items:', err);
      setError(err.response?.data?.message || 'Failed to retrieve item reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await API.delete(`/admin/item/${itemToDelete._id}`);
      setFeedbackMessage({
        text: res.data.message || 'Listing successfully deleted and associated claims cleaned.',
        type: 'success'
      });
      setShowConfirm(false);
      setItemToDelete(null);
      fetchItems();
    } catch (err) {
      console.error('Error deleting item:', err);
      setFeedbackMessage({
        text: err.response?.data?.message || 'Failed to delete listing.',
        type: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setTimeout(() => setFeedbackMessage({ text: '', type: '' }), 4000);
    }
  };

  // Determine item type based on fields
  // If found items have foundDate or specific properties, or we can check the path/model
  // Item model might have title, description, category, date, user
  // Let's see: In FoundItem, is there foundDate, and in Item, is there date?
  // Let's filter first:
  const getIsFound = (item) => {
    // Found items might have foundDate, or lost items have date, or found items are instances of FoundItem model
    // Let's check item.category. Found items generally set category to Found or don't have category='Lost'
    // Let's inspect properties: Item model has category: 'Lost' or we can check.
    // In our adminController.js, we loaded Item (lost items) and FoundItem (found items).
    // Let's look: Item model uses category: { type: String } etc. FoundItem might not have category, or has foundDate.
    // We can check if 'foundDate' in item or check category === 'Lost'
    return !!item.foundDate || item.category === 'Found' || !item.category;
  };

  const filteredItems = items.filter((item) => {
    const isFound = getIsFound(item);
    
    // Type Filter
    if (filterType === 'lost' && isFound) return false;
    if (filterType === 'found' && !isFound) return false;
    
    // Search Query Filter
    const query = searchQuery.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(query);
    const descMatch = item.description?.toLowerCase().includes(query);
    const locMatch = item.location?.toLowerCase().includes(query);
    const ownerMatch = item.user?.name?.toLowerCase().includes(query) || item.user?.email?.toLowerCase().includes(query);
    
    return titleMatch || descMatch || locMatch || ownerMatch;
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <span style={styles.pretitle}>SaaS Platform Listings</span>
          <h1 style={styles.title}>Item Moderation Feed</h1>
        </div>
        <div style={styles.statsBadge}>
          Active Posts: {items.length}
        </div>
      </header>

      {/* Toggles & Search Row */}
      <div style={styles.filterRow}>
        <div style={styles.tabGroup}>
          <button 
            onClick={() => setFilterType('all')}
            style={{ ...styles.filterTab, ...(filterType === 'all' ? styles.filterTabActive : {}) }}
          >
            All Listings ({items.length})
          </button>
          <button 
            onClick={() => setFilterType('lost')}
            style={{ ...styles.filterTab, ...(filterType === 'lost' ? styles.filterTabActive : {}) }}
          >
            Lost Items ({items.filter(i => !getIsFound(i)).length})
          </button>
          <button 
            onClick={() => setFilterType('found')}
            style={{ ...styles.filterTab, ...(filterType === 'found' ? styles.filterTabActive : {}) }}
          >
            Found Items ({items.filter(i => getIsFound(i)).length})
          </button>
        </div>

        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Search by title, description, owner..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={styles.btnClearSearch}>
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Action Toast Messages */}
      {feedbackMessage.text && (
        <div style={{
          ...styles.toast,
          backgroundColor: feedbackMessage.type === 'success' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          borderColor: feedbackMessage.type === 'success' ? '#34d399' : '#ef4444',
          color: feedbackMessage.type === 'success' ? '#34d399' : '#ef4444',
        }}>
          {feedbackMessage.type === 'success' ? '✅' : '⚠️'} {feedbackMessage.text}
        </div>
      )}

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: '16px', color: '#9ca3af' }}>Fetching unified catalog...</p>
        </div>
      ) : error ? (
        <div style={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={fetchItems} style={styles.retryBtn}>Retry</button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={styles.emptyContainer}>
          <span style={styles.emptyIcon}>📦</span>
          <h3>No items found</h3>
          <p style={{ color: '#9ca3af', margin: '5px 0 15px 0' }}>
            {searchQuery ? 'Adjust your text search or toggle filter options.' : 'No listings currently reported.'}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredItems.map((item) => {
            const isFound = getIsFound(item);
            return (
              <div key={item._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={{
                    ...styles.typeBadge,
                    backgroundColor: isFound ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    borderColor: isFound ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                    color: isFound ? '#10b981' : '#f43f5e',
                  }}>
                    {isFound ? '🔍 Found' : '📦 Lost'}
                  </span>
                  <span style={styles.itemDate}>
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {item.image && (
                  <div style={styles.imageWrapper}>
                    <img src={item.image} alt={item.title} style={styles.itemImg} />
                  </div>
                )}

                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.itemDesc}>{item.description}</p>

                <div style={styles.detailsGroup}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>📍 Location:</span>
                    <span style={styles.detailVal}>{item.location}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>🏷️ Category:</span>
                    <span style={styles.detailVal}>{item.category || 'General'}</span>
                  </div>
                  {isFound && item.foundDate && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>📅 Found Date:</span>
                      <span style={styles.detailVal}>{new Date(item.foundDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {!isFound && item.date && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>📅 Lost Date:</span>
                      <span style={styles.detailVal}>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>🟢 Status:</span>
                    <span style={{
                      ...styles.statusText,
                      color: item.status === 'Resolved' || item.status === 'claimed' ? '#10b981' : '#f59e0b'
                    }}>
                      {item.status || 'Active'}
                    </span>
                  </div>
                </div>

                {/* Owner info */}
                <div style={styles.ownerBox}>
                  <div style={styles.ownerHeader}>Reported By</div>
                  <div style={styles.ownerName}>{item.user?.name || 'Unknown User'}</div>
                  <div style={styles.ownerEmail}>{item.user?.email || 'N/A'}</div>
                </div>

                {/* Delete command */}
                <button 
                  onClick={() => handleDeleteClick(item)} 
                  style={styles.btnDelete}
                >
                  🗑️ Delete Post
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <span style={styles.modalWarningIcon}>⚠️</span>
            <h2 style={styles.modalTitle}>Confirm Moderation Action</h2>
            <p style={styles.modalText}>
              Are you sure you want to delete the post <strong>"{itemToDelete?.title}"</strong>?
            </p>
            <div style={styles.cascadeWarning}>
              <strong style={{ color: '#ef4444' }}>IMPORTANT SYSTEM CONSEQUENCE:</strong>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5' }}>
                Deleting this item will instantly purge all pending or accepted claim requests filed against it.
                This action is logged and cannot be undone.
              </p>
            </div>
            <div style={styles.modalActions}>
              <button 
                onClick={() => {
                  setShowConfirm(false);
                  setItemToDelete(null);
                }} 
                disabled={deleteLoading}
                style={styles.btnCancel}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete} 
                disabled={deleteLoading}
                style={styles.btnConfirmDelete}
              >
                {deleteLoading ? 'Removing Listing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    animation: 'fadeIn 0.5s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  pretitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#f43f5e',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: '4px 0 0 0',
    background: 'linear-gradient(to right, #ffffff, #9ca3af)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statsBadge: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    color: '#e5e7eb',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '30px',
  },
  tabGroup: {
    display: 'flex',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  filterTab: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontWeight: '600',
    fontSize: '0.85rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterTabActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    color: '#f43f5e',
    border: '1px solid rgba(244, 63, 94, 0.2)',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '380px',
    background: 'rgba(17, 24, 39, 0.5)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#6b7280',
    fontSize: '0.9rem',
  },
  searchInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    padding: '10px 10px 10px 38px',
    fontSize: '0.85rem',
  },
  btnClearSearch: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0 12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'rgba(17, 24, 39, 0.45)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  typeBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    border: '1px solid',
  },
  itemDate: {
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  imageWrapper: {
    width: '100%',
    height: '160px',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  itemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 8px 0',
  },
  itemDesc: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    margin: '0 0 16px 0',
    lineHeight: '1.45',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  detailsGroup: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
  },
  detailLabel: {
    color: '#6b7280',
    fontWeight: '600',
  },
  detailVal: {
    color: '#e5e7eb',
    fontWeight: '500',
  },
  statusText: {
    fontWeight: '700',
  },
  ownerBox: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '12px',
    marginBottom: '20px',
  },
  ownerHeader: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  ownerName: {
    fontSize: '0.85rem',
    color: '#ffffff',
    fontWeight: '600',
  },
  ownerEmail: {
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  btnDelete: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: 'auto',
    transition: 'all 0.2s ease',
  },
  loadingContainer: {
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(244, 63, 94, 0.1)',
    borderTop: '3px solid #f43f5e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  retryBtn: {
    padding: '6px 14px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '50px 20px',
    background: 'rgba(17, 24, 39, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '15px',
  },
  toast: {
    padding: '14px 20px',
    border: '1px solid',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    animation: 'fadeIn 0.3s ease-out',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  modal: {
    background: '#111827',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.1)',
    textAlign: 'center',
    animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  modalWarningIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '15px',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 10px 0',
  },
  modalText: {
    fontSize: '0.95rem',
    color: '#e5e7eb',
    margin: '0 0 20px 0',
    lineHeight: '1.5',
  },
  cascadeWarning: {
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left',
    marginBottom: '25px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  btnCancel: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  btnConfirmDelete: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s ease',
  },
};

export default AdminItems;
