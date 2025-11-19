"use client";

import { useState, useEffect } from "react";

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
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/preferences`,
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
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/preferences/theme`,
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Appearance Settings</h2>
        <p className="text-gray-600 mt-1">
          Customize the look and feel of your workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Theme Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Theme Mode
          </label>
          <div className="grid grid-cols-3 gap-4">
            {["light", "dark", "auto"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme({ ...theme, mode })}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  theme.mode === mode
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">
                  {mode === "light" ? "☀️" : mode === "dark" ? "🌙" : "🔄"}
                </div>
                <div className="font-medium capitalize">{mode}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Primary Color
          </label>
          <div className="grid grid-cols-5 gap-3 mb-3">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setTheme({ ...theme, primaryColor: color.value })}
                className={`relative h-12 rounded-lg border-2 transition-all ${
                  theme.primaryColor === color.value
                    ? "border-gray-900 scale-110"
                    : "border-gray-200 hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {theme.primaryColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) =>
                setTheme({ ...theme, primaryColor: e.target.value })
              }
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={theme.primaryColor}
              onChange={(e) =>
                setTheme({ ...theme, primaryColor: e.target.value })
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Accent Color
          </label>
          <div className="grid grid-cols-5 gap-3 mb-3">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setTheme({ ...theme, accentColor: color.value })}
                className={`relative h-12 rounded-lg border-2 transition-all ${
                  theme.accentColor === color.value
                    ? "border-gray-900 scale-110"
                    : "border-gray-200 hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {theme.accentColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.accentColor}
              onChange={(e) =>
                setTheme({ ...theme, accentColor: e.target.value })
              }
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={theme.accentColor}
              onChange={(e) =>
                setTheme({ ...theme, accentColor: e.target.value })
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="#10B981"
            />
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Font Size
          </label>
          <div className="grid grid-cols-3 gap-4">
            {["small", "medium", "large"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setTheme({ ...theme, fontSize: size })}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  theme.fontSize === size
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`mb-2 ${size === "small" ? "text-sm" : size === "large" ? "text-xl" : "text-base"}`}>
                  Aa
                </div>
                <div className="font-medium capitalize">{size}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Layout Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Layout Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={theme.sidebarCollapsed}
                onChange={(e) =>
                  setTheme({ ...theme, sidebarCollapsed: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Collapsed Sidebar</div>
                <div className="text-sm text-gray-600">Start with sidebar minimized</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={theme.compactMode}
                onChange={(e) =>
                  setTheme({ ...theme, compactMode: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Compact Mode</div>
                <div className="text-sm text-gray-600">Reduce spacing for denser layout</div>
              </div>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preview
          </label>
          <div className="border-2 border-gray-200 rounded-lg p-6" style={{ borderColor: theme.primaryColor }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
              <div>
                <div className="font-semibold text-gray-900">Your Workspace</div>
                <div className="text-sm text-gray-600">Custom theme preview</div>
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
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Save Theme"}
          </button>

          {saved && (
            <div className="text-green-600 flex items-center gap-2">
              <span>✓</span>
              <span>Theme updated successfully</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
