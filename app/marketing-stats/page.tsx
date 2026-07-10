"use client";
import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import FirebaseImageUpload from "../../components/FirebaseImageUpload";
import {
 PageHeader,
 Card,
 Button,
 Input,
 Textarea,
 Select,
 Tabs,
 EmptyState,
 Skeleton,
} from "@/components/ui";
import api from "../../lib/api";
import {
 BarChart,
 Bar,
 PieChart,
 Pie,
 Cell,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// Simple toast notifications
const showToast = (message: string, type: "success" | "error" = "success") => {
 const toast = document.createElement("div");
 toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
 type === "success" ? "bg-green-600" : "bg-red-600"
 } text-white font-medium`;
 toast.textContent = message;
 document.body.appendChild(toast);
 setTimeout(() => toast.remove(), 3000);
};

interface Testimonial {
 name: string;
 company: string;
 role: string;
 content: string;
 rating: number;
 avatar?: string;
 isActive: boolean;
}

interface TrustedByLogo {
 name: string;
 logoUrl: string;
 isActive: boolean;
}

interface MarketingStats {
 activeCompanies: number;
 activeUsers: number;
 dailyUptimeSLA: number;
 integrationsCount: number;
 testimonials: Testimonial[];
 trustedByLogos: TrustedByLogo[];
 autoUpdate: boolean;
 lastUpdated: string;
}

export default function MarketingStatsPage() {
 const [stats, setStats] = useState<MarketingStats>({
 activeCompanies: 0,
 activeUsers: 0,
 dailyUptimeSLA: 99.9,
 integrationsCount: 15,
 testimonials: [],
 trustedByLogos: [],
 autoUpdate: false,
 lastUpdated: new Date().toISOString(),
 });
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [refreshing, setRefreshing] = useState(false);
 const [activeTab, setActiveTab] = useState<
 "stats" | "testimonials" | "logos"
 >("stats");

 // New testimonial form
 const [newTestimonial, setNewTestimonial] = useState<Testimonial>({
 name: "",
 company: "",
 role: "",
 content: "",
 rating: 5,
 avatar: "",
 isActive: true,
 });

 // New logo form
 const [newLogo, setNewLogo] = useState<TrustedByLogo>({
 name: "",
 logoUrl: "",
 isActive: true,
 });

 useEffect(() => {
 fetchStats();
 }, []);

 const fetchStats = async () => {
 try {
 const response = await api.get("/marketing/admin/stats");
 setStats(response.data.stats);
 } catch (error) {
 showToast("Failed to load stats", "error");
 } finally {
 setLoading(false);
 }
 };

 const handleSave = async () => {
 setSaving(true);
 try {
 await api.put("/marketing/admin/stats", stats);
 showToast("Stats updated successfully!", "success");
 fetchStats();
 } catch (error) {
 showToast("Error updating stats", "error");
 } finally {
 setSaving(false);
 }
 };

 const handleRefresh = async () => {
 setRefreshing(true);
 try {
 await api.post("/marketing/admin/stats/refresh");
 showToast("Stats refreshed from database!", "success");
 fetchStats();
 } catch (error) {
 showToast("Error refreshing stats", "error");
 } finally {
 setRefreshing(false);
 }
 };

 const addTestimonial = () => {
 if (
 !newTestimonial.name ||
 !newTestimonial.company ||
 !newTestimonial.content
 ) {
 showToast("Please fill in all required fields", "error");
 return;
 }

 setStats({
 ...stats,
 testimonials: [...stats.testimonials, { ...newTestimonial }],
 });

 setNewTestimonial({
 name: "",
 company: "",
 role: "",
 content: "",
 rating: 5,
 avatar: "",
 isActive: true,
 });

 showToast("Testimonial added! Don't forget to save.", "success");
 };

 const removeTestimonial = (index: number) => {
 setStats({
 ...stats,
 testimonials: stats.testimonials.filter((_, i) => i !== index),
 });
 showToast("Testimonial removed! Don't forget to save.", "success");
 };

 const toggleTestimonialStatus = (index: number) => {
 const updated = [...stats.testimonials];
 updated[index].isActive = !updated[index].isActive;
 setStats({ ...stats, testimonials: updated });
 };

 const addLogo = () => {
 if (!newLogo.name || !newLogo.logoUrl) {
 showToast("Please provide logo name and URL", "error");
 return;
 }

 setStats({
 ...stats,
 trustedByLogos: [...stats.trustedByLogos, { ...newLogo }],
 });

 setNewLogo({ name: "", logoUrl: "", isActive: true });
 showToast("Logo added! Don't forget to save.", "success");
 };

 const removeLogo = (index: number) => {
 setStats({
 ...stats,
 trustedByLogos: stats.trustedByLogos.filter((_, i) => i !== index),
 });
 showToast("Logo removed! Don't forget to save.", "success");
 };

 const toggleLogoStatus = (index: number) => {
 const updated = [...stats.trustedByLogos];
 updated[index].isActive = !updated[index].isActive;
 setStats({ ...stats, trustedByLogos: updated });
 };

 if (loading) {
 return (
 <Layout>
 <div className="space-y-6">
 <Skeleton variant="rounded" height={40} width={320} />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {[1, 2, 3, 4].map((i) => (
 <Skeleton key={i} variant="rounded" height={160} />
 ))}
 </div>
 </div>
 </Layout>
 );
 }

 const chartTooltipStyle = {
 backgroundColor: "#fff",
 border: "1px solid #e5e7eb",
 borderRadius: "8px",
 };

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="Marketing Stats Manager"
 description="Manage public-facing statistics, testimonials, and trusted company logos"
 actions={
 <>
 <Button variant="outline" onClick={handleRefresh} loading={refreshing}>
 {refreshing ? "Refreshing..." : "Refresh from DB"}
 </Button>
 <Button onClick={handleSave} loading={saving}>
 {saving ? "Saving..." : "Save Changes"}
 </Button>
 </>
 }
 />

 <div className="text-sm text-slate-500 dark:text-slate-400 -mt-2">
 Last updated: {new Date(stats.lastUpdated).toLocaleString()}
 </div>

 {/* Tabs */}
 <Tabs
 activeKey={activeTab}
 onChange={(k) => setActiveTab(k as "stats" | "testimonials" | "logos")}
 tabs={[
 { key: "stats", label: "Statistics" },
 { key: "testimonials", label: "Testimonials", badge: stats.testimonials.length },
 { key: "logos", label: "Trusted By", badge: stats.trustedByLogos.length },
 ]}
 />

 {/* Stats Tab */}
 {activeTab === "stats" && (
 <div className="space-y-6">
 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 <Card className="p-6">
 <Input
 type="number"
 label="Active Companies"
 value={stats.activeCompanies}
 onChange={(e) =>
 setStats({ ...stats, activeCompanies: parseInt(e.target.value) || 0 })
 }
 />
 </Card>
 <Card className="p-6">
 <Input
 type="number"
 label="Active Users"
 value={stats.activeUsers}
 onChange={(e) =>
 setStats({ ...stats, activeUsers: parseInt(e.target.value) || 0 })
 }
 />
 </Card>
 <Card className="p-6">
 <Input
 type="number"
 step="0.1"
 min="0"
 max="100"
 label="Daily Uptime SLA (%)"
 value={stats.dailyUptimeSLA}
 onChange={(e) =>
 setStats({ ...stats, dailyUptimeSLA: parseFloat(e.target.value) || 0 })
 }
 />
 </Card>
 <Card className="p-6">
 <Input
 type="number"
 label="Integrations Count"
 value={stats.integrationsCount}
 onChange={(e) =>
 setStats({ ...stats, integrationsCount: parseInt(e.target.value) || 0 })
 }
 />
 </Card>
 </div>

 {/* Auto Update Toggle */}
 <Card className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1">
 Auto-Update from Database
 </h3>
 <p className="text-sm text-slate-600 dark:text-slate-400">
 Automatically sync companies and users count from database
 </p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input
 type="checkbox"
 checked={stats.autoUpdate}
 onChange={(e) =>
 setStats({ ...stats, autoUpdate: e.target.checked })
 }
 className="sr-only peer"
 />
 <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
 </label>
 </div>
 </Card>

 {/* Analytics Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="p-6">
 <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4">
 Platform Statistics Overview
 </h3>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart
 data={[
 { name: "Companies", value: stats.activeCompanies },
 { name: "Users", value: stats.activeUsers },
 { name: "Integrations", value: stats.integrationsCount },
 ]}
 >
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis dataKey="name" stroke="#64748b" />
 <YAxis stroke="#64748b" />
 <Tooltip contentStyle={chartTooltipStyle} />
 <Bar dataKey="value" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </Card>

 <Card className="p-6">
 <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4">
 Testimonials by Rating
 </h3>
 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={[
 { name: "5 Stars", value: stats.testimonials.filter((t) => t.rating === 5).length },
 { name: "4 Stars", value: stats.testimonials.filter((t) => t.rating === 4).length },
 { name: "3 Stars", value: stats.testimonials.filter((t) => t.rating === 3).length },
 ].filter((d) => d.value > 0)}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
 outerRadius={100}
 fill="#8884d8"
 dataKey="value"
 >
 {[
 { name: "5 Stars", value: stats.testimonials.filter((t) => t.rating === 5).length },
 { name: "4 Stars", value: stats.testimonials.filter((t) => t.rating === 4).length },
 { name: "3 Stars", value: stats.testimonials.filter((t) => t.rating === 3).length },
 ]
 .filter((d) => d.value > 0)
 .map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={chartTooltipStyle} />
 </PieChart>
 </ResponsiveContainer>
 </Card>

 <Card className="p-6 lg:col-span-2">
 <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4">
 Content Activity Overview
 </h3>
 <ResponsiveContainer width="100%" height={250}>
 <BarChart
 data={[
 { name: "Testimonials", Active: stats.testimonials.filter(t => t.isActive).length, Inactive: stats.testimonials.filter(t => !t.isActive).length },
 { name: "Logos", Active: stats.trustedByLogos.filter(l => l.isActive).length, Inactive: stats.trustedByLogos.filter(l => !l.isActive).length },
 ]}
 >
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis dataKey="name" stroke="#64748b" />
 <YAxis stroke="#64748b" />
 <Tooltip contentStyle={chartTooltipStyle} />
 <Legend />
 <Bar dataKey="Active" fill={COLORS[1]} radius={[8, 8, 0, 0]} />
 <Bar dataKey="Inactive" fill={COLORS[3]} radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </Card>
 </div>
 </div>
 )}

 {/* Testimonials Tab */}
 {activeTab === "testimonials" && (
 <div className="space-y-6">
 {/* Add New Testimonial */}
 <Card className="p-6">
 <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4">
 Add New Testimonial
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <Input
 label="Name *"
 value={newTestimonial.name}
 onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
 placeholder="John Doe"
 />
 <Input
 label="Company *"
 value={newTestimonial.company}
 onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
 placeholder="Acme Corp"
 />
 <Input
 label="Role"
 value={newTestimonial.role}
 onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
 placeholder="CEO"
 />
 <Select
 label="Rating"
 value={newTestimonial.rating}
 onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
 >
 {[5, 4, 3, 2, 1].map((rating) => (
 <option key={rating} value={rating}>
 {"⭐".repeat(rating)} ({rating} stars)
 </option>
 ))}
 </Select>
 <div className="md:col-span-2">
 <FirebaseImageUpload
 label="Avatar (optional)"
 currentImage={newTestimonial.avatar}
 onUpload={(url) => setNewTestimonial({ ...newTestimonial, avatar: url })}
 folder="testimonials/avatars"
 maxSize={2}
 />
 </div>
 <div className="md:col-span-2">
 <Textarea
 label="Testimonial Content *"
 value={newTestimonial.content}
 onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
 rows={3}
 placeholder="Share your experience with OfficePro360..."
 />
 </div>
 </div>
 <Button onClick={addTestimonial}>Add Testimonial</Button>
 </Card>

 {/* Testimonials List */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {stats.testimonials.map((testimonial, index) => (
 <div
 key={index}
 className={`bg-white dark:bg-slate-900 rounded-xl p-6 border ${
 testimonial.isActive
 ? "border-slate-200 dark:border-slate-800"
 : "border-slate-300 dark:border-slate-700 opacity-60"
 }`}
 >
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center gap-3">
 {testimonial.avatar && (
 <img
 src={testimonial.avatar}
 alt={testimonial.name}
 className="w-12 h-12 rounded-full object-cover"
 />
 )}
 <div>
 <h4 className="font-semibold text-slate-900 dark:text-slate-100">{testimonial.name}</h4>
 <p className="text-sm text-slate-600 dark:text-slate-400">
 {testimonial.role} at {testimonial.company}
 </p>
 </div>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => toggleTestimonialStatus(index)}
 className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
 title={testimonial.isActive ? "Hide" : "Show"}
 >
 {testimonial.isActive ? (
 <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
 </svg>
 ) : (
 <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
 </svg>
 )}
 </button>
 <button
 onClick={() => removeTestimonial(index)}
 className="p-2 hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-600 rounded-lg transition-colors"
 >
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
 </svg>
 </button>
 </div>
 </div>
 <div className="flex gap-1 mb-3">
 {Array.from({ length: testimonial.rating }).map((_, i) => (
 <span key={i} className="text-warning-500">⭐</span>
 ))}
 </div>
 <p className="text-slate-700 dark:text-slate-300 text-sm">
 {testimonial.content}
 </p>
 </div>
 ))}
 </div>

 {stats.testimonials.length === 0 && (
 <EmptyState
 title="No testimonials yet"
 description="Add your first testimonial above!"
 />
 )}
 </div>
 )}

 {/* Logos Tab */}
 {activeTab === "logos" && (
 <div className="space-y-6">
 {/* Add New Logo */}
 <Card className="p-6">
 <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4">
 Add New Trusted Company
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <Input
 label="Company Name *"
 value={newLogo.name}
 onChange={(e) => setNewLogo({ ...newLogo, name: e.target.value })}
 placeholder="Acme Corporation"
 />
 <div>
 <FirebaseImageUpload
 label="Company Logo *"
 currentImage={newLogo.logoUrl}
 onUpload={(url) => setNewLogo({ ...newLogo, logoUrl: url })}
 folder="marketing/logos"
 maxSize={2}
 />
 </div>
 </div>
 <Button onClick={addLogo}>Add Company Logo</Button>
 </Card>

 {/* Logos Grid */}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {stats.trustedByLogos.map((logo, index) => (
 <div
 key={index}
 className={`bg-white dark:bg-slate-900 rounded-xl p-6 border ${
 logo.isActive
 ? "border-slate-200 dark:border-slate-800"
 : "border-slate-300 dark:border-slate-700 opacity-60"
 } text-center`}
 >
 <div className="aspect-square mb-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
 <img
 src={logo.logoUrl}
 alt={logo.name}
 className="max-w-full max-h-full object-contain p-4"
 onError={(e) => {
 (e.target as HTMLImageElement).style.display = "none";
 (
 e.target as HTMLImageElement
 ).parentElement!.innerHTML =
 '<div class="text-slate-400 text-sm">Image Error</div>';
 }}
 />
 </div>
 <p className="font-medium text-sm mb-3 truncate text-slate-900 dark:text-slate-100">
 {logo.name}
 </p>
 <div className="flex gap-2 justify-center">
 <button
 onClick={() => toggleLogoStatus(index)}
 className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
 title={logo.isActive ? "Hide" : "Show"}
 >
 {logo.isActive ? (
 <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
 </svg>
 ) : (
 <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
 </svg>
 )}
 </button>
 <button
 onClick={() => removeLogo(index)}
 className="p-2 hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-600 rounded-lg transition-colors"
 >
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
 </svg>
 </button>
 </div>
 </div>
 ))}
 </div>

 {stats.trustedByLogos.length === 0 && (
 <EmptyState
 title="No company logos yet"
 description="Add your first trusted company above!"
 />
 )}
 </div>
 )}
 </div>
 </Layout>
 );
}
