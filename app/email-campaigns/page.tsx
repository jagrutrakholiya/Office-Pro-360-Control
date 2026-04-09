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
 // The promotional template is generated in the emailLayout format
 // For now, use a simple HTML template with merge tags
 setForm({
 ...form,
 subject: "{{contactName}}, streamline {{companyName}} with OfficePro360",
 htmlBody: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
 <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:16px">Hi {{contactName}},</h1>

 <p style="color:#475569;line-height:1.7;margin-bottom:20px">
 We noticed <b>{{companyName}}</b> might benefit from a modern workforce management platform.
 OfficePro360 replaces 5+ tools with one integrated solution.
 </p>

 <h2 style="font-size:18px;font-weight:600;color:#0f172a;margin-bottom:12px">What you get — FREE trial, full access:</h2>

 <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
 <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155"><b>HR & Employees</b></td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b">Directory, org chart, onboarding, offboarding</td></tr>
 <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155"><b>Attendance</b></td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b">GPS clock-in/out, live tracking, shifts</td></tr>
 <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155"><b>Payroll</b></td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b">Auto-generate, salary slips, tax</td></tr>
 <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155"><b>Tasks & Projects</b></td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b">Kanban, sprints, timesheet</td></tr>
 <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155"><b>GST Invoicing</b></td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b">CGST/SGST auto-split, HSN, PDF</td></tr>
 <tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155"><b>AI Assistant</b></td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b">Ask questions in plain English</td></tr>
 <tr><td style="padding:8px 12px;font-size:14px;color:#334155"><b>+ More</b></td><td style="padding:8px 12px;font-size:14px;color:#64748b">Expenses, docs, messaging, analytics</td></tr>
 </table>

 <h2 style="font-size:18px;font-weight:600;color:#0f172a;margin-bottom:12px">Pricing that scales:</h2>
 <p style="color:#475569;line-height:1.7;margin-bottom:4px">• <b>Free</b> — ₹0, 3 users, ALL features</p>
 <p style="color:#475569;line-height:1.7;margin-bottom:4px">• <b>Starter</b> — ₹199/mo, 10 users</p>
 <p style="color:#475569;line-height:1.7;margin-bottom:4px">• <b>Professional</b> — ₹499/mo, 25 users</p>
 <p style="color:#475569;line-height:1.7;margin-bottom:20px">• <b>Enterprise</b> — ₹999/mo, 50 users</p>

 <div style="text-align:center;margin:32px 0">
 <a href="https://officepro360.in/signup" style="background:#0f172a;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block">Start Free Trial →</a>
 </div>

 <p style="color:#475569;line-height:1.7">Questions? Reply to this email — a real human responds.</p>
 <p style="color:#475569;line-height:1.7">Best,<br/><b>Team OfficePro360</b></p>

 <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#9ca3af;text-align:center">
 You received this because we think OfficePro360 could help {{companyName}}.<br/>
 <a href="https://officepro360.in/unsubscribe?email={{email}}" style="color:#9ca3af">Unsubscribe</a>
 </div>
</div>`,
 });
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
