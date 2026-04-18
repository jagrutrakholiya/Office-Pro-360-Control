"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../../../components/Layout";
import { useToast } from "../../../../../components/ui/Toast";
import { careerAPI, JobOpening } from "@/lib/marketingAPI";
import { getMergedOptions, type OptionItem } from "@/lib/contentOptionsAPI";
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

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
            onClick={() => router.push("/marketing/careers")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
          >
            <FaArrowLeft /> Back to Careers
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Job Opening</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Job Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    list="department-options"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    list="location-options"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Employment Type</label>
                  <input
                    list="employment-type-options"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <datalist id="employment-type-options">
                    {typeOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded"
                  />
                  Featured Position
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Job Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Salary Range (Optional)</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Min</label>
                <input
                  type="number"
                  value={formData.salaryRange?.min || 0}
                  onChange={(e) => setFormData({ ...formData, salaryRange: { ...formData.salaryRange!, min: parseInt(e.target.value) || 0 } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Max</label>
                <input
                  type="number"
                  value={formData.salaryRange?.max || 0}
                  onChange={(e) => setFormData({ ...formData, salaryRange: { ...formData.salaryRange!, max: parseInt(e.target.value) || 0 } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Currency</label>
                <select
                  value={formData.salaryRange?.currency || "USD"}
                  onChange={(e) => setFormData({ ...formData, salaryRange: { ...formData.salaryRange!, currency: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
          </div>

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
              <div key={field} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{labels[field]}</h2>
                  <button
                    type="button"
                    onClick={() => addItem(field)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaPlus /> Add
                  </button>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateItem(field, index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={placeholders[field]}
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(field, index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

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
              onClick={() => router.push("/marketing/careers")}
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
