'use client';

import { useState, useEffect } from 'react';

interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showOnlineStatus: boolean;
  activityVisibility: 'everyone' | 'team' | 'none';
  searchable: boolean;
  allowTagging: boolean;
  twoFactorAuth: {
    enabled: boolean;
    method: 'sms' | 'email' | 'authenticator';
    backupCodes: string[];
  };
  sessionTimeout: number;
  autoLogout: boolean;
  loginNotifications: boolean;
  deviceTracking: boolean;
}

export default function PrivacySecurityPage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'team',
    showEmail: false,
    showPhone: false,
    showOnlineStatus: true,
    activityVisibility: 'team',
    searchable: true,
    allowTagging: true,
    twoFactorAuth: {
      enabled: false,
      method: 'authenticator',
      backupCodes: []
    },
    sessionTimeout: 60,
    autoLogout: true,
    loginNotifications: true,
    deviceTracking: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    {
      id: '1',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: '2',
      device: 'iPhone 15',
      location: 'San Francisco, CA',
      lastActive: '1 hour ago',
      current: false
    }
  ]);

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user-settings/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.privacy) {
          setSettings(data.data.privacy);
        }
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    }
  };

  const handleSaveSettings = async () => {
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
        body: JSON.stringify({ privacy: settings })
      });

      if (response.ok) {
        setMessage('Privacy settings saved successfully!');
      } else {
        setMessage('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('An error occurred while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnable2FA = () => {
    // Generate backup codes
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
    
    setSettings({
      ...settings,
      twoFactorAuth: {
        ...settings.twoFactorAuth,
        enabled: true,
        backupCodes: codes
      }
    });
    
    setShowBackupCodes(true);
  };

  const handleDisable2FA = () => {
    setSettings({
      ...settings,
      twoFactorAuth: {
        ...settings.twoFactorAuth,
        enabled: false,
        backupCodes: []
      }
    });
  };

  const handleTerminateSession = (sessionId: string) => {
    setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
    setMessage('Session terminated successfully.');
  };

  const handleTerminateAllSessions = () => {
    setActiveSessions(activeSessions.filter(s => s.current));
    setMessage('All other sessions terminated successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Privacy & Security</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your privacy settings and security preferences to protect your account.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('success') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Profile Privacy */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Privacy</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => setSettings({
                ...settings,
                profileVisibility: e.target.value as 'public' | 'team' | 'private'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Public - Everyone can see your profile</option>
              <option value="team">Team Only - Only team members can see your profile</option>
              <option value="private">Private - Only you can see your profile</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showEmail}
                onChange={(e) => setSettings({
                  ...settings,
                  showEmail: e.target.checked
                })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show email address on profile</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showPhone}
                onChange={(e) => setSettings({
                  ...settings,
                  showPhone: e.target.checked
                })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show phone number on profile</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showOnlineStatus}
                onChange={(e) => setSettings({
                  ...settings,
                  showOnlineStatus: e.target.checked
                })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show online status</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.searchable}
                onChange={(e) => setSettings({
                  ...settings,
                  searchable: e.target.checked
                })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Make profile searchable</span>
            </label>
          </div>
        </div>
      </div>

      {/* Activity Privacy */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Privacy</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Visibility
            </label>
            <select
              value={settings.activityVisibility}
              onChange={(e) => setSettings({
                ...settings,
                activityVisibility: e.target.value as 'everyone' | 'team' | 'none'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="everyone">Everyone - All users can see your activity</option>
              <option value="team">Team Only - Only team members can see your activity</option>
              <option value="none">None - Hide activity from everyone</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Controls who can see your task updates, comments, and project activity
            </p>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.allowTagging}
              onChange={(e) => setSettings({
                ...settings,
                allowTagging: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Allow others to tag me in tasks and comments</span>
          </label>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                2FA Status: {settings.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {settings.twoFactorAuth.enabled 
                  ? 'Your account is protected with two-factor authentication'
                  : 'Add an extra layer of security to your account'
                }
              </p>
            </div>
            {settings.twoFactorAuth.enabled ? (
              <button
                onClick={handleDisable2FA}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                onClick={handleEnable2FA}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enable 2FA
              </button>
            )}
          </div>

          {settings.twoFactorAuth.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Authentication Method
              </label>
              <select
                value={settings.twoFactorAuth.method}
                onChange={(e) => setSettings({
                  ...settings,
                  twoFactorAuth: {
                    ...settings.twoFactorAuth,
                    method: e.target.value as 'sms' | 'email' | 'authenticator'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="authenticator">Authenticator App (Recommended)</option>
                <option value="sms">SMS Text Message</option>
                <option value="email">Email</option>
              </select>
            </div>
          )}

          {showBackupCodes && settings.twoFactorAuth.backupCodes.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Save Your Backup Codes</h3>
              <p className="text-sm text-yellow-800 mb-3">
                Store these codes in a safe place. Each code can be used once to access your account if you lose your 2FA device.
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-white p-3 rounded">
                {settings.twoFactorAuth.backupCodes.map((code, index) => (
                  <div key={index} className="text-gray-900">{code}</div>
                ))}
              </div>
              <button
                onClick={() => setShowBackupCodes(false)}
                className="mt-3 text-sm text-yellow-800 hover:text-yellow-900 font-medium"
              >
                I've saved these codes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Session Management</h2>
          <button
            onClick={handleTerminateAllSessions}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Terminate All Other Sessions
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="480"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({
                ...settings,
                sessionTimeout: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Automatically log out after this period of inactivity
            </p>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.autoLogout}
              onChange={(e) => setSettings({
                ...settings,
                autoLogout: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable automatic logout on inactivity</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.loginNotifications}
              onChange={(e) => setSettings({
                ...settings,
                loginNotifications: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Send email notifications for new logins</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.deviceTracking}
              onChange={(e) => setSettings({
                ...settings,
                deviceTracking: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Track device information for security</span>
          </label>
        </div>

        {/* Active Sessions List */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Active Sessions</h3>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{session.device}</p>
                    {session.current && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{session.location}</p>
                  <p className="text-xs text-gray-500 mt-1">Last active: {session.lastActive}</p>
                </div>
                {!session.current && (
                  <button
                    onClick={() => handleTerminateSession(session.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Terminate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Privacy Settings'}
        </button>
      </div>
    </div>
  );
}
