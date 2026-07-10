"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../../../components/Layout";
import FirebaseImageUpload from "../../../../../components/FirebaseImageUpload";
import RichTextEditor from "../../../../../components/RichTextEditor";
import { useToast } from "../../../../../components/ui/Toast";
import { tutorialAPI, Tutorial } from "@/lib/marketingAPI";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import { PageHeader, Card, CardHeader, CardTitle, Button, IconButton, Input, Textarea, Select, Skeleton } from "../../../../../components/ui";

export default function EditTutorial() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Tutorial, "_id" | "slug">>({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    level: "Beginner",
    duration: 0,
    image: "",
    steps: [{ stepNumber: 1, title: "", content: "", image: "" }],
    tags: [""],
    featured: false,
    status: "draft",
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const list: Tutorial[] = await tutorialAPI.list();
        const tut = list.find((t) => t._id === id);
        if (!tut) {
          toast.error("Tutorial not found");
          router.push("/marketing/tutorials");
          return;
        }
        setFormData({
          title: tut.title || "",
          excerpt: tut.excerpt || "",
          content: tut.content || "",
          category: tut.category || "",
          level: tut.level || "Beginner",
          duration: tut.duration || 0,
          image: tut.image || "",
          steps: tut.steps?.length ? tut.steps : [{ stepNumber: 1, title: "", content: "", image: "" }],
          tags: tut.tags?.length ? tut.tags : [""],
          featured: !!tut.featured,
          status: tut.status || "draft",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load tutorial");
        router.push("/marketing/tutorials");
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
      await tutorialAPI.update(id, formData);
      toast.success("Tutorial updated");
      router.push("/marketing/tutorials");
    } catch (error) {
      console.error("Failed to update tutorial:", error);
      toast.error("Failed to update tutorial");
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { stepNumber: formData.steps.length + 1, title: "", content: "", image: "" }],
    });
  };

  const removeStep = (index: number) => {
    setFormData({ ...formData, steps: formData.steps.filter((_, i) => i !== index) });
  };

  const updateStep = (index: number, field: keyof Tutorial["steps"][0], value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const addTag = () => setFormData({ ...formData, tags: [...formData.tags, ""] });
  const removeTag = (index: number) => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
  const updateTag = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
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
          title="Edit Tutorial"
          breadcrumbs={[
            { label: "Tutorials", href: "/marketing/tutorials" },
            { label: "Edit" },
          ]}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>

            <div className="mt-4 space-y-4">
              <Input
                label="Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <Textarea
                label="Excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <Select
                  label="Level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Duration (min)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="0"
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
              </div>

              <FirebaseImageUpload
                label="Cover Image"
                currentImage={formData.image}
                onUpload={(url) => setFormData({ ...formData, image: url })}
                folder="tutorials"
              />

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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Content</CardTitle>
            </CardHeader>
            <div className="mt-4">
              <RichTextEditor
                value={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="Write the complete tutorial content here..."
                minHeight={300}
              />
            </div>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Tutorial Steps</CardTitle>
              <Button type="button" variant="secondary" size="sm" leadingIcon={<FaPlus />} onClick={addStep}>
                Add Step
              </Button>
            </CardHeader>

            <div className="mt-4 space-y-4">
              {formData.steps.map((step, index) => (
                <div key={index} className="border border-slate-300 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">Step {index + 1}</h3>
                    {formData.steps.length > 1 && (
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove step ${index + 1}`}
                        onClick={() => removeStep(index)}
                        className="text-danger-600"
                      >
                        <FaTrash />
                      </IconButton>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(index, "title", e.target.value)}
                      placeholder="Step title"
                    />
                    <Textarea
                      value={step.content}
                      onChange={(e) => updateStep(index, "content", e.target.value)}
                      placeholder="Step description"
                      rows={3}
                    />
                    <FirebaseImageUpload
                      label={`Step ${index + 1} Image (Optional)`}
                      currentImage={step.image}
                      onUpload={(url) => updateStep(index, "image", url)}
                      folder={`tutorials/steps`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Tags</CardTitle>
              <Button type="button" variant="secondary" size="sm" leadingIcon={<FaPlus />} onClick={addTag}>
                Add Tag
              </Button>
            </CardHeader>

            <div className="mt-4 space-y-3">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-3">
                  <Input
                    wrapperClassName="flex-1"
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    placeholder="e.g., react, javascript"
                  />
                  {formData.tags.length > 1 && (
                    <IconButton
                      type="button"
                      variant="ghost"
                      aria-label={`Remove tag ${index + 1}`}
                      onClick={() => removeTag(index)}
                      className="text-danger-600"
                    >
                      <FaTrash />
                    </IconButton>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" variant="primary" loading={saving} leadingIcon={<FaSave />}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/marketing/tutorials")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
