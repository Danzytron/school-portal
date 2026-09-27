import React from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonTableColumn {
  label?: string;
  header?: string;
  key?: string;
  width?: string;
  [key: string]: any;
}

export interface SkeletonTableProps {
  columns?: SkeletonTableColumn[];
  columnCount?: number;
  rows?: number;
  className?: string;
  caption?: string;
}

export function SkeletonTable({
  columns,
  columnCount = 5,
  rows = 5,
  className = '',
  caption,
}: SkeletonTableProps) {
  const actualColCount = columns ? columns.length : columnCount;

  return (
    <div
      className={`w-full bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] select-none ${className}`}
      aria-hidden="true"
    >
      {caption && (
        <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      )}

      {/* ── Desktop Table Skeleton (≥ md) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200">
              {columns && columns.length > 0
                ? columns.map((col, idx) => (
                    <th key={idx} className="py-3 px-4 font-semibold text-slate-700">
                      <span className="text-[11px] font-semibold text-slate-600">
                        {col.label || col.header || col.key || 'Column'}
                      </span>
                    </th>
                  ))
                : Array.from({ length: actualColCount }).map((_, idx) => (
                    <th key={idx} className="py-3 px-4">
                      <Skeleton className="h-3 w-20" />
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50">
                {Array.from({ length: actualColCount }).map((_, cIdx) => (
                  <td key={cIdx} className="py-3.5 px-4">
                    <Skeleton
                      className={`h-3.5 ${
                        cIdx === 0
                          ? 'w-3/4'
                          : cIdx === actualColCount - 1
                          ? 'w-16'
                          : cIdx % 2 === 0
                          ? 'w-1/2'
                          : 'w-2/3'
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards Skeleton (< md) ── */}
      <div className="md:hidden divide-y divide-slate-200/80">
        {Array.from({ length: Math.min(rows, 4) }).map((_, idx) => (
          <div key={idx} className="p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonTable;
