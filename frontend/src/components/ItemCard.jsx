import React from 'react';
import { Link } from 'react-router-dom';
import BookmarkButton from './BookmarkButton';

const ItemCard = ({ item, isFavorited = false, onBookmarkToggle }) => {
  const isLost = item.category === 'Lost';
  const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative h-full flex flex-col glass-panel rounded-3xl overflow-hidden transition-premium hover:-translate-y-1 hover:shadow-2xl hover:border-[var(--accent-primary)]/30">
      {/* Bookmark Button */}
      <div className="absolute top-3 right-3 z-15">
        <BookmarkButton
          itemId={item._id}
          itemModel="Item"
          initialIsFavorited={isFavorited}
          onToggle={onBookmarkToggle}
        />
      </div>

      {/* Category Badge */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
        <span className={`px-3 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-widest border backdrop-blur-md ${
          isLost 
            ? 'bg-rose-500/10 text-rose-500 border-rose-500/15' 
            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15'
        }`}>
          {item.category}
        </span>
        <span className="px-3 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-widest text-[var(--text-secondary)] bg-slate-950/40 border border-border-subtle backdrop-blur-md">
          {formattedDate}
        </span>
      </div>

      {/* Image Preview or Dynamic Placeholder */}
      <div className="relative w-full h-[200px] bg-slate-950/10 flex items-center justify-center overflow-hidden border-b border-border-subtle">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">{isLost ? '🔍' : '🎁'}</span>
            <span className="text-[9px] text-[var(--text-secondary)] font-semibold font-mono uppercase tracking-widest">No Image</span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 leading-relaxed tracking-wide font-sans">{item.title}</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed font-sans line-clamp-3 h-[4.8em]">{item.description}</p>
        
        <div className="flex flex-col gap-2 mb-5 mt-auto font-mono text-[9px] text-[var(--text-secondary)] uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span className="truncate">{item.location}</span>
          </div>
          {item.user && (
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span className="truncate" title={item.user.email}>
                {item.user.name || 'Anonymous'}
              </span>
            </div>
          )}
        </div>

        {/* View Details Link */}
        <Link 
          to={`/lost-items/${item._id}`} 
          className="block w-full py-2.5 text-center rounded-full border border-border-subtle hover:border-[var(--accent-primary)]/50 hover:text-[var(--accent-primary)] bg-slate-950/10 hover:bg-slate-900/20 font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-bold transition-all duration-400"
        >
          // View Full Details
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;
