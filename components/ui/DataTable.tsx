"use client";

import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string;
}

export default function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = "No data",
  onRowClick,
  rowKey,
}: Props<T>) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider ${col.className || ""}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.map((row, idx) => {
              const key = rowKey ? rowKey(row) : String(idx);
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`${
                    onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50" : ""
                  } transition-colors`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-6 py-4 text-sm text-slate-700 dark:text-slate-300 ${col.className || ""}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
