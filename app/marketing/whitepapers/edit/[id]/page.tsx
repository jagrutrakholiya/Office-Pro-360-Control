"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../../../components/Layout";
import FirebaseImageUpload from "../../../../../components/FirebaseImageUpload";
import { useToast } from "../../../../../components/ui/Toast";
import { Button, Card, CardHeader, CardTitle, PageHeader, Input, Textarea, Select, Skeleton } from "../../../../../components/ui";
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
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Edit Whitepaper"
          breadcrumbs={[{ label: 'Whitepapers', href: '/marketing/whitepapers' }, { label: 'Edit' }]}
          actions={
            <Button
              type="button"
              variant="outline"
              leadingIcon={<FaArrowLeft />}
              onClick={() => router.push("/marketing/whitepapers")}
            >
              Back to Whitepapers
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>

            <div className="mt-4 space-y-4">
              <Input
                label={<>Title <span className="text-red-500">*</span></>}
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={<>Category <span className="text-red-500">*</span></>}
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
                <Input
                  label="Pages"
                  type="number"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <Input
                label="Publish Date"
                type="date"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              />

              <FirebaseImageUpload
                label="Cover Image"
                currentImage={formData.coverImage}
                onUpload={(url) => setFormData({ ...formData, coverImage: url })}
                folder="whitepapers/covers"
              />

              <Input
                label="File URL (PDF)"
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://storage.example.com/whitepaper.pdf"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
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

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>Authors</CardTitle>
              <Button
                type="button"
                variant="primary"
                leadingIcon={<FaPlus />}
                onClick={addAuthor}
              >
                Add Author
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {formData.authors.map((author, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <Input
                    wrapperClassName="flex-1"
                    type="text"
                    value={author}
                    onChange={(e) => updateAuthor(index, e.target.value)}
                    placeholder="Author name"
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <div className="mt-4 space-y-4">
              <Input
                label="SEO Title"
                type="text"
                value={formData.seo.title}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
              />
              <Textarea
                label="SEO Description"
                value={formData.seo.description}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
                rows={2}
              />
              <Input
                label="Keywords (comma-separated)"
                type="text"
                value={formData.seo.keywords.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, keywords: e.target.value.split(",").map((k) => k.trim()) },
                  })
                }
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              leadingIcon={<FaSave />}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/marketing/whitepapers")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
