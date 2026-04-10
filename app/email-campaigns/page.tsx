"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";

export default function EmailCampaignsPage() {
 const [campaigns, setCampaigns] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [showCreate, setShowCreate] = useState(false);
 const [form, setForm] = useState({ name: "", subject: "", htmlBody: "", targetStatus: ["new", "contacted"] });
 const [saving, setSaving] = useState(false);
 const [sending, setSending] = useState("");

 const load = async () => {
 try {
 const res = await api.get("/admin/campaigns");
 setCampaigns(res.data.campaigns || []);
 } catch (e) { console.error(e); }
 finally { setLoading(false); }
 };

 useEffect(() => { load(); }, []);

 const createCampaign = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);
 try {
 await api.post("/admin/campaigns", {
 name: form.name,
 subject: form.subject,
 htmlBody: form.htmlBody,
 targetFilter: { status: form.targetStatus },
 });
 setShowCreate(false);
 setForm({ name: "", subject: "", htmlBody: "", targetStatus: ["new", "contacted"] });
 await load();
 } catch (err: any) {
 alert(err?.response?.data?.message || "Failed");
 } finally { setSaving(false); }
 };

 const sendCampaign = async (id: string) => {
 if (!confirm("Send this campaign to all matching leads? This cannot be undone.")) return;
 setSending(id);
 try {
 const res = await api.post(`/admin/campaigns/${id}/send`);
 alert(`Sent to ${res.data.sentCount} leads (${res.data.failedCount} failed)`);
 await load();
 } catch (err: any) {
 alert(err?.response?.data?.message || "Send failed");
 } finally { setSending(""); }
 };

 const loadTemplate = async () => {
 try {
 const res = await api.get("/admin/campaigns/template");
 setForm({ ...form, subject: res.data.subject, htmlBody: res.data.htmlBody });
 } catch {
 setForm({ ...form, subject: "{{contactName}}, manage {{companyName}} smarter with OfficePro360", htmlBody: "<p>Hi {{contactName}}, try OfficePro360 for {{companyName}}. Visit https://officepro360.in/signup</p>" });
 }
 };

 const STATUS_COLORS: Record<string, string> = {
 draft: "bg-slate-100 text-slate-700", sending: "bg-amber-100 text-amber-700",
 sent: "bg-emerald-100 text-emerald-700", failed: "bg-red-100 text-red-700",
 };

 return (
 <Layout>
 <div className="mb-6 flex items-end justify-between">
 <div>
 <h1 className="text-2xl font-bold text-slate-900">Email Campaigns</h1>
 <p className="text-sm text-slate-600 mt-1">Create and send promotional emails to marketing leads.</p>
 </div>
 <button onClick={() => setShowCreate(true)} className="px-4 py-2 text-sm font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800">+ New Campaign</button>
 </div>

 {/* Campaign list */}
 <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
 <table className="w-full">
 <thead className="bg-slate-50 border-b border-slate-200">
 <tr>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Name</th>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Subject</th>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Status</th>
 <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Sent</th>
 <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Failed</th>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Date</th>
 <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {loading ? (
 <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">Loading…</td></tr>
 ) : campaigns.length === 0 ? (
 <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No campaigns yet. Create one to start outreach.</td></tr>
 ) : campaigns.map((c: any) => (
 <tr key={c._id} className="hover:bg-slate-50">
 <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.name}</td>
 <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{c.subject}</td>
 <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || ""}`}>{c.status}</span></td>
 <td className="px-4 py-3 text-sm text-right tabular-nums text-emerald-700">{c.sentCount || 0}</td>
 <td className="px-4 py-3 text-sm text-right tabular-nums text-red-600">{c.failedCount || 0}</td>
 <td className="px-4 py-3 text-xs text-slate-500">{c.sentAt ? new Date(c.sentAt).toLocaleDateString("en-IN") : "Not sent"}</td>
 <td className="px-4 py-3 text-right">
 {c.status === "draft" && (
 <button onClick={() => sendCampaign(c._id)} disabled={sending === c._id}
 className="text-xs px-3 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50">
 {sending === c._id ? "Sending…" : "Send Now"}
 </button>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Create Campaign Modal */}
 {showCreate && (
 <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
 <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
 <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
 <h2 className="text-lg font-bold text-slate-900">New Email Campaign</h2>
 <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"></button>
 </div>
 <form onSubmit={createCampaign} className="p-6 space-y-4">
 <div>
 <label className="text-xs font-medium text-slate-700 mb-1 block">Campaign Name</label>
 <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. April 2026 Outreach"
 className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
 </div>

 <div>
 <div className="flex items-center justify-between mb-1">
 <label className="text-xs font-medium text-slate-700">Email Subject</label>
 <button type="button" onClick={loadTemplate} className="text-xs text-blue-600 hover:text-blue-800">Load promo template</button>
 </div>
 <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
 placeholder="{{contactName}}, try OfficePro360 for {{companyName}}"
 className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
 <p className="text-[11px] text-slate-400 mt-1">Merge tags: {"{{companyName}}"}, {"{{contactName}}"}, {"{{email}}"}</p>
 </div>

 <div>
 <label className="text-xs font-medium text-slate-700 mb-1 block">Email Body (HTML)</label>
 <textarea required rows={12} value={form.htmlBody} onChange={(e) => setForm({ ...form, htmlBody: e.target.value })}
 placeholder="<h1>Hi {{contactName}},</h1><p>...</p>"
 className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono" />
 </div>

 <div>
 <label className="text-xs font-medium text-slate-700 mb-1 block">Target lead statuses</label>
 <div className="flex flex-wrap gap-2">
 {["new", "contacted", "interested"].map((s) => (
 <label key={s} className="flex items-center gap-1.5 text-sm">
 <input type="checkbox" checked={form.targetStatus.includes(s)}
 onChange={(e) => {
 setForm({
 ...form,
 targetStatus: e.target.checked
 ? [...form.targetStatus, s]
 : form.targetStatus.filter((x) => x !== s),
 });
 }}
 />
 {s.replace("_", " ")}
 </label>
 ))}
 </div>
 </div>

 <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
 <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-md">Cancel</button>
 <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md disabled:opacity-50">
 {saving ? "Creating…" : "Create Campaign"}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </Layout>
 );
}
