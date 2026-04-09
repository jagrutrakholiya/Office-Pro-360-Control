"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../components/Layout";
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
 <div className="flex items-center justify-center py-24">
 <div className="flex flex-col items-center gap-4">
 <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
 <div className="text-slate-600 font-medium">Loading plan...</div>
 </div>
 </div>
 </Layout>
 );
 }

 return (
 <Layout>
 <div className="section-header">
 <div className="section-actions">
 <div>
 <h2 className="section-title">Edit Plan</h2>
 <p className="section-subtitle">
 {plan.name} ({plan.code})
 </p>
 </div>
 <div className="flex gap-3">
 <button onClick={() => router.push("/plans")} className="btn-secondary">
 Back to Plans
 </button>
 <button onClick={savePlan} disabled={saving} className="btn-primary">
 {saving ? "Saving..." : "Save Plan"}
 </button>
 <button onClick={deletePlan} className="btn-danger">
 Delete
 </button>
 </div>
 </div>
 </div>

 <div className="space-y-6">
 {/* Basic Info */}
 <div className="bg-white rounded-xl border border-slate-200 p-6">
 <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
 <input
 type="text"
 value={plan.name}
 onChange={(e) => updateField("name", e.target.value)}
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
 <input
 type="text"
 value={plan.code}
 onChange={(e) => updateField("code", e.target.value)}
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
 <select
 value={plan.status}
 onChange={(e) => updateField("status", e.target.value)}
 className="select-small w-full"
 >
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 <option value="deprecated">Deprecated</option>
 </select>
 </div>
 <div className="md:col-span-3">
 <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
 <textarea
 value={plan.description}
 onChange={(e) => updateField("description", e.target.value)}
 className="input-small w-full h-20 resize-none"
 />
 </div>
 </div>
 </div>

 {/* Pricing */}
 <div className="bg-white rounded-xl border border-slate-200 p-6">
 <h3 className="text-lg font-bold text-slate-900 mb-4">Pricing</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Pricing Model</label>
 <select
 value={plan.pricingModel}
 onChange={(e) => updateField("pricingModel", e.target.value)}
 className="select-small w-full"
 >
 <option value="free">Free</option>
 <option value="flat">Flat</option>
 <option value="per_user">Per User</option>
 <option value="hybrid">Hybrid</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
 <input
 type="text"
 value={plan.currency}
 onChange={(e) => updateField("currency", e.target.value)}
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Included Users</label>
 <input
 type="number"
 value={plan.includedUsers}
 onChange={(e) => updateField("includedUsers", Number(e.target.value))}
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Base Monthly</label>
 <input
 type="number"
 value={plan.baseMonthly}
 onChange={(e) => updateField("baseMonthly", Number(e.target.value))}
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Base Yearly</label>
 <input
 type="number"
 value={plan.baseYearly}
 onChange={(e) => updateField("baseYearly", Number(e.target.value))}
 className="input-small w-full"
 />
 </div>
 <div></div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Per User Monthly</label>
 <input
 type="number"
 value={plan.perUserMonthly}
 onChange={(e) => updateField("perUserMonthly", Number(e.target.value))}
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Per User Yearly</label>
 <input
 type="number"
 value={plan.perUserYearly}
 onChange={(e) => updateField("perUserYearly", Number(e.target.value))}
 className="input-small w-full"
 />
 </div>
 </div>
 </div>

 {/* Limits */}
 <div className="bg-white rounded-xl border border-slate-200 p-6">
 <h3 className="text-lg font-bold text-slate-900 mb-4">Limits</h3>
 <p className="text-sm text-slate-500 mb-4">Set to -1 for unlimited</p>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Max Users</label>
 <input
 type="number"
 value={plan.maxUsers}
 onChange={(e) => updateField("maxUsers", Number(e.target.value))}
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Max Projects</label>
 <input
 type="number"
 value={plan.maxProjects}
 onChange={(e) => updateField("maxProjects", Number(e.target.value))}
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Max Storage (MB)</label>
 <input
 type="number"
 value={plan.maxStorage}
 onChange={(e) => updateField("maxStorage", Number(e.target.value))}
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Max API Calls</label>
 <input
 type="number"
 value={plan.maxApiCalls}
 onChange={(e) => updateField("maxApiCalls", Number(e.target.value))}
 className="input-small w-full"
 />
 </div>
 </div>
 </div>

 {/* Feature Flags */}
 <div className="bg-white rounded-xl border border-slate-200 p-6">
 <h3 className="text-lg font-bold text-slate-900 mb-4">Feature Flags (planFeatures)</h3>
 <div className="space-y-3">
 {Object.entries(plan.planFeatures).map(([key, enabled]) => (
 <div
 key={key}
 className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
 >
 <div className="flex items-center gap-3">
 <input
 type="checkbox"
 checked={enabled}
 onChange={() => toggleFeatureFlag(key)}
 className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
 />
 <span className="text-sm font-medium text-slate-900">{key}</span>
 </div>
 <button
 onClick={() => removeFeatureFlag(key)}
 className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
 >
 Remove
 </button>
 </div>
 ))}
 {Object.keys(plan.planFeatures).length === 0 && (
 <p className="text-sm text-slate-500">No feature flags defined.</p>
 )}
 </div>
 <div className="flex gap-2 mt-4">
 <input
 type="text"
 value={newFeatureKey}
 onChange={(e) => setNewFeatureKey(e.target.value)}
 placeholder="Feature key (e.g. tasks)"
 className="input-small flex-1"
 onKeyDown={(e) => e.key === "Enter" && addFeatureFlag()}
 />
 <button onClick={addFeatureFlag} className="btn-primary-small">
 Add Flag
 </button>
 </div>
 </div>

 {/* Marketing Features */}
 <div className="bg-white rounded-xl border border-slate-200 p-6">
 <h3 className="text-lg font-bold text-slate-900 mb-4">Marketing Features (display list)</h3>
 <div className="space-y-2">
 {plan.features.map((f, i) => (
 <div
 key={i}
 className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
 >
 <span className="text-sm text-slate-900">{f}</span>
 <button
 onClick={() => removeFeatureText(i)}
 className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
 >
 Remove
 </button>
 </div>
 ))}
 {plan.features.length === 0 && (
 <p className="text-sm text-slate-500">No marketing features added.</p>
 )}
 </div>
 <div className="flex gap-2 mt-4">
 <input
 type="text"
 value={newFeatureText}
 onChange={(e) => setNewFeatureText(e.target.value)}
 placeholder="e.g. Unlimited projects"
 className="input-small flex-1"
 onKeyDown={(e) => e.key === "Enter" && addFeatureText()}
 />
 <button onClick={addFeatureText} className="btn-primary-small">
 Add Feature
 </button>
 </div>
 </div>

 {/* Display Settings */}
 <div className="bg-white rounded-xl border border-slate-200 p-6">
 <h3 className="text-lg font-bold text-slate-900 mb-4">Display Settings</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
 <input
 type="number"
 value={plan.displayOrder}
 onChange={(e) => updateField("displayOrder", Number(e.target.value))}
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Badge</label>
 <input
 type="text"
 value={plan.badge}
 onChange={(e) => updateField("badge", e.target.value)}
 placeholder="e.g. Most Popular"
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
 <input
 type="text"
 value={plan.color}
 onChange={(e) => updateField("color", e.target.value)}
 placeholder="e.g. #3B82F6"
 className="input-small w-full"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
 <select
 value={plan.visibility}
 onChange={(e) => updateField("visibility", e.target.value)}
 className="select-small w-full"
 >
 <option value="public">Public</option>
 <option value="hidden">Hidden</option>
 <option value="internal">Internal</option>
 </select>
 </div>
 <div className="flex items-center gap-3 pt-6">
 <input
 type="checkbox"
 checked={plan.isPopular}
 onChange={(e) => updateField("isPopular", e.target.checked)}
 className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
 />
 <label className="text-sm font-medium text-slate-700">Mark as Popular</label>
 </div>
 </div>
 </div>
 </div>
 </Layout>
 );
}
