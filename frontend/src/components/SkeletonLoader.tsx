import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full glass-panel rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-pulse">
      {/* Shimmer gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnail skeleton */}
        <div className="w-full md:w-72 h-44 rounded-2xl bg-surface-100 shrink-0 relative overflow-hidden" />

        {/* Content skeleton */}
        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-3">
            <div className="h-6 bg-surface-100 rounded-lg w-3/4" />
            <div className="h-4 bg-surface-100 rounded-md w-1/3" />
            <div className="flex gap-2 pt-2">
              <div className="h-5 bg-surface-100 rounded-full w-20" />
              <div className="h-5 bg-surface-100 rounded-full w-16" />
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="h-11 bg-surface-100 rounded-xl" />
              <div className="h-11 bg-surface-100 rounded-xl" />
              <div className="h-11 bg-surface-100 rounded-xl" />
            </div>
            <div className="h-12 bg-surface-100 rounded-xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
