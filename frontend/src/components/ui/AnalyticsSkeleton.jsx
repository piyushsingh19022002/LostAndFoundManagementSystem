import React from 'react';
import Skeleton from './Skeleton';

const AnalyticsSkeleton = () => {
  return (
    <div className="space-y-8 w-full">
      {/* Stat Cards Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col gap-3 shadow-xl">
            <Skeleton className="w-1/2 h-4 rounded" />
            <Skeleton className="w-3/4 h-8 rounded" />
            <Skeleton className="w-2/3 h-3 rounded" />
          </div>
        ))}
      </div>

      {/* Main Graph Card Shimmer */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6 rounded" />
            <Skeleton className="w-72 h-4 rounded" />
          </div>
          <Skeleton className="w-28 h-10 rounded-lg" />
        </div>

        {/* Mock Chart Area */}
        <div className="flex items-end gap-3 h-64 px-4 pt-8">
          {[40, 75, 55, 90, 30, 85, 60, 45, 95, 70, 50, 80].map((h, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton 
                className="w-full rounded-t-md bg-slate-850/60" 
                style={{ height: `${h}%` }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
