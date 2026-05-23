import React from 'react';
import Skeleton from './ui/Skeleton';

const ItemCardSkeleton = () => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col min-h-[410px] h-full gap-5">
      {/* Floating Badges */}
      <div className="flex items-center justify-between z-10">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>

      {/* Image Placeholder */}
      <Skeleton className="w-full h-48 rounded-xl bg-slate-950/40 border border-slate-900" />

      {/* Content Details */}
      <div className="flex flex-col flex-1 gap-4">
        {/* Title */}
        <Skeleton className="w-2/3 h-5 rounded" />

        {/* Description Lines */}
        <div className="space-y-2">
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-5/6 h-3 rounded" />
        </div>

        {/* Meta items */}
        <div className="mt-auto space-y-3 pt-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-1/3 h-3 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-1/4 h-3 rounded" />
          </div>
        </div>

        {/* Action Button */}
        <Skeleton className="w-full h-11 rounded-xl mt-4" />
      </div>
    </div>
  );
};

export default ItemCardSkeleton;
