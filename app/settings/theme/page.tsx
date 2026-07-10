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

interface ThemeData {
 mode?: string;
 primaryColor?: string;
 accentColor?: string;
 fontSize?: string;
 sidebarCollapsed?: boolean;
 compactMode?: boolean;
}

const colorPresets = [
 { name: "Blue", value: "#3B82F6" },
 { name: "Indigo", value: "#6366F1" },
 { name: "Purple", value: "#8B5CF6" },
 { name: "Pink", value: "#EC4899" },
 { name: "Red", value: "#EF4444" },
 { name: "Orange", value: "#F97316" },
 { name: "Yellow", value: "#F59E0B" },
 { name: "Green", value: "#10B981" },
 { name: "Teal", value: "#14B8A6" },
 { name: "Cyan", value: "#06B6D4" },
];

export default function ThemeSettingsPage() {
 const [theme, setTheme] = useState<ThemeData>({
 mode: "light",
 primaryColor: "#3B82F6",
 accentColor: "#10B981",
 fontSize: "medium",
 sidebarCollapsed: false,
 compactMode: false
 });
 const [loading, setLoading] = useState(false);
 const [saved, setSaved] = useState(false);

 useEffect(() => {
 fetchTheme();
 }, []);

 const fetchTheme = async () => {
 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/preferences`,
 {
 headers: {
 Authorization: `Bearer ${token}`,
 },
 }
 );

 if (response.ok) {
 const data = await response.json();
 if (data.data?.theme) {
 setTheme(data.data.theme);
 }
 }
 } catch (error) {
 console.error("Error fetching theme:", error);
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setSaved(false);

 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/preferences/theme`,
 {
 method: "PUT",
 headers: {
 Authorization: `Bearer ${token}`,
 "Content-Type": "application/json",
 },
 body: JSON.stringify(theme),
 }
 );

 if (response.ok) {
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 }
 } catch (error) {
 console.error("Error updating theme:", error);
 alert("Failed to update theme");
 } finally {
 setLoading(false);
 }
 };

 const selectedTile =
 "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-slate-900 dark:text-slate-100";
 const unselectedTile =
 "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600";

 return (
 <div className="p-6 space-y-6">
 <PageHeader
 title="Appearance Settings"
 description="Customize the look and feel of your workspace"
 breadcrumbs={[
 { label: "Settings", href: "/settings" },
 { label: "Appearance" },
 ]}
 />

 <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
 {/* Theme Mode */}
 <Card>
 <CardHeader>
 <CardTitle>Theme Mode</CardTitle>
 <CardDescription>Choose your preferred color scheme.</CardDescription>
 </CardHeader>
 <div className="mt-4 grid grid-cols-3 gap-4">
 {["light", "dark", "auto"].map((mode) => (
 <button
 key={mode}
 type="button"
 onClick={() => setTheme({ ...theme, mode })}
 className={`p-4 border-2 rounded-lg text-center transition-all ${
 theme.mode === mode ? selectedTile : unselectedTile
 }`}
 >
 <div className="font-medium capitalize">{mode}</div>
 </button>
 ))}
 </div>
 </Card>

 {/* Primary Color */}
 <Card>
 <CardHeader>
 <CardTitle>Primary Color</CardTitle>
 </CardHeader>
 <div className="mt-4 grid grid-cols-5 gap-3 mb-3">
 {colorPresets.map((color) => (
 <button
 key={color.value}
 type="button"
 onClick={() => setTheme({ ...theme, primaryColor: color.value })}
 className={`relative h-12 rounded-lg border-2 transition-all ${
 theme.primaryColor === color.value
 ? "border-slate-900 dark:border-slate-100 scale-110"
 : "border-slate-200 dark:border-slate-700 hover:scale-105"
 }`}
 style={{ backgroundColor: color.value }}
 title={color.name}
 />
 ))}
 </div>
 <div className="flex items-center gap-2">
 <input
 type="color"
 value={theme.primaryColor}
 onChange={(e) =>
 setTheme({ ...theme, primaryColor: e.target.value })
 }
 className="h-10 w-20 rounded border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
 />
 <Input
 type="text"
 value={theme.primaryColor}
 onChange={(e) =>
 setTheme({ ...theme, primaryColor: e.target.value })
 }
 placeholder="#3B82F6"
 wrapperClassName="flex-1"
 />
 </div>
 </Card>

 {/* Accent Color */}
 <Card>
 <CardHeader>
 <CardTitle>Accent Color</CardTitle>
 </CardHeader>
 <div className="mt-4 grid grid-cols-5 gap-3 mb-3">
 {colorPresets.map((color) => (
 <button
 key={color.value}
 type="button"
 onClick={() => setTheme({ ...theme, accentColor: color.value })}
 className={`relative h-12 rounded-lg border-2 transition-all ${
 theme.accentColor === color.value
 ? "border-slate-900 dark:border-slate-100 scale-110"
 : "border-slate-200 dark:border-slate-700 hover:scale-105"
 }`}
 style={{ backgroundColor: color.value }}
 title={color.name}
 />
 ))}
 </div>
 <div className="flex items-center gap-2">
 <input
 type="color"
 value={theme.accentColor}
 onChange={(e) =>
 setTheme({ ...theme, accentColor: e.target.value })
 }
 className="h-10 w-20 rounded border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
 />
 <Input
 type="text"
 value={theme.accentColor}
 onChange={(e) =>
 setTheme({ ...theme, accentColor: e.target.value })
 }
 placeholder="#10B981"
 wrapperClassName="flex-1"
 />
 </div>
 </Card>

 {/* Font Size */}
 <Card>
 <CardHeader>
 <CardTitle>Font Size</CardTitle>
 </CardHeader>
 <div className="mt-4 grid grid-cols-3 gap-4">
 {["small", "medium", "large"].map((size) => (
 <button
 key={size}
 type="button"
 onClick={() => setTheme({ ...theme, fontSize: size })}
 className={`p-4 border-2 rounded-lg text-center transition-all ${
 theme.fontSize === size ? selectedTile : unselectedTile
 }`}
 >
 <div className={`mb-2 ${size === "small" ? "text-sm" : size === "large" ? "text-xl" : "text-base"}`}>
 Aa
 </div>
 <div className="font-medium capitalize">{size}</div>
 </button>
 ))}
 </div>
 </Card>

 {/* Layout Options */}
 <Card>
 <CardHeader>
 <CardTitle>Layout Options</CardTitle>
 </CardHeader>
 <div className="mt-4 space-y-3">
 <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
 <input
 type="checkbox"
 checked={theme.sidebarCollapsed}
 onChange={(e) =>
 setTheme({ ...theme, sidebarCollapsed: e.target.checked })
 }
 className="w-5 h-5 accent-primary-600 rounded focus:ring-2 focus:ring-primary-500"
 />
 <div>
 <div className="font-medium text-slate-900 dark:text-slate-100">Collapsed Sidebar</div>
 <div className="text-sm text-slate-500 dark:text-slate-400">Start with sidebar minimized</div>
 </div>
 </label>

 <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
 <input
 type="checkbox"
 checked={theme.compactMode}
 onChange={(e) =>
 setTheme({ ...theme, compactMode: e.target.checked })
 }
 className="w-5 h-5 accent-primary-600 rounded focus:ring-2 focus:ring-primary-500"
 />
 <div>
 <div className="font-medium text-slate-900 dark:text-slate-100">Compact Mode</div>
 <div className="text-sm text-slate-500 dark:text-slate-400">Reduce spacing for denser layout</div>
 </div>
 </label>
 </div>
 </Card>

 {/* Preview */}
 <Card>
 <CardHeader>
 <CardTitle>Preview</CardTitle>
 </CardHeader>
 <div className="mt-4 border-2 rounded-lg p-6" style={{ borderColor: theme.primaryColor }}>
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
 <div>
 <div className="font-semibold text-slate-900 dark:text-slate-100">Your Workspace</div>
 <div className="text-sm text-slate-500 dark:text-slate-400">Custom theme preview</div>
 </div>
 </div>
 <button
 type="button"
 className="px-4 py-2 rounded-lg text-white"
 style={{ backgroundColor: theme.accentColor }}
 >
 Button Example
 </button>
 </div>
 </Card>

 {/* Actions */}
 <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
 <Button type="submit" loading={loading} disabled={loading}>
 {loading ? "Saving..." : "Save Theme"}
 </Button>

 {saved && <Badge variant="success">Theme updated successfully</Badge>}
 </div>
 </form>
 </div>
 );
}
