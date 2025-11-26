"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getGlobalOptions,
  updateGlobalOptions,
  initializeGlobalDefaults,
  type OptionItem,
} from "@/lib/contentOptionsAPI";

export default function ContentOptionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("departments");

  const optionTypes = [
    { key: "departments", label: "Departments", icon: "🏢" },
    { key: "employmentTypes", label: "Employment Types", icon: "💼" },
    { key: "locations", label: "Locations", icon: "📍" },
    { key: "tutorialCategories", label: "Tutorial Categories", icon: "📚" },
    { key: "tutorialLevels", label: "Tutorial Levels", icon: "📊" },
    { key: "industries", label: "Industries", icon: "🏭" },
    { key: "companySizes", label: "Company Sizes", icon: "📈" },
    { key: "contentCategories", label: "Content Categories", icon: "📝" },
  ];

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const data = await getGlobalOptions();
      setOptions(data);
    } catch (error: any) {
      console.error("Failed to load options:", error);
      alert(error.response?.data?.message || "Failed to load options");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateGlobalOptions(options);
      alert("✅ Global options saved successfully!");
    } catch (error: any) {
      console.error("Failed to save:", error);
      alert(error.response?.data?.message || "Failed to save options");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "⚠️ This will reset all global options to defaults. Company-specific options will remain unchanged. Continue?"
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await initializeGlobalDefaults();
      await loadOptions();
      alert("✅ Global options reset to defaults!");
    } catch (error: any) {
      console.error("Failed to reset:", error);
      alert(error.response?.data?.message || "Failed to reset options");
    } finally {
      setSaving(false);
    }
  };

  const addOption = (type: string) => {
    const currentOptions = options[type] || [];
    const newOption: OptionItem = {
      value: "",
      label: "",
      order: currentOptions.length + 1,
      active: true,
    };

    setOptions({
      ...options,
      [type]: [...currentOptions, newOption],
    });
  };

  const updateOption = (
    type: string,
    index: number,
    field: keyof OptionItem,
    value: any
  ) => {
    const updatedOptions = [...(options[type] || [])];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };

    // If value changes, sync label
    if (field === "value" && !updatedOptions[index].label) {
      updatedOptions[index].label = value;
    }

    setOptions({
      ...options,
      [type]: updatedOptions,
    });
  };

  const removeOption = (type: string, index: number) => {
    const updatedOptions = (options[type] || []).filter(
      (_: any, i: number) => i !== index
    );
    setOptions({
      ...options,
      [type]: updatedOptions,
    });
  };

  const moveOption = (type: string, index: number, direction: "up" | "down") => {
    const arr = [...(options[type] || [])];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= arr.length) return;

    [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];

    // Update order numbers
    arr.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setOptions({
      ...options,
      [type]: arr,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading options...</p>
        </div>
      </div>
    );
  }

  const currentOptions = options?.[activeTab] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Content Options Manager
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage global default options for marketing content. Companies
                can override these with their own values.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                🔄 Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                💾 {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {optionTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setActiveTab(type.key)}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 border-b last:border-b-0 transition-colors ${
                    activeTab === type.key
                      ? "bg-blue-50 border-l-4 border-l-blue-600 text-blue-900"
                      : "hover:bg-gray-50 text-gray-700 border-l-4 border-l-transparent"
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500">
                      {(options?.[type.key] || []).length} options
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {
                    optionTypes.find((t) => t.key === activeTab)?.label
                  }{" "}
                  Options
                </h2>
                <button
                  onClick={() => addOption(activeTab)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  ➕ Add Option
                </button>
              </div>

              <div className="p-6">
                {currentOptions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No options yet. Click "Add Option" to create one.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentOptions.map((option: OptionItem, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border"
                      >
                        {/* Drag Handle */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveOption(activeTab, index, "up")}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ▲
                          </button>
                          <span className="text-gray-400">⋮⋮</span>
                          <button
                            onClick={() => moveOption(activeTab, index, "down")}
                            disabled={index === currentOptions.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Value Input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) =>
                              updateOption(
                                activeTab,
                                index,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder="Value (e.g., engineering)"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Label Input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) =>
                              updateOption(
                                activeTab,
                                index,
                                "label",
                                e.target.value
                              )
                            }
                            placeholder="Label (e.g., Engineering)"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Active Toggle */}
                        <button
                          onClick={() =>
                            updateOption(activeTab, index, "active", !option.active)
                          }
                          className={`p-2 rounded-lg border-2 transition-colors text-lg ${
                            option.active
                              ? "bg-green-50 border-green-500 text-green-600"
                              : "bg-gray-100 border-gray-300 text-gray-400"
                          }`}
                          title={option.active ? "Active" : "Inactive"}
                        >
                          {option.active ? "✓" : "✗"}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeOption(activeTab, index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-lg"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
