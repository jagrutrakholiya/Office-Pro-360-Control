'use client'
import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// PAGINATION UTILITIES
// ============================================

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
) {
  const { initialPage = 1, pageSize = 10 } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);
  
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);
  
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  return {
    currentData,
    currentPage,
    totalPages,
    totalItems: data.length,
    pageSize,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
  };
}

// ============================================
// INFINITE SCROLL
// ============================================

export interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll(
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
): [(node: HTMLElement | null) => void, boolean] {
  const { threshold = 1.0, rootMargin = '0px' } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const measureRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      if (node) {
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            setIsIntersecting(entry.isIntersecting);
            if (entry.isIntersecting) {
              callback();
            }
          },
          { threshold, rootMargin }
        );
        
        observerRef.current.observe(node);
      }
    },
    [callback, threshold, rootMargin]
  );
  
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  return [measureRef, isIntersecting];
}

export interface UseInfiniteLoadOptions<T> {
  pageSize?: number;
  loadMore: (page: number) => Promise<T[]>;
  initialData?: T[];
}

export function useInfiniteLoad<T>(options: UseInfiniteLoadOptions<T>) {
  const { pageSize = 20, loadMore, initialData = [] } = options;
  
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadNextPage = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newData = await loadMore(page);
      
      if (newData.length < pageSize) {
        setHasMore(false);
      }
      
      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, loadMore, pageSize]);
  
  const reset = useCallback(() => {
    setData(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [initialData]);
  
  const [sentinelRef] = useInfiniteScroll(loadNextPage, { threshold: 0.5 });
  
  return {
    data,
    loading,
    hasMore,
    error,
    loadNextPage,
    reset,
    sentinelRef,
  };
}

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());
  
  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);
      
      return () => clearTimeout(timerId);
    }
  }, [value, interval]);
  
  return throttledValue;
}

// ============================================
// VIRTUAL SCROLLING
// ============================================

export interface VirtualScrollOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const { itemHeight, overscan = 3, containerHeight = 600 } = options;
  
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    item,
    index: startIndex + index,
    offsetTop: (startIndex + index) * itemHeight,
  }));
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex,
  };
}

// ============================================
// OPTIMISTIC UPDATES
// ============================================

export interface OptimisticUpdate<T> {
  id: string;
  data: T;
  timestamp: number;
}

export function useOptimisticUpdate<T extends { _id?: string; id?: string }>() {
  const [pending, setPending] = useState<Map<string, OptimisticUpdate<T>>>(new Map());
  
  const addOptimistic = useCallback((id: string, data: T) => {
    setPending(prev => {
      const newMap = new Map(prev);
      newMap.set(id, { id, data, timestamp: Date.now() });
      return newMap;
    });
  }, []);
  
  const removeOptimistic = useCallback((id: string) => {
    setPending(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);
  
  const clearOptimistic = useCallback(() => {
    setPending(new Map());
  }, []);
  
  const applyOptimistic = useCallback(
    (items: T[]): T[] => {
      if (pending.size === 0) return items;
      
      const optimisticItems = Array.from(pending.values()).map(u => u.data);
      return [...optimisticItems, ...items];
    },
    [pending]
  );
  
  return {
    pending,
    addOptimistic,
    removeOptimistic,
    clearOptimistic,
    applyOptimistic,
  };
}

// ============================================
// CACHING
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;
  
  constructor(defaultTTL: number = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
  }
  
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + (ttl ?? this.defaultTTL),
    });
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export function useCache<T>(key: string, ttl?: number) {
  const cacheRef = useRef<Cache<T>>(new Cache<T>(ttl));
  
  const setCache = useCallback((data: T) => {
    cacheRef.current.set(key, data, ttl);
  }, [key, ttl]);
  
  const getCache = useCallback((): T | null => {
    return cacheRef.current.get(key);
  }, [key]);
  
  const clearCache = useCallback(() => {
    cacheRef.current.delete(key);
  }, [key]);
  
  return { setCache, getCache, clearCache };
}

// ============================================
// ASYNC DATA FETCHING WITH CACHE
// ============================================

export interface UseAsyncDataOptions<T> {
  cacheKey?: string;
  cacheTTL?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
) {
  const {
    cacheKey,
    cacheTTL = 5 * 60 * 1000,
    onSuccess,
    onError,
    enabled = true,
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { getCache, setCache } = useCache<T>(cacheKey || 'default', cacheTTL);
  
  const execute = useCallback(async (force = false) => {
    if (!enabled) return;
    
    // Check cache first
    if (!force && cacheKey) {
      const cached = getCache();
      if (cached) {
        setData(cached);
        return cached;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      setData(result);
      
      if (cacheKey) {
        setCache(result);
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [enabled, cacheKey, getCache, setCache, fetcher, onSuccess, onError]);
  
  const refetch = useCallback(() => execute(true), [execute]);
  
  useEffect(() => {
    execute();
  }, [execute]);
  
  return { data, loading, error, refetch, execute };
}

// ============================================
// LAZY LOADING
// ============================================

export function useLazyLoad<T>(
  loader: () => Promise<T>,
  options: { threshold?: number; rootMargin?: string } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedRef = useRef(false);
  
  const load = useCallback(async () => {
    if (hasLoadedRef.current || loading) return;
    
    hasLoadedRef.current = true;
    setLoading(true);
    
    try {
      const result = await loader();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load'));
    } finally {
      setLoading(false);
    }
  }, [loader, loading]);
  
  const [ref] = useInfiniteScroll(load, options);
  
  return { data, loading, error, ref };
}
