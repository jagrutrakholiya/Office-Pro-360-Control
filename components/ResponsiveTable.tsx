'use client';

import { useState } from 'react';
import { useIsMobile } from '../lib/mobileUtils';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  mobileLabel?: string; // Shorter label for mobile
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  keyField: string;
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export default function ResponsiveTable({
  columns,
  data,
  keyField,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false
}: ResponsiveTableProps) {
  const isMobile = useIsMobile();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-3">
        {sortedData.map((row) => (
          <div
            key={row[keyField]}
            onClick={() => onRowClick?.(row)}
            className={`bg-white rounded-lg shadow p-4 border border-gray-200 ${
              onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
          >
            {columns.map((column) => (
              <div key={column.key} className="mb-2 last:mb-0">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500">
                    {column.mobileLabel || column.label}
                  </span>
                  <div className="text-sm text-gray-900 text-right flex-1 ml-4">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <svg
                          className={`w-4 h-4 ${
                            sortColumn === column.key
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {sortColumn === column.key && sortDirection === 'asc' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          )}
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((row) => (
                <tr
                  key={row[keyField]}
                  onClick={() => onRowClick?.(row)}
                  className={`${
                    onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  } transition-colors`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Example usage
export function ExampleTable() {
  const columns: Column[] = [
    { key: 'id', label: 'ID', sortable: true, mobileLabel: '#' },
    { key: 'name', label: 'Name', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'email', label: 'Email' }
  ];

  const data = [
    { id: 1, name: 'John Doe', status: 'active', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', status: 'inactive', email: 'jane@example.com' }
  ];

  return (
    <ResponsiveTable
      columns={columns}
      data={data}
      keyField="id"
      onRowClick={(row) => console.log('Clicked:', row)}
    />
  );
}
