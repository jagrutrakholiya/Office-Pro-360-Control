"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpArticle, helpArticleAPI } from "@/lib/marketingAPI";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "./ui/Toast";
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

type FormData = Omit<HelpArticle, "_id">;

function defaultForm(): FormData {
  return {
    slug: "",
    title: "",
    category: "Getting Started",
    icon: "HelpCircle",
    excerpt: "",
    content: "",
    tags: [],
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

export default function HelpArticleForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>(initial || defaultForm());
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug || !formData.title) {
      toast.warning("Slug and Title are required");
      return;
    }
    setSaving(true);
    try {
      if (mode === "new") await helpArticleAPI.create(formData);
      else if (id) await helpArticleAPI.update(id, formData);
      toast.success(mode === "new" ? "Article created" : "Article updated");
      router.push("/marketing/help-articles");
    } catch (err: any) {
      toast.error("Failed to save", err?.response?.data?.message);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData({ ...formData, tags: [...formData.tags, t] });
      setTagInput("");
    }
  };

  const input =
    "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push("/marketing/help-articles")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
        >
          <FaArrowLeft /> Back to Help Center
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {mode === "new" ? "Add Help Article" : "Edit Help Article"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Article</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug:
                      mode === "new" && !formData.slug
                        ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                        : formData.slug,
                  });
                }}
                className={input}
                placeholder="How to set up GPS attendance"
                required
              />
            </div>
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
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="help-categories"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={input}
                  required
                />
                <datalist id="help-categories">
                  <option value="Getting Started" />
                  <option value="Account & Billing" />
                  <option value="Attendance" />
                  <option value="Payroll" />
                  <option value="Tasks & Projects" />
                  <option value="Integrations" />
                  <option value="Mobile App" />
                  <option value="Troubleshooting" />
                </datalist>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className={input}
                placeholder="Short summary shown in list view"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Icon</label>
                <input
                  type="text"
                  value={formData.icon || ""}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className={input}
                  placeholder="HelpCircle"
                />
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Article Content</h2>
          <RichTextEditor
            value={formData.content || ""}
            onChange={(html) => setFormData({ ...formData, content: html })}
            placeholder="Write the help article content..."
            minHeight={400}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tags</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add a tag and press Enter"
              className={input}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
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
            <FaSave /> {saving ? "Saving..." : mode === "new" ? "Create Article" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/marketing/help-articles")}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
