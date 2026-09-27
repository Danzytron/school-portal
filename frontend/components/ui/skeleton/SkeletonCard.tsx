import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonText } from './SkeletonText';

export interface SkeletonCardProps {
  className?: string;
  lines?: number;
  hasHeader?: boolean;
  hasFooter?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export function SkeletonCard({
  className = '',
  lines = 3,
  hasHeader = true,
  hasFooter = false,
  header,
  footer,
  children,
}: SkeletonCardProps) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-2xs ${className}`}
      aria-hidden="true"
    >
      {header ? (
        <div className="bg-slate-50/70 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
          {header}
        </div>
      ) : hasHeader ? (
        <div className="bg-slate-50/70 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      ) : null}

      <div className="p-4 sm:p-5 space-y-3">
        {children || <SkeletonText lines={lines} />}
      </div>

      {footer ? (
        <div className="bg-slate-50/50 border-t border-slate-200/60 px-4 py-2.5 flex items-center justify-between">
          {footer}
        </div>
      ) : hasFooter ? (
        <div className="bg-slate-50/50 border-t border-slate-200/60 px-4 py-2.5 flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      ) : null}
    </div>
  );
}

export default SkeletonCard;
