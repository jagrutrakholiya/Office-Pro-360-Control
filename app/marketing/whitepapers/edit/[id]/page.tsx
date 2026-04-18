"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../../../components/Layout";
import FirebaseImageUpload from "../../../../../components/FirebaseImageUpload";
import { useToast } from "../../../../../components/ui/Toast";
import { whitepaperAPI, Whitepaper } from "@/lib/marketingAPI";
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

export default function EditWhitepaper() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Whitepaper, "_id" | "slug">>({
    title: "",
    description: "",
    category: "",
    coverImage: "",
    icon: "",
    fileUrl: "",
    pages: 0,
    authors: [""],
    publishDate: new Date().toISOString().split("T")[0],
    gated: false,
    featured: false,
    status: "draft",
    seo: { title: "", description: "", keywords: [] },
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const list: Whitepaper[] = await whitepaperAPI.list();
        const paper = list.find((p) => p._id === id);
        if (!paper) {
          toast.error("Whitepaper not found");
          router.push("/marketing/whitepapers");
          return;
        }
        setFormData({
          title: paper.title || "",
          description: paper.description || "",
          category: paper.category || "",
          coverImage: paper.coverImage || "",
          icon: paper.icon || "",
          fileUrl: paper.fileUrl || "",
          pages: paper.pages || 0,
          authors: paper.authors?.length ? paper.authors : [""],
          publishDate: paper.publishDate ? paper.publishDate.split("T")[0] : new Date().toISOString().split("T")[0],
          gated: !!paper.gated,
          featured: !!paper.featured,
          status: paper.status || "draft",
          seo: {
            title: paper.seo?.title || "",
            description: paper.seo?.description || "",
            keywords: paper.seo?.keywords || [],
          },
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load whitepaper");
        router.push("/marketing/whitepapers");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      toast.warning("Please fill in required fields");
      return;
    }
    setSaving(true);
    try {
      await whitepaperAPI.update(id, formData);
      toast.success("Whitepaper updated");
      router.push("/marketing/whitepapers");
    } catch (error) {
      console.error("Failed to update whitepaper:", error);
      toast.error("Failed to update whitepaper");
    } finally {
      setSaving(false);
    }
  };

  const addAuthor = () => setFormData({ ...formData, authors: [...formData.authors, ""] });
  const removeAuthor = (index: number) =>
    setFormData({ ...formData, authors: formData.authors.filter((_, i) => i !== index) });
  const updateAuthor = (index: number, value: string) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = value;
    setFormData({ ...formData, authors: newAuthors });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/marketing/whitepapers")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
          >
            <FaArrowLeft /> Back to Whitepapers
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Whitepaper</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pages</label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Publish Date</label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <FirebaseImageUpload
                label="Cover Image"
                currentImage={formData.coverImage}
                onUpload={(url) => setFormData({ ...formData, coverImage: url })}
                folder="whitepapers/covers"
              />

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">File URL (PDF)</label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://storage.example.com/whitepaper.pdf"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.gated}
                      onChange={(e) => setFormData({ ...formData, gated: e.target.checked })}
                      className="rounded"
                    />
                    Gated (Require email to download)
                  </label>
                </div>
                <div>
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
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Authors</h2>
              <button
                type="button"
                onClick={addAuthor}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaPlus /> Add Author
              </button>
            </div>

            <div className="space-y-3">
              {formData.authors.map((author, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => updateAuthor(index, e.target.value)}
                    placeholder="Author name"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {formData.authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">SEO Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">SEO Title</label>
                <input
                  type="text"
                  value={formData.seo.title}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">SEO Description</label>
                <textarea
                  value={formData.seo.description}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="keyword1, keyword2, keyword3"
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
              <FaSave /> {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/marketing/whitepapers")}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
