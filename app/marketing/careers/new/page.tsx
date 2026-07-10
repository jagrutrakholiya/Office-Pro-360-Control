"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../../components/Layout";
import { useToast } from "../../../../components/ui/Toast";
import { careerAPI, JobOpening } from "@/lib/marketingAPI";
import { getMergedOptions, type OptionItem } from "@/lib/contentOptionsAPI";
import { PageHeader, Button, Card, Input, Textarea, Select } from "@/components/ui";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";

export default function NewCareer() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [deptOptions, setDeptOptions] = useState<OptionItem[]>([]);
  const [typeOptions, setTypeOptions] = useState<OptionItem[]>([]);
  const [locationOptions, setLocationOptions] = useState<OptionItem[]>([]);
  const [formData, setFormData] = useState<Omit<JobOpening, '_id' | 'slug'>>({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    description: "",
    responsibilities: [""],
    requirements: [""],
    benefits: [""],
    salaryRange: { min: 0, max: 0, currency: "USD" },
    featured: false,
    status: "open"
  });

  useEffect(() => {
    // Load options from content options API (merged global + company)
    getMergedOptions()
      .then((opts) => {
        setDeptOptions(opts.departments || []);
        setTypeOptions(opts.employmentTypes || []);
        setLocationOptions(opts.locations || []);
      })
      .catch((err) => {
        console.error("Failed to load options:", err);
        // Fallback to empty
        setDeptOptions([]);
        setTypeOptions([]);
        setLocationOptions([]);
      })
      .finally(() => {
        setLoadingOptions(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.department) {
      toast.warning("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      await careerAPI.create(formData);
      toast.success("Job opening posted");
      router.push("/marketing/careers");
    } catch (error) {
      console.error("Failed to post job opening:", error);
      toast.error("Failed to post job opening");
    } finally {
      setLoading(false);
    }
  };

  const addItem = (field: 'responsibilities' | 'requirements' | 'benefits') => {
    const arr = formData[field] || [];
    setFormData({ ...formData, [field]: [...arr, ""] });
  };

  const removeItem = (field: 'responsibilities' | 'requirements' | 'benefits', index: number) => {
    const arr = formData[field] || [];
    setFormData({ ...formData, [field]: arr.filter((_, i) => i !== index) });
  };

  const updateItem = (field: 'responsibilities' | 'requirements' | 'benefits', index: number, value: string) => {
    const arr = formData[field] || [];
    const newArray = [...arr];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Post Job Opening"
          breadcrumbs={[{ label: "Careers", href: "/marketing/careers" }, { label: "New" }]}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Job Details</h2>

            <div className="space-y-4">
              <Input
                label="Job Title *"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior Full Stack Developer"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Department *"
                    list="department-options"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Type or select department"
                    required
                  />
                  <datalist id="department-options">
                    {deptOptions.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <Input
                    label="Location"
                    list="location-options"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Type or select location"
                  />
                  <datalist id="location-options">
                    {locationOptions.map((loc) => (
                      <option key={loc.value} value={loc.value}>
                        {loc.label}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Employment Type"
                    list="employment-type-options"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    placeholder="Type or select employment type"
                  />
                  <datalist id="employment-type-options">
                    {typeOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </datalist>
                </div>

                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </Select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded"
                  />
                  Featured Position
                </label>
              </div>

              <Textarea
                label="Job Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                placeholder="Describe the role and what makes it exciting..."
              />
            </div>
          </Card>

          {/* Salary Range */}
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Salary Range (Optional)</h2>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Min"
                type="number"
                value={formData.salaryRange?.min || 0}
                onChange={(e) => setFormData({ ...formData, salaryRange: { ...formData.salaryRange!, min: parseInt(e.target.value) } })}
                min="0"
              />
              <Input
                label="Max"
                type="number"
                value={formData.salaryRange?.max || 0}
                onChange={(e) => setFormData({ ...formData, salaryRange: { ...formData.salaryRange!, max: parseInt(e.target.value) } })}
                min="0"
              />
              <Select
                label="Currency"
                value={formData.salaryRange?.currency || "USD"}
                onChange={(e) => setFormData({ ...formData, salaryRange: { ...formData.salaryRange!, currency: e.target.value } })}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </Select>
            </div>
          </Card>

          {/* Responsibilities */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Responsibilities</h2>
              <Button type="button" size="sm" variant="secondary" leadingIcon={<FaPlus />} onClick={() => addItem('responsibilities')}>
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {formData.responsibilities.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem('responsibilities', index, e.target.value)}
                      placeholder="e.g., Design and implement new features"
                    />
                  </div>
                  {formData.responsibilities.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem('responsibilities', index)}>
                      <FaTrash />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Requirements */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Requirements</h2>
              <Button type="button" size="sm" variant="secondary" leadingIcon={<FaPlus />} onClick={() => addItem('requirements')}>
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {formData.requirements.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem('requirements', index, e.target.value)}
                      placeholder="e.g., 5+ years of experience in React"
                    />
                  </div>
                  {formData.requirements.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem('requirements', index)}>
                      <FaTrash />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Benefits */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Benefits</h2>
              <Button type="button" size="sm" variant="secondary" leadingIcon={<FaPlus />} onClick={() => addItem('benefits')}>
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {(formData.benefits || []).map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem('benefits', index, e.target.value)}
                      placeholder="e.g., Health insurance, Remote work"
                    />
                  </div>
                  {(formData.benefits || []).length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem('benefits', index)}>
                      <FaTrash />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" variant="primary" loading={loading} leadingIcon={<FaSave />}>
              {loading ? "Posting..." : "Post Job Opening"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/marketing/careers")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
