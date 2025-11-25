"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiImage, FiTrash2, FiCheck } from "react-icons/fi";
import api from "@/lib/api";

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

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    try {
      const response = await api.get("/api/screenshots");
      setScreenshots(response.data.screenshots || []);
    } catch (error) {
      console.error("Error fetching screenshots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (key: string, file: File) => {
    if (!file) return;

    setUploading(key);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", key);

    const typeData = SCREENSHOT_TYPES.find((t) => t.key === key);
    if (typeData) {
      formData.append("title", typeData.title);
      formData.append("description", typeData.description);
      formData.append("order", typeData.order.toString());
      formData.append("isActive", "true");
    }

    try {
      await api.post("/api/screenshots/upload", formData, {
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
      await api.delete(`/api/screenshots/${key}`);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SCREENSHOT_TYPES.map((type) => {
          const screenshot = getScreenshot(type.key);
          const isUploading = uploading === type.key;

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
                        Active
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

              {/* Preview */}
              <div className="mb-4 aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                {screenshot ? (
                  <img
                    src={screenshot.imageUrl}
                    alt={type.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <FiImage className="mx-auto text-4xl mb-2" />
                    <p className="text-sm">No screenshot uploaded</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload />
                    {screenshot ? "Replace Screenshot" : "Upload Screenshot"}
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleUpload(type.key, e.target.files[0])}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

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
          <li>• Recommended size: 1920x1080 pixels or larger</li>
          <li>• Supported formats: JPEG, PNG, WebP</li>
          <li>• Maximum file size: 5MB</li>
          <li>• Use high-quality screenshots for best results</li>
          <li>• Images will be displayed on the marketing website homepage</li>
          <li>• Screenshots automatically appear on marketing site once uploaded</li>
        </ul>
      </div>
    </div>
  );
}
