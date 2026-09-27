import React from 'react';
import { Skeleton } from './Skeleton';

interface SkeletonMetricProps {
  count?: number;
  className?: string;
}

export function SkeletonMetric({ count = 4, className = '' }: SkeletonMetricProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200/80 rounded-lg p-3.5 shadow-2xs flex items-start gap-3"
        >
          <Skeleton className="w-8 h-8 rounded-md shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-2 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonMetric;
