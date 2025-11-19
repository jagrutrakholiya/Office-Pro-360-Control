'use client';

import { useEffect, useState } from 'react';
import { useSearch } from '../context/SearchContext';
import { useRouter } from 'next/navigation';

interface Command {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  category: 'navigation' | 'actions' | 'settings';
}

export default function CommandPalette() {
  const { isCommandPaletteOpen, closeCommandPalette } = useSearch();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      description: 'View your dashboard overview',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      action: () => router.push('/'),
      category: 'navigation'
    },
    {
      id: 'nav-tasks',
      label: 'Go to Tasks',
      description: 'View all your tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      action: () => router.push('/tasks'),
      category: 'navigation'
    },
    {
      id: 'nav-projects',
      label: 'Go to Projects',
      description: 'View all your projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      action: () => router.push('/projects'),
      category: 'navigation'
    },
    {
      id: 'nav-team',
      label: 'Go to Team',
      description: 'Manage your team members',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      action: () => router.push('/team'),
      category: 'navigation'
    },
    {
      id: 'nav-calendar',
      label: 'Go to Calendar',
      description: 'View your calendar',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      action: () => router.push('/calendar'),
      category: 'navigation'
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      description: 'Manage your preferences',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: () => router.push('/settings'),
      category: 'navigation'
    },
    // Actions
    {
      id: 'action-new-task',
      label: 'Create New Task',
      description: 'Create a new task quickly',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      action: () => router.push('/tasks/new'),
      shortcut: 'Ctrl+N',
      category: 'actions'
    },
    {
      id: 'action-new-project',
      label: 'Create New Project',
      description: 'Start a new project',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      action: () => router.push('/projects/new'),
      shortcut: 'Ctrl+Shift+N',
      category: 'actions'
    },
    {
      id: 'action-invite',
      label: 'Invite Team Member',
      description: 'Invite someone to your team',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      action: () => router.push('/team/invite'),
      category: 'actions'
    },
    {
      id: 'action-search',
      label: 'Open Global Search',
      description: 'Search across everything',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      action: () => {
        closeCommandPalette();
        setTimeout(() => {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
        }, 100);
      },
      shortcut: 'Ctrl+K',
      category: 'actions'
    },
    // Settings
    {
      id: 'settings-profile',
      label: 'Edit Profile',
      description: 'Update your profile information',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      action: () => router.push('/settings/profile'),
      category: 'settings'
    },
    {
      id: 'settings-theme',
      label: 'Change Theme',
      description: 'Customize your theme settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      action: () => router.push('/settings/theme'),
      category: 'settings'
    },
    {
      id: 'settings-notifications',
      label: 'Notification Settings',
      description: 'Manage notification preferences',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      action: () => router.push('/settings/notifications'),
      category: 'settings'
    }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  const groupedCommands = {
    navigation: filteredCommands.filter(c => c.category === 'navigation'),
    actions: filteredCommands.filter(c => c.category === 'actions'),
    settings: filteredCommands.filter(c => c.category === 'settings')
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          closeCommandPalette();
          setQuery('');
        }
      } else if (e.key === 'Escape') {
        closeCommandPalette();
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filteredCommands, selectedIndex, closeCommandPalette]);

  const handleCommandClick = (command: Command) => {
    command.action();
    closeCommandPalette();
    setQuery('');
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeCommandPalette}
      />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          {/* Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              autoFocus
              className="flex-1 outline-none text-gray-900 placeholder-gray-400"
            />
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-[60vh] overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-600">No commands found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different search</p>
              </div>
            ) : (
              <>
                {/* Navigation Commands */}
                {groupedCommands.navigation.length > 0 && (
                  <div className="mb-4">
                    <div className="px-4 py-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Navigation
                      </h3>
                    </div>
                    {groupedCommands.navigation.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      return (
                        <button
                          key={command.id}
                          onClick={() => handleCommandClick(command)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                            globalIndex === selectedIndex ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="text-gray-600">{command.icon}</div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{command.label}</p>
                            <p className="text-sm text-gray-500">{command.description}</p>
                          </div>
                          {command.shortcut && (
                            <kbd className="px-2 py-1 text-xs font-mono text-gray-500 bg-gray-100 border border-gray-200 rounded">
                              {command.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Action Commands */}
                {groupedCommands.actions.length > 0 && (
                  <div className="mb-4">
                    <div className="px-4 py-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Actions
                      </h3>
                    </div>
                    {groupedCommands.actions.map((command) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      return (
                        <button
                          key={command.id}
                          onClick={() => handleCommandClick(command)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                            globalIndex === selectedIndex ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="text-blue-600">{command.icon}</div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{command.label}</p>
                            <p className="text-sm text-gray-500">{command.description}</p>
                          </div>
                          {command.shortcut && (
                            <kbd className="px-2 py-1 text-xs font-mono text-gray-500 bg-gray-100 border border-gray-200 rounded">
                              {command.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Settings Commands */}
                {groupedCommands.settings.length > 0 && (
                  <div>
                    <div className="px-4 py-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Settings
                      </h3>
                    </div>
                    {groupedCommands.settings.map((command) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      return (
                        <button
                          key={command.id}
                          onClick={() => handleCommandClick(command)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                            globalIndex === selectedIndex ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="text-purple-600">{command.icon}</div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{command.label}</p>
                            <p className="text-sm text-gray-500">{command.description}</p>
                          </div>
                          {command.shortcut && (
                            <kbd className="px-2 py-1 text-xs font-mono text-gray-500 bg-gray-100 border border-gray-200 rounded">
                              {command.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
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
              Press <kbd className="px-1.5 py-0.5 font-mono bg-white border border-gray-200 rounded">Ctrl+Shift+P</kbd> to open
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
