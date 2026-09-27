import React from 'react';
import { Skeleton } from './Skeleton';

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineHeight?: string;
}

export function SkeletonText({
  lines = 2,
  className = '',
  lineHeight = 'h-3.5',
}: SkeletonTextProps) {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-1/2'];

  return (
    <div className={`space-y-2 select-none ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={`${lineHeight} ${widths[idx % widths.length]}`}
        />
      ))}
    </div>
  );
}

export default SkeletonText;
