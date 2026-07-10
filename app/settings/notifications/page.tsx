"use client";

import { useState, useEffect } from "react";
import {
 PageHeader,
 Card,
 CardHeader,
 CardTitle,
 CardDescription,
 Button,
 Badge,
 Input,
} from "@/components/ui";

interface NotificationPrefs {
 email?: {
 enabled?: boolean;
 taskAssigned?: boolean;
 taskDue?: boolean;
 taskCompleted?: boolean;
 mentions?: boolean;
 projectUpdates?: boolean;
 teamMessages?: boolean;
 dailyDigest?: boolean;
 weeklyReport?: boolean;
 };
 inApp?: {
 enabled?: boolean;
 sound?: boolean;
 desktop?: boolean;
 taskAssigned?: boolean;
 taskDue?: boolean;
 taskCompleted?: boolean;
 mentions?: boolean;
 projectUpdates?: boolean;
 teamMessages?: boolean;
 };
 mobile?: {
 enabled?: boolean;
 taskAssigned?: boolean;
 taskDue?: boolean;
 mentions?: boolean;
 urgentOnly?: boolean;
 };
 quietHours?: {
 enabled?: boolean;
 startTime?: string;
 endTime?: string;
 days?: number[];
 };
}

function Toggle({
 checked,
 onChange,
}: {
 checked?: boolean;
 onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
 return (
 <label className="relative inline-flex items-center cursor-pointer">
 <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
 <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
 </label>
 );
}

export default function NotificationSettingsPage() {
 const [notifications, setNotifications] = useState<NotificationPrefs>({
 email: { enabled: true },
 inApp: { enabled: true, sound: true },
 mobile: { enabled: true },
 quietHours: { enabled: false, days: [] }
 });
 const [loading, setLoading] = useState(false);
 const [saved, setSaved] = useState(false);

 useEffect(() => {
 fetchNotifications();
 }, []);

 const fetchNotifications = async () => {
 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/preferences`,
 {
 headers: { Authorization: `Bearer ${token}` },
 }
 );

 if (response.ok) {
 const data = await response.json();
 if (data.data?.notifications) {
 setNotifications(data.data.notifications);
 }
 }
 } catch (error) {
 console.error("Error fetching notifications:", error);
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setSaved(false);

 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/preferences/notifications`,
 {
 method: "PUT",
 headers: {
 Authorization: `Bearer ${token}`,
 "Content-Type": "application/json",
 },
 body: JSON.stringify(notifications),
 }
 );

 if (response.ok) {
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 }
 } catch (error) {
 console.error("Error updating notifications:", error);
 alert("Failed to update notification settings");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="p-6 space-y-6">
 <PageHeader
 title="Notification Settings"
 description="Control how and when you receive notifications"
 breadcrumbs={[
 { label: "Settings", href: "/settings" },
 { label: "Notifications" },
 ]}
 />

 <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
 {/* Email Notifications */}
 <Card>
 <div className="flex items-center justify-between">
 <CardHeader>
 <CardTitle>Email Notifications</CardTitle>
 <CardDescription>Receive notifications via email</CardDescription>
 </CardHeader>
 <Toggle
 checked={notifications.email?.enabled}
 onChange={(e) =>
 setNotifications({
 ...notifications,
 email: { ...notifications.email, enabled: e.target.checked },
 })
 }
 />
 </div>

 {notifications.email?.enabled && (
 <div className="mt-4 space-y-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
 {[
 { key: "taskAssigned", label: "Task assigned to me" },
 { key: "taskDue", label: "Task due soon" },
 { key: "taskCompleted", label: "Task completed" },
 { key: "mentions", label: "Someone mentions me" },
 { key: "projectUpdates", label: "Project updates" },
 { key: "teamMessages", label: "Team messages" },
 { key: "dailyDigest", label: "Daily digest" },
 { key: "weeklyReport", label: "Weekly report" },
 ].map((item) => (
 <label key={item.key} className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={notifications.email?.[item.key as keyof typeof notifications.email]}
 onChange={(e) =>
 setNotifications({
 ...notifications,
 email: { ...notifications.email, [item.key]: e.target.checked },
 })
 }
 className="w-4 h-4 accent-primary-600 rounded focus:ring-2 focus:ring-primary-500"
 />
 <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
 </label>
 ))}
 </div>
 )}
 </Card>

 {/* In-App Notifications */}
 <Card>
 <div className="flex items-center justify-between">
 <CardHeader>
 <CardTitle>In-App Notifications</CardTitle>
 <CardDescription>Notifications within the application</CardDescription>
 </CardHeader>
 <Toggle
 checked={notifications.inApp?.enabled}
 onChange={(e) =>
 setNotifications({
 ...notifications,
 inApp: { ...notifications.inApp, enabled: e.target.checked },
 })
 }
 />
 </div>

 {notifications.inApp?.enabled && (
 <div className="mt-4 space-y-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={notifications.inApp?.sound}
 onChange={(e) =>
 setNotifications({
 ...notifications,
 inApp: { ...notifications.inApp, sound: e.target.checked },
 })
 }
 className="w-4 h-4 accent-primary-600 rounded focus:ring-2 focus:ring-primary-500"
 />
 <span className="text-sm text-slate-700 dark:text-slate-300">Play sound</span>
 </label>
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={notifications.inApp?.desktop}
 onChange={(e) =>
 setNotifications({
 ...notifications,
 inApp: { ...notifications.inApp, desktop: e.target.checked },
 })
 }
 className="w-4 h-4 accent-primary-600 rounded focus:ring-2 focus:ring-primary-500"
 />
 <span className="text-sm text-slate-700 dark:text-slate-300">Desktop notifications</span>
 </label>
 </div>
 )}
 </Card>

 {/* Quiet Hours */}
 <Card>
 <div className="flex items-center justify-between">
 <CardHeader>
 <CardTitle>Quiet Hours</CardTitle>
 <CardDescription>Pause notifications during specific times</CardDescription>
 </CardHeader>
 <Toggle
 checked={notifications.quietHours?.enabled}
 onChange={(e) =>
 setNotifications({
 ...notifications,
 quietHours: { ...notifications.quietHours, enabled: e.target.checked },
 })
 }
 />
 </div>

 {notifications.quietHours?.enabled && (
 <div className="mt-4 grid grid-cols-2 gap-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
 <Input
 label="Start Time"
 type="time"
 value={notifications.quietHours?.startTime || ""}
 onChange={(e) =>
 setNotifications({
 ...notifications,
 quietHours: { ...notifications.quietHours, startTime: e.target.value },
 })
 }
 />
 <Input
 label="End Time"
 type="time"
 value={notifications.quietHours?.endTime || ""}
 onChange={(e) =>
 setNotifications({
 ...notifications,
 quietHours: { ...notifications.quietHours, endTime: e.target.value },
 })
 }
 />
 </div>
 )}
 </Card>

 {/* Actions */}
 <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
 <Button type="submit" loading={loading} disabled={loading}>
 {loading ? "Saving..." : "Save Preferences"}
 </Button>

 {saved && <Badge variant="success">Notification preferences updated</Badge>}
 </div>
 </form>
 </div>
 );
}
