"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../../components/Layout";
import { useToast } from "../../../../components/ui/Toast";
import { pageContentAPI, PageContent } from "@/lib/marketingAPI";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import { PageHeader, Button, Card, Input, Textarea, Select } from "@/components/ui";

export default function NewPageContent() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<PageContent, '_id' | 'createdAt' | 'updatedAt'>>({
    pageName: "",
    sections: [{
      type: "hero",
      heading: "",
      subheading: "",
      content: ""
    }],
    seo: {
      title: "",
      description: "",
      keywords: [],
      ogImage: ""
    },
    status: "draft"
  });

  const [keywordInput, setKeywordInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pageName || !formData.seo.title) {
      toast.warning("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      await pageContentAPI.create(formData);
      toast.success("Page created");
      router.push("/marketing/pages");
    } catch (error) {
      console.error("Failed to create page:", error);
      toast.error("Failed to create page");
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { type: "content", heading: "", content: "" }]
    });
  };

  const removeSection = (index: number) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index)
    });
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData({ ...formData, sections: newSections });
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setFormData({
        ...formData,
        seo: {
          ...formData.seo,
          keywords: [...formData.seo.keywords, keywordInput.trim()]
        }
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    setFormData({
      ...formData,
      seo: {
        ...formData.seo,
        keywords: formData.seo.keywords.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Create New Page Content"
          breadcrumbs={[
            { label: "Pages", href: "/marketing/pages" },
            { label: "New" },
          ]}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Basic Information</h2>

            <div className="space-y-4">
              <Input
                label={<>Page Name <span className="text-red-500">*</span></>}
                type="text"
                value={formData.pageName}
                onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                required
              />

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
          </Card>

          {/* Sections */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Page Sections</h2>
              <Button type="button" size="sm" leadingIcon={<FaPlus />} onClick={addSection}>
                Add Section
              </Button>
            </div>

            <div className="space-y-4">
              {formData.sections.map((section, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Section {index + 1}</span>
                    {formData.sections.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leadingIcon={<FaTrash />}
                        onClick={() => removeSection(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Select
                      label="Type"
                      value={section.type}
                      onChange={(e) => updateSection(index, "type", e.target.value)}
                    >
                      <option value="hero">Hero</option>
                      <option value="content">Content</option>
                      <option value="features">Features</option>
                      <option value="cta">Call to Action</option>
                    </Select>

                    <Input
                      label="Heading"
                      type="text"
                      value={section.heading || ""}
                      onChange={(e) => updateSection(index, "heading", e.target.value)}
                    />

                    {section.subheading !== undefined && (
                      <Input
                        label="Subheading"
                        type="text"
                        value={section.subheading || ""}
                        onChange={(e) => updateSection(index, "subheading", e.target.value)}
                      />
                    )}

                    <Textarea
                      label="Content"
                      value={typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
                      onChange={(e) => updateSection(index, "content", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SEO */}
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">SEO Settings</h2>

            <div className="space-y-4">
              <Input
                label={<>SEO Title <span className="text-red-500">*</span></>}
                type="text"
                value={formData.seo.title}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
                required
              />

              <Textarea
                label="SEO Description"
                value={formData.seo.description}
                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
                rows={3}
              />

              <div>
                <div className="flex gap-2 mb-2 items-end">
                  <Input
                    wrapperClassName="flex-1"
                    label="Keywords"
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Type keyword and press Enter"
                  />
                  <Button type="button" onClick={addKeyword}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.seo.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="hover:text-red-600 dark:hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" variant="primary" loading={loading} leadingIcon={<FaSave />}>
              {loading ? "Creating..." : "Create Page"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/marketing/pages")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
