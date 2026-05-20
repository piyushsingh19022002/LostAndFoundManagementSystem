import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import ItemManagementCard from '../components/ItemManagementCard';
import DeleteConfirmation from '../components/DeleteConfirmation';

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All' | 'Lost' | 'Found'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state for custom DeleteConfirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const navigate = useNavigate();

  const fetchMyItems = async () => {
    setLoading(true);
    setError('');
    try {
      // Concurrently query both endpoints
      const [lostRes, foundRes] = await Promise.all([
        API.get('/lost-items/my-items'),
        API.get('/found-items/my-items'),
      ]);
      
      // Combine results and sort by newest first
      const combined = [
        ...lostRes.data.map(item => ({ ...item, category: item.category || 'Lost' })),
        ...foundRes.data.map(item => ({ ...item, category: 'Found' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setItems(combined);
    } catch (err) {
      console.error('Error fetching owned reports:', err);
      setError('Failed to fetch your items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, []);

  const handleEditClick = (item) => {
    // Navigate to /edit-item/:id and pass category type in search params
    const type = item.category === 'Found' ? 'found' : 'lost';
    navigate(`/edit-item/${item._id}?type=${type}`);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setDeleteModalOpen(false);
    const id = itemToDelete._id;
    const isFound = itemToDelete.category === 'Found';
    const endpoint = isFound ? `/found-items/${id}` : `/lost-items/${id}`;
    
    try {
      await API.delete(endpoint);
      
      // Dynamic State Update: instantly remove from state without full refresh
      setItems(prev => prev.filter(item => item._id !== id));
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting report:', err);
      alert(err.response?.data?.message || 'Failed to delete report.');
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Filter combined reports
  const filteredItems = items.filter(item => {
    if (filter === 'All') return true;
    if (filter === 'Lost') return item.category !== 'Found';
    if (filter === 'Found') return item.category === 'Found';
    return true;
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size="50px" color="#61dafb" />
        <p style={{ marginTop: '16px', color: '#94a3b8' }}>Loading your reports...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.titleText}>Manage My Reports</h2>
        <p style={styles.subtitleText}>Manage, edit, or delete the items you have reported on the platform.</p>
        
        {/* Toggle filters */}
        <div style={styles.filterBar}>
          {['All', 'Lost', 'Found'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                ...styles.filterBtn,
                backgroundColor: filter === tab ? 'rgba(97, 218, 251, 0.15)' : 'transparent',
                borderColor: filter === tab ? '#61dafb' : 'rgba(255, 255, 255, 0.08)',
                color: filter === tab ? '#61dafb' : '#94a3b8',
                fontWeight: filter === tab ? '700' : '500',
              }}
            >
              {tab === 'All' ? '🗂️ All Reports' : tab === 'Lost' ? '🎒 Lost' : '🎁 Found'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <span>⚠️ {error}</span>
          <button onClick={fetchMyItems} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {!error && filteredItems.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📦</div>
          <h3>No reports found</h3>
          <p>You haven't reported any {filter !== 'All' ? filter.toLowerCase() : ''} items yet.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={() => navigate('/add-lost-item')} style={styles.btnActionLost}>Report Lost</button>
            <button onClick={() => navigate('/add-found-item')} style={styles.btnActionFound}>Report Found</button>
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredItems.map(item => (
            <div key={item._id} style={styles.gridItem}>
              <ItemManagementCard 
                item={item} 
                onEdit={handleEditClick} 
                onDelete={handleDeleteClick} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Reusable safety delete confirmation modal */}
      <DeleteConfirmation 
        isOpen={deleteModalOpen} 
        itemTitle={itemToDelete ? itemToDelete.title : ''} 
        onConfirm={confirmDelete} 
        onCancel={cancelDelete} 
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '80vh',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  header: {
    marginBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  titleText: {
    margin: 0,
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.025em',
    background: 'linear-gradient(to right, #61dafb, #34d399)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitleText: {
    margin: 0,
    fontSize: '1rem',
    color: '#94a3b8',
  },
  filterBar: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#f8fafc',
    marginBottom: '24px',
  },
  retryBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#61dafb',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  gridItem: {
    height: '100%',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    marginTop: '20px',
  },
  emptyIcon: {
    fontSize: '3.5rem',
    marginBottom: '16px',
  },
  btnActionLost: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
  },
  btnActionFound: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#10b981',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
  }
};

export default MyItems;
