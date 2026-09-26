import React from "react";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";

export interface ColumnDef {
  key?: string;
  accessor?: string;
  label?: string;
  header?: string;
  render?: (row: any) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

interface DataTableProps {
  columns: ColumnDef[];
  data: any[];
  actions?: (row: any) => React.ReactNode;
  keyField?: string;
  loading?: boolean;
  emptyMessage?: string;
  caption?: string;
  renderCard?: (row: any, index: number) => React.ReactNode;
}

export function DataTable({ 
  columns, 
  data, 
  actions, 
  keyField = "id",
  loading = false,
  emptyMessage = "No academic records available",
  caption,
  renderCard
}: DataTableProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No Records Available" description={emptyMessage} />;
  }

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {caption && (
        <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 py-2.5 text-xs font-heading font-semibold text-slate-800">
          {caption}
        </div>
      )}

      {/* ── Desktop Table View (≥ md) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200">
              {columns.map((col, idx) => {
                const headerText = col.label || col.header || col.key || `Col ${idx}`;
                const alignClass = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";
                return (
                  <th 
                    key={idx} 
                    className={`px-3.5 sm:px-4 py-3 font-semibold text-slate-700 uppercase tracking-wider text-[11px] select-none font-sans ${alignClass} ${col.className || ""}`}
                  >
                    {headerText}
                  </th>
                );
              })}
              {actions && (
                <th className="px-3.5 sm:px-4 py-3 font-semibold text-slate-700 uppercase tracking-wider text-[11px] text-right select-none font-sans">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {data.map((row, rowIdx) => {
              const rowKey = row[keyField] !== undefined ? row[keyField] : rowIdx;
              const isEven = rowIdx % 2 === 1;

              return (
                <tr 
                  key={rowKey} 
                  className={`hover:bg-blue-50/30 transition-colors ${isEven ? 'bg-slate-50/40' : 'bg-white'}`}
                >
                  {columns.map((col, colIdx) => {
                    const fieldKey = col.accessor || col.key;
                    let cellVal = fieldKey && row[fieldKey] !== undefined ? row[fieldKey] : null;

                    if (col.render) {
                      cellVal = col.render(row);
                    }

                    const alignClass = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";

                    return (
                      <td 
                        key={colIdx} 
                        className={`px-3.5 sm:px-4 py-3 text-slate-700 align-middle ${alignClass} ${col.className || ""}`}
                      >
                        {cellVal !== null && cellVal !== undefined ? cellVal : "—"}
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="px-3.5 sm:px-4 py-3 text-right align-middle font-medium">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card / List View (< md) ── */}
      <div className="block md:hidden divide-y divide-slate-200/80">
        {data.map((row, rowIdx) => {
          const rowKey = row[keyField] !== undefined ? row[keyField] : rowIdx;

          if (renderCard) {
            return (
              <div key={rowKey} className="p-3.5 hover:bg-slate-50/60 transition-colors">
                {renderCard(row, rowIdx)}
              </div>
            );
          }

          const primaryCol = columns[0];
          const otherCols = columns.slice(1);

          let primaryVal = primaryCol?.accessor || primaryCol?.key ? row[primaryCol.accessor || primaryCol.key!] : null;
          if (primaryCol?.render) {
            primaryVal = primaryCol.render(row);
          }

          return (
            <div key={rowKey} className="p-3.5 space-y-2.5 bg-white hover:bg-slate-50/60 transition-colors">
              {/* Primary Header Item */}
              {primaryCol && (
                <div className="font-semibold text-slate-900 text-sm break-words">
                  {primaryVal !== null && primaryVal !== undefined ? primaryVal : "—"}
                </div>
              )}

              {/* Other Column Details */}
              {otherCols.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-100">
                  {otherCols.map((col, cIdx) => {
                    const fieldKey = col.accessor || col.key;
                    const label = col.label || col.header || fieldKey || `Field ${cIdx + 1}`;
                    let val = fieldKey && row[fieldKey] !== undefined ? row[fieldKey] : null;

                    if (col.render) {
                      val = col.render(row);
                    }
                    if (val === null || val === undefined) val = "—";

                    return (
                      <div key={cIdx} className="flex items-center justify-between gap-2 py-0.5 min-w-0">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                          {label}
                        </span>
                        <div className="text-slate-800 font-medium text-right truncate">
                          {val}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions Row */}
              {actions && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  {actions(row)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DataTable;
