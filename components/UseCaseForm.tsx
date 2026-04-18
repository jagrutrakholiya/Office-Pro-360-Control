"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UseCase, useCaseAPI } from "@/lib/marketingAPI";
import FirebaseImageUpload from "./FirebaseImageUpload";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "./ui/Toast";
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

type FormData = Omit<UseCase, "_id">;

function defaultForm(): FormData {
  return {
    slug: "",
    title: "",
    category: "General",
    icon: "Sparkles",
    color: "#1978E5",
    summary: "",
    problem: "",
    solution: "",
    outcome: "",
    steps: [{ title: "", description: "" }],
    image: "",
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

export default function UseCaseForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>(initial || defaultForm());
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug || !formData.title) {
      toast.warning("Slug and Title are required");
      return;
    }
    setSaving(true);
    try {
      if (mode === "new") await useCaseAPI.create(formData);
      else if (id) await useCaseAPI.update(id, formData);
      toast.success(mode === "new" ? "Use case created" : "Use case updated");
      router.push("/marketing/use-cases");
    } catch (err: any) {
      toast.error("Failed to save", err?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => setFormData({ ...formData, steps: [...formData.steps, { title: "", description: "" }] });
  const removeStep = (i: number) =>
    setFormData({ ...formData, steps: formData.steps.filter((_, idx) => idx !== i) });
  const updateStep = (i: number, field: "title" | "description", val: string) => {
    const next = [...formData.steps];
    next[i] = { ...next[i], [field]: val };
    setFormData({ ...formData, steps: next });
  };

  const input =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push("/marketing/use-cases")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
        >
          <FaArrowLeft /> Back to Use Cases
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {mode === "new" ? "Add Use Case" : "Edit Use Case"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Info</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  className={input}
                  disabled={mode === "edit"}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={input}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={input}
                  placeholder="e.g. Attendance, Payroll"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Icon</label>
                <input
                  type="text"
                  value={formData.icon || ""}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className={input}
                  placeholder="Sparkles"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Color</label>
                <input
                  type="color"
                  value={formData.color || "#1978E5"}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-full rounded border border-gray-300 dark:border-gray-600 bg-white"
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
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Order</label>
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
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Summary</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={2}
                className={input}
                placeholder="Short description shown in list view"
              />
            </div>
            <FirebaseImageUpload
              label="Cover Image"
              currentImage={formData.image}
              onUpload={(url) => setFormData({ ...formData, image: url })}
              folder="use-cases"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">The Problem</h2>
          <RichTextEditor
            value={formData.problem || ""}
            onChange={(html) => setFormData({ ...formData, problem: html })}
            placeholder="Describe the problem this use case addresses..."
            minHeight={200}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">The Solution</h2>
          <RichTextEditor
            value={formData.solution || ""}
            onChange={(html) => setFormData({ ...formData, solution: html })}
            placeholder="How does OfficePro360 solve it..."
            minHeight={200}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">The Outcome</h2>
          <RichTextEditor
            value={formData.outcome || ""}
            onChange={(html) => setFormData({ ...formData, outcome: html })}
            placeholder="What results did the customer achieve..."
            minHeight={200}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Steps</h2>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus /> Add Step
            </button>
          </div>
          <div className="space-y-3">
            {formData.steps.map((s, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Step {i + 1}</h3>
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={s.title}
                  onChange={(e) => updateStep(i, "title", e.target.value)}
                  placeholder="Step title"
                  className={input}
                />
                <textarea
                  value={s.description}
                  onChange={(e) => updateStep(i, "description", e.target.value)}
                  placeholder="Step description"
                  rows={2}
                  className={`${input} mt-3`}
                />
              </div>
            ))}
          </div>
        </div>

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
            <FaSave /> {saving ? "Saving..." : mode === "new" ? "Create Use Case" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/marketing/use-cases")}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
