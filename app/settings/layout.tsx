"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

interface SettingsLayoutProps {
 children: React.ReactNode;
}

const settingsMenu = [
 {
 id: "profile",
 label: "Profile",
 icon: "",
 href: "/settings/profile",
 description: "Manage your personal information"
 },
 {
 id: "theme",
 label: "Appearance",
 icon: "",
 href: "/settings/theme",
 description: "Customize colors and theme"
 },
 {
 id: "notifications",
 label: "Notifications",
 icon: "",
 href: "/settings/notifications",
 description: "Configure notification preferences"
 },
 {
 id: "privacy",
 label: "Privacy & Security",
 icon: "",
 href: "/settings/privacy",
 description: "Control your privacy settings"
 },
 {
 id: "integrations",
 label: "Integrations",
 icon: "",
 href: "/settings/integrations",
 description: "Connect third-party services"
 },
 {
 id: "api-keys",
 label: "API Keys",
 icon: "",
 href: "/settings/api-keys",
 description: "Manage API access"
 },
 {
 id: "data",
 label: "Data & Backup",
 icon: "",
 href: "/settings/data",
 description: "Export and backup your data"
 }
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
 const pathname = usePathname();
 const router = useRouter();
 const { user, loading } = useAuth();
 const [isSidebarOpen, setIsSidebarOpen] = useState(true);

 // Auth guard — redirect to login if not authenticated
 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gray-50">
 <div className="flex flex-col items-center gap-4">
 <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
 <div className="text-gray-600 font-medium">Checking authentication...</div>
 </div>
 </div>
 );
 }

 if (!user) {
 router.push("/login");
 return null;
 }

 const isActive = (href: string) => {
 return pathname === href;
 };

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Header */}
 <div className="mb-8">
 <div className="flex items-center gap-3 mb-1">
 <button onClick={() => router.back()} className="p-1 rounded-md hover:bg-gray-200 text-gray-500">
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
 </button>
 <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
 </div>
 <p className="text-gray-600 mt-1">
 Manage your account settings and preferences
 </p>
 </div>

 <div className="flex gap-6">
 {/* Sidebar */}
 <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} flex-shrink-0 transition-all duration-200`}>
 <div className="bg-white rounded-lg shadow sticky top-6">
 {/* Toggle Button */}
 <div className="p-4 border-b border-gray-200">
 <button
 onClick={() => setIsSidebarOpen(!isSidebarOpen)}
 className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900"
 >
 {isSidebarOpen && <span>Settings Menu</span>}
 <span className="text-xl">{isSidebarOpen ? '◀' : '▶'}</span>
 </button>
 </div>

 {/* Menu Items */}
 <nav className="p-2">
 {settingsMenu.map((item) => (
 <Link
 key={item.id}
 href={item.href}
 className={`
 flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors
 ${isActive(item.href)
 ? 'bg-blue-50 text-blue-700'
 : 'text-gray-700 hover:bg-gray-50'
 }
 `}
 title={!isSidebarOpen ? item.label : undefined}
 >
 <span className="text-xl flex-shrink-0">{item.icon}</span>
 {isSidebarOpen && (
 <div className="flex-1 min-w-0">
 <div className="font-medium text-sm">{item.label}</div>
 <div className="text-xs text-gray-500 truncate">
 {item.description}
 </div>
 </div>
 )}
 {isActive(item.href) && isSidebarOpen && (
 <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
 )}
 </Link>
 ))}
 </nav>

 {/* Help Section */}
 {isSidebarOpen && (
 <div className="p-4 border-t border-gray-200">
 <div className="bg-blue-50 rounded-lg p-3">
 <div className="flex items-start gap-2">
 <span className="text-xl"></span>
 <div>
 <h4 className="text-sm font-medium text-blue-900">
 Need Help?
 </h4>
 <p className="text-xs text-blue-700 mt-1">
 Check our documentation for detailed guides
 </p>
 <button className="text-xs text-blue-600 hover:text-blue-800 mt-2 underline">
 View Docs
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </aside>

 {/* Main Content */}
 <main className="flex-1 min-w-0">
 <div className="bg-white rounded-lg shadow">
 {children}
 </div>
 </main>
 </div>
 </div>
 </div>
 );
}
