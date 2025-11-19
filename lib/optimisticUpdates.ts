'use client'
import { useState, useCallback, useRef } from 'react';

// ============================================
// OPTIMISTIC UPDATE MANAGER
// ============================================

export type OptimisticAction<T> = {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: T | Partial<T>;
  originalData?: T;
  timestamp: number;
};

export class OptimisticManager<T extends { _id?: string; id?: string }> {
  private actions: Map<string, OptimisticAction<T>> = new Map();
  private listeners: Set<() => void> = new Set();
  
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  notify() {
    this.listeners.forEach(listener => listener());
  }
  
  addCreate(id: string, data: T) {
    this.actions.set(id, {
      id,
      type: 'create',
      data,
      timestamp: Date.now(),
    });
    this.notify();
  }
  
  addUpdate(id: string, data: Partial<T>, originalData: T) {
    this.actions.set(id, {
      id,
      type: 'update',
      data,
      originalData,
      timestamp: Date.now(),
    });
    this.notify();
  }
  
  addDelete(id: string, originalData: T) {
    this.actions.set(id, {
      id,
      type: 'delete',
      data: originalData,
      originalData,
      timestamp: Date.now(),
    });
    this.notify();
  }
  
  commit(id: string) {
    this.actions.delete(id);
    this.notify();
  }
  
  rollback(id: string) {
    this.actions.delete(id);
    this.notify();
  }
  
  clear() {
    this.actions.clear();
    this.notify();
  }
  
  getActions() {
    return Array.from(this.actions.values());
  }
  
  hasAction(id: string) {
    return this.actions.has(id);
  }
  
  applyOptimisticUpdates(items: T[]): T[] {
    let result = [...items];
    
    for (const action of this.actions.values()) {
      switch (action.type) {
        case 'create':
          result = [action.data as T, ...result];
          break;
          
        case 'update':
          result = result.map(item => {
            const itemId = item._id || item.id;
            if (itemId === action.id) {
              return { ...item, ...action.data };
            }
            return item;
          });
          break;
          
        case 'delete':
          result = result.filter(item => {
            const itemId = item._id || item.id;
            return itemId !== action.id;
          });
          break;
      }
    }
    
    return result;
  }
}

// ============================================
// USE OPTIMISTIC MUTATIONS HOOK
// ============================================

export interface OptimisticMutationOptions<T, TArgs = any> {
  mutationFn: (args: TArgs) => Promise<T>;
  onSuccess?: (data: T, args: TArgs) => void;
  onError?: (error: Error, args: TArgs) => void;
  onSettled?: (data: T | undefined, error: Error | undefined, args: TArgs) => void;
}

export function useOptimisticMutation<T extends { _id?: string; id?: string }, TArgs = any>(
  options: OptimisticMutationOptions<T, TArgs>
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const optimisticIdRef = useRef(0);
  
  const mutate = useCallback(async (args: TArgs, optimisticData?: T) => {
    const optimisticId = `optimistic-${++optimisticIdRef.current}`;
    
    setIsPending(true);
    setError(null);
    
    try {
      // Return optimistic ID for immediate UI updates
      const pendingPromise = options.mutationFn(args);
      
      if (optimisticData) {
        // Caller can use optimisticId to track this mutation
        (optimisticData as any).__optimisticId = optimisticId;
      }
      
      const result = await pendingPromise;
      
      options.onSuccess?.(result, args);
      options.onSettled?.(result, undefined, args);
      
      return { result, optimisticId };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      setError(error);
      options.onError?.(error, args);
      options.onSettled?.(undefined, error, args);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [options]);
  
  return {
    mutate,
    isPending,
    error,
  };
}

// ============================================
// USE OPTIMISTIC STATE HOOK
// ============================================

export interface UseOptimisticStateOptions<T> {
  initialData: T[];
  onUpdate?: (data: T[]) => void;
}

export function useOptimisticState<T extends { _id?: string; id?: string }>(
  options: UseOptimisticStateOptions<T>
) {
  const [data, setData] = useState<T[]>(options.initialData);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticAction<T>>>(new Map());
  
  const applyOptimistic = useCallback((items: T[]): T[] => {
    let result = [...items];
    
    for (const action of optimisticUpdates.values()) {
      switch (action.type) {
        case 'create':
          result = [action.data as T, ...result];
          break;
          
        case 'update':
          result = result.map(item => {
            const itemId = item._id || item.id;
            if (itemId === action.id) {
              return { ...item, ...action.data };
            }
            return item;
          });
          break;
          
        case 'delete':
          result = result.filter(item => {
            const itemId = item._id || item.id;
            return itemId !== action.id;
          });
          break;
      }
    }
    
    return result;
  }, [optimisticUpdates]);
  
  const optimisticCreate = useCallback((item: T) => {
    const id = item._id || item.id || `temp-${Date.now()}`;
    
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.set(id, {
        id,
        type: 'create',
        data: item,
        timestamp: Date.now(),
      });
      return next;
    });
    
    return id;
  }, []);
  
  const optimisticUpdate = useCallback((id: string, updates: Partial<T>) => {
    const originalItem = data.find(item => (item._id || item.id) === id);
    
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.set(id, {
        id,
        type: 'update',
        data: updates,
        originalData: originalItem,
        timestamp: Date.now(),
      });
      return next;
    });
  }, [data]);
  
  const optimisticDelete = useCallback((id: string) => {
    const originalItem = data.find(item => (item._id || item.id) === id);
    
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.set(id, {
        id,
        type: 'delete',
        data: originalItem!,
        originalData: originalItem,
        timestamp: Date.now(),
      });
      return next;
    });
  }, [data]);
  
  const commitOptimistic = useCallback((id: string, serverData?: T) => {
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
    
    if (serverData) {
      setData(prev => {
        const action = optimisticUpdates.get(id);
        
        if (action?.type === 'create') {
          // Replace optimistic item with server data
          return prev.map(item => {
            const itemId = item._id || item.id;
            return itemId === id ? serverData : item;
          });
        }
        
        if (action?.type === 'update') {
          // Update with server data
          return prev.map(item => {
            const itemId = item._id || item.id;
            return itemId === id ? serverData : item;
          });
        }
        
        return prev;
      });
    }
  }, [optimisticUpdates]);
  
  const rollbackOptimistic = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);
  
  const clearOptimistic = useCallback(() => {
    setOptimisticUpdates(new Map());
  }, []);
  
  const displayData = applyOptimistic(data);
  
  return {
    data: displayData,
    setData,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    commitOptimistic,
    rollbackOptimistic,
    clearOptimistic,
    hasOptimisticUpdates: optimisticUpdates.size > 0,
  };
}

// ============================================
// USE OPTIMISTIC QUERY HOOK
// ============================================

export interface UseOptimisticQueryOptions<T> {
  queryKey: string;
  queryFn: () => Promise<T[]>;
  enabled?: boolean;
  refetchInterval?: number;
}

export function useOptimisticQuery<T extends { _id?: string; id?: string }>(
  options: UseOptimisticQueryOptions<T>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchCount, setRefetchCount] = useState(0);
  
  const optimisticState = useOptimisticState({ initialData: data });
  
  const fetchData = useCallback(async () => {
    if (!options.enabled) return;
    
    try {
      setLoading(true);
      const result = await options.queryFn();
      setData(result);
      optimisticState.setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Query failed'));
    } finally {
      setLoading(false);
    }
  }, [options.enabled, options.queryFn, refetchCount]);
  
  const refetch = useCallback(() => {
    setRefetchCount(prev => prev + 1);
  }, []);
  
  // Auto-refetch on interval
  React.useEffect(() => {
    if (options.refetchInterval && options.enabled) {
      const interval = setInterval(refetch, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [options.refetchInterval, options.enabled, refetch]);
  
  // Initial fetch
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data: optimisticState.data,
    loading,
    error,
    refetch,
    optimisticCreate: optimisticState.optimisticCreate,
    optimisticUpdate: optimisticState.optimisticUpdate,
    optimisticDelete: optimisticState.optimisticDelete,
    commitOptimistic: optimisticState.commitOptimistic,
    rollbackOptimistic: optimisticState.rollbackOptimistic,
  };
}

// Add React import at top
import React from 'react';
