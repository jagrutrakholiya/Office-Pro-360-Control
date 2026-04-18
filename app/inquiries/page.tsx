"use client";
import { useEffect, useState, useMemo } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import DataTable, { Column } from "../../components/ui/DataTable";
import { useToast } from "../../components/ui/Toast";
import api from "../../lib/api";
import { FaInbox, FaEnvelope } from "react-icons/fa";

type Inquiry = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  topic?: string;
  message: string;
  planCode?: string;
  status: string;
  createdAt: string;
};

type FilterValue = "all" | "new" | "in_progress" | "closed";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
];

export default function InquiriesPage() {
  const toast = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>("all");

  const load = async () => {
    try {
      const res = await api.get("/marketing/admin/inquiries");
      setInquiries(res.data.inquiries || []);
    } catch {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/marketing/admin/inquiries/${id}`, { status });
      toast.success("Status updated");
      await load();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const filtered = useMemo(
    () => (filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter)),
    [inquiries, filter]
  );

  const newCount = inquiries.filter((i) => i.status === "new").length;
  const inProgressCount = inquiries.filter((i) => i.status === "in_progress").length;
  const closedCount = inquiries.filter((i) => i.status === "closed").length;

  const columns: Column<Inquiry>[] = [
    {
      key: "name",
      header: "Name",
      render: (inq) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{inq.name}</div>
          {inq.phone && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{inq.phone}</div>}
        </div>
      ),
    },
    { key: "email", header: "Email", render: (inq) => inq.email },
    { key: "company", header: "Company", render: (inq) => inq.company || "—" },
    {
      key: "plan",
      header: "Plan",
      render: (inq) =>
        inq.planCode ? (
          <span className="inline-flex px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md text-xs font-medium">
            {inq.planCode}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "message",
      header: "Message",
      render: (inq) => (
        <p className="max-w-xs truncate text-slate-600 dark:text-slate-400" title={inq.message}>
          {inq.message}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "160px",
      render: (inq) => (
        <select
          defaultValue={inq.status}
          onChange={(e) => changeStatus(inq._id, e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
      ),
    },
  ];

  return (
    <Layout>
      <PageHeader title="Inquiries" description="Leads and contact submissions from the marketing site" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={inquiries.length} color="slate" />
        <StatCard label="New" value={newCount} color="blue" />
        <StatCard label="In Progress" value={inProgressCount} color="amber" />
        <StatCard label="Closed" value={closedCount} color="green" />
      </div>

      {/* Filter pills */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white border border-blue-600"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={filter === "all" ? <FaInbox className="w-6 h-6" /> : <FaEnvelope className="w-6 h-6" />}
          title={filter === "all" ? "No inquiries yet" : `No ${filter.replace("_", " ")} inquiries`}
          description={
            filter === "all"
              ? "Demo requests and contact form submissions from the marketing site will appear here."
              : "Try a different filter to see more inquiries."
          }
        />
      ) : (
        <DataTable<Inquiry>
          columns={columns}
          data={filtered}
          loading={loading}
          rowKey={(i) => i._id}
        />
      )}
    </Layout>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: "slate" | "blue" | "amber" | "green" }) {
  const valueColor = {
    slate: "text-slate-900 dark:text-white",
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    green: "text-green-600 dark:text-green-400",
  }[color];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</div>
      <div className={`text-3xl font-bold mt-1 tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
}
