import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ItemCard from '../components/ItemCard';
import FoundItemCard from '../components/FoundItemCard';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/favorites');
      setFavorites(res.data || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.response?.data?.message || 'Failed to load bookmarked items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFromGrid = (itemId) => {
    // Instantly filter out the unfavorited item from state to provide reactive UI updates
    setFavorites((prev) => prev.filter((fav) => fav.item?._id !== itemId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
        <Loader size="50px" color="var(--accent-primary)" />
        <p className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">Opening your saved bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-secondary)]">// Personal Dashboard</span>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] uppercase mt-1">Bookmarked Listings</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              Keep track of reported items you are watching or claiming.
            </p>
          </div>
          {favorites.length > 0 && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-slate-950/20 border border-border-subtle text-[var(--text-primary)]">
              {favorites.length} Saved Item{favorites.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex gap-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 font-mono text-xs text-amber-500">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-bold text-sm mb-1">Load Error</h3>
              <p className="text-[var(--text-primary)] mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchFavorites}>Retry</Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && favorites.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 px-6 bg-[var(--bg-card)] border border-dashed border-border-subtle rounded-3xl">
            <span className="text-4xl mb-4">❤️</span>
            <h2 className="text-lg font-bold mb-2">Your Bookmarks Shelf is Empty</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-8 max-w-sm leading-relaxed">
              Bookmark items while searching to revisit them quickly. You can save both lost reports and found listings.
            </p>
            <div className="flex gap-4 font-mono">
              <Link to="/lost-items" className="no-underline">
                <Button variant="primary" size="sm">Browse Lost Items</Button>
              </Link>
              <Link to="/found-items" className="no-underline">
                <Button variant="secondary" size="sm">Browse Found Items</Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((fav) => {
              const item = fav.item;
              if (!item) return null;

              if (fav.itemModel === 'Item') {
                return (
                  <ItemCard
                    key={fav._id}
                    item={item}
                    isFavorited={true}
                    onBookmarkToggle={handleRemoveFromGrid}
                  />
                );
              } else {
                return (
                  <FoundItemCard
                    key={fav._id}
                    item={item}
                    isFavorited={true}
                    onBookmarkToggle={handleRemoveFromGrid}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
