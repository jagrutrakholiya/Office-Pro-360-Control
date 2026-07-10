"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import { PageHeader, Button, Card, Input, Textarea } from "@/components/ui";
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
      <div className="space-y-6">
        <PageHeader
          title="Create New Plan"
          description="Add a new subscription plan and configure pricing"
          actions={
            <Button variant="secondary" onClick={() => router.push("/plans")}>
              ← Back to Plans
            </Button>
          }
        />

        <Card>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Plan Name *"
                placeholder="e.g. Starter"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                label="Plan Code *"
                placeholder="e.g. starter"
                value={form.code}
                onChange={(e) =>
                  setForm({
                    ...form,
                    code: e.target.value.trim().toLowerCase(),
                  })
                }
                helperText="Short, unique identifier. Lowercase letters only."
                required
              />
            </div>

            <Textarea
              label="Description"
              placeholder="Brief description of the plan features and benefits"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              helperText="Optional. Describe what's included in this plan."
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Features
              </label>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      wrapperClassName="flex-1"
                      type="text"
                      placeholder={`Feature ${index + 1} (e.g., Unlimited users)`}
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                    />
                    {features.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => removeFeature(index)}
                        title="Remove feature"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addFeature}
                >
                  + Add Feature
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                List the key features and benefits of this plan. Each feature will
                be displayed as a bullet point on the marketing website.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Monthly Price (₹)"
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
              />
              <Input
                label="Yearly Price (₹)"
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={form.priceYearly || ""}
                onChange={(e) =>
                  setForm({ ...form, priceYearly: Number(e.target.value) || 0 })
                }
                helperText="Keep 0 if not applicable."
              />
            </div>

            {error && (
              <div className="p-3 bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 rounded-md text-danger-700 dark:text-danger-300 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-800 rounded-md text-success-700 dark:text-success-300 text-sm">
                Plan created successfully! Redirecting...
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="submit" disabled={loading || success} loading={loading}>
                {loading ? "Creating..." : success ? "Created!" : "Create Plan"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/plans")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
