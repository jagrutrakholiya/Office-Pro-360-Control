'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from 'context/SearchContext';

export default function GlobalSearch() {
  const {
    isSearchOpen,
    closeSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchHistory,
    performSearch
  } = useSearch();

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'tasks' | 'projects' | 'files'>('all');

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleResultClick(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  const handleResultClick = (result: any) => {
    router.push(result.url);
    closeSearch();
  };

  const filteredResults = searchResults.filter((result: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'tasks') return result.type === 'task';
    if (activeTab === 'projects') return result.type === 'project';
    if (activeTab === 'files') return result.type === 'file';
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'project':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'file':
        return (
          <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'page':
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeSearch}
      />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tasks, projects, files, and more..."
              className="flex-1 outline-none text-gray-900 placeholder-gray-400"
            />
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              ESC
            </kbd>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'projects'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'files'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Files
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : searchQuery && filteredResults.length === 0 ? (
              <div className="py-12 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 font-medium">No results found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search query</p>
              </div>
            ) : searchQuery ? (
              <div className="py-2">
                {filteredResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{result.title}</p>
                      {result.description && (
                        <p className="text-sm text-gray-500 truncate">{result.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-4">
                {/* Recent Searches */}
                {searchHistory.length > 0 && (
                  <div className="px-4 mb-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Recent Searches
                    </h3>
                    <div className="space-y-1">
                      {searchHistory.slice(0, 5).map((item, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(item.query)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="flex-1 text-sm text-gray-700">{item.query}</span>
                          <span className="text-xs text-gray-400">{item.results} results</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="px-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Quick Actions
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => router.push('/tasks/new')}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm text-gray-700">Create new task</span>
                    </button>
                    <button
                      onClick={() => router.push('/projects/new')}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm text-gray-700">Create new project</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono bg-white border border-gray-200 rounded">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono bg-white border border-gray-200 rounded">↵</kbd>
                Select
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 font-mono bg-white border border-gray-200 rounded">Ctrl+K</kbd> to search
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
