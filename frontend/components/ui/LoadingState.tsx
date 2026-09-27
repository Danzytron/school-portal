import React from "react";
import { Skeleton } from "./skeleton/Skeleton";
import { SkeletonTable } from "./skeleton/SkeletonTable";

interface LoadingStateProps {
  message?: string;
  text?: string;
  className?: string;
  variant?: 'table' | 'cards' | 'inline' | 'panel';
  rows?: number;
}

export function LoadingState({
  message,
  text,
  className = "",
  variant = 'table',
  rows = 4,
}: LoadingStateProps) {
  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 select-none ${className}`} aria-hidden="true">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'panel') {
    return (
      <div className={`bg-white border border-slate-200/90 rounded-lg p-5 space-y-4 shadow-2xs select-none ${className}`} aria-hidden="true">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </div>
    );
  }

  return <SkeletonTable rows={rows} className={className} />;
}

export default LoadingState;
