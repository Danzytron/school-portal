import React from 'react';
import { Skeleton } from '../Skeleton';

export function StudentDashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-7 font-sans select-none" aria-hidden="true">
      {/* 1. Large Hero Gradient Skeleton Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-7 lg:p-8 bg-blue-600/90 text-white shadow-md">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <Skeleton className="h-6 w-52 rounded-full bg-white/20" />
            <Skeleton className="h-10 w-80 rounded-xl bg-white/30" />
            <Skeleton className="h-4 w-96 rounded bg-white/20" />
            <div className="flex items-center gap-3 pt-2">
              <Skeleton className="h-9 w-40 rounded-xl bg-white/90" />
              <Skeleton className="h-9 w-44 rounded-xl bg-white/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4 border border-white/15 space-y-2 min-w-[125px]">
                <Skeleton className="h-3.5 w-20 bg-white/20" />
                <Skeleton className="h-7 w-16 bg-white/30" />
                <Skeleton className="h-3 w-24 bg-white/20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Four Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3.5 w-full" />
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Two-Column Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Schedule */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-1.5 h-6 rounded-full" />
                <Skeleton className="h-5 w-44" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 flex-1">
                    <Skeleton className="h-16 w-24 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3.5 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-28 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Campus Bulletin */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-1.5 h-6 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-6 rounded-full" />
            </div>

            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200/80 space-y-2 bg-slate-50/50">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="pt-2 border-t border-slate-200/60 flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboardSkeleton;
