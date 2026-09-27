import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'rounded' | 'circular';
  animate?: boolean;
}

export function Skeleton({
  className = '',
  variant = 'rounded',
  animate = true,
  ...props
}: SkeletonProps) {
  const variantClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'rectangular'
      ? 'rounded-none'
      : 'rounded-md';

  const animationClass = animate ? 'animate-pulse bg-slate-200/80' : 'bg-slate-200/80';

  return (
    <div
      aria-hidden="true"
      className={`shrink-0 select-none ${variantClass} ${animationClass} ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
