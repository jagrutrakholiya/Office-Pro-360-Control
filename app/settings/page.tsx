"use client";

import Link from "next/link";

const settingsCategories = [
  {
    id: "profile",
    title: "Profile Settings",
    description: "Manage your personal information, bio, and contact details",
    icon: "👤",
    href: "/settings/profile",
    color: "bg-blue-500"
  },
  {
    id: "theme",
    title: "Appearance",
    description: "Customize your theme, colors, and visual preferences",
    icon: "🎨",
    href: "/settings/theme",
    color: "bg-purple-500"
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Control email, in-app, and mobile notification settings",
    icon: "🔔",
    href: "/settings/notifications",
    color: "bg-yellow-500"
  },
  {
    id: "privacy",
    title: "Privacy & Security",
    description: "Manage privacy settings, 2FA, and session preferences",
    icon: "🔒",
    href: "/settings/privacy",
    color: "bg-green-500"
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect Slack, Email, Calendar, and other services",
    icon: "🔌",
    href: "/settings/integrations",
    color: "bg-indigo-500"
  },
  {
    id: "api-keys",
    title: "API Keys",
    description: "Create and manage API keys for external access",
    icon: "🔑",
    href: "/settings/api-keys",
    color: "bg-red-500"
  },
  {
    id: "data",
    title: "Data & Backup",
    description: "Export your data and configure automatic backups",
    icon: "💾",
    href: "/settings/data",
    color: "bg-teal-500"
  }
];

export default function SettingsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Settings Overview</h2>
        <p className="text-gray-600 mt-2">
          Configure your account settings and preferences across all categories
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-600 font-medium">Profile</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">85%</div>
              <div className="text-xs text-blue-700 mt-1">Complete</div>
            </div>
            <div className="text-4xl">👤</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-600 font-medium">Security</div>
              <div className="text-2xl font-bold text-green-900 mt-1">Strong</div>
              <div className="text-xs text-green-700 mt-1">Protection</div>
            </div>
            <div className="text-4xl">🔒</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-600 font-medium">Integrations</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">3</div>
              <div className="text-xs text-purple-700 mt-1">Active</div>
            </div>
            <div className="text-4xl">🔌</div>
          </div>
        </div>
      </div>

      {/* Settings Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
          >
            <div className="flex items-start gap-4">
              <div className={`${category.color} text-white text-3xl rounded-lg p-3 group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {category.description}
                </p>
                <div className="mt-3 text-sm text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  <span>Configure</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <span className="text-gray-900 font-medium">Theme updated</span>
              <span className="text-gray-600"> - Changed to dark mode</span>
            </div>
            <span className="text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <span className="text-gray-900 font-medium">Notification preferences</span>
              <span className="text-gray-600"> - Email notifications enabled</span>
            </div>
            <span className="text-gray-500">1 day ago</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <span className="text-gray-900 font-medium">Integration added</span>
              <span className="text-gray-600"> - Slack workspace connected</span>
            </div>
            <span className="text-gray-500">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
