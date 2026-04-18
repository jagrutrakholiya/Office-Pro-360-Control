"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Comparison, comparisonAPI } from "@/lib/marketingAPI";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "./ui/Toast";
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

type FormData = Omit<Comparison, "_id">;

function defaultForm(): FormData {
  return {
    slug: "",
    competitorName: "",
    pageType: "versus",
    hero: { badge: "", title: "", titleHighlight: "", description: "" },
    features: [{ feature: "", us: "yes", competitor: "no", usNote: "", competitorNote: "" }],
    us: { pros: [""], cons: [""] },
    competitor: { pros: [""], cons: [""] },
    pricing: { usHeadline: "", usNote: "", competitorHeadline: "", competitorNote: "" },
    verdictTitle: "Which one should you choose?",
    verdict: "",
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

export default function ComparisonForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>(initial || defaultForm());
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug || !formData.competitorName) {
      toast.warning("Slug and Competitor Name are required");
      return;
    }
    setSaving(true);
    try {
      if (mode === "new") await comparisonAPI.create(formData);
      else if (id) await comparisonAPI.update(id, formData);
      toast.success(mode === "new" ? "Comparison created" : "Comparison updated");
      router.push("/marketing/comparisons");
    } catch (err: any) {
      toast.error("Failed to save", err?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () =>
    setFormData({
      ...formData,
      features: [...formData.features, { feature: "", us: "yes", competitor: "no", usNote: "", competitorNote: "" }],
    });
  const removeFeature = (i: number) =>
    setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) });
  const updateFeature = (i: number, patch: Partial<(typeof formData.features)[0]>) => {
    const next = [...formData.features];
    next[i] = { ...next[i], ...patch };
    setFormData({ ...formData, features: next });
  };

  const updateListItem = (side: "us" | "competitor", field: "pros" | "cons", i: number, value: string) => {
    const next = [...formData[side][field]];
    next[i] = value;
    setFormData({ ...formData, [side]: { ...formData[side], [field]: next } });
  };
  const addListItem = (side: "us" | "competitor", field: "pros" | "cons") =>
    setFormData({ ...formData, [side]: { ...formData[side], [field]: [...formData[side][field], ""] } });
  const removeListItem = (side: "us" | "competitor", field: "pros" | "cons", i: number) =>
    setFormData({
      ...formData,
      [side]: { ...formData[side], [field]: formData[side][field].filter((_, idx) => idx !== i) },
    });

  const input =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push("/marketing/comparisons")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
        >
          <FaArrowLeft /> Back to Comparisons
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {mode === "new" ? "Add Comparison" : "Edit Comparison"}
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
                  Slug <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(URL: /compare/[slug])</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                  }
                  className={input}
                  placeholder="vs-keka or keka-alternative"
                  disabled={mode === "edit"}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Competitor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.competitorName}
                  onChange={(e) => setFormData({ ...formData, competitorName: e.target.value })}
                  className={input}
                  placeholder="Keka, Zoho People, greytHR..."
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Page Type</label>
                <select
                  value={formData.pageType}
                  onChange={(e) => setFormData({ ...formData, pageType: e.target.value as any })}
                  className={input}
                >
                  <option value="versus">Versus (OfficePro360 vs X)</option>
                  <option value="alternative">Alternative (X alternative)</option>
                </select>
              </div>
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
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Badge</label>
                <input
                  type="text"
                  value={formData.hero.badge || ""}
                  onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, badge: e.target.value } })}
                  className={input}
                  placeholder={`e.g. Looking for ${formData.competitorName || "[Competitor]"} alternative?`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  value={formData.hero.title || ""}
                  onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, title: e.target.value } })}
                  className={input}
                  placeholder="OfficePro360 vs"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Title Highlight <span className="text-xs text-gray-500">(gradient text)</span>
              </label>
              <input
                type="text"
                value={formData.hero.titleHighlight || ""}
                onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, titleHighlight: e.target.value } })}
                className={input}
                placeholder={formData.competitorName}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                value={formData.hero.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, hero: { ...formData.hero, description: e.target.value } })
                }
                rows={3}
                className={input}
                placeholder={`A balanced, honest comparison for teams evaluating ${formData.competitorName || "competitor"}.`}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feature Comparison</h2>
              <p className="text-xs text-gray-500 mt-1">
                Status: yes = ✓ included · no = ✗ not available · partial = △ limited · custom = write a note
              </p>
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus /> Add Feature
            </button>
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
                <input
                  type="text"
                  value={f.feature}
                  onChange={(e) => updateFeature(i, { feature: e.target.value })}
                  placeholder="Feature name (e.g. AI Assistant)"
                  className={`${input} mb-3`}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">OfficePro360</label>
                    <select
                      value={f.us}
                      onChange={(e) => updateFeature(i, { us: e.target.value })}
                      className={input}
                    >
                      <option value="yes">✓ Yes</option>
                      <option value="no">✗ No</option>
                      <option value="partial">△ Partial</option>
                      <option value="custom">Custom note</option>
                    </select>
                    {f.us === "custom" && (
                      <input
                        type="text"
                        value={f.usNote || ""}
                        onChange={(e) => updateFeature(i, { usNote: e.target.value })}
                        placeholder="Custom text"
                        className={`${input} mt-2`}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                      {formData.competitorName || "Competitor"}
                    </label>
                    <select
                      value={f.competitor}
                      onChange={(e) => updateFeature(i, { competitor: e.target.value })}
                      className={input}
                    >
                      <option value="yes">✓ Yes</option>
                      <option value="no">✗ No</option>
                      <option value="partial">△ Partial</option>
                      <option value="custom">Custom note</option>
                    </select>
                    {f.competitor === "custom" && (
                      <input
                        type="text"
                        value={f.competitorNote || ""}
                        onChange={(e) => updateFeature(i, { competitorNote: e.target.value })}
                        placeholder="Custom text"
                        className={`${input} mt-2`}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pros/Cons for both sides */}
        {(["us", "competitor"] as const).map((side) => (
          <div key={side} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {side === "us" ? "OfficePro360" : formData.competitorName || "Competitor"} — Pros & Cons
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {(["pros", "cons"] as const).map((field) => (
                <div key={field}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 capitalize">{field}</h3>
                    <button
                      type="button"
                      onClick={() => addListItem(side, field)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <FaPlus className="text-xs" /> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData[side][field].map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateListItem(side, field, i, e.target.value)}
                          placeholder={field === "pros" ? "What's good" : "What's not"}
                          className={`flex-1 ${input}`}
                        />
                        {formData[side][field].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeListItem(side, field, i)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Pricing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Pricing (optional)</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">OfficePro360</h3>
              <input
                type="text"
                value={formData.pricing.usHeadline || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pricing: { ...formData.pricing, usHeadline: e.target.value } })
                }
                placeholder="Headline (e.g. ₹99/employee/month)"
                className={input}
              />
              <textarea
                value={formData.pricing.usNote || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pricing: { ...formData.pricing, usNote: e.target.value } })
                }
                placeholder="Note (e.g. 30-day free trial, no credit card)"
                rows={2}
                className={input}
              />
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">{formData.competitorName || "Competitor"}</h3>
              <input
                type="text"
                value={formData.pricing.competitorHeadline || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pricing: { ...formData.pricing, competitorHeadline: e.target.value } })
                }
                placeholder="Headline"
                className={input}
              />
              <textarea
                value={formData.pricing.competitorNote || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pricing: { ...formData.pricing, competitorNote: e.target.value } })
                }
                placeholder="Note"
                rows={2}
                className={input}
              />
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Verdict</h2>
          <input
            type="text"
            value={formData.verdictTitle || ""}
            onChange={(e) => setFormData({ ...formData, verdictTitle: e.target.value })}
            className={`${input} mb-3`}
            placeholder="Section title"
          />
          <RichTextEditor
            value={formData.verdict || ""}
            onChange={(html) => setFormData({ ...formData, verdict: html })}
            placeholder="Your honest verdict: when to choose OfficePro360, when to pick the alternative..."
            minHeight={200}
          />
        </div>

        {/* SEO */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">SEO</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={formData.seo.title}
              onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
              className={input}
              placeholder="SEO title"
            />
            <textarea
              value={formData.seo.description}
              onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
              rows={2}
              className={input}
              placeholder="SEO description"
            />
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
              placeholder="Keywords (comma-separated)"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <FaSave /> {saving ? "Saving..." : mode === "new" ? "Create Comparison" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/marketing/comparisons")}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
