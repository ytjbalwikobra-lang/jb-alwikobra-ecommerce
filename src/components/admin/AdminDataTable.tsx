import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, MoreHorizontal } from 'lucide-react';
import { AdminButton } from './AdminButton';

interface Column<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  mobileHidden?: boolean; // Hide column on mobile
}

interface AdminDataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  searchable?: boolean;
  filterable?: boolean;
  onSearch?: (searchTerm: string) => void;
  actions?: {
    label: string;
    onClick: (record: T) => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  className?: string;
  emptyText?: string;
  mobileCardRender?: (record: T, index: number) => React.ReactNode; // Custom mobile view
}

const AdminDataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  searchable = false,
  filterable = false,
  onSearch,
  actions,
  className = '',
  emptyText = 'No data available',
  mobileCardRender
}: AdminDataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string; direction: 'asc' | 'desc'} | null>(null);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Pagination controls
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;
  const startItem = pagination ? (pagination.current - 1) * pagination.pageSize + 1 : 1;
  const endItem = pagination ? Math.min(pagination.current * pagination.pageSize, pagination.total) : data.length;

  if (loading) {
    return (
      <div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-700 rounded w-1/4"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-700 rounded w-20"></div>
              <div className="h-8 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
          
          {/* Table skeleton */}
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl overflow-hidden ${className}`}>
      {/* Header with search and filters */}
      {(searchable || filterable) && (
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}
            
            {filterable && (
              <AdminButton
                variant="secondary"
                size="sm"
                icon={<Filter className="h-4 w-4" />}
              >
                Filters
              </AdminButton>
            )}
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-orange-600 to-orange-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-orange-600' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-6 py-12 text-center text-gray-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => (
                <tr key={index} className="hover:bg-gray-700 transition-colors duration-200">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-6 py-4 ${column.className || ''}`}>
                      {column.render 
                        ? column.render(record[column.key], record, index)
                        : record[column.key]
                      }
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {actions.map((action, actionIndex) => (
                          <AdminButton
                            key={actionIndex}
                            variant={action.variant || 'secondary'}
                            size="sm"
                            icon={action.icon}
                            onClick={() => action.onClick(record)}
                          >
                            {action.label}
                          </AdminButton>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {sortedData.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {emptyText}
          </div>
        ) : (
          sortedData.map((record, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 space-y-3">
              {mobileCardRender ? (
                mobileCardRender(record, index)
              ) : (
                <>
                  {columns
                    .filter(col => !col.mobileHidden)
                    .map((column) => (
                      <div key={column.key} className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-400 capitalize">
                          {column.title}:
                        </span>
                        <span className="text-sm text-white text-right">
                          {column.render 
                            ? column.render(record[column.key], record, index)
                            : record[column.key]
                          }
                        </span>
                      </div>
                    ))
                  }
                  
                  {actions && actions.length > 0 && (
                    <div className="flex justify-end space-x-2 pt-2 border-t border-gray-700">
                      {actions.map((action, actionIndex) => (
                        <AdminButton
                          key={actionIndex}
                          variant={action.variant || 'secondary'}
                          size="sm"
                          icon={action.icon}
                          onClick={() => action.onClick(record)}
                        >
                          {action.label}
                        </AdminButton>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > pagination.pageSize && (
        <div className="px-4 py-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              Showing {startItem} to {endItem} of {pagination.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <AdminButton
                variant="secondary"
                size="sm"
                icon={<ChevronLeft className="h-4 w-4" />}
                disabled={pagination.current === 1}
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              >
                Previous
              </AdminButton>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= pagination.current - 1 && page <= pagination.current + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => pagination.onChange(page, pagination.pageSize)}
                        className={`px-3 py-1 text-sm rounded ${
                          page === pagination.current
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.current - 2 ||
                    page === pagination.current + 2
                  ) {
                    return <span key={page} className="text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <AdminButton
                variant="secondary"
                size="sm"
                icon={<ChevronRight className="h-4 w-4" />}
                disabled={pagination.current === totalPages}
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              >
                Next
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataTable;
