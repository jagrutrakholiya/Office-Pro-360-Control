'use client'
import { useEffect, useRef, useCallback } from 'react';

// ============================================
// ADVANCED CACHE WITH LRU
// ============================================

export class LRUCache<T> {
  private cache: Map<string, { value: T; timestamp: number; accessCount: number }>;
  private maxSize: number;
  private ttl: number;
  
  constructor(maxSize: number = 100, ttl: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access count and move to end (most recently used)
    entry.accessCount++;
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.value;
  }
  
  set(key: string, value: T): void {
    // Remove if exists (will re-add at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Remove least recently used if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
    });
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
  
  size(): number {
    return this.cache.size;
  }
  
  // Get cache statistics
  getStats() {
    let totalAccess = 0;
    const entries = Array.from(this.cache.entries());
    
    entries.forEach(([, entry]) => {
      totalAccess += entry.accessCount;
    });
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccess,
      avgAccessPerItem: entries.length > 0 ? totalAccess / entries.length : 0,
    };
  }
  
  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// ============================================
// CACHE WITH STALE-WHILE-REVALIDATE
// ============================================

export class StaleWhileRevalidateCache<T> {
  private cache: Map<string, { value: T; timestamp: number; staleAt: number }>;
  private freshTTL: number;
  private staleTTL: number;
  
  constructor(freshTTL: number = 30 * 1000, staleTTL: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.freshTTL = freshTTL;
    this.staleTTL = staleTTL;
  }
  
  get(key: string): { value: T | null; isStale: boolean } {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return { value: null, isStale: false };
    }
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    // Too old, remove and return null
    if (age > this.staleTTL) {
      this.cache.delete(key);
      return { value: null, isStale: false };
    }
    
    // Stale but usable
    if (age > this.freshTTL) {
      return { value: entry.value, isStale: true };
    }
    
    // Fresh
    return { value: entry.value, isStale: false };
  }
  
  set(key: string, value: T): void {
    const now = Date.now();
    this.cache.set(key, {
      value,
      timestamp: now,
      staleAt: now + this.freshTTL,
    });
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// ============================================
// QUERY CACHE WITH DEPENDENCIES
// ============================================

export class QueryCache<T> {
  private cache: Map<string, { value: T; timestamp: number; dependencies: string[] }>;
  private ttl: number;
  
  constructor(ttl: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  set(key: string, value: T, dependencies: string[] = []): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      dependencies,
    });
  }
  
  // Invalidate cache entry and all dependent entries
  invalidate(key: string): void {
    this.cache.delete(key);
    
    // Invalidate dependent queries
    const keysToInvalidate: string[] = [];
    
    this.cache.forEach((entry, cacheKey) => {
      if (entry.dependencies.includes(key)) {
        keysToInvalidate.push(cacheKey);
      }
    });
    
    keysToInvalidate.forEach(k => this.cache.delete(k));
  }
  
  // Invalidate all entries with a specific dependency
  invalidateByDependency(dependency: string): void {
    const keysToInvalidate: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (entry.dependencies.includes(dependency)) {
        keysToInvalidate.push(key);
      }
    });
    
    keysToInvalidate.forEach(key => this.cache.delete(key));
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// ============================================
// BROWSER STORAGE CACHE
// ============================================

export class PersistentCache<T> {
  private storageKey: string;
  private ttl: number;
  private storage: Storage;
  
  constructor(storageKey: string, ttl: number = 24 * 60 * 60 * 1000, useSessionStorage = false) {
    this.storageKey = storageKey;
    this.ttl = ttl;
    this.storage = useSessionStorage ? sessionStorage : localStorage;
  }
  
  get(key: string): T | null {
    try {
      const item = this.storage.getItem(`${this.storageKey}:${key}`);
      
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      if (Date.now() - parsed.timestamp > this.ttl) {
        this.delete(key);
        return null;
      }
      
      return parsed.value;
    } catch {
      return null;
    }
  }
  
  set(key: string, value: T): void {
    try {
      const item = {
        value,
        timestamp: Date.now(),
      };
      
      this.storage.setItem(`${this.storageKey}:${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }
  
  delete(key: string): void {
    this.storage.removeItem(`${this.storageKey}:${key}`);
  }
  
  clear(): void {
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith(`${this.storageKey}:`)) {
        this.storage.removeItem(key);
      }
    });
  }
  
  // Get all cached keys
  keys(): string[] {
    const allKeys = Object.keys(this.storage);
    return allKeys
      .filter(key => key.startsWith(`${this.storageKey}:`))
      .map(key => key.replace(`${this.storageKey}:`, ''));
  }
}

// ============================================
// REACT HOOKS FOR CACHING
// ============================================

export function useLRUCache<T>(maxSize?: number, ttl?: number) {
  const cacheRef = useRef<LRUCache<T>>(new LRUCache<T>(maxSize, ttl));
  
  useEffect(() => {
    const interval = setInterval(() => {
      cacheRef.current.cleanup();
    }, 60000); // Cleanup every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return cacheRef.current;
}

export function useQueryCache<T>(ttl?: number) {
  const cacheRef = useRef<QueryCache<T>>(new QueryCache<T>(ttl));
  return cacheRef.current;
}

export function usePersistentCache<T>(
  storageKey: string,
  ttl?: number,
  useSessionStorage?: boolean
) {
  const cacheRef = useRef<PersistentCache<T>>(
    new PersistentCache<T>(storageKey, ttl, useSessionStorage)
  );
  return cacheRef.current;
}

export function useStaleWhileRevalidate<T>(freshTTL?: number, staleTTL?: number) {
  const cacheRef = useRef<StaleWhileRevalidateCache<T>>(
    new StaleWhileRevalidateCache<T>(freshTTL, staleTTL)
  );
  return cacheRef.current;
}

// ============================================
// CACHE MANAGER WITH MULTIPLE STRATEGIES
// ============================================

export type CacheStrategy = 'memory' | 'lru' | 'swr' | 'persistent';

export class CacheManager<T> {
  private memoryCache: Map<string, { value: T; timestamp: number; ttl: number }>;
  private lruCache: LRUCache<T>;
  private swrCache: StaleWhileRevalidateCache<T>;
  private persistentCache: PersistentCache<T> | null = null;
  
  constructor(storageKey?: string) {
    this.memoryCache = new Map();
    this.lruCache = new LRUCache<T>();
    this.swrCache = new StaleWhileRevalidateCache<T>();
    
    if (storageKey && typeof window !== 'undefined') {
      this.persistentCache = new PersistentCache<T>(storageKey);
    }
  }
  
  get(key: string, strategy: CacheStrategy = 'memory'): T | null {
    switch (strategy) {
      case 'lru':
        return this.lruCache.get(key);
        
      case 'swr':
        return this.swrCache.get(key).value;
        
      case 'persistent':
        return this.persistentCache?.get(key) || null;
        
      case 'memory':
      default:
        const entry = this.memoryCache.get(key);
        if (!entry) return null;
        
        if (Date.now() - entry.timestamp > entry.ttl) {
          this.memoryCache.delete(key);
          return null;
        }
        
        return entry.value;
    }
  }
  
  set(key: string, value: T, strategy: CacheStrategy = 'memory', ttl: number = 5 * 60 * 1000): void {
    switch (strategy) {
      case 'lru':
        this.lruCache.set(key, value);
        break;
        
      case 'swr':
        this.swrCache.set(key, value);
        break;
        
      case 'persistent':
        this.persistentCache?.set(key, value);
        break;
        
      case 'memory':
      default:
        this.memoryCache.set(key, {
          value,
          timestamp: Date.now(),
          ttl,
        });
    }
  }
  
  delete(key: string, strategy?: CacheStrategy): void {
    if (!strategy || strategy === 'memory') {
      this.memoryCache.delete(key);
    }
    if (!strategy || strategy === 'lru') {
      this.lruCache.delete(key);
    }
    if (!strategy || strategy === 'swr') {
      this.swrCache.delete(key);
    }
    if (!strategy || strategy === 'persistent') {
      this.persistentCache?.delete(key);
    }
  }
  
  clear(strategy?: CacheStrategy): void {
    if (!strategy || strategy === 'memory') {
      this.memoryCache.clear();
    }
    if (!strategy || strategy === 'lru') {
      this.lruCache.clear();
    }
    if (!strategy || strategy === 'swr') {
      this.swrCache.clear();
    }
    if (!strategy || strategy === 'persistent') {
      this.persistentCache?.clear();
    }
  }
}

export function useCacheManager<T>(storageKey?: string) {
  const managerRef = useRef<CacheManager<T>>(new CacheManager<T>(storageKey));
  return managerRef.current;
}

// ============================================
// CACHE KEY GENERATOR
// ============================================

export function generateCacheKey(base: string, params?: Record<string, any>): string {
  if (!params) return base;
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');
  
  return `${base}@${sortedParams}`;
}
