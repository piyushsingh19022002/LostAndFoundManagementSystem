import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import ItemManagementCard from '../components/ItemManagementCard';
import DeleteConfirmation from '../components/DeleteConfirmation';
import Button from '../components/ui/Button';

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
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
        <Loader size="50px" color="var(--accent-primary)" />
        <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Header Block */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] uppercase">Manage My Reports</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Manage, edit, or delete the items you have reported on the platform.
          </p>
          
          {/* Toggle filters */}
          <div className="flex gap-2 p-1 bg-slate-950/20 border border-border-subtle rounded-full w-fit max-w-full overflow-x-auto scrollbar-none mt-4">
            {['All', 'Lost', 'Found'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  filter === tab
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab === 'All' ? '🗂️ All' : tab === 'Lost' ? '🎒 Lost' : '🎁 Found'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex gap-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 font-mono text-xs text-amber-500">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-[var(--text-primary)] mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchMyItems}>Retry</Button>
            </div>
          </div>
        )}

        {!error && filteredItems.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 px-6 bg-[var(--bg-card)] border border-dashed border-border-subtle rounded-3xl">
            <span className="text-4xl mb-4">📦</span>
            <h3 className="text-lg font-bold mb-2">No reports found</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-sm">
              You haven't reported any {filter !== 'All' ? filter.toLowerCase() : ''} items yet.
            </p>
            <div className="flex gap-4 font-mono">
              <Button variant="primary" size="sm" onClick={() => navigate('/add-lost-item')}>Report Lost</Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/add-found-item')}>Report Found</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <div key={item._id} className="h-full">
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
    </div>
  );
};

export default MyItems;
