"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../../../components/Layout";
import { useToast } from "../../../../../components/ui/Toast";
import { careerAPI, JobOpening } from "@/lib/marketingAPI";
import { getMergedOptions, type OptionItem } from "@/lib/contentOptionsAPI";
import { PageHeader, Button, Card, Input, Textarea, Select } from "@/components/ui";
import { FaSave, FaPlus, FaTrash } from "react-icons/fa";

export default function EditCareer() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deptOptions, setDeptOptions] = useState<OptionItem[]>([]);
  const [typeOptions, setTypeOptions] = useState<OptionItem[]>([]);
  const [locationOptions, setLocationOptions] = useState<OptionItem[]>([]);
  const [formData, setFormData] = useState<Omit<JobOpening, "_id" | "slug">>({
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
    status: "open",
  });

  useEffect(() => {
    getMergedOptions()
      .then((opts) => {
        setDeptOptions(opts.departments || []);
        setTypeOptions(opts.employmentTypes || []);
        setLocationOptions(opts.locations || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const jobs: JobOpening[] = await careerAPI.list();
        const job = jobs.find((j) => j._id === id);
        if (!job) {
          toast.error("Job opening not found");
          router.push("/marketing/careers");
          return;
        }
        setFormData({
          title: job.title || "",
          department: job.department || "",
          location: job.location || "",
          type: job.type || "Full-time",
          description: job.description || "",
          responsibilities: job.responsibilities?.length ? job.responsibilities : [""],
          requirements: job.requirements?.length ? job.requirements : [""],
          benefits: job.benefits?.length ? job.benefits : [""],
          salaryRange: job.salaryRange || { min: 0, max: 0, currency: "USD" },
          featured: !!job.featured,
          status: job.status || "open",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load job opening");
        router.push("/marketing/careers");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.department) {
      toast.warning("Please fill in required fields");
      return;
    }
    setSaving(true);
    try {
      await careerAPI.update(id, formData);
      toast.success("Job opening updated");
      router.push("/marketing/careers");
    } catch (error) {
      console.error("Failed to update job opening:", error);
      toast.error("Failed to update job opening");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: "responsibilities" | "requirements" | "benefits") => {
    const arr = formData[field] || [];
    setFormData({ ...formData, [field]: [...arr, ""] });
  };

  const removeItem = (field: "responsibilities" | "requirements" | "benefits", index: number) => {
    const arr = formData[field] || [];
    setFormData({ ...formData, [field]: arr.filter((_, i) => i !== index) });
  };

  const updateItem = (field: "responsibilities" | "requirements" | "benefits", index: number, value: string) => {
    const arr = formData[field] || [];
    const newArray = [...arr];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Edit Job Opening"
          breadcrumbs={[{ label: "Careers", href: "/marketing/careers" }, { label: "Edit" }]}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Job Details</h2>

            <div className="space-y-4">
              <Input
                label="Job Title *"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Department *"
                    list="department-options"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                  <option value="draft">Draft</option>
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
              />
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Salary Range (Optional)</h2>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Min"
                type="number"
                value={formData.salaryRange?.min || 0}
                onChange={(e) => setFormData({ ...formData, salaryRange: { ...formData.salaryRange!, min: parseInt(e.target.value) || 0 } })}
                min="0"
              />
              <Input
                label="Max"
                type="number"
                value={formData.salaryRange?.max || 0}
                onChange={(e) => setFormData({ ...formData, salaryRange: { ...formData.salaryRange!, max: parseInt(e.target.value) || 0 } })}
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

          {(["responsibilities", "requirements", "benefits"] as const).map((field) => {
            const labels: Record<string, string> = {
              responsibilities: "Responsibilities",
              requirements: "Requirements",
              benefits: "Benefits",
            };
            const placeholders: Record<string, string> = {
              responsibilities: "e.g., Design and implement new features",
              requirements: "e.g., 5+ years of experience in React",
              benefits: "e.g., Health insurance, Remote work",
            };
            const items = (formData[field] as string[]) || [];
            return (
              <Card key={field} padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{labels[field]}</h2>
                  <Button type="button" size="sm" variant="secondary" leadingIcon={<FaPlus />} onClick={() => addItem(field)}>
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={item}
                          onChange={(e) => updateItem(field, index, e.target.value)}
                          placeholder={placeholders[field]}
                        />
                      </div>
                      {items.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(field, index)}>
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

          <div className="flex gap-4">
            <Button type="submit" variant="primary" loading={saving} leadingIcon={<FaSave />}>
              {saving ? "Saving..." : "Save Changes"}
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
