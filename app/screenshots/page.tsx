"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiImage, FiTrash2, FiCheck } from "react-icons/fi";
import api from "@/lib/api";
import Layout from "../../components/Layout";

const SCREENSHOT_TYPES = [
  {
    key: "dashboard_overview",
    title: "Dashboard Overview",
    description: "Real-time insights at a glance",
    order: 0,
  },
  {
    key: "task_management",
    title: "Task Management",
    description: "Kanban boards that work",
    order: 1,
  },
  {
    key: "attendance_tracking",
    title: "Attendance Tracking",
    description: "Clock in/out with precision",
    order: 2,
  },
  {
    key: "payroll_processing",
    title: "Payroll Processing",
    description: "Automated salary calculations",
    order: 3,
  },
];

interface Screenshot {
  _id: string;
  key: string;
  title: string;
  description: string;
  imageUrl: string;
  darkModeImageUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ScreenshotManagement() {
  const router = useRouter();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<Record<string, 'light' | 'dark'>>({});

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    try {
      const response = await api.get("/screenshots");
      setScreenshots(response.data.screenshots || []);
    } catch (error) {
      console.error("Error fetching screenshots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (key: string, file: File, mode: 'light' | 'dark') => {
    if (!file) return;

    setUploading(`${key}-${mode}`);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", key);
    formData.append("mode", mode);

    const typeData = SCREENSHOT_TYPES.find((t) => t.key === key);
    if (typeData) {
      formData.append("title", typeData.title);
      formData.append("description", typeData.description);
      formData.append("order", typeData.order.toString());
      formData.append("isActive", "true");
    }

    try {
      await api.post("/screenshots/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchScreenshots();
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      alert("Failed to upload screenshot");
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm("Are you sure you want to delete this screenshot?")) return;

    try {
      await api.delete(`/screenshots/${key}`);
      fetchScreenshots();
    } catch (error) {
      console.error("Error deleting screenshot:", error);
      alert("Failed to delete screenshot");
    }
  };

  const getScreenshot = (key: string) => {
    return screenshots.find((s) => s.key === key);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Screenshot Management
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Upload and manage screenshots for the marketing website
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Screenshots</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{screenshots.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {screenshots.filter(s => s.isActive).length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">Missing</div>
          <div className="text-2xl font-bold text-yellow-600">
            {SCREENSHOT_TYPES.length - screenshots.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">Status</div>
          <div className="text-2xl font-bold text-blue-600">
            {screenshots.length === SCREENSHOT_TYPES.length ? 'Complete' : 'Incomplete'}
          </div>
        </div>
      </div>

      {/* Screenshots Grid */}
      <div className="grid grid-cols-1 gap-8">
        {SCREENSHOT_TYPES.map((type) => {
          const screenshot = getScreenshot(type.key);
          const currentMode = selectedMode[type.key] || 'light';
          const isUploadingLight = uploading === `${type.key}-light`;
          const isUploadingDark = uploading === `${type.key}-dark`;

          return (
            <div
              key={type.key}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {type.title}
                    </h3>
                    {screenshot && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        <FiCheck className="text-xs" />
                        {screenshot.imageUrl && screenshot.darkModeImageUrl ? 'Both Modes' : 
                         screenshot.imageUrl ? 'Light Only' : 'Dark Only'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {type.description}
                  </p>
                </div>
                {screenshot && (
                  <button
                    onClick={() => handleDelete(type.key)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>

              {/* Mode Selector */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">View Mode:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedMode({...selectedMode, [type.key]: 'light'})}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentMode === 'light'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    ☀️ Light Mode
                  </button>
                  <button
                    onClick={() => setSelectedMode({...selectedMode, [type.key]: 'dark'})}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentMode === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    🌙 Dark Mode
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="mb-4 aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                {screenshot && ((currentMode === 'light' && screenshot.imageUrl) || 
                               (currentMode === 'dark' && screenshot.darkModeImageUrl)) ? (
                  <img
                    src={currentMode === 'light' ? screenshot.imageUrl : screenshot.darkModeImageUrl}
                    alt={`${type.title} - ${currentMode} mode`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <FiImage className="mx-auto text-4xl mb-2" />
                    <p className="text-sm">
                      No {currentMode} mode screenshot uploaded
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer">
                  {isUploadingLight ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload />
                      ☀️ {screenshot?.imageUrl ? "Replace Light" : "Upload Light"}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleUpload(type.key, e.target.files[0], 'light')}
                    disabled={isUploadingLight || isUploadingDark}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                  {isUploadingDark ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload />
                      🌙 {screenshot?.darkModeImageUrl ? "Replace Dark" : "Upload Dark"}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleUpload(type.key, e.target.files[0], 'dark')}
                    disabled={isUploadingLight || isUploadingDark}
                    className="hidden"
                  />
                </label>
              </div>

              {screenshot && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  Last updated: {new Date(screenshot.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
          📸 Upload Guidelines
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• <strong>Light & Dark Mode:</strong> Upload separate screenshots for each theme</li>
          <li>• <strong>Recommended size:</strong> 1920x1080 pixels or larger</li>
          <li>• <strong>Supported formats:</strong> JPEG, PNG, WebP</li>
          <li>• <strong>Maximum file size:</strong> 5MB per image</li>
          <li>• <strong>Light Mode:</strong> Use bright background screenshots (white/light colors)</li>
          <li>• <strong>Dark Mode:</strong> Use dark background screenshots (black/dark colors)</li>
          <li>• Marketing website automatically displays correct version based on user's theme</li>
          <li>• Both versions should show the same feature/screen for consistency</li>
        </ul>
      </div>
      </div>
    </Layout>
  );
}
