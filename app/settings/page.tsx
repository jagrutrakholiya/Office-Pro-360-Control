"use client";

import Link from "next/link";
import {
 PageHeader,
 StatCard,
 Card,
 CardTitle,
 CardDescription,
 Badge,
} from "@/components/ui";

const settingsCategories = [
 {
 id: "profile",
 title: "Profile Settings",
 description: "Manage your personal information, bio, and contact details",
 href: "/settings/profile",
 },
 {
 id: "theme",
 title: "Appearance",
 description: "Customize your theme, colors, and visual preferences",
 href: "/settings/theme",
 },
 {
 id: "notifications",
 title: "Notifications",
 description: "Control email, in-app, and mobile notification settings",
 href: "/settings/notifications",
 },
 {
 id: "privacy",
 title: "Privacy & Security",
 description: "Manage privacy settings, 2FA, and session preferences",
 href: "/settings/privacy",
 },
 {
 id: "integrations",
 title: "Integrations",
 description: "Connect Slack, Email, Calendar, and other services",
 href: "/settings/integrations",
 },
 {
 id: "api-keys",
 title: "API Keys",
 description: "Create and manage API keys for external access",
 href: "/settings/api-keys",
 },
 {
 id: "data",
 title: "Data & Backup",
 description: "Export your data and configure automatic backups",
 href: "/settings/data",
 },
];

const recentChanges = [
 {
 title: "Theme updated",
 detail: "Changed to dark mode",
 time: "2 hours ago",
 dot: "bg-primary-500",
 },
 {
 title: "Notification preferences",
 detail: "Email notifications enabled",
 time: "1 day ago",
 dot: "bg-success-500",
 },
 {
 title: "Integration added",
 detail: "Slack workspace connected",
 time: "3 days ago",
 dot: "bg-purple-500",
 },
];

export default function SettingsPage() {
 return (
 <div className="p-6 space-y-6">
 <PageHeader
 title="Settings Overview"
 description="Configure your account settings and preferences across all categories"
 />

 {/* Quick Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <StatCard label="Profile" value="85%" description="Complete" accent="primary" />
 <StatCard label="Security" value="Strong" description="Protection" accent="success" />
 <StatCard label="Integrations" value="3" description="Active" accent="neutral" />
 </div>

 {/* Settings Categories Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {settingsCategories.map((category) => (
 <Link key={category.id} href={category.href} className="group block">
 <Card variant="interactive" className="h-full">
 <CardTitle className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
 {category.title}
 </CardTitle>
 <CardDescription className="mt-1">
 {category.description}
 </CardDescription>
 <div className="mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1 group-hover:gap-2 transition-all">
 <span>Configure</span>
 <span aria-hidden="true">→</span>
 </div>
 </Card>
 </Link>
 ))}
 </div>

 {/* Recent Activity */}
 <Card>
 <CardTitle>Recent Changes</CardTitle>
 <div className="mt-4 space-y-3">
 {recentChanges.map((change, i) => (
 <div key={i} className="flex items-center gap-3 text-sm">
 <div className={`w-2 h-2 rounded-full ${change.dot}`} aria-hidden="true"></div>
 <div className="flex-1 min-w-0">
 <span className="text-slate-900 dark:text-slate-100 font-medium">
 {change.title}
 </span>
 <span className="text-slate-500 dark:text-slate-400">
 {" "}
 - {change.detail}
 </span>
 </div>
 <Badge variant="neutral" size="sm">
 {change.time}
 </Badge>
 </div>
 ))}
 </div>
 </Card>
 </div>
 );
}
