'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
 PageHeader,
 Card,
 CardHeader,
 CardTitle,
 CardDescription,
 Button,
 Badge,
 Select,
 Input,
 DataTable,
} from '@/components/ui';

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
 const response = await api.get('/user-settings/preferences');
 const data = response.data;
 if (data.success && data.data.dataPreferences) {
 setPreferences(data.data.dataPreferences);
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
 const response = await api.get(`/user-settings/export`, {
 params: { format },
 responseType: 'blob',
 });

 const blob = new Blob([response.data]);
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `data-export-${new Date().toISOString().split('T')[0]}.${format}`;
 document.body.appendChild(a);
 a.click();
 window.URL.revokeObjectURL(url);
 document.body.removeChild(a);

 setMessage('Data exported successfully!');
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
 await api.post('/user-settings/backup', {
 includeAttachments: preferences.includeAttachments,
 compress: preferences.compressBackup
 });

 setMessage('Backup created successfully!');
 fetchBackupHistory();
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
 await api.put('/user-settings/preferences', { dataPreferences: preferences });

 setMessage('Preferences saved successfully!');
 } catch (error) {
 console.error('Error saving preferences:', error);
 setMessage('An error occurred while saving preferences.');
 } finally {
 setIsSaving(false);
 }
 };

 return (
 <div className="p-6 space-y-6">
 <PageHeader
 title="Data Export & Backup"
 description="Export your data or configure automatic backups to keep your information safe."
 breadcrumbs={[
 { label: 'Settings', href: '/settings' },
 { label: 'Data & Backup' },
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

 {/* Export Data Section */}
 <Card>
 <CardHeader>
 <CardTitle>Export Data</CardTitle>
 <CardDescription>
 Download all your data in your preferred format. Exports include tasks, projects, comments, and attachments.
 </CardDescription>
 </CardHeader>

 <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
 {([
 { format: 'json', title: 'JSON Format', subtitle: 'Structured data format' },
 { format: 'csv', title: 'CSV Format', subtitle: 'Spreadsheet compatible' },
 { format: 'excel', title: 'Excel Format', subtitle: 'Microsoft Excel ready' },
 ] as const).map((opt) => (
 <button
 key={opt.format}
 onClick={() => handleExportData(opt.format)}
 disabled={isExporting}
 className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <span className="font-medium text-slate-900 dark:text-slate-100">{opt.title}</span>
 <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{opt.subtitle}</span>
 </button>
 ))}
 </div>
 </Card>

 {/* Manual Backup Section */}
 <Card>
 <div className="flex items-center justify-between">
 <CardHeader>
 <CardTitle>Manual Backup</CardTitle>
 <CardDescription>
 Create a complete backup of all your data including tasks, projects, files, and settings.
 </CardDescription>
 </CardHeader>
 <Button onClick={handleCreateBackup} loading={isExporting} disabled={isExporting}>
 {isExporting ? 'Creating...' : 'Create Backup Now'}
 </Button>
 </div>

 <div className="mt-4 space-y-3">
 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.includeAttachments}
 onChange={(e) => setPreferences({
 ...preferences,
 includeAttachments: e.target.checked
 })}
 className="w-4 h-4 accent-primary-600 rounded focus:ring-primary-500"
 />
 <span className="text-sm text-slate-700 dark:text-slate-300">Include attachments in backup</span>
 </label>

 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={preferences.compressBackup}
 onChange={(e) => setPreferences({
 ...preferences,
 compressBackup: e.target.checked
 })}
 className="w-4 h-4 accent-primary-600 rounded focus:ring-primary-500"
 />
 <span className="text-sm text-slate-700 dark:text-slate-300">Compress backup files</span>
 </label>
 </div>
 </Card>

 {/* Automatic Backup Configuration */}
 <Card>
 <CardHeader>
 <CardTitle>Automatic Backup</CardTitle>
 </CardHeader>

 <div className="mt-4 space-y-4">
 <label className="flex items-center gap-3 cursor-pointer">
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
 className="w-4 h-4 accent-primary-600 rounded focus:ring-primary-500"
 />
 <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Enable automatic backups</span>
 </label>

 {preferences.autoBackup.enabled && (
 <div className="ml-7 space-y-4 pt-2">
 <Select
 label="Backup Frequency"
 value={preferences.autoBackup.frequency}
 onChange={(e) => setPreferences({
 ...preferences,
 autoBackup: {
 ...preferences.autoBackup,
 frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
 }
 })}
 >
 <option value="daily">Daily</option>
 <option value="weekly">Weekly</option>
 <option value="monthly">Monthly</option>
 </Select>

 <Input
 label="Backup Time"
 type="time"
 value={preferences.autoBackup.time}
 onChange={(e) => setPreferences({
 ...preferences,
 autoBackup: {
 ...preferences.autoBackup,
 time: e.target.value
 }
 })}
 />

 <Input
 label="Retention Period (days)"
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
 helperText="Backups older than this will be automatically deleted"
 />
 </div>
 )}
 </div>

 <div className="mt-6 flex justify-end">
 <Button onClick={handleSavePreferences} loading={isSaving} disabled={isSaving}>
 {isSaving ? 'Saving...' : 'Save Settings'}
 </Button>
 </div>
 </Card>

 {/* Backup History */}
 <Card>
 <CardHeader>
 <CardTitle>Backup History</CardTitle>
 </CardHeader>
 <div className="mt-4">
 <DataTable
 rowKey={(row: BackupHistory) => row.id}
 data={backupHistory}
 emptyTitle="No backups yet"
 columns={[
 { key: 'date', header: 'Date' },
 { key: 'size', header: 'Size' },
 {
 key: 'type',
 header: 'Type',
 render: (row: BackupHistory) => (
 <Badge variant={row.type === 'automatic' ? 'info' : 'neutral'} size="sm">
 {row.type === 'automatic' ? 'Automatic' : 'Manual'}
 </Badge>
 ),
 },
 {
 key: 'status',
 header: 'Status',
 render: (row: BackupHistory) => (
 <Badge variant={row.status === 'completed' ? 'success' : 'danger'} size="sm">
 {row.status === 'completed' ? 'Completed' : 'Failed'}
 </Badge>
 ),
 },
 {
 key: 'actions',
 header: 'Actions',
 className: 'text-right',
 render: (row: BackupHistory) =>
 row.status === 'completed' ? (
 <Button variant="ghost" size="sm">Download</Button>
 ) : null,
 },
 ]}
 />
 </div>
 </Card>
 </div>
 );
}
