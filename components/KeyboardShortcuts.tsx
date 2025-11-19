'use client';

import { useState } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'general' | 'navigation' | 'actions' | 'editing';
}

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts: Shortcut[] = [
    // General
    { keys: ['Ctrl', 'K'], description: 'Open global search', category: 'general' },
    { keys: ['Ctrl', 'Shift', 'P'], description: 'Open command palette', category: 'general' },
    { keys: ['?'], description: 'Show keyboard shortcuts', category: 'general' },
    { keys: ['Esc'], description: 'Close modal/dialog', category: 'general' },
    
    // Navigation
    { keys: ['G', 'H'], description: 'Go to dashboard/home', category: 'navigation' },
    { keys: ['G', 'T'], description: 'Go to tasks', category: 'navigation' },
    { keys: ['G', 'P'], description: 'Go to projects', category: 'navigation' },
    { keys: ['G', 'C'], description: 'Go to calendar', category: 'navigation' },
    { keys: ['G', 'S'], description: 'Go to settings', category: 'navigation' },
    
    // Actions
    { keys: ['Ctrl', 'N'], description: 'Create new task', category: 'actions' },
    { keys: ['Ctrl', 'Shift', 'N'], description: 'Create new project', category: 'actions' },
    { keys: ['Ctrl', 'S'], description: 'Save current item', category: 'actions' },
    { keys: ['Ctrl', 'Enter'], description: 'Submit form', category: 'actions' },
    { keys: ['Delete'], description: 'Delete selected item', category: 'actions' },
    
    // Editing
    { keys: ['Ctrl', 'Z'], description: 'Undo', category: 'editing' },
    { keys: ['Ctrl', 'Y'], description: 'Redo', category: 'editing' },
    { keys: ['Ctrl', 'C'], description: 'Copy', category: 'editing' },
    { keys: ['Ctrl', 'V'], description: 'Paste', category: 'editing' },
    { keys: ['Ctrl', 'A'], description: 'Select all', category: 'editing' }
  ];

  const groupedShortcuts = {
    general: shortcuts.filter(s => s.category === 'general'),
    navigation: shortcuts.filter(s => s.category === 'navigation'),
    actions: shortcuts.filter(s => s.category === 'actions'),
    editing: shortcuts.filter(s => s.category === 'editing')
  };

  const KeyboardKey = ({ keys }: { keys: string[] }) => (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <span key={index} className="flex items-center">
          <kbd className="px-2 py-1 text-xs font-mono font-semibold text-gray-700 bg-white border border-gray-300 rounded shadow-sm">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="mx-1 text-gray-400">+</span>
          )}
        </span>
      ))}
    </div>
  );

  // Listen for "?" key to open shortcuts panel
  if (typeof window !== 'undefined') {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input or textarea
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen(true);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (!isOpen) {
      document.addEventListener('keydown', handleKeyPress);
    } else {
      document.removeEventListener('keydown', handleKeyPress);
    }
  }

  return (
    <>
      {/* Button to open shortcuts */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all z-40 group"
        title="Keyboard shortcuts (?)"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Keyboard shortcuts (?)
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="flex min-h-full items-start justify-center p-4 pt-[5vh]">
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Use these shortcuts to navigate and perform actions quickly
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      General
                    </h3>
                    <div className="space-y-3">
                      {groupedShortcuts.general.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{shortcut.description}</span>
                          <KeyboardKey keys={shortcut.keys} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Navigation
                    </h3>
                    <div className="space-y-3">
                      {groupedShortcuts.navigation.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{shortcut.description}</span>
                          <KeyboardKey keys={shortcut.keys} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Actions
                    </h3>
                    <div className="space-y-3">
                      {groupedShortcuts.actions.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{shortcut.description}</span>
                          <KeyboardKey keys={shortcut.keys} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Editing */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Editing
                    </h3>
                    <div className="space-y-3">
                      {groupedShortcuts.editing.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{shortcut.description}</span>
                          <KeyboardKey keys={shortcut.keys} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Press <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">?</kbd> anytime to view shortcuts</li>
                    <li>• Use <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">Esc</kbd> to close any modal or dialog</li>
                    <li>• Navigation shortcuts work from any page</li>
                    <li>• Combine shortcuts for faster workflow</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Press <kbd className="px-2 py-1 text-xs font-mono bg-white border border-gray-200 rounded">?</kbd> to toggle this panel
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
