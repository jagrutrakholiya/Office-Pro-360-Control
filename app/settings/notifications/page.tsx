"use client";

import { useState, useEffect } from "react";

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
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/preferences`,
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
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/preferences/notifications`,
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
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
        <p className="text-gray-600 mt-1">
          Control how and when you receive notifications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        {/* Email Notifications */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📧 Email Notifications
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Receive notifications via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email?.enabled}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    email: { ...notifications.email, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {notifications.email?.enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-gray-200">
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
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* In-App Notifications */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                🔔 In-App Notifications
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Notifications within the application
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.inApp?.enabled}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    inApp: { ...notifications.inApp, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {notifications.inApp?.enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-gray-200">
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
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">🔊 Play sound</span>
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
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">🖥️ Desktop notifications</span>
              </label>
            </div>
          )}
        </div>

        {/* Quiet Hours */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                🌙 Quiet Hours
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Pause notifications during specific times
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.quietHours?.enabled}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    quietHours: { ...notifications.quietHours, enabled: e.target.checked },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {notifications.quietHours?.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={notifications.quietHours?.startTime || ""}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      quietHours: { ...notifications.quietHours, startTime: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={notifications.quietHours?.endTime || ""}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      quietHours: { ...notifications.quietHours, endTime: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Save Preferences"}
          </button>

          {saved && (
            <div className="text-green-600 flex items-center gap-2">
              <span>✓</span>
              <span>Notification preferences updated</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
