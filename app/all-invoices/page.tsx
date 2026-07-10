"use client";
import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import {
  PageHeader,
  StatCard,
  Button,
  Badge,
  DataTable,
  Input,
  Select,
} from "@/components/ui";
import type { BadgeProps } from "@/components/ui";
import api from "../../lib/api";

const STATUS_LIST = [
  "draft",
  "sent",
  "viewed",
  "approved",
  "rejected",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
  "disputed",
];

function statusVariant(status: string): BadgeProps["variant"] {
  const map: Record<string, BadgeProps["variant"]> = {
    draft: "neutral",
    sent: "info",
    viewed: "info",
    approved: "success",
    rejected: "danger",
    partially_paid: "warning",
    paid: "success",
    overdue: "danger",
    cancelled: "neutral",
    disputed: "warning",
  };
  return map[status] || "neutral";
}

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
      <div className="space-y-6">
        <PageHeader
          title="All Invoices (Platform-wide)"
          description="Every invoice created by every company on the platform."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Invoices" value={stats?.totalInvoices ?? "—"} accent="primary" />
          <StatCard label="Total Revenue" value={stats ? fmt(stats.totalRevenue) : "—"} accent="primary" />
          <StatCard label="Collected" value={stats ? fmt(stats.totalCollected) : "—"} accent="success" />
          <StatCard label="Outstanding" value={stats ? fmt(stats.totalOutstanding) : "—"} accent="warning" />
        </div>

        <div className="flex items-center gap-3">
          <Input
            wrapperClassName="flex-1 max-w-sm"
            placeholder="Search invoice # or client…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All statuses</option>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>

        <div className="space-y-3">
          <DataTable<any>
            data={invoices}
            loading={loading}
            rowKey={(inv) => inv._id}
            emptyTitle="No invoices found"
            columns={[
              {
                key: "invoiceNumber",
                header: "Invoice #",
                render: (inv) => (
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</span>
                ),
              },
              { key: "company", header: "Company", render: (inv) => inv.companyId?.name || "—" },
              { key: "client", header: "Client", render: (inv) => inv.buyer?.name || inv.clientId?.name || "—" },
              {
                key: "date",
                header: "Date",
                render: (inv) => new Date(inv.issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
              },
              {
                key: "amount",
                header: "Amount",
                className: "text-right",
                render: (inv) => <span className="font-semibold tabular-nums">{fmt(inv.grandTotal)}</span>,
              },
              {
                key: "status",
                header: "Status",
                render: (inv) => <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>,
              },
            ]}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Page {page} / {totalPages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
                <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
