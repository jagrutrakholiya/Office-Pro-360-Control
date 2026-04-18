"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Solution, solutionAPI } from "@/lib/marketingAPI";
import { useToast } from "./ui/Toast";
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

type FormData = Omit<Solution, "_id">;

function defaultForm(): FormData {
  return {
    slug: "",
    name: "",
    hero: {
      badge: "",
      icon: "Sparkles",
      title: "",
      titleHighlight: "",
      description: "",
      primaryCta: { text: "Book a Demo", link: "/demo" },
      secondaryCta: { text: "View Pricing", link: "/pricing" },
    },
    featuresTitle: "Key Features",
    featuresDescription: "",
    features: [{ icon: "Sparkles", title: "", description: "", color: "#1978E5" }],
    metrics: [{ value: "", label: "" }],
    seo: { title: "", description: "", keywords: [] },
    status: "draft",
    order: 0,
    featured: false,
  };
}

interface Props {
  mode: "new" | "edit";
  id?: string;
  initial?: FormData;
}

export default function SolutionForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>(initial || defaultForm());
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug || !formData.name) {
      toast.warning("Slug and Name are required");
      return;
    }
    setSaving(true);
    try {
      if (mode === "new") {
        await solutionAPI.create(formData);
      } else if (id) {
        await solutionAPI.update(id, formData);
      }
      toast.success(mode === "new" ? "Solution created" : "Solution updated");
      router.push("/marketing/solutions");
    } catch (err: any) {
      toast.error("Failed to save", err?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () =>
    setFormData({
      ...formData,
      features: [...formData.features, { icon: "Sparkles", title: "", description: "", color: "#1978E5" }],
    });
  const removeFeature = (i: number) =>
    setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) });
  const updateFeature = (i: number, field: "icon" | "title" | "description" | "color", val: string) => {
    const next = [...formData.features];
    next[i] = { ...next[i], [field]: val };
    setFormData({ ...formData, features: next });
  };

  const addMetric = () => setFormData({ ...formData, metrics: [...formData.metrics, { value: "", label: "" }] });
  const removeMetric = (i: number) =>
    setFormData({ ...formData, metrics: formData.metrics.filter((_, idx) => idx !== i) });
  const updateMetric = (i: number, field: "value" | "label", val: string) => {
    const next = [...formData.metrics];
    next[i] = { ...next[i], [field]: val };
    setFormData({ ...formData, metrics: next });
  };

  const input =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push("/marketing/solutions")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
        >
          <FaArrowLeft /> Back to Solutions
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {mode === "new" ? "Add Solution" : "Edit Solution"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Info</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Slug <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(URL: /solutions/[slug])</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  className={input}
                  placeholder="hr-management"
                  disabled={mode === "edit"}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={input}
                  placeholder="HR Management"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className={input}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className={input}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded"
                  />
                  Featured
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Hero Section</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Badge Text</label>
                <input
                  type="text"
                  value={formData.hero.badge || ""}
                  onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, badge: e.target.value } })}
                  className={input}
                  placeholder="HR Management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Icon (lucide name)</label>
                <input
                  type="text"
                  value={formData.hero.icon || ""}
                  onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, icon: e.target.value } })}
                  className={input}
                  placeholder="Users, Building2, Sparkles..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  value={formData.hero.title || ""}
                  onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, title: e.target.value } })}
                  className={input}
                  placeholder="Complete HR Management for"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Title Highlight <span className="text-xs text-gray-500">(shown in gradient)</span>
                </label>
                <input
                  type="text"
                  value={formData.hero.titleHighlight || ""}
                  onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, titleHighlight: e.target.value } })}
                  className={input}
                  placeholder="Modern Teams"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                value={formData.hero.description || ""}
                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, description: e.target.value } })}
                rows={3}
                className={input}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Primary CTA</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.hero.primaryCta?.text || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          primaryCta: { text: e.target.value, link: formData.hero.primaryCta?.link || "/demo" },
                        },
                      })
                    }
                    className={input}
                    placeholder="Button text"
                  />
                  <input
                    type="text"
                    value={formData.hero.primaryCta?.link || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          primaryCta: { text: formData.hero.primaryCta?.text || "", link: e.target.value },
                        },
                      })
                    }
                    className={input}
                    placeholder="/demo"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Secondary CTA</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.hero.secondaryCta?.text || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          secondaryCta: { text: e.target.value, link: formData.hero.secondaryCta?.link || "/pricing" },
                        },
                      })
                    }
                    className={input}
                    placeholder="Button text"
                  />
                  <input
                    type="text"
                    value={formData.hero.secondaryCta?.link || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          secondaryCta: { text: formData.hero.secondaryCta?.text || "", link: e.target.value },
                        },
                      })
                    }
                    className={input}
                    placeholder="/pricing"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Features</h2>
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus /> Add Feature
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Section Title</label>
              <input
                type="text"
                value={formData.featuresTitle || ""}
                onChange={(e) => setFormData({ ...formData, featuresTitle: e.target.value })}
                className={input}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Section Description</label>
              <input
                type="text"
                value={formData.featuresDescription || ""}
                onChange={(e) => setFormData({ ...formData, featuresDescription: e.target.value })}
                className={input}
              />
            </div>
          </div>

          <div className="space-y-3">
            {formData.features.map((f, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Feature {i + 1}</h3>
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={f.icon || ""}
                    onChange={(e) => updateFeature(i, "icon", e.target.value)}
                    placeholder="Icon name (e.g. Users)"
                    className={input}
                  />
                  <input
                    type="text"
                    value={f.title}
                    onChange={(e) => updateFeature(i, "title", e.target.value)}
                    placeholder="Feature title"
                    className={input}
                  />
                  <input
                    type="color"
                    value={f.color || "#1978E5"}
                    onChange={(e) => updateFeature(i, "color", e.target.value)}
                    className="h-10 rounded border border-gray-300 dark:border-gray-600 bg-white"
                  />
                </div>
                <textarea
                  value={f.description}
                  onChange={(e) => updateFeature(i, "description", e.target.value)}
                  placeholder="Feature description"
                  rows={2}
                  className={`${input} mt-3`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Metrics</h2>
            <button
              type="button"
              onClick={addMetric}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus /> Add Metric
            </button>
          </div>
          <div className="space-y-3">
            {formData.metrics.map((m, i) => (
              <div key={i} className="flex gap-3 items-start">
                <input
                  type="text"
                  value={m.value}
                  onChange={(e) => updateMetric(i, "value", e.target.value)}
                  placeholder="Value (e.g. 80%)"
                  className={`flex-1 ${input}`}
                />
                <input
                  type="text"
                  value={m.label}
                  onChange={(e) => updateMetric(i, "label", e.target.value)}
                  placeholder="Label (e.g. Faster onboarding)"
                  className={`flex-1 ${input}`}
                />
                {formData.metrics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMetric(i)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">SEO Title</label>
              <input
                type="text"
                value={formData.seo.title}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
                className={input}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">SEO Description</label>
              <textarea
                value={formData.seo.description}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
                rows={2}
                className={input}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={formData.seo.keywords.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, keywords: e.target.value.split(",").map((k) => k.trim()) },
                  })
                }
                className={input}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <FaSave /> {saving ? "Saving..." : mode === "new" ? "Create Solution" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/marketing/solutions")}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
