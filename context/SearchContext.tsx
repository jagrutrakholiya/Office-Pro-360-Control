'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'user' | 'file' | 'page';
  title: string;
  description?: string;
  url: string;
  icon?: string;
  relevance?: number;
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
  results: number;
}

export interface RecentPage {
  title: string;
  url: string;
  timestamp: Date;
}

interface SearchContextType {
  // Search state
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchHistory: SearchHistory[];
  recentPages: RecentPage[];
  
  // Command palette
  isCommandPaletteOpen: boolean;
  
  // Actions
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearchHistory: () => void;
  addToRecentPages: (page: RecentPage) => void;
  
  // Command palette actions
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    const savedPages = localStorage.getItem('recentPages');
    
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setSearchHistory(parsed.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp)
        })));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
    
    if (savedPages) {
      try {
        const parsed = JSON.parse(savedPages);
        setRecentPages(parsed.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp)
        })));
      } catch (error) {
        console.error('Error loading recent pages:', error);
      }
    }
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  useEffect(() => {
    if (recentPages.length > 0) {
      localStorage.setItem('recentPages', JSON.stringify(recentPages));
    }
  }, [recentPages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      
      // Ctrl+Shift+P or Cmd+Shift+P for command palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsCommandPaletteOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const openCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        
        // Add to search history
        const newHistory: SearchHistory = {
          query,
          timestamp: new Date(),
          results: data.results?.length || 0
        };
        
        setSearchHistory(prev => {
          const filtered = prev.filter(h => h.query !== query);
          return [newHistory, ...filtered].slice(0, 10); // Keep last 10
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  const addToRecentPages = useCallback((page: RecentPage) => {
    setRecentPages(prev => {
      const filtered = prev.filter(p => p.url !== page.url);
      return [page, ...filtered].slice(0, 10); // Keep last 10
    });
  }, []);

  const value: SearchContextType = {
    isSearchOpen,
    searchQuery,
    searchResults,
    isSearching,
    searchHistory,
    recentPages,
    isCommandPaletteOpen,
    openSearch,
    closeSearch,
    setSearchQuery,
    performSearch,
    clearSearchHistory,
    addToRecentPages,
    openCommandPalette,
    closeCommandPalette
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
