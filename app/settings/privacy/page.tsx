'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
 PageHeader,
 Card,
 CardHeader,
 CardTitle,
 Button,
 Badge,
 Select,
 Input,
} from '@/components/ui';

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
 const response = await api.get('/user-settings/preferences');
 const data = response.data;
 if (data.success && data.data.privacy) {
 setSettings(data.data.privacy);
 }
 } catch (error) {
 console.error('Error fetching privacy settings:', error);
 }
 };

 const handleSaveSettings = async () => {
 setIsSaving(true);
 setMessage('');

 try {
 await api.put('/user-settings/preferences', { privacy: settings });

 setMessage('Privacy settings saved successfully!');
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

 const checkbox =
 'w-4 h-4 accent-primary-600 rounded focus:ring-primary-500';

 return (
 <div className="p-6 space-y-6">
 <PageHeader
 title="Privacy & Security"
 description="Manage your privacy settings and security preferences to protect your account."
 breadcrumbs={[
 { label: 'Settings', href: '/settings' },
 { label: 'Privacy & Security' },
 ]}
 />

 {message && (
 <div
 className={`p-4 rounded-lg text-sm border ${
 message.includes('success')
 ? 'bg-success-50 dark:bg-success-900/20 text-success-800 dark:text-success-300 border-success-200 dark:border-success-900/50'
 : 'bg-danger-50 dark:bg-danger-900/20 text-danger-800 dark:text-danger-300 border-danger-200 dark:border-danger-900/50'
 }`}
 >
 {message}
 </div>
 )}

 {/* Profile Privacy */}
 <Card>
 <CardHeader>
 <CardTitle>Profile Privacy</CardTitle>
 </CardHeader>

 <div className="mt-4 space-y-4">
 <Select
 label="Profile Visibility"
 value={settings.profileVisibility}
 onChange={(e) => setSettings({
 ...settings,
 profileVisibility: e.target.value as 'public' | 'team' | 'private'
 })}
 >
 <option value="public">Public - Everyone can see your profile</option>
 <option value="team">Team Only - Only team members can see your profile</option>
 <option value="private">Private - Only you can see your profile</option>
 </Select>

 <div className="space-y-3 pt-2">
 {[
 { key: 'showEmail', label: 'Show email address on profile', val: settings.showEmail },
 { key: 'showPhone', label: 'Show phone number on profile', val: settings.showPhone },
 { key: 'showOnlineStatus', label: 'Show online status', val: settings.showOnlineStatus },
 { key: 'searchable', label: 'Make profile searchable', val: settings.searchable },
 ].map((item) => (
 <label key={item.key} className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={item.val}
 onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
 className={checkbox}
 />
 <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
 </label>
 ))}
 </div>
 </div>
 </Card>

 {/* Activity Privacy */}
 <Card>
 <CardHeader>
 <CardTitle>Activity Privacy</CardTitle>
 </CardHeader>

 <div className="mt-4 space-y-4">
 <Select
 label="Activity Visibility"
 value={settings.activityVisibility}
 onChange={(e) => setSettings({
 ...settings,
 activityVisibility: e.target.value as 'everyone' | 'team' | 'none'
 })}
 helperText="Controls who can see your task updates, comments, and project activity"
 >
 <option value="everyone">Everyone - All users can see your activity</option>
 <option value="team">Team Only - Only team members can see your activity</option>
 <option value="none">None - Hide activity from everyone</option>
 </Select>

 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={settings.allowTagging}
 onChange={(e) => setSettings({
 ...settings,
 allowTagging: e.target.checked
 })}
 className={checkbox}
 />
 <span className="text-sm text-slate-700 dark:text-slate-300">Allow others to tag me in tasks and comments</span>
 </label>
 </div>
 </Card>

 {/* Two-Factor Authentication */}
 <Card>
 <CardHeader>
 <CardTitle>Two-Factor Authentication</CardTitle>
 </CardHeader>

 <div className="mt-4 space-y-4">
 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
 <div>
 <div className="flex items-center gap-2">
 <p className="font-medium text-slate-900 dark:text-slate-100">2FA Status</p>
 <Badge variant={settings.twoFactorAuth.enabled ? 'success' : 'neutral'} size="sm">
 {settings.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
 </Badge>
 </div>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
 {settings.twoFactorAuth.enabled
 ? 'Your account is protected with two-factor authentication'
 : 'Add an extra layer of security to your account'
 }
 </p>
 </div>
 {settings.twoFactorAuth.enabled ? (
 <Button variant="danger" onClick={handleDisable2FA}>Disable 2FA</Button>
 ) : (
 <Button onClick={handleEnable2FA}>Enable 2FA</Button>
 )}
 </div>

 {settings.twoFactorAuth.enabled && (
 <Select
 label="Authentication Method"
 value={settings.twoFactorAuth.method}
 onChange={(e) => setSettings({
 ...settings,
 twoFactorAuth: {
 ...settings.twoFactorAuth,
 method: e.target.value as 'sms' | 'email' | 'authenticator'
 }
 })}
 >
 <option value="authenticator">Authenticator App (Recommended)</option>
 <option value="sms">SMS Text Message</option>
 <option value="email">Email</option>
 </Select>
 )}

 {showBackupCodes && settings.twoFactorAuth.backupCodes.length > 0 && (
 <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-900/50 rounded-lg">
 <h3 className="font-medium text-warning-900 dark:text-warning-200 mb-2">Save Your Backup Codes</h3>
 <p className="text-sm text-warning-800 dark:text-warning-300 mb-3">
 Store these codes in a safe place. Each code can be used once to access your account if you lose your 2FA device.
 </p>
 <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 rounded">
 {settings.twoFactorAuth.backupCodes.map((code, index) => (
 <div key={index}>{code}</div>
 ))}
 </div>
 <button
 onClick={() => setShowBackupCodes(false)}
 className="mt-3 text-sm text-warning-800 dark:text-warning-300 hover:text-warning-900 dark:hover:text-warning-200 font-medium"
 >
 I've saved these codes
 </button>
 </div>
 )}
 </div>
 </Card>

 {/* Session Management */}
 <Card>
 <div className="flex items-center justify-between mb-4">
 <CardTitle>Session Management</CardTitle>
 <Button variant="danger" size="sm" onClick={handleTerminateAllSessions}>
 Terminate All Other Sessions
 </Button>
 </div>

 <div className="space-y-4 mb-6">
 <Input
 label="Session Timeout (minutes)"
 type="number"
 min="5"
 max="480"
 value={settings.sessionTimeout}
 onChange={(e) => setSettings({
 ...settings,
 sessionTimeout: parseInt(e.target.value)
 })}
 helperText="Automatically log out after this period of inactivity"
 />

 {[
 { key: 'autoLogout', label: 'Enable automatic logout on inactivity', val: settings.autoLogout },
 { key: 'loginNotifications', label: 'Send email notifications for new logins', val: settings.loginNotifications },
 { key: 'deviceTracking', label: 'Track device information for security', val: settings.deviceTracking },
 ].map((item) => (
 <label key={item.key} className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={item.val}
 onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
 className={checkbox}
 />
 <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
 </label>
 ))}
 </div>

 {/* Active Sessions List */}
 <div>
 <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Active Sessions</h3>
 <div className="space-y-3">
 {activeSessions.map((session) => (
 <div
 key={session.id}
 className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
 >
 <div className="flex-1">
 <div className="flex items-center gap-2">
 <p className="font-medium text-slate-900 dark:text-slate-100">{session.device}</p>
 {session.current && (
 <Badge variant="success" size="sm">Current</Badge>
 )}
 </div>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{session.location}</p>
 <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Last active: {session.lastActive}</p>
 </div>
 {!session.current && (
 <Button variant="ghost" size="sm" onClick={() => handleTerminateSession(session.id)}>
 Terminate
 </Button>
 )}
 </div>
 ))}
 </div>
 </div>
 </Card>

 {/* Save Button */}
 <div className="flex justify-end">
 <Button onClick={handleSaveSettings} loading={isSaving} disabled={isSaving}>
 {isSaving ? 'Saving...' : 'Save Privacy Settings'}
 </Button>
 </div>
 </div>
 );
}
