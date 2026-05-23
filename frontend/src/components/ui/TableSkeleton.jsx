import React from 'react';
import Skeleton from './Skeleton';

const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Table Mock Header */}
      <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex gap-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <Skeleton 
            key={idx} 
            className={`h-4 rounded ${idx === 0 ? 'w-1/4' : 'w-1/5'}`} 
          />
        ))}
      </div>

      {/* Table Mock Rows */}
      <div className="divide-y divide-slate-850">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-6 py-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, cIdx) => {
              // Vary the widths to look realistic
              let width = 'w-1/5';
              if (cIdx === 0) width = 'w-1/3';
              if (cIdx === cols - 1) width = 'w-24'; // Button replacement

              return (
                <Skeleton 
                  key={cIdx} 
                  className={`h-4 rounded ${width}`} 
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
