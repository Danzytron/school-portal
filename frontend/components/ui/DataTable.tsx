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
}

export function DataTable({ 
  columns, 
  data, 
  actions, 
  keyField = "id",
  loading = false,
  emptyMessage = "No academic records available",
  caption
}: DataTableProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No Records Available" description={emptyMessage} />;
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-md overflow-hidden">
      {caption && (
        <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800">
          {caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, idx) => {
                const headerText = col.label || col.header || col.key || `Col ${idx}`;
                const alignClass = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";
                return (
                  <th 
                    key={idx} 
                    className={`px-3.5 py-2.5 font-semibold text-slate-600 uppercase tracking-wider text-[11px] select-none ${alignClass} ${col.className || ""}`}
                  >
                    {headerText}
                  </th>
                );
              })}
              {actions && (
                <th className="px-3.5 py-2.5 font-semibold text-slate-600 uppercase tracking-wider text-[11px] text-right select-none">
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
                  className={`hover:bg-slate-50 transition-colors ${isEven ? 'bg-slate-50/30' : 'bg-white'}`}
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
                        className={`px-3.5 py-2.5 text-slate-700 align-middle ${alignClass} ${col.className || ""}`}
                      >
                        {cellVal !== null && cellVal !== undefined ? cellVal : "—"}
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="px-3.5 py-2.5 text-right align-middle font-medium">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
