"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpArticle, helpArticleAPI } from "@/lib/marketingAPI";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "./ui/Toast";
import { PageHeader, Button, Card, Input, Textarea, Select, Badge } from "@/components/ui";
import { FaSave, FaPlus } from "react-icons/fa";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === "new" ? "Add Help Article" : "Edit Help Article"}
        breadcrumbs={[
          { label: "Help Articles", href: "/marketing/help-articles" },
          { label: mode === "new" ? "New" : "Edit" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card padding="md">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Article</h2>
          <div className="space-y-4">
            <Input
              label={<>Title <span className="text-red-500">*</span></>}
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
              placeholder="How to set up GPS attendance"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={<>Slug <span className="text-red-500">*</span></>}
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                disabled={mode === "edit"}
                required
              />
              <div>
                <Input
                  label={<>Category <span className="text-red-500">*</span></>}
                  type="text"
                  list="help-categories"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
            <Textarea
              label="Excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              placeholder="Short summary shown in list view"
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Icon"
                type="text"
                value={formData.icon || ""}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="HelpCircle"
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 pb-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-600"
                  />
                  Featured
                </label>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Article Content</h2>
          <RichTextEditor
            value={formData.content || ""}
            onChange={(html) => setFormData({ ...formData, content: html })}
            placeholder="Write the help article content..."
            minHeight={400}
          />
        </Card>

        <Card padding="md">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Tags</h2>
          <div className="flex gap-2 mb-3 items-end">
            <Input
              wrapperClassName="flex-1"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              placeholder="Add a tag and press Enter"
            />
            <Button type="button" size="md" leadingIcon={<FaPlus />} onClick={addTag}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="info">
                {tag}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })}
                  className="hover:text-primary-900 dark:hover:text-primary-100"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">SEO</h2>
          <div className="space-y-4">
            <Input
              label="SEO Title"
              type="text"
              value={formData.seo.title}
              onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
              placeholder="SEO title"
            />
            <Textarea
              label="SEO Description"
              value={formData.seo.description}
              onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
              rows={2}
              placeholder="SEO description"
            />
            <Input
              label="Keywords"
              type="text"
              value={formData.seo.keywords.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seo: { ...formData.seo, keywords: e.target.value.split(",").map((k) => k.trim()) },
                })
              }
              placeholder="Keywords (comma-separated)"
            />
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" variant="primary" loading={saving} leadingIcon={<FaSave />}>
            {saving ? "Saving..." : mode === "new" ? "Create Article" : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/marketing/help-articles")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
