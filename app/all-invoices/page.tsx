"use client";
import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700", sent: "bg-blue-100 text-blue-700",
  viewed: "bg-cyan-100 text-cyan-700", approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700", partially_paid: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700", overdue: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-slate-500", disputed: "bg-orange-100 text-orange-700",
};

export default function AllInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const [listRes, statsRes] = await Promise.all([
        api.get("/admin/invoices", { params }),
        api.get("/admin/invoices/stats"),
      ]);
      setInvoices(listRes.data.invoices || []);
      setTotal(listRes.data.total || 0);
      setStats(statsRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Invoices (Platform-wide)</h1>
        <p className="text-sm text-slate-600 mt-1">Every invoice created by every company on the platform.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card label="Total Invoices" value={stats?.totalInvoices ?? "—"} />
        <Card label="Total Revenue" value={stats ? fmt(stats.totalRevenue) : "—"} />
        <Card label="Collected" value={stats ? fmt(stats.totalCollected) : "—"} />
        <Card label="Outstanding" value={stats ? fmt(stats.totalOutstanding) : "—"} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input placeholder="Search invoice # or client…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 max-w-sm px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-md border border-slate-300 text-sm">
          <option value="">All statuses</option>
          {Object.keys(STATUS_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th>Invoice #</Th><Th>Company</Th><Th>Client</Th><Th>Date</Th>
              <Th align="right">Amount</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">Loading…</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No invoices found.</td></tr>
            ) : invoices.map((inv: any) => (
              <tr key={inv._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{inv.companyId?.name || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{inv.buyer?.name || inv.clientId?.name || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{new Date(inv.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3 text-sm text-right font-semibold tabular-nums">{fmt(inv.grandTotal)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] || ""}`}>{inv.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-sm">
            <span className="text-slate-600">Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
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
function Th({ children, align }: { children: React.ReactNode; align?: string }) {
  return <th className={`px-4 py-2 text-xs font-semibold text-slate-600 uppercase ${align === "right" ? "text-right" : "text-left"}`}>{children}</th>;
}
