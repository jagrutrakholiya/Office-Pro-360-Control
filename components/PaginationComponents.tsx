'use client'
import React from 'react';

// ============================================
// PAGINATION COMPONENT
// ============================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  showFirstLast = true,
  className = '',
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          First
        </button>
      )}
      
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      
      {getPageNumbers().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              currentPage === page
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-2 text-gray-500">
            {page}
          </span>
        )
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
      
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Last
        </button>
      )}
    </div>
  );
}

// ============================================
// INFINITE SCROLL SENTINEL
// ============================================

interface InfiniteScrollSentinelProps {
  loading?: boolean;
  hasMore?: boolean;
  loaderText?: string;
  endText?: string;
  sentinelRef?: (node: HTMLElement | null) => void;
}

export function InfiniteScrollSentinel({
  loading = false,
  hasMore = true,
  loaderText = 'Loading more...',
  endText = 'No more items',
  sentinelRef,
}: InfiniteScrollSentinelProps) {
  return (
    <div
      ref={sentinelRef}
      className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400"
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>{loaderText}</span>
        </div>
      ) : hasMore ? (
        <span className="text-sm">Scroll for more</span>
      ) : (
        <span className="text-sm">{endText}</span>
      )}
    </div>
  );
}

// ============================================
// VIRTUAL SCROLL CONTAINER
// ============================================

interface VirtualScrollContainerProps<T> {
  items: Array<{ item: T; index: number; offsetTop: number }>;
  totalHeight: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  containerHeight: number;
}

export function VirtualScrollContainer<T>({
  items,
  totalHeight,
  onScroll,
  renderItem,
  className = '',
  containerHeight,
}: VirtualScrollContainerProps<T>) {
  return (
    <div
      onScroll={onScroll}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items.map(({ item, index, offsetTop }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetTop,
              left: 0,
              right: 0,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// LOAD MORE BUTTON
// ============================================

interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  text?: string;
  loadingText?: string;
  className?: string;
}

export function LoadMoreButton({
  onClick,
  loading = false,
  disabled = false,
  text = 'Load More',
  loadingText = 'Loading...',
  className = '',
}: LoadMoreButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${className}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      <span>{loading ? loadingText : text}</span>
    </button>
  );
}

// ============================================
// PAGE SIZE SELECTOR
// ============================================

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  className?: string;
}

export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = [10, 25, 50, 100],
  className = '',
}: PageSizeSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
    </div>
  );
}

// ============================================
// PAGINATION INFO
// ============================================

interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
  className = '',
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return (
    <div className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      Showing {startItem} - {endItem} of {totalItems} items
    </div>
  );
}

// ============================================
// COMPLETE PAGINATION CONTROLS
// ============================================

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  className = '',
}: PaginationControlsProps) {
  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${className}`}>
      <PaginationInfo
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
      />
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <PageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          options={pageSizeOptions}
        />
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
