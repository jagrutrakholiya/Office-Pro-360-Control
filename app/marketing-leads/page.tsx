"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Layout from "../../components/Layout";
import {
  PageHeader,
  StatCard,
  Button,
  DataTable,
  Input,
  Textarea,
  Select,
  Modal,
} from "@/components/ui";
import { useToast } from "../../components/ui/Toast";
import api from "../../lib/api";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  contacted: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  interested: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  trial_started: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  converted: "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
  not_interested: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  unsubscribed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
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
      <div className="space-y-6">
        <PageHeader
          title="Marketing Leads"
          description="Import companies, manage leads, and send promotional campaigns."
          actions={
            <>
              <Button variant="outline" onClick={() => setShowImport(true)}>Import CSV</Button>
              <Button onClick={() => setShowAdd(true)}>+ Add Lead</Button>
            </>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Leads" value={stats?.total ?? "—"} accent="primary" />
          <StatCard label="New" value={stats?.byStatus?.new ?? 0} accent="primary" />
          <StatCard label="Contacted" value={stats?.byStatus?.contacted ?? 0} accent="warning" />
          <StatCard label="Converted" value={stats?.byStatus?.converted ?? 0} accent="success" />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Input
            wrapperClassName="flex-1 max-w-sm"
            placeholder="Search company, name, email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All</option>
            {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </Select>
        </div>

        {/* Table */}
        <div className="space-y-3">
          <DataTable<any>
            data={leads}
            loading={loading}
            rowKey={(l) => l._id}
            emptyTitle="No leads yet"
            emptyDescription="Add manually or import a CSV to get started."
            columns={[
              {
                key: "companyName",
                header: "Company",
                render: (l) => <span className="font-medium text-slate-900 dark:text-slate-100">{l.companyName}</span>,
              },
              { key: "contactName", header: "Contact", render: (l) => l.contactName || "—" },
              { key: "email", header: "Email", render: (l) => l.email },
              { key: "industry", header: "Industry", render: (l) => l.industry || "—" },
              {
                key: "status",
                header: "Status",
                render: (l) => (
                  <select
                    value={l.status}
                    onChange={(e) => updateStatus(l._id, e.target.value)}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[l.status] || ""}`}
                  >
                    {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                ),
              },
              {
                key: "lastContactedAt",
                header: "Last Contacted",
                render: (l) => (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {l.lastContactedAt ? new Date(l.lastContactedAt).toLocaleDateString("en-IN") : "Never"}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (l) => (
                  <Button size="sm" variant="ghost" onClick={() => deleteLead(l._id)}>Delete</Button>
                ),
              },
            ]}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Page {page} / {totalPages} · {total} leads</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
                <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Lead">
        <form onSubmit={addLead} className="space-y-3">
          <Input label="Company Name *" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          <Input label="Contact Name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" loading={saving} disabled={saving}>{saving ? "Saving…" : "Add Lead"}</Button>
          </div>
        </form>
      </Modal>

      {/* Import CSV Modal */}
      <Modal open={showImport} onClose={() => { setShowImport(false); setImportResult(null); }} title="Import Leads from CSV">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Upload a .csv file or paste CSV with headers: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">companyName,contactName,email,phone,industry,city</code>
        </p>
        <div className="mb-3">
          <input
            ref={fileRef}
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
            className="block w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white dark:file:bg-white dark:file:text-slate-900 hover:file:bg-slate-800 cursor-pointer"
          />
        </div>
        <Textarea
          rows={8}
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="companyName,contactName,email,phone,industry,city&#10;Acme Corp,John Doe,john@acme.com,9876543210,Technology,Mumbai"
          className="font-mono"
        />
        {importResult && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300">
            Imported: <b>{importResult.imported}</b> · Skipped (duplicates): <b>{importResult.skipped}</b> · Errors: <b>{importResult.errors}</b>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-3">
          <Button variant="secondary" onClick={() => { setShowImport(false); setImportResult(null); }}>Close</Button>
          <Button onClick={handleCSV} loading={saving} disabled={saving || !importData.trim()}>{saving ? "Importing…" : "Import"}</Button>
        </div>
      </Modal>
    </Layout>
  );
}
