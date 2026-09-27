import React from 'react';
import { Skeleton } from '../Skeleton';
import { SkeletonMetric } from '../SkeletonMetric';
import { SkeletonBulletins } from '../SkeletonBulletins';

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 font-sans select-none" aria-hidden="true">
      {/* 1. Executive Editorial Header Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-60" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-36 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* 2. Official Campus Bulletins Section Skeleton */}
      <SkeletonBulletins count={2} />

      {/* 3. Executive Metrics Strip Skeleton */}
      <SkeletonMetric count={4} />

      {/* 4. Analytics & Console Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Distribution Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-2xs">
            <div className="bg-slate-50/70 border-b border-slate-200/80 px-4 sm:px-5 py-3 flex items-center justify-between">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <div className="p-5 space-y-4">
              <div className="h-56 w-full flex items-end justify-between gap-4 pt-8 px-4">
                {[40, 75, 55, 90, 60].map((h, idx) => (
                  <div key={idx} className="w-full flex flex-col items-center gap-2">
                    <Skeleton className="w-full rounded-t" style={{ height: `${h}%` }} />
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Activity Ledger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-2xs">
            <div className="bg-slate-50/70 border-b border-slate-200/80 px-4 sm:px-5 py-3 flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <div className="p-0 divide-y divide-slate-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-44" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardSkeleton;
