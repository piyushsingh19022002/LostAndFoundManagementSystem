import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';
import BookmarkButton from '../components/BookmarkButton';
import AIMatchesSection from '../components/AIMatchesSection';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const FoundItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  const [item, setItem]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  // Fetch found item by ID whenever route param changes
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/found-items/${id}`);
        setItem(response.data);
        setError('');

        if (currentUser) {
          const favsRes = await API.get('/favorites');
          const isFav = favsRes.data.some(f => f.item?._id === id || f.item === id);
          setIsFavorited(isFav);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to retrieve item details. It may have been removed or the ID is invalid.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id, currentUser]);

  // Ownership check — handles both populated and non-populated user references
  const isOwner =
    item &&
    currentUser &&
    item.user &&
    (item.user._id?.toString() === currentUser.id?.toString() ||
      item.user.toString() === currentUser.id?.toString() ||
      item.user._id?.toString() === currentUser._id?.toString() ||
      item.user.toString() === currentUser._id?.toString());

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      setLoading(true);
      await API.delete(`/found-items/${id}`);
      alert('Report deleted successfully.');
      navigate('/found-items');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item.');
      setLoading(false);
    }
  };

  // --- Render States ---  // Rendering Loader State
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
        <Loader size="50px" color="var(--accent-primary)" />
        <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Loading item details...</p>
      </div>
    );
  }

  // Rendering Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="flex gap-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 font-mono text-xs text-amber-500 max-w-lg w-full">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-bold text-sm mb-1 font-sans">Error Loading Report</h3>
            <p className="text-[var(--text-primary)] font-sans mb-4">{error}</p>
            <Link to="/found-items" className="inline-block px-4 py-2 rounded-full border border-border-subtle bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-slate-400 transition-all no-underline font-mono uppercase text-[9px] tracking-wider font-bold">
              Back to Found Items Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Rendering Null State
  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="flex gap-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 font-mono text-xs text-amber-500 max-w-lg w-full">
          <span className="text-xl">🔍</span>
          <div>
            <h3 className="font-bold text-sm mb-1 font-sans">Item Not Found</h3>
            <p className="text-[var(--text-primary)] font-sans mb-4">This report could not be located. It may have been deleted.</p>
            <Link to="/found-items" className="inline-block px-4 py-2 rounded-full border border-border-subtle bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-slate-400 transition-all no-underline font-mono uppercase text-[9px] tracking-wider font-bold">
              Back to Found Items Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(item.dateFound).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-16 transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex flex-col">
        {/* Back Link */}
        <Link to="/found-items" className="inline-block text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 no-underline">
          &larr; Back to Found Items Feed
        </Link>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Column: Image Section */}
          <Card className="p-0 overflow-hidden aspect-[4/3] w-full flex items-center justify-center bg-slate-950/10 border-border-subtle relative rounded-3xl">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="text-5xl">🎁</span>
                <span className="text-[10px] text-[var(--text-secondary)] font-bold font-mono uppercase tracking-widest">No Image Provided</span>
              </div>
            )}
          </Card>

          {/* Right Column: Metadata Section */}
          <Card className="p-8 flex flex-col gap-6">
            <div className="flex flex-wrap gap-2.5">
              <span className="px-3 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-widest border bg-emerald-500/10 text-emerald-500 border-emerald-500/15">
                🎁 Found Item
              </span>
              <span className={`px-3 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-widest border ${
                item.status === 'found'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15'
                  : item.status === 'claimed'
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/15'
                  : 'bg-purple-500/10 text-purple-400 border-purple-500/15'
              }`}>
                {item.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-xl font-bold tracking-wide text-[var(--text-primary)] leading-snug">{item.title}</h1>
              {currentUser && (
                <BookmarkButton
                  itemId={item._id}
                  itemModel="FoundItem"
                  initialIsFavorited={isFavorited}
                />
              )}
            </div>

            <div className="flex flex-col gap-2 font-mono text-[10px] text-[var(--text-secondary)] uppercase tracking-wider bg-slate-950/10 border border-border-subtle rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs">📍</span>
                <span>Found at: <strong className="text-[var(--text-primary)]">{item.location}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">📅</span>
                <span>Date Found: <strong className="text-[var(--text-primary)]">{formattedDate}</strong></span>
              </div>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)] mb-2">// Description</h3>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">{item.description}</p>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <div className="bg-slate-950/10 border border-border-subtle rounded-2xl p-4">
                <h4 className="text-[9px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)] mb-3">// Finder Registry</h4>
                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">👤</span>
                    <div>
                      <p className="text-[9px] text-[var(--text-secondary)] font-mono uppercase tracking-wider leading-none">Name</p>
                      <p className="font-semibold text-[var(--text-primary)] mt-1">{item.user?.name || 'Anonymous User'}</p>
                    </div>
                  </div>
                  {item.user?.email && (
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">✉️</span>
                      <div>
                        <p className="text-[9px] text-[var(--text-secondary)] font-mono uppercase tracking-wider leading-none">Contact Email</p>
                        <a href={`mailto:${item.user.email}`} className="text-[var(--accent-primary)] hover:underline mt-1 block">
                          {item.user.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex gap-3 border-t border-border-subtle pt-6 font-mono">
                <Link to={`/found-items/edit/${id}`} className="no-underline">
                  <Button variant="secondary" size="sm">✏️ Edit Report</Button>
                </Link>
                <Button variant="danger" size="sm" onClick={handleDelete}>🗑️ Delete Report</Button>
              </div>
            )}

            {/* Non-Owner Claim */}
            {!isOwner && (
              <div className="border-t border-border-subtle pt-6">
                {item.status === 'claimed' ? (
                  <Button disabled variant="outline" className="w-full">🔒 Already Claimed</Button>
                ) : item.status === 'returned' ? (
                  <Button disabled variant="outline" className="w-full">🔒 Already Returned</Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login', { state: { from: `/found-items/${id}` } });
                      } else {
                        navigate(`/claim/${id}?type=found`);
                      }
                    }}
                  >
                    🤝 Claim Item / Contact Finder
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* AI Recommendations Panel */}
        <AIMatchesSection itemId={id} type="found" />
      </div>
    </div>
  );
};

export default FoundItemDetails;
