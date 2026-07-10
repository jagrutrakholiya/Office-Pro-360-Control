"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
 Button,
 PageHeader,
 Badge,
 DataTable,
 Column,
 Modal,
 Input,
 Textarea,
} from "@/components/ui";
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

 const STATUS_VARIANT: Record<string, "neutral" | "warning" | "success" | "danger"> = {
 draft: "neutral", sending: "warning", sent: "success", failed: "danger",
 };

 const columns: Column<any>[] = [
 {
 key: "name",
 header: "Name",
 render: (c) => <span className="font-medium text-slate-900 dark:text-slate-100">{c.name}</span>,
 },
 {
 key: "subject",
 header: "Subject",
 render: (c) => (
 <span className="block max-w-xs truncate text-slate-600 dark:text-slate-400">{c.subject}</span>
 ),
 },
 {
 key: "status",
 header: "Status",
 render: (c) => <Badge variant={STATUS_VARIANT[c.status] || "neutral"}>{c.status}</Badge>,
 },
 {
 key: "sent",
 header: "Sent",
 className: "text-right",
 render: (c) => (
 <span className="tabular-nums text-success-600 dark:text-success-400">{c.sentCount || 0}</span>
 ),
 },
 {
 key: "failed",
 header: "Failed",
 className: "text-right",
 render: (c) => (
 <span className="tabular-nums text-danger-600 dark:text-danger-400">{c.failedCount || 0}</span>
 ),
 },
 {
 key: "date",
 header: "Date",
 render: (c) => (
 <span className="text-xs text-slate-500 dark:text-slate-400">
 {c.sentAt ? new Date(c.sentAt).toLocaleDateString("en-IN") : "Not sent"}
 </span>
 ),
 },
 {
 key: "actions",
 header: "Actions",
 className: "text-right",
 render: (c) =>
 c.status === "draft" ? (
 <Button
 size="sm"
 onClick={() => sendCampaign(c._id)}
 loading={sending === c._id}
 >
 {sending === c._id ? "Sending…" : "Send Now"}
 </Button>
 ) : null,
 },
 ];

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="Email Campaigns"
 description="Create and send promotional emails to marketing leads."
 actions={<Button onClick={() => setShowCreate(true)}>+ New Campaign</Button>}
 />

 <DataTable<any>
 columns={columns}
 data={campaigns}
 loading={loading}
 rowKey={(c) => c._id}
 emptyTitle="No campaigns yet"
 emptyDescription="Create one to start outreach."
 />

 <Modal
 open={showCreate}
 onClose={() => setShowCreate(false)}
 title="New Email Campaign"
 size="lg"
 >
 <form id="create-campaign-form" onSubmit={createCampaign} className="space-y-4">
 <Input
 label="Campaign Name"
 required
 value={form.name}
 onChange={(e) => setForm({ ...form, name: e.target.value })}
 placeholder="e.g. April 2026 Outreach"
 />

 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Subject</label>
 <button type="button" onClick={loadTemplate} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Load promo template</button>
 </div>
 <Input
 required
 value={form.subject}
 onChange={(e) => setForm({ ...form, subject: e.target.value })}
 placeholder="{{contactName}}, try OfficePro360 for {{companyName}}"
 helperText={`Merge tags: {{companyName}}, {{contactName}}, {{email}}`}
 />
 </div>

 <Textarea
 label="Email Body (HTML)"
 required
 rows={12}
 value={form.htmlBody}
 onChange={(e) => setForm({ ...form, htmlBody: e.target.value })}
 placeholder="<h1>Hi {{contactName}},</h1><p>...</p>"
 className="font-mono"
 />

 <div>
 <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Target lead statuses</label>
 <div className="flex flex-wrap gap-3">
 {["new", "contacted", "interested"].map((s) => (
 <label key={s} className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
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
 </form>
 <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
 <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
 <Button type="submit" form="create-campaign-form" loading={saving}>
 {saving ? "Creating…" : "Create Campaign"}
 </Button>
 </div>
 </Modal>
 </div>
 </Layout>
 );
}
