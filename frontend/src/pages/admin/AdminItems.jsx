import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import ItemCardSkeleton from '../../components/ItemCardSkeleton';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { FiSearch, FiX, FiTrash2, FiAlertTriangle, FiPackage, FiMapPin, FiCalendar, FiUser } from 'react-icons/fi';

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

  const getIsFound = (item) => {
    return !!item.foundDate || item.category === 'Found' || !item.category;
  };

  const filteredItems = items.filter((item) => {
    const isFound = getIsFound(item);

    if (filterType === 'lost' && isFound) return false;
    if (filterType === 'found' && !isFound) return false;

    const query = searchQuery.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(query);
    const descMatch = item.description?.toLowerCase().includes(query);
    const locMatch = item.location?.toLowerCase().includes(query);
    const ownerMatch = item.user?.name?.toLowerCase().includes(query) || item.user?.email?.toLowerCase().includes(query);

    return titleMatch || descMatch || locMatch || ownerMatch;
  });

  const filterTabs = [
    { id: 'all', label: `All (${items.length})` },
    { id: 'lost', label: `Lost (${items.filter(i => !getIsFound(i)).length})` },
    { id: 'found', label: `Found (${items.filter(i => getIsFound(i)).length})` },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold font-mono uppercase tracking-widest text-[var(--accent-primary)] mb-1">// SaaS Platform Listings</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] uppercase">Item Moderation Feed</h1>
        </div>
        <Badge variant="neutral" className="text-xs px-4 py-1.5">
          Active Posts: {items.length}
        </Badge>
      </div>

      {/* Filter & Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Pill Tabs */}
        <div className="flex items-center gap-1 p-1 glass-panel rounded-full border border-border-subtle">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                filterType === tab.id
                  ? 'bg-[var(--accent-primary)] text-stone-950 shadow-[0_4px_12px_rgba(245,158,11,0.25)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex items-center max-w-sm w-full">
          <FiSearch className="absolute left-4 text-[var(--text-secondary)] text-sm" />
          <input
            type="text"
            placeholder="Search by title, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 glass-panel rounded-full text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none border border-border-subtle focus:border-[var(--accent-primary)]/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <FiX className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage.text && (
        <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-mono border ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {feedbackMessage.type === 'success' ? '✓' : <FiAlertTriangle />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Items Grid or States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <ItemCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl px-4 py-3 text-sm font-mono">
          <span className="flex items-center gap-2"><FiAlertTriangle /> {error}</span>
          <Button variant="danger" size="sm" onClick={fetchItems}>Retry</Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="text-center py-16 border border-dashed border-border-subtle">
          <FiPackage className="text-3xl text-[var(--text-secondary)] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase mb-1">No Items Found</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {searchQuery ? 'Adjust your text search or toggle filter options.' : 'No listings currently reported.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isFound = getIsFound(item);
            return (
              <Card key={item._id} className="flex flex-col gap-4 p-5 border border-border-subtle hover:scale-[1.01] transition-premium">
                {/* Card header badges */}
                <div className="flex items-center justify-between">
                  <Badge variant={isFound ? 'success' : 'error'}>
                    {isFound ? 'Found' : 'Lost'}
                  </Badge>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Item Image */}
                {item.image && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden border border-border-subtle bg-slate-950/20">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight mb-1 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{item.description}</p>
                </div>

                {/* Details */}
                <div className="bg-slate-500/5 border border-border-subtle rounded-2xl p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                    <FiMapPin className="text-[var(--accent-primary)] text-xs flex-shrink-0" />
                    <span className="truncate">{item.location || 'Unknown'}</span>
                  </div>
                  {isFound && item.foundDate && (
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                      <FiCalendar className="text-[var(--accent-primary)] text-xs flex-shrink-0" />
                      <span>Found: {new Date(item.foundDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {!isFound && item.date && (
                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                      <FiCalendar className="text-[var(--accent-primary)] text-xs flex-shrink-0" />
                      <span>Lost: {new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`text-xs font-bold ${item.status === 'Resolved' || item.status === 'claimed' ? 'text-emerald-400' : 'text-[var(--accent-primary)]'}`}>
                      ● {item.status || 'Active'}
                    </span>
                  </div>
                </div>

                {/* Reported By */}
                <div className="flex items-center gap-2 border-t border-border-subtle pt-3">
                  <div className="w-7 h-7 rounded-full bg-slate-500/20 border border-border-subtle flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-[var(--text-secondary)] text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">{item.user?.name || 'Unknown'}</div>
                    <div className="text-[10px] font-mono text-[var(--text-secondary)] truncate">{item.user?.email || 'N/A'}</div>
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 flex items-center justify-center gap-2 mt-auto"
                  onClick={() => handleDeleteClick(item)}
                >
                  <FiTrash2 className="text-xs" />
                  Delete Post
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <Card className="max-w-md w-full text-center border border-rose-500/25 shadow-[0_0_40px_rgba(239,68,68,0.1)] p-8">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl mx-auto mb-5">
              <FiAlertTriangle />
            </div>
            <h2 className="text-base font-extrabold uppercase tracking-tight text-[var(--text-primary)] mb-2">Confirm Moderation Action</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed">
              Delete the post <strong className="text-[var(--text-primary)]">"{itemToDelete?.title}"</strong>?
            </p>
            <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-4 text-left mb-6">
              <strong className="text-[10px] font-bold font-mono uppercase tracking-widest text-rose-400 block mb-2">Important System Consequence:</strong>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Deleting this item will instantly purge all pending or accepted claim requests filed against it. This action is logged and cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => { setShowConfirm(false); setItemToDelete(null); }}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Removing...' : 'Confirm Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminItems;
