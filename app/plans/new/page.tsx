"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import api from "../../../lib/api";

export default function NewPlanPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    priceMonthly: 0,
    priceYearly: 0,
  });
  const [features, setFeatures] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (index: number) =>
    setFeatures(features.filter((_, i) => i !== index));
  const updateFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Filter out empty features
      const filteredFeatures = features.filter((f) => f.trim() !== "");
      await api.post("/admin/plans", { ...form, features: filteredFeatures });
      setSuccess(true);
      setTimeout(() => {
        router.push("/plans");
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Create New Plan
            </h2>
            <p className="text-slate-600">
              Add a new subscription plan and configure pricing
            </p>
          </div>
          <button
            onClick={() => router.push("/plans")}
            className="btn-secondary"
          >
            ← Back to Plans
          </button>
        </div>
      </div>

      <section className="card mb-8">
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Plan Name *
              </label>
              <input
                placeholder="e.g. Starter"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Plan Code *
              </label>
              <input
                placeholder="e.g. starter"
                value={form.code}
                onChange={(e) =>
                  setForm({
                    ...form,
                    code: e.target.value.trim().toLowerCase(),
                  })
                }
                className="input"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Short, unique identifier. Lowercase letters only.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Brief description of the plan features and benefits"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input min-h-[100px] resize-y"
              rows={4}
            />
            <p className="mt-1 text-xs text-slate-500">
              Optional. Describe what's included in this plan.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Features
            </label>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Feature ${index + 1} (e.g., Unlimited users)`}
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="input flex-1"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Remove feature"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Feature
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              List the key features and benefits of this plan. Each feature will
              be displayed as a bullet point on the marketing website.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Price (₹)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={form.priceMonthly || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priceMonthly: Number(e.target.value) || 0,
                  })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Yearly Price (₹)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={form.priceYearly || ""}
                onChange={(e) =>
                  setForm({ ...form, priceYearly: Number(e.target.value) || 0 })
                }
                className="input"
              />
              <p className="mt-1 text-xs text-slate-500">
                Keep 0 if not applicable.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              Plan created successfully! Redirecting...
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary"
            >
              {loading ? "Creating..." : success ? "Created!" : "Create Plan"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/plans")}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
}
