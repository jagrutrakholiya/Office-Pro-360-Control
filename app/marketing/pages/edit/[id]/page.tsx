"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../../../components/Layout"; 
import { pageContentAPI, PageContent } from "@/lib/marketingAPI";
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

export default function EditPageContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PageContent | null>(null);
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    loadPage();
  }, [id]);

  const loadPage = async () => {
    try {
      const data = await pageContentAPI.get(id);
      setFormData(data);
    } catch (error) {
      console.error("Failed to load page:", error);
      alert("Failed to load page data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (!formData.pageName || !formData.seo.title) {
      alert("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      await pageContentAPI.update(id, formData);
      alert("Page updated successfully!");
      router.push("/marketing/pages");
    } catch (error) {
      console.error("Failed to update page:", error);
      alert("Failed to update page");
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
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="mb-6 flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push("/marketing/pages")}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-2"
              >
                <FaArrowLeft /> Back to Pages
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Page: {formData.pageName}</h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 shadow-lg"
            >
              <FaSave /> {loading ? "Saving..." : "Save Changes"}
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Page Name (URL Slug)
                </label>
                <input
                  type="text"
                  value={formData.pageName}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Page Sections</h2>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <FaPlus /> Add Section
              </button>
            </div>

            <div className="space-y-6">
              {formData.sections.map((section, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-gray-400">#{index + 1}</span>
                        <input 
                            type="text"
                            value={section.sectionName || ''}
                            onChange={(e) => updateSection(index, 'sectionName', e.target.value)}
                            className="bg-transparent border-none font-semibold text-gray-900 dark:text-white focus:ring-0 p-0"
                            placeholder="Section Name"
                        />
                    </div>
                    {formData.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Type</label>
                        <select
                            value={section.type}
                            onChange={(e) => updateSection(index, "type", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="hero">Hero Section</option>
                            <option value="features">Features Grid</option>
                            <option value="stats">Stats Section</option>
                            <option value="content">Generic Content</option>
                            <option value="cta">Call to Action</option>
                        </select>
                        </div>
                   </div>

                    {/* Common Fields */}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
                      <input
                        type="text"
                        value={section.title || section.heading || ""}
                        onChange={(e) => updateSection(index, "title", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Main heading"
                      />
                    </div>

                    <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Subtitle</label>
                    <textarea
                        value={section.subtitle || section.subheading || ""}
                        onChange={(e) => updateSection(index, "subtitle", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Supporting text"
                    />
                    </div>

                    {/* Hero Specific Fields */}
                    {section.type === 'hero' && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg space-y-4 border border-blue-100 dark:border-blue-800">
                            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Hero Configuration</h3>
                            
                            {/* Badge */}
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium mb-1 text-gray-600">Badge Icon</label>
                                    <input 
                                        type="text" 
                                        value={section.badge?.icon || ''} 
                                        onChange={(e) => updateSection(index, 'badge.icon', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div className="col-span-10">
                                    <label className="block text-xs font-medium mb-1 text-gray-600">Badge Text</label>
                                    <input 
                                        type="text" 
                                        value={section.badge?.text || ''} 
                                        onChange={(e) => updateSection(index, 'badge.text', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>

                            {/* CTA Primary */}
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-600">Primary Button</label>
                                <div className="flex gap-2">
                                    <input 
                                        placeholder="Text"
                                        type="text" 
                                        value={section.cta?.primary?.text || ''} 
                                        onChange={(e) => updateCTA(index, 'primary', 'text', e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <input 
                                        placeholder="Link / URL"
                                        type="text" 
                                        value={section.cta?.primary?.link || ''} 
                                        onChange={(e) => updateCTA(index, 'primary', 'link', e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>

                             {/* CTA Secondary */}
                             <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-600">Secondary Button</label>
                                <div className="flex gap-2">
                                    <input 
                                        placeholder="Text"
                                        type="text" 
                                        value={section.cta?.secondary?.text || ''} 
                                        onChange={(e) => updateCTA(index, 'secondary', 'text', e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <input 
                                        placeholder="Link / URL"
                                        type="text" 
                                        value={section.cta?.secondary?.link || ''} 
                                        onChange={(e) => updateCTA(index, 'secondary', 'link', e.target.value)}
                                        className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Items JSON Fallback (for features etc) */}
                    {(section.type === 'features' || section.type === 'content') && (
                        <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Content Items (JSON)
                            <span className="text-xs font-normal text-gray-500 ml-2">For simple lists</span>
                        </label>
                        <textarea
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                        />
                        </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">SEO Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  SEO Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.seo.title}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  SEO Description
                </label>
                <textarea
                  value={formData.seo.description}
                  onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Type keyword and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
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
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
