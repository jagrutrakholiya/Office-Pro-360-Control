'use client'
import React from 'react';

// ============================================
// VIRTUAL LIST COMPONENT
// ============================================

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
  emptyMessage = 'No items to display',
  keyExtractor,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, virtualIndex) => {
          const actualIndex = startIndex + virtualIndex;
          const key = keyExtractor ? keyExtractor(item, actualIndex) : actualIndex;
          
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// VIRTUAL GRID COMPONENT
// ============================================

interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number;
  itemWidth: number;
  columns: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function VirtualGrid<T>({
  items,
  itemHeight,
  itemWidth,
  columns,
  containerHeight,
  renderItem,
  gap = 16,
  overscan = 1,
  className = '',
  emptyMessage = 'No items to display',
  keyExtractor,
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const rows = Math.ceil(items.length / columns);
  const totalHeight = rows * (itemHeight + gap) - gap;
  
  const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
  const endRow = Math.min(
    rows - 1,
    Math.floor((scrollTop + containerHeight) / (itemHeight + gap)) + overscan
  );
  
  const visibleItems: Array<{ item: T; index: number; row: number; col: number }> = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index < items.length) {
        visibleItems.push({
          item: items[index],
          index,
          row,
          col,
        });
      }
    }
  }
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: row * (itemHeight + gap),
                left: col * (itemWidth + gap),
                width: itemWidth,
                height: itemHeight,
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// VIRTUAL TABLE COMPONENT
// ============================================

interface VirtualTableColumn<T> {
  key: string;
  label: string;
  width?: number | string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface VirtualTableProps<T> {
  items: T[];
  columns: VirtualTableColumn<T>[];
  rowHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  emptyMessage?: string;
  keyExtractor?: (item: T, index: number) => string | number;
  onRowClick?: (item: T, index: number) => void;
}

export function VirtualTable<T>({
  items,
  columns,
  rowHeight,
  containerHeight,
  overscan = 3,
  className = '',
  headerClassName = '',
  rowClassName = '',
  emptyMessage = 'No data available',
  keyExtractor,
  onRowClick,
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const totalHeight = items.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / rowHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  const getRowClassName = (item: T, index: number) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(item, index);
    }
    return rowClassName;
  };
  
  if (items.length === 0) {
    return (
      <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
        <div className={`grid grid-cols-${columns.length} gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-semibold ${headerClassName}`}>
          {columns.map((col) => (
            <div key={col.key} style={{ width: col.width }}>
              {col.label}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      <div className={`grid gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-semibold ${headerClassName}`} style={{ gridTemplateColumns: columns.map(c => c.width || '1fr').join(' ') }}>
        {columns.map((col) => (
          <div key={col.key}>{col.label}</div>
        ))}
      </div>
      
      <div
        onScroll={handleScroll}
        style={{ height: containerHeight, overflow: 'auto' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((item, virtualIndex) => {
            const actualIndex = startIndex + virtualIndex;
            const key = keyExtractor ? keyExtractor(item, actualIndex) : actualIndex;
            
            return (
              <div
                key={key}
                onClick={() => onRowClick?.(item, actualIndex)}
                className={`grid gap-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${getRowClassName(item, actualIndex)} ${onRowClick ? 'cursor-pointer' : ''}`}
                style={{
                  position: 'absolute',
                  top: actualIndex * rowHeight,
                  left: 0,
                  right: 0,
                  height: rowHeight,
                  gridTemplateColumns: columns.map(c => c.width || '1fr').join(' '),
                }}
              >
                {columns.map((col) => (
                  <div key={col.key} className="flex items-center overflow-hidden">
                    {col.render ? col.render(item, actualIndex) : String((item as any)[col.key] ?? '')}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// AUTO-SIZING VIRTUAL LIST
// ============================================

interface AutoSizeVirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimatedItemHeight?: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function AutoSizeVirtualList<T>({
  items,
  renderItem,
  estimatedItemHeight = 100,
  containerHeight,
  overscan = 3,
  className = '',
  emptyMessage = 'No items to display',
  keyExtractor,
}: AutoSizeVirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [itemHeights, setItemHeights] = React.useState<Map<number, number>>(new Map());
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const getItemHeight = (index: number) => {
    return itemHeights.get(index) || estimatedItemHeight;
  };
  
  const getTotalHeight = () => {
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += getItemHeight(i);
    }
    return height;
  };
  
  const getStartIndex = () => {
    let accumulatedHeight = 0;
    for (let i = 0; i < items.length; i++) {
      if (accumulatedHeight >= scrollTop) {
        return Math.max(0, i - overscan);
      }
      accumulatedHeight += getItemHeight(i);
    }
    return 0;
  };
  
  const getVisibleRange = () => {
    const startIndex = getStartIndex();
    let accumulatedHeight = 0;
    
    for (let i = 0; i < startIndex; i++) {
      accumulatedHeight += getItemHeight(i);
    }
    
    const visibleItems = [];
    for (let i = startIndex; i < items.length; i++) {
      if (accumulatedHeight > scrollTop + containerHeight + overscan * estimatedItemHeight) {
        break;
      }
      
      visibleItems.push({
        item: items[i],
        index: i,
        offsetTop: accumulatedHeight,
      });
      
      accumulatedHeight += getItemHeight(i);
    }
    
    return visibleItems;
  };
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  const measureItem = React.useCallback((index: number, height: number) => {
    setItemHeights(prev => {
      if (prev.get(index) === height) return prev;
      const next = new Map(prev);
      next.set(index, height);
      return next;
    });
  }, []);
  
  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }
  
  const visibleItems = getVisibleRange();
  const totalHeight = getTotalHeight();
  
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, offsetTop }) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          
          return (
            <MeasuredItem
              key={key}
              index={index}
              offsetTop={offsetTop}
              onMeasure={measureItem}
            >
              {renderItem(item, index)}
            </MeasuredItem>
          );
        })}
      </div>
    </div>
  );
}

interface MeasuredItemProps {
  index: number;
  offsetTop: number;
  onMeasure: (index: number, height: number) => void;
  children: React.ReactNode;
}

function MeasuredItem({ index, offsetTop, onMeasure, children }: MeasuredItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (ref.current) {
      const height = ref.current.getBoundingClientRect().height;
      onMeasure(index, height);
    }
  }, [index, onMeasure]);
  
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: offsetTop,
        left: 0,
        right: 0,
      }}
    >
      {children}
    </div>
  );
}
