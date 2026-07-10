"use client";
import { useEffect, useState, useMemo } from "react";
import Layout from "../../components/Layout";
import {
 PageHeader,
 StatCard,
 EmptyState,
 DataTable,
 Column,
 Badge,
 Button,
 Select,
} from "@/components/ui";
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
        inq.planCode ? <Badge variant="info">{inq.planCode}</Badge> : "—",
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
        <Select
          defaultValue={inq.status}
          onChange={(e) => changeStatus(inq._id, e.target.value)}
        >
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </Select>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader title="Inquiries" description="Leads and contact submissions from the marketing site" />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={inquiries.length} accent="neutral" />
          <StatCard label="New" value={newCount} accent="primary" />
          <StatCard label="In Progress" value={inProgressCount} accent="warning" />
          <StatCard label="Closed" value={closedCount} accent="success" />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? "primary" : "outline"}
              className="rounded-full"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
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
      </div>
    </Layout>
  );
}
