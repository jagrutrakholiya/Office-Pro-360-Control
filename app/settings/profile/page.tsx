"use client";

import { useState, useEffect } from "react";

interface ProfileData {
  bio?: string;
  signature?: string;
  phoneNumber?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  timeFormat?: string;
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<ProfileData>({
    timezone: "UTC",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h"
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
        if (data.data?.profile) {
          setProfile(data.data.profile);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/preferences/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profile),
        }
      );

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={4}
            maxLength={500}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {profile.bio?.length || 0}/500 characters
          </div>
        </div>

        {/* Signature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Signature
          </label>
          <input
            type="text"
            value={profile.signature || ""}
            onChange={(e) =>
              setProfile({ ...profile, signature: e.target.value })
            }
            maxLength={200}
            placeholder="Best regards, John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={profile.phoneNumber || ""}
            onChange={(e) =>
              setProfile({ ...profile, phoneNumber: e.target.value })
            }
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={profile.timezone}
            onChange={(e) =>
              setProfile({ ...profile, timezone: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC">UTC (Coordinated Universal Time)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="Australia/Sydney">Sydney (AEDT)</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={profile.language}
            onChange={(e) =>
              setProfile({ ...profile, language: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="pt">Português</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </select>
        </div>

        {/* Date Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={profile.dateFormat}
            onChange={(e) =>
              setProfile({ ...profile, dateFormat: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
          </select>
        </div>

        {/* Time Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Format
          </label>
          <select
            value={profile.timeFormat}
            onChange={(e) =>
              setProfile({ ...profile, timeFormat: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="12h">12-hour (2:30 PM)</option>
            <option value="24h">24-hour (14:30)</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          
          {saved && (
            <div className="text-green-600 flex items-center gap-2">
              <span>✓</span>
              <span>Profile updated successfully</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
