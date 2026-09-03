import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : undefined;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 border-t-0 rounded-b-md text-xs text-slate-600">
      <div>
        {startItem && endItem && totalItems ? (
          <span>Showing <strong className="font-semibold text-slate-800">{startItem}</strong> to <strong className="font-semibold text-slate-800">{endItem}</strong> of <strong className="font-semibold text-slate-800">{totalItems}</strong> entries</span>
        ) : (
          <span>Page <strong className="font-semibold text-slate-800">{currentPage}</strong> of <strong className="font-semibold text-slate-800">{totalPages}</strong></span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn-default py-1 px-2 text-[11px] disabled:opacity-40"
        >
          <ChevronLeft size={13} className="mr-0.5" /> Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
          .map((page, idx, arr) => {
            const prev = arr[idx - 1];
            const isEllipsis = prev && page - prev > 1;

            return (
              <React.Fragment key={page}>
                {isEllipsis && <span className="px-1 text-slate-400">...</span>}
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-2.5 py-1 text-[11px] rounded border font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-blue-700 text-white border-blue-800 font-semibold'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn-default py-1 px-2 text-[11px] disabled:opacity-40"
        >
          Next <ChevronRight size={13} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
