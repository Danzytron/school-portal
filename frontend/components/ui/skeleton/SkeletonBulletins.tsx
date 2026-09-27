import React from 'react';
import { Skeleton } from './Skeleton';

interface SkeletonBulletinsProps {
  className?: string;
  count?: number;
}

export function SkeletonBulletins({ className = '', count = 2 }: SkeletonBulletinsProps) {
  return (
    <section className={`space-y-3 font-sans select-none ${className}`} aria-hidden="true">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/70">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-6 w-28 rounded" />
      </div>

      {/* Grid of Bulletin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-4.5 space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SkeletonBulletins;
