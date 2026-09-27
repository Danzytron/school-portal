import React from 'react';
import { Skeleton } from '../Skeleton';
import { SkeletonMetric } from '../SkeletonMetric';
import { SkeletonBulletins } from '../SkeletonBulletins';

export function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-6 font-sans select-none" aria-hidden="true">
      {/* 1. Faculty Header Dossier Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-60" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>

      {/* 2. Official Campus Bulletins Section Skeleton */}
      <SkeletonBulletins count={2} />

      {/* 3. Faculty Metrics Strip Skeleton */}
      <SkeletonMetric count={4} />

      {/* 4. Main Two-Column Faculty Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Course Teaching Load */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-2xs">
            <div className="bg-slate-50/70 border-b border-slate-200/80 px-4 sm:px-5 py-3 flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3.5 rounded-lg border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-3 w-40" />
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-6 w-16 rounded" />
                      <Skeleton className="h-6 w-16 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Shortcuts & Queue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-2xs">
            <div className="bg-slate-50/70 border-b border-slate-200/80 px-4 sm:px-5 py-3">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200/80 flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboardSkeleton;
