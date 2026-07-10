"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../components/Layout";
import {
  PageHeader,
  Button,
  Card,
  CardTitle,
  CardDescription,
  Input,
  Textarea,
  Select,
  Skeleton,
} from "@/components/ui";
import api from "../../../lib/api";

type PlanData = {
  _id: string;
  name: string;
  code: string;
  description: string;
  // Pricing
  pricingModel: string;
  baseMonthly: number;
  baseYearly: number;
  perUserMonthly: number;
  perUserYearly: number;
  includedUsers: number;
  currency: string;
  // Limits
  maxUsers: number;
  maxProjects: number;
  maxStorage: number;
  maxApiCalls: number;
  // Features
  planFeatures: Record<string, boolean>;
  features: string[];
  // Display
  displayOrder: number;
  isPopular: boolean;
  badge: string;
  color: string;
  visibility: string;
  status: string;
};

const defaultPlan: PlanData = {
  _id: "",
  name: "",
  code: "",
  description: "",
  pricingModel: "flat",
  baseMonthly: 0,
  baseYearly: 0,
  perUserMonthly: 0,
  perUserYearly: 0,
  includedUsers: 0,
  currency: "INR",
  maxUsers: -1,
  maxProjects: -1,
  maxStorage: 5120,
  maxApiCalls: -1,
  planFeatures: {},
  features: [],
  displayOrder: 0,
  isPopular: false,
  badge: "",
  color: "",
  visibility: "public",
  status: "active",
};

export default function PlanEditorPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [plan, setPlan] = useState<PlanData>(defaultPlan);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFeatureKey, setNewFeatureKey] = useState("");
  const [newFeatureText, setNewFeatureText] = useState("");

  async function loadPlan() {
    setLoading(true);
    try {
      const res = await api.get(`/admin/plans/${planId}`);
      const data = res.data.plan || res.data;
      setPlan({
        ...defaultPlan,
        ...data,
        planFeatures: data.planFeatures || {},
        features: data.features || [],
      });
    } catch (err) {
      console.error("Failed to load plan", err);
      alert("Failed to load plan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (planId) loadPlan();
  }, [planId]);

  function updateField(field: string, value: any) {
    setPlan((prev) => ({ ...prev, [field]: value }));
  }

  function toggleFeatureFlag(key: string) {
    setPlan((prev) => ({
      ...prev,
      planFeatures: {
        ...prev.planFeatures,
        [key]: !prev.planFeatures[key],
      },
    }));
  }

  function addFeatureFlag() {
    if (!newFeatureKey.trim()) return;
    setPlan((prev) => ({
      ...prev,
      planFeatures: {
        ...prev.planFeatures,
        [newFeatureKey.trim()]: true,
      },
    }));
    setNewFeatureKey("");
  }

  function removeFeatureFlag(key: string) {
    setPlan((prev) => {
      const updated = { ...prev.planFeatures };
      delete updated[key];
      return { ...prev, planFeatures: updated };
    });
  }

  function addFeatureText() {
    if (!newFeatureText.trim()) return;
    setPlan((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureText.trim()],
    }));
    setNewFeatureText("");
  }

  function removeFeatureText(index: number) {
    setPlan((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }

  async function savePlan() {
    setSaving(true);
    try {
      const { _id, ...body } = plan;
      await api.put(`/admin/plans/${planId}`, body);
      alert("Plan saved successfully.");
    } catch (err: any) {
      alert(`Failed to save: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deletePlan() {
    if (!confirm("Are you sure you want to delete this plan? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/plans/${planId}`);
      alert("Plan deleted.");
      router.push("/plans");
    } catch (err: any) {
      alert(`Failed to delete: ${err.response?.data?.message || err.message}`);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </Card>
          <Card>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Edit Plan"
          description={`${plan.name} (${plan.code})`}
          actions={
            <>
              <Button variant="secondary" onClick={() => router.push("/plans")}>
                Back to Plans
              </Button>
              <Button onClick={savePlan} loading={saving}>
                {saving ? "Saving..." : "Save Plan"}
              </Button>
              <Button variant="danger" onClick={deletePlan}>
                Delete
              </Button>
            </>
          }
        />

        {/* Basic Info */}
        <Card>
          <CardTitle className="mb-4">Basic Information</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Name"
              value={plan.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            <Input
              label="Code"
              value={plan.code}
              onChange={(e) => updateField("code", e.target.value)}
            />
            <Select
              label="Status"
              value={plan.status}
              onChange={(e) => updateField("status", e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deprecated">Deprecated</option>
            </Select>
            <div className="md:col-span-3">
              <Textarea
                label="Description"
                value={plan.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card>
          <CardTitle className="mb-4">Pricing</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Pricing Model"
              value={plan.pricingModel}
              onChange={(e) => updateField("pricingModel", e.target.value)}
            >
              <option value="free">Free</option>
              <option value="flat">Flat</option>
              <option value="per_user">Per User</option>
              <option value="hybrid">Hybrid</option>
            </Select>
            <Input
              label="Currency"
              value={plan.currency}
              onChange={(e) => updateField("currency", e.target.value)}
            />
            <Input
              label="Included Users"
              type="number"
              value={plan.includedUsers}
              onChange={(e) => updateField("includedUsers", Number(e.target.value))}
            />
            <Input
              label="Base Monthly"
              type="number"
              value={plan.baseMonthly}
              onChange={(e) => updateField("baseMonthly", Number(e.target.value))}
            />
            <Input
              label="Base Yearly"
              type="number"
              value={plan.baseYearly}
              onChange={(e) => updateField("baseYearly", Number(e.target.value))}
            />
            <div></div>
            <Input
              label="Per User Monthly"
              type="number"
              value={plan.perUserMonthly}
              onChange={(e) => updateField("perUserMonthly", Number(e.target.value))}
            />
            <Input
              label="Per User Yearly"
              type="number"
              value={plan.perUserYearly}
              onChange={(e) => updateField("perUserYearly", Number(e.target.value))}
            />
          </div>
        </Card>

        {/* Limits */}
        <Card>
          <CardTitle>Limits</CardTitle>
          <CardDescription className="mb-4">Set to -1 for unlimited</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Max Users"
              type="number"
              value={plan.maxUsers}
              onChange={(e) => updateField("maxUsers", Number(e.target.value))}
            />
            <Input
              label="Max Projects"
              type="number"
              value={plan.maxProjects}
              onChange={(e) => updateField("maxProjects", Number(e.target.value))}
            />
            <Input
              label="Max Storage (MB)"
              type="number"
              value={plan.maxStorage}
              onChange={(e) => updateField("maxStorage", Number(e.target.value))}
            />
            <Input
              label="Max API Calls"
              type="number"
              value={plan.maxApiCalls}
              onChange={(e) => updateField("maxApiCalls", Number(e.target.value))}
            />
          </div>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardTitle className="mb-4">Feature Flags (planFeatures)</CardTitle>
          <div className="space-y-3">
            {Object.entries(plan.planFeatures).map(([key, enabled]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleFeatureFlag(key)}
                    className="w-4 h-4 text-primary-600 border-slate-300 dark:border-slate-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{key}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeFeatureFlag(key)}>
                  Remove
                </Button>
              </div>
            ))}
            {Object.keys(plan.planFeatures).length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No feature flags defined.</p>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Input
              wrapperClassName="flex-1"
              value={newFeatureKey}
              onChange={(e) => setNewFeatureKey(e.target.value)}
              placeholder="Feature key (e.g. tasks)"
              onKeyDown={(e) => e.key === "Enter" && addFeatureFlag()}
            />
            <Button onClick={addFeatureFlag}>Add Flag</Button>
          </div>
        </Card>

        {/* Marketing Features */}
        <Card>
          <CardTitle className="mb-4">Marketing Features (display list)</CardTitle>
          <div className="space-y-2">
            {plan.features.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-lg"
              >
                <span className="text-sm text-slate-900 dark:text-slate-100">{f}</span>
                <Button size="sm" variant="ghost" onClick={() => removeFeatureText(i)}>
                  Remove
                </Button>
              </div>
            ))}
            {plan.features.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">No marketing features added.</p>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Input
              wrapperClassName="flex-1"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              placeholder="e.g. Unlimited projects"
              onKeyDown={(e) => e.key === "Enter" && addFeatureText()}
            />
            <Button onClick={addFeatureText}>Add Feature</Button>
          </div>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardTitle className="mb-4">Display Settings</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Display Order"
              type="number"
              value={plan.displayOrder}
              onChange={(e) => updateField("displayOrder", Number(e.target.value))}
            />
            <Input
              label="Badge"
              value={plan.badge}
              onChange={(e) => updateField("badge", e.target.value)}
              placeholder="e.g. Most Popular"
            />
            <Input
              label="Color"
              value={plan.color}
              onChange={(e) => updateField("color", e.target.value)}
              placeholder="e.g. #3B82F6"
            />
            <Select
              label="Visibility"
              value={plan.visibility}
              onChange={(e) => updateField("visibility", e.target.value)}
            >
              <option value="public">Public</option>
              <option value="hidden">Hidden</option>
              <option value="internal">Internal</option>
            </Select>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                checked={plan.isPopular}
                onChange={(e) => updateField("isPopular", e.target.checked)}
                className="w-4 h-4 text-primary-600 border-slate-300 dark:border-slate-600 rounded focus:ring-primary-500"
              />
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as Popular</label>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
