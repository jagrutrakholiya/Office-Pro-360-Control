'use client';

import { useState, useEffect } from 'react';

interface BackupHistory {
  id: string;
  date: string;
  size: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed';
}

interface DataPreferences {
  autoBackup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    retention: number;
  };
  exportFormat: 'json' | 'csv' | 'excel';
  includeAttachments: boolean;
  compressBackup: boolean;
}

export default function DataExportPage() {
  const [preferences, setPreferences] = useState<DataPreferences>({
    autoBackup: {
      enabled: false,
      frequency: 'weekly',
      time: '02:00',
      retention: 30
    },
    exportFormat: 'json',
    includeAttachments: true,
    compressBackup: true
  });

  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
    fetchBackupHistory();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user-settings/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.dataPreferences) {
          setPreferences(data.data.dataPreferences);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchBackupHistory = () => {
    // Mock data - in production, fetch from API
    setBackupHistory([
      {
        id: '1',
        date: '2024-11-15 02:00:00',
        size: '45.2 MB',
        type: 'automatic',
        status: 'completed'
      },
      {
        id: '2',
        date: '2024-11-08 02:00:00',
        size: '43.8 MB',
        type: 'automatic',
        status: 'completed'
      },
      {
        id: '3',
        date: '2024-11-05 14:30:00',
        size: '44.1 MB',
        type: 'manual',
        status: 'completed'
      },
      {
        id: '4',
        date: '2024-11-01 02:00:00',
        size: '42.5 MB',
        type: 'automatic',
        status: 'failed'
      }
    ]);
  };

  const handleExportData = async (format: 'json' | 'csv' | 'excel') => {
    setIsExporting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user-settings/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage('Data exported successfully!');
      } else {
        setMessage('Failed to export data. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage('An error occurred while exporting data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsExporting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user-settings/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          includeAttachments: preferences.includeAttachments,
          compress: preferences.compressBackup
        })
      });

      if (response.ok) {
        setMessage('Backup created successfully!');
        fetchBackupHistory();
      } else {
        setMessage('Failed to create backup. Please try again.');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      setMessage('An error occurred while creating backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user-settings/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dataPreferences: preferences })
      });

      if (response.ok) {
        setMessage('Preferences saved successfully!');
      } else {
        setMessage('Failed to save preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('An error occurred while saving preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Export & Backup</h1>
        <p className="mt-2 text-sm text-gray-600">
          Export your data or configure automatic backups to keep your information safe.
        </p>
      </div>

      {/* Icons as SVG */}
      <svg className="hidden">
        <symbol id="icon-download" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </symbol>
        <symbol id="icon-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </symbol>
        <symbol id="icon-document" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </symbol>
        <symbol id="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </symbol>
        <symbol id="icon-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </symbol>
        <symbol id="icon-cog" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </symbol>
      </svg>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('success') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Export Data Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <use href="#icon-document" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Download all your data in your preferred format. Exports include tasks, projects, comments, and attachments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExportData('json')}
            disabled={isExporting}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <use href="#icon-download" />
            </svg>
            <span className="font-medium text-gray-900">JSON Format</span>
            <span className="text-xs text-gray-500 mt-1">Structured data format</span>
          </button>

          <button
            onClick={() => handleExportData('csv')}
            disabled={isExporting}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <use href="#icon-download" />
            </svg>
            <span className="font-medium text-gray-900">CSV Format</span>
            <span className="text-xs text-gray-500 mt-1">Spreadsheet compatible</span>
          </button>

          <button
            onClick={() => handleExportData('excel')}
            disabled={isExporting}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <use href="#icon-download" />
            </svg>
            <span className="font-medium text-gray-900">Excel Format</span>
            <span className="text-xs text-gray-500 mt-1">Microsoft Excel ready</span>
          </button>
        </div>
      </div>

      {/* Manual Backup Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <use href="#icon-clock" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Manual Backup</h2>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Creating...' : 'Create Backup Now'}
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Create a complete backup of all your data including tasks, projects, files, and settings.
        </p>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.includeAttachments}
              onChange={(e) => setPreferences({
                ...preferences,
                includeAttachments: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include attachments in backup</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferences.compressBackup}
              onChange={(e) => setPreferences({
                ...preferences,
                compressBackup: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Compress backup files</span>
          </label>
        </div>
      </div>

      {/* Automatic Backup Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <use href="#icon-cog" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Automatic Backup</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.autoBackup.enabled}
              onChange={(e) => setPreferences({
                ...preferences,
                autoBackup: {
                  ...preferences.autoBackup,
                  enabled: e.target.checked
                }
              })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-900">Enable automatic backups</span>
          </label>

          {preferences.autoBackup.enabled && (
            <div className="ml-7 space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={preferences.autoBackup.frequency}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    autoBackup: {
                      ...preferences.autoBackup,
                      frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Time
                </label>
                <input
                  type="time"
                  value={preferences.autoBackup.time}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    autoBackup: {
                      ...preferences.autoBackup,
                      time: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retention Period (days)
                </label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={preferences.autoBackup.retention}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    autoBackup: {
                      ...preferences.autoBackup,
                      retention: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Backups older than this will be automatically deleted
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup History</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backupHistory.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {backup.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      backup.type === 'automatic'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {backup.type === 'automatic' ? 'Automatic' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {backup.status === 'completed' ? (
                        <>
                          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <use href="#icon-check" />
                          </svg>
                          <span className="text-sm text-green-700">Completed</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <use href="#icon-warning" />
                          </svg>
                          <span className="text-sm text-red-700">Failed</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {backup.status === 'completed' && (
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
