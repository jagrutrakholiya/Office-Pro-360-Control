"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../../components/Layout";
import FirebaseImageUpload from "../../../../components/FirebaseImageUpload";
import RichTextEditor from "../../../../components/RichTextEditor";
import { useToast } from "../../../../components/ui/Toast";
import { caseStudyAPI, CaseStudy } from "@/lib/marketingAPI";
import { getMergedOptions, type OptionItem } from "@/lib/contentOptionsAPI";
import { PageHeader, Button, Card, Input, Textarea, Select } from "@/components/ui";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";

export default function NewCaseStudy() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [industryOptions, setIndustryOptions] = useState<OptionItem[]>([]);
  const [companySizeOptions, setCompanySizeOptions] = useState<OptionItem[]>([]);
  const [formData, setFormData] = useState<Omit<CaseStudy, '_id' | 'slug'>>({
    title: "",
    company: {
      name: "",
      logo: "",
      size: "",
      website: ""
    },
    industry: "",
    challenge: "",
    solution: "",
    results: "",
    metrics: [{ label: "", value: "" }],
    testimonial: {
      quote: "",
      author: "",
      position: ""
    },
    image: "",
    featured: false,
    status: "draft"
  });

  useEffect(() => {
    getMergedOptions()
      .then((opts) => {
        setIndustryOptions(opts.industries || []);
        setCompanySizeOptions(opts.companySizes || []);
      })
      .catch((err) => {
        console.error("Failed to load options:", err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company.name) {
      toast.warning("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      await caseStudyAPI.create(formData);
      toast.success("Case study created");
      router.push("/marketing/case-studies");
    } catch (error) {
      console.error("Failed to create case study:", error);
      toast.error("Failed to create case study");
    } finally {
      setLoading(false);
    }
  };

  const addMetric = () => {
    setFormData({
      ...formData,
      metrics: [...formData.metrics, { label: "", value: "" }]
    });
  };

  const removeMetric = (index: number) => {
    setFormData({
      ...formData,
      metrics: formData.metrics.filter((_, i) => i !== index)
    });
  };

  const updateMetric = (index: number, field: 'label' | 'value', value: string) => {
    const newMetrics = [...formData.metrics];
    newMetrics[index][field] = value;
    setFormData({ ...formData, metrics: newMetrics });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Add Case Study"
          breadcrumbs={[
            { label: "Case Studies", href: "/marketing/case-studies" },
            { label: "New" },
          ]}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Basic Information</h2>

            <div className="space-y-4">
              <Input
                label="Title *"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div>
                <Input
                  label="Industry"
                  list="industry-options"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Type or select industry"
                />
                <datalist id="industry-options">
                  {industryOptions.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </datalist>
              </div>

              <FirebaseImageUpload
                label="Cover Image"
                currentImage={formData.image}
                onUpload={(url) => setFormData({ ...formData, image: url })}
                folder="case-studies"
              />

              <div className="grid grid-cols-2 gap-4">
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
            </div>
          </Card>

          {/* Company Info */}
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Company Details</h2>

            <div className="space-y-4">
              <Input
                label="Company Name *"
                type="text"
                value={formData.company.name}
                onChange={(e) => setFormData({ ...formData, company: { ...formData.company, name: e.target.value } })}
                required
              />

              <FirebaseImageUpload
                label="Company Logo"
                currentImage={formData.company.logo}
                onUpload={(url) => setFormData({ ...formData, company: { ...formData.company, logo: url } })}
                folder="case-studies/logos"
                maxSize={2}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Company Size"
                    list="company-size-options"
                    value={formData.company.size || ""}
                    onChange={(e) => setFormData({ ...formData, company: { ...formData.company, size: e.target.value } })}
                    placeholder="Type or select company size"
                  />
                  <datalist id="company-size-options">
                    {companySizeOptions.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </datalist>
                </div>
                <Input
                  label="Website"
                  type="url"
                  value={formData.company.website || ""}
                  onChange={(e) => setFormData({ ...formData, company: { ...formData.company, website: e.target.value } })}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </Card>

          {/* Content */}
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Case Study Content</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Challenge</label>
                <RichTextEditor
                  value={formData.challenge}
                  onChange={(html) => setFormData({ ...formData, challenge: html })}
                  placeholder="What problem did the client face?"
                  minHeight={180}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Solution</label>
                <RichTextEditor
                  value={formData.solution}
                  onChange={(html) => setFormData({ ...formData, solution: html })}
                  placeholder="How did you solve it?"
                  minHeight={180}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Results</label>
                <RichTextEditor
                  value={formData.results}
                  onChange={(html) => setFormData({ ...formData, results: html })}
                  placeholder="What were the outcomes?"
                  minHeight={180}
                />
              </div>
            </div>
          </Card>

          {/* Metrics */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Key Metrics</h2>
              <Button type="button" size="sm" leadingIcon={<FaPlus />} onClick={addMetric}>
                Add Metric
              </Button>
            </div>

            <div className="space-y-3">
              {formData.metrics.map((metric, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <Input
                    type="text"
                    value={metric.label}
                    onChange={(e) => updateMetric(index, 'label', e.target.value)}
                    placeholder="Label (e.g., Revenue Growth)"
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    value={metric.value}
                    onChange={(e) => updateMetric(index, 'value', e.target.value)}
                    placeholder="Value (e.g., +150%)"
                    className="flex-1"
                  />
                  {formData.metrics.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMetric(index)}>
                      <FaTrash />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Testimonial */}
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Testimonial (Optional)</h2>

            <div className="space-y-4">
              <Textarea
                label="Quote"
                value={formData.testimonial?.quote || ""}
                onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, quote: e.target.value } })}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Author"
                  type="text"
                  value={formData.testimonial?.author || ""}
                  onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, author: e.target.value } })}
                />
                <Input
                  label="Position"
                  type="text"
                  value={formData.testimonial?.position || ""}
                  onChange={(e) => setFormData({ ...formData, testimonial: { ...formData.testimonial!, position: e.target.value } })}
                />
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" variant="primary" loading={loading} leadingIcon={<FaSave />}>
              {loading ? "Creating..." : "Create Case Study"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/marketing/case-studies")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
