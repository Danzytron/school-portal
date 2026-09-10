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
  onRowClick?: (row: any) => void;
  footer?: React.ReactNode;
}

export function DataTable({ 
  columns, 
  data, 
  actions, 
  keyField = "id",
  loading = false,
  emptyMessage = "No records found.",
  caption,
  onRowClick,
  footer
}: DataTableProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No Records" description={emptyMessage} />;
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded overflow-hidden">
      {caption && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-800">
          {caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col, idx) => {
                const headerText = col.label || col.header || col.key || `Col ${idx}`;
                const alignClass = col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left";
                return (
                  <th 
                    key={idx} 
                    className={`px-3 py-2 font-semibold text-gray-600 uppercase tracking-wider text-[11px] select-none ${alignClass} ${col.className || ""}`}
                  >
                    {headerText}
                  </th>
                );
              })}
              {actions && (
                <th className="px-3 py-2 font-semibold text-gray-600 uppercase tracking-wider text-[11px] text-right select-none">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => {
              const rowKey = row[keyField] !== undefined ? row[keyField] : rowIdx;

              return (
                <tr 
                  key={rowKey} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
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
                        className={`px-3 py-2 text-gray-700 align-middle ${alignClass} ${col.className || ""}`}
                      >
                        {cellVal !== null && cellVal !== undefined ? cellVal : "—"}
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="px-3 py-2 text-right align-middle">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          {footer && (
            <tfoot>
              {footer}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default DataTable;
