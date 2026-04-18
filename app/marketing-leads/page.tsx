"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/ui/PageHeader";
import { useToast } from "../../components/ui/Toast";
import api from "../../lib/api";

const STATUS_COLORS: Record<string, string> = {
 new: "bg-blue-100 text-blue-700", contacted: "bg-cyan-100 text-cyan-700",
 interested: "bg-emerald-100 text-emerald-700", trial_started: "bg-purple-100 text-purple-700",
 converted: "bg-emerald-200 text-emerald-800", not_interested: "bg-slate-200 text-slate-600",
 unsubscribed: "bg-red-100 text-red-700",
};

export default function MarketingLeadsPage() {
 const toast = useToast();
 const [leads, setLeads] = useState<any[]>([]);
 const [stats, setStats] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [statusFilter, setStatusFilter] = useState("");
 const [page, setPage] = useState(1);
 const [total, setTotal] = useState(0);
 const [showAdd, setShowAdd] = useState(false);
 const [showImport, setShowImport] = useState(false);
 const [form, setForm] = useState({ companyName: "", contactName: "", email: "", phone: "", industry: "", city: "" });
 const [saving, setSaving] = useState(false);
 const [importData, setImportData] = useState("");
 const [importResult, setImportResult] = useState<any>(null);
 const fileRef = useRef<HTMLInputElement>(null);

 const load = useCallback(async () => {
 setLoading(true);
 try {
 const params: any = { page, limit: 30 };
 if (search) params.search = search;
 if (statusFilter) params.status = statusFilter;
 const [listRes, statsRes] = await Promise.all([
 api.get("/admin/leads", { params }),
 api.get("/admin/leads/stats"),
 ]);
 setLeads(listRes.data.leads || []);
 setTotal(listRes.data.total || 0);
 setStats(statsRes.data);
 } catch (e) { console.error(e); } finally { setLoading(false); }
 }, [page, search, statusFilter]);

 useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

 const addLead = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);
 try {
 await api.post("/admin/leads", form);
 toast.success("Lead added");
 setShowAdd(false);
 setForm({ companyName: "", contactName: "", email: "", phone: "", industry: "", city: "" });
 await load();
 } catch (err: any) {
 toast.error("Failed to add lead", err?.response?.data?.message);
 } finally { setSaving(false); }
 };

 const handleCSV = async () => {
 setSaving(true);
 setImportResult(null);
 try {
 // Parse CSV text → array of objects
 const lines = importData.trim().split("\n");
 if (lines.length < 2) { toast.warning("Need header row + at least one data row"); setSaving(false); return; }
 const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
 const rows = lines.slice(1).map((line) => {
 const vals = line.split(",").map((v) => v.trim());
 const obj: any = {};
 headers.forEach((h, i) => {
 if (h.includes("company")) obj.companyName = vals[i];
 else if (h.includes("contact") || h.includes("name")) obj.contactName = vals[i];
 else if (h.includes("email")) obj.email = vals[i];
 else if (h.includes("phone")) obj.phone = vals[i];
 else if (h.includes("industry")) obj.industry = vals[i];
 else if (h.includes("city")) obj.city = vals[i];
 });
 return obj;
 }).filter((r) => r.email && r.companyName);

 const res = await api.post("/admin/leads/import", { leads: rows });
 setImportResult(res.data);
 toast.success(`Imported ${res.data?.imported ?? 0} leads`);
 await load();
 } catch (err: any) {
 toast.error("Import failed", err?.response?.data?.message);
 } finally { setSaving(false); }
 };

 const updateStatus = async (id: string, status: string) => {
 try {
 await api.patch(`/admin/leads/${id}`, { status });
 toast.success("Status updated");
 await load();
 } catch {
 toast.error("Failed to update status");
 }
 };

 const deleteLead = async (id: string) => {
 if (!confirm("Delete this lead?")) return;
 try {
 await api.delete(`/admin/leads/${id}`);
 toast.success("Lead deleted");
 await load();
 } catch {
 toast.error("Failed to delete lead");
 }
 };

 const totalPages = Math.max(1, Math.ceil(total / 30));

 return (
 <Layout>
 <PageHeader
 title="Marketing Leads"
 description="Import companies, manage leads, and send promotional campaigns."
 actions={
 <div className="flex gap-2">
 <button onClick={() => setShowImport(true)} className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Import CSV</button>
 <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">+ Add Lead</button>
 </div>
 }
 />

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
 <Card label="Total Leads" value={stats?.total ?? "—"} />
 <Card label="New" value={stats?.byStatus?.new ?? 0} />
 <Card label="Contacted" value={stats?.byStatus?.contacted ?? 0} />
 <Card label="Converted" value={stats?.byStatus?.converted ?? 0} />
 </div>

 {/* Filters */}
 <div className="flex gap-3 mb-4">
 <input placeholder="Search company, name, email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
 className="flex-1 max-w-sm px-3 py-2 rounded-md border border-slate-300 text-sm" />
 <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
 className="px-3 py-2 rounded-md border border-slate-300 text-sm">
 <option value="">All</option>
 {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
 </select>
 </div>

 {/* Table */}
 <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
 <table className="w-full">
 <thead className="bg-slate-50 border-b border-slate-200">
 <tr>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Company</th>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Contact</th>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Email</th>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Industry</th>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Status</th>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Last Contacted</th>
 <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {loading ? (
 <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">Loading…</td></tr>
 ) : leads.length === 0 ? (
 <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No leads yet. Add manually or import CSV.</td></tr>
 ) : leads.map((l: any) => (
 <tr key={l._id} className="hover:bg-slate-50">
 <td className="px-4 py-3 text-sm font-medium text-slate-900">{l.companyName}</td>
 <td className="px-4 py-3 text-sm text-slate-700">{l.contactName || "—"}</td>
 <td className="px-4 py-3 text-sm text-slate-600">{l.email}</td>
 <td className="px-4 py-3 text-sm text-slate-600">{l.industry || "—"}</td>
 <td className="px-4 py-3">
 <select value={l.status} onChange={(e) => updateStatus(l._id, e.target.value)}
 className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[l.status] || ""}`}>
 {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
 </select>
 </td>
 <td className="px-4 py-3 text-xs text-slate-500">{l.lastContactedAt ? new Date(l.lastContactedAt).toLocaleDateString("en-IN") : "Never"}</td>
 <td className="px-4 py-3 text-right">
 <button onClick={() => deleteLead(l._id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {totalPages > 1 && (
 <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-sm">
 <span className="text-slate-600">Page {page} / {totalPages} · {total} leads</span>
 <div className="flex gap-2">
 <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40">Prev</button>
 <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40">Next</button>
 </div>
 </div>
 )}
 </div>

 {/* Add Lead Modal */}
 {showAdd && (
 <Modal title="Add Lead" onClose={() => setShowAdd(false)}>
 <form onSubmit={addLead} className="space-y-3">
 <Input label="Company Name *" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} required />
 <Input label="Contact Name" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
 <Input label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
 <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
 <Input label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
 <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
 <div className="flex justify-end gap-3 pt-3">
 <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border border-slate-300 rounded-md">Cancel</button>
 <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md disabled:opacity-50">{saving ? "Saving…" : "Add Lead"}</button>
 </div>
 </form>
 </Modal>
 )}

 {/* Import CSV Modal */}
 {showImport && (
 <Modal title="Import Leads from CSV" onClose={() => { setShowImport(false); setImportResult(null); }}>
 <p className="text-xs text-slate-500 mb-3">
 Upload a .csv file or paste CSV with headers: <code className="bg-slate-100 px-1 rounded">companyName,contactName,email,phone,industry,city</code>
 </p>
 <div className="mb-3">
 <input
 type="file"
 accept=".csv,text/csv"
 onChange={(e) => {
 const file = e.target.files?.[0];
 if (!file) return;
 const reader = new FileReader();
 reader.onload = (evt) => {
 setImportData(String(evt.target?.result || ""));
 };
 reader.readAsText(file);
 }}
 className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
 />
 </div>
 <textarea rows={8} value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="companyName,contactName,email,phone,industry,city&#10;Acme Corp,John Doe,john@acme.com,9876543210,Technology,Mumbai"
 className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono" />
 {importResult && (
 <div className="mt-3 p-3 bg-slate-50 rounded-md text-sm">
 Imported: <b>{importResult.imported}</b> · Skipped (duplicates): <b>{importResult.skipped}</b> · Errors: <b>{importResult.errors}</b>
 </div>
 )}
 <div className="flex justify-end gap-3 pt-3">
 <button onClick={() => { setShowImport(false); setImportResult(null); }} className="px-4 py-2 text-sm border border-slate-300 rounded-md">Close</button>
 <button onClick={handleCSV} disabled={saving || !importData.trim()} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md disabled:opacity-50">{saving ? "Importing…" : "Import"}</button>
 </div>
 </Modal>
 )}
 </Layout>
 );
}

function Card({ label, value }: { label: string; value: string | number }) {
 return (
 <div className="bg-white rounded-lg border border-slate-200 p-5">
 <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
 <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
 </div>
 );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
 return (
 <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
 <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
 <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
 <h2 className="text-lg font-bold text-slate-900">{title}</h2>
 <button onClick={onClose} className="text-slate-400 hover:text-slate-600"></button>
 </div>
 <div className="p-6">{children}</div>
 </div>
 </div>
 );
}

function Input({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
 return (
 <label className="block">
 <div className="text-xs font-medium text-slate-700 mb-1">{label}</div>
 <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
 className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20" />
 </label>
 );
}
