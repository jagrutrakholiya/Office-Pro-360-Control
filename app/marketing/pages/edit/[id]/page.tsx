"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../../../components/Layout";
import { useToast } from "../../../../../components/ui/Toast";
import { pageContentAPI, PageContent } from "@/lib/marketingAPI";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";
import { PageHeader, Button, Card, Input, Textarea, Select, Skeleton } from "@/components/ui";

export default function EditPageContent() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PageContent | null>(null);
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPage = async () => {
    try {
      const data = await pageContentAPI.get(id);
      setFormData(data);
    } catch (error) {
      console.error("Failed to load page:", error);
      toast.error("Failed to load page data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (!formData.pageName || !formData.seo.title) {
      toast.warning("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      await pageContentAPI.update(id, formData);
      toast.success("Page updated");
      router.push("/marketing/pages");
    } catch (error) {
      console.error("Failed to update page:", error);
      toast.error("Failed to update page");
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      sections: [...formData.sections, { type: "content", heading: "", content: "", sectionName: `section-${formData.sections.length + 1}` }]
    });
  };

  const removeSection = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index)
    });
  };

  const updateSection = (index: number, field: string, value: any) => {
    if (!formData) return;
    const newSections = [...formData.sections];
    // Special handling for nested updates (e.g. badge.text)
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newSections[index] = {
        ...newSections[index],
        [parent]: {
          ...newSections[index][parent],
          [child]: value
        }
      };
    } else {
      newSections[index] = { ...newSections[index], [field]: value };
    }
    setFormData({ ...formData, sections: newSections });
  };

  const updateCTA = (index: number, type: 'primary' | 'secondary', field: 'text' | 'link', value: string) => {
    if (!formData) return;
    const newSections = [...formData.sections];
    const cta = newSections[index].cta || { primary: {}, secondary: {} };

    newSections[index] = {
      ...newSections[index],
      cta: {
        ...cta,
        [type]: {
          ...cta[type],
          [field]: value
        }
      }
    };
    setFormData({ ...formData, sections: newSections });
  }

  const addKeyword = () => {
    if (keywordInput.trim() && formData) {
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
    if (!formData) return;
    setFormData({
      ...formData,
      seo: {
        ...formData.seo,
        keywords: formData.seo.keywords.filter((_, i) => i !== index)
      }
    });
  };

  if (loading || !formData) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-20">
        <PageHeader
          title={`Edit Page: ${formData.pageName}`}
          breadcrumbs={[
            { label: "Pages", href: "/marketing/pages" },
            { label: "Edit" },
          ]}
          actions={
            <Button
              variant="primary"
              loading={loading}
              leadingIcon={<FaSave />}
              onClick={handleSubmit}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Basic Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Page Name (URL Slug)"
                type="text"
                value={formData.pageName}
                disabled
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Page Sections</h2>
              <Button type="button" variant="secondary" size="sm" leadingIcon={<FaPlus />} onClick={addSection}>
                Add Section
              </Button>
            </div>

            <div className="space-y-6">
              {formData.sections.map((section, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-400 dark:text-slate-500">#{index + 1}</span>
                      <input
                        type="text"
                        value={section.sectionName || ''}
                        onChange={(e) => updateSection(index, 'sectionName', e.target.value)}
                        className="bg-transparent border-none font-semibold text-slate-900 dark:text-slate-100 focus:ring-0 p-0"
                        placeholder="Section Name"
                      />
                    </div>
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

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Type"
                        value={section.type}
                        onChange={(e) => updateSection(index, "type", e.target.value)}
                      >
                        <option value="hero">Hero Section</option>
                        <option value="features">Features Grid</option>
                        <option value="stats">Stats Section</option>
                        <option value="content">Generic Content</option>
                        <option value="cta">Call to Action</option>
                      </Select>
                    </div>

                    {/* Common Fields */}
                    <Input
                      label="Title"
                      type="text"
                      value={section.title || section.heading || ""}
                      onChange={(e) => updateSection(index, "title", e.target.value)}
                      placeholder="Main heading"
                    />

                    <Textarea
                      label="Subtitle"
                      value={section.subtitle || section.subheading || ""}
                      onChange={(e) => updateSection(index, "subtitle", e.target.value)}
                      rows={2}
                      placeholder="Supporting text"
                    />

                    {/* Hero Specific Fields */}
                    {section.type === 'hero' && (
                      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg space-y-4 border border-blue-100 dark:border-blue-800">
                        <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Hero Configuration</h3>

                        {/* Badge */}
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-2">
                            <Input
                              label="Badge Icon"
                              type="text"
                              value={section.badge?.icon || ''}
                              onChange={(e) => updateSection(index, 'badge.icon', e.target.value)}
                            />
                          </div>
                          <div className="col-span-10">
                            <Input
                              label="Badge Text"
                              type="text"
                              value={section.badge?.text || ''}
                              onChange={(e) => updateSection(index, 'badge.text', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* CTA Primary */}
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Primary Button</label>
                          <div className="flex gap-2">
                            <Input
                              wrapperClassName="flex-1"
                              placeholder="Text"
                              type="text"
                              value={section.cta?.primary?.text || ''}
                              onChange={(e) => updateCTA(index, 'primary', 'text', e.target.value)}
                            />
                            <Input
                              wrapperClassName="flex-1"
                              placeholder="Link / URL"
                              type="text"
                              value={section.cta?.primary?.link || ''}
                              onChange={(e) => updateCTA(index, 'primary', 'link', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* CTA Secondary */}
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Secondary Button</label>
                          <div className="flex gap-2">
                            <Input
                              wrapperClassName="flex-1"
                              placeholder="Text"
                              type="text"
                              value={section.cta?.secondary?.text || ''}
                              onChange={(e) => updateCTA(index, 'secondary', 'text', e.target.value)}
                            />
                            <Input
                              wrapperClassName="flex-1"
                              placeholder="Link / URL"
                              type="text"
                              value={section.cta?.secondary?.link || ''}
                              onChange={(e) => updateCTA(index, 'secondary', 'link', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items JSON Fallback (for features etc) */}
                    {(section.type === 'features' || section.type === 'content') && (
                      <Textarea
                        label={
                          <>
                            Content Items (JSON)
                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">For simple lists</span>
                          </>
                        }
                        value={typeof section.items === 'object' ? JSON.stringify(section.items, null, 2) : section.content || ''}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            updateSection(index, "items", parsed);
                          } catch (err) {
                            // Allow typing until valid JSON
                            updateSection(index, "content", e.target.value);
                          }
                        }}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    )}

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
        </form>
      </div>
    </Layout>
  );
}
