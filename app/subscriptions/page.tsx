"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import {
  PageHeader,
  StatCard,
  Button,
  Badge,
  DataTable,
  Card,
  CardTitle,
  Select,
  Input,
  Textarea,
  Modal,
} from "@/components/ui";
import type { BadgeProps } from "@/components/ui";
import api from "../../lib/api";

type Subscription = {
  _id: string;
  companyId: string;
  companyName?: string;
  plan: string;
  planCode?: string;
  status: string;
  billingCycle?: string;
  amount?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  trialEnd?: string;
  createdAt: string;
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Lifetime grant modal
  const [lifetimeModal, setLifetimeModal] = useState<Subscription | null>(null);
  const [lifetimePlan, setLifetimePlan] = useState("");
  const [lifetimeReason, setLifetimeReason] = useState("");

  // Change plan modal
  const [changePlanModal, setChangePlanModal] = useState<Subscription | null>(null);
  const [newPlanCode, setNewPlanCode] = useState("");

  async function loadSubscriptions() {
    setLoading(true);
    try {
      const res = await api.get("/subscription/all");
      setSubscriptions(res.data.subscriptions || res.data || []);
    } catch (err) {
      console.error("Failed to load subscriptions", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const filtered = useMemo(() => {
    if (!filterStatus) return subscriptions;
    return subscriptions.filter((s) => s.status === filterStatus);
  }, [subscriptions, filterStatus]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active").length;
    const trials = subscriptions.filter((s) => s.status === "trial").length;
    const lifetime = subscriptions.filter((s) => s.status === "lifetime").length;
    const monthlyRevenue = subscriptions
      .filter((s) => s.status === "active" && s.billingCycle === "monthly")
      .reduce((sum, s) => sum + (s.amount || 0), 0);
    return { active, trials, lifetime, monthlyRevenue };
  }, [subscriptions]);

  const statusVariant = (status: string): BadgeProps["variant"] => {
    const map: Record<string, BadgeProps["variant"]> = {
      trial: "info",
      active: "success",
      lifetime: "default",
      expired: "danger",
      cancelled: "neutral",
    };
    return map[status] || "neutral";
  };

  async function grantLifetime() {
    if (!lifetimeModal) return;
    try {
      await api.post("/subscription/lifetime", {
        companyId: lifetimeModal.companyId,
        plan: lifetimePlan,
        reason: lifetimeReason,
      });
      alert("Lifetime subscription granted.");
      setLifetimeModal(null);
      setLifetimePlan("");
      setLifetimeReason("");
      await loadSubscriptions();
    } catch (err: any) {
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    }
  }

  async function changePlan() {
    if (!changePlanModal || !newPlanCode) return;
    try {
      await api.post("/subscription/change-plan", {
        companyId: changePlanModal.companyId,
        planCode: newPlanCode,
      });
      alert("Plan changed successfully.");
      setChangePlanModal(null);
      setNewPlanCode("");
      await loadSubscriptions();
    } catch (err: any) {
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    }
  }

  async function downloadInvoice(subId: string) {
    try {
      const res = await api.get(`/subscription/invoice/${subId}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${subId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Failed to download invoice: ${err.response?.data?.message || err.message}`);
    }
  }

  const mrr = subscriptions
    .filter((s) => s.status === "active" && s.billingCycle === "monthly")
    .reduce((sum, s) => sum + (s.amount || 0), 0);
  const arr = mrr * 12;
  const lifetimeGrants = subscriptions.filter((s) => s.status === "lifetime").length;

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Subscriptions"
          description="Manage billing, plans, and revenue"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Active" value={stats.active} accent="success" />
          <StatCard label="Trials" value={stats.trials} accent="primary" />
          <StatCard label="Lifetime" value={stats.lifetime} accent="neutral" />
          <StatCard
            label="Est. Monthly Revenue"
            value={`₹${stats.monthlyRevenue.toLocaleString()}`}
            accent="primary"
          />
        </div>

        {/* Filter */}
        <Card padding="sm">
          <Select
            wrapperClassName="max-w-xs"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="trial">Trial</option>
            <option value="active">Active</option>
            <option value="lifetime">Lifetime</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Card>

        {/* Table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              All Subscriptions
            </h3>
            <Badge variant="neutral">{filtered.length} total</Badge>
          </div>

          <DataTable<Subscription>
            data={paged}
            loading={loading}
            rowKey={(s) => s._id}
            emptyTitle="No subscriptions found"
            columns={[
              {
                key: "company",
                header: "Company",
                render: (s) => (
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {s.companyName || s.companyId}
                  </span>
                ),
              },
              {
                key: "plan",
                header: "Plan",
                render: (s) => s.plan || s.planCode || "N/A",
              },
              {
                key: "status",
                header: "Status",
                render: (s) => (
                  <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                ),
              },
              {
                key: "cycle",
                header: "Cycle",
                render: (s) => s.billingCycle || "N/A",
              },
              {
                key: "amount",
                header: "Amount",
                render: (s) =>
                  s.amount != null ? `${s.currency || "₹"}${s.amount}` : "N/A",
              },
              {
                key: "start",
                header: "Start",
                render: (s) =>
                  s.startDate ? new Date(s.startDate).toLocaleDateString() : "N/A",
              },
              {
                key: "end",
                header: "End",
                render: (s) =>
                  s.endDate ? new Date(s.endDate).toLocaleDateString() : "N/A",
              },
              {
                key: "actions",
                header: "Actions",
                render: (s) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setLifetimeModal(s)}>
                      Grant Lifetime
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setChangePlanModal(s)}>
                      Change Plan
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => downloadInvoice(s._id)}>
                      Invoice
                    </Button>
                  </div>
                ),
              },
            ]}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="px-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {page} / {totalPages}
                </span>
                <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Summary */}
        <Card>
          <CardTitle className="mb-4">Revenue Summary</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">MRR (Monthly Recurring Revenue)</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">&#8377;{mrr.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">ARR (Annual Recurring Revenue)</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">&#8377;{arr.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Total Lifetime Grants</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{lifetimeGrants}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Grant Lifetime Modal */}
      <Modal
        open={!!lifetimeModal}
        onClose={() => {
          setLifetimeModal(null);
          setLifetimePlan("");
          setLifetimeReason("");
        }}
        title="Grant Lifetime Subscription"
        footer={
          <>
            <Button onClick={grantLifetime}>Grant Lifetime</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setLifetimeModal(null);
                setLifetimePlan("");
                setLifetimeReason("");
              }}
            >
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {lifetimeModal?.companyName || lifetimeModal?.companyId}
          </p>
          <Input
            label="Plan"
            value={lifetimePlan}
            onChange={(e) => setLifetimePlan(e.target.value)}
            placeholder="e.g. enterprise"
          />
          <Textarea
            label="Reason"
            value={lifetimeReason}
            onChange={(e) => setLifetimeReason(e.target.value)}
            placeholder="Reason for granting lifetime access..."
          />
        </div>
      </Modal>

      {/* Change Plan Modal */}
      <Modal
        open={!!changePlanModal}
        onClose={() => {
          setChangePlanModal(null);
          setNewPlanCode("");
        }}
        title="Change Plan"
        footer={
          <>
            <Button onClick={changePlan}>Change Plan</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setChangePlanModal(null);
                setNewPlanCode("");
              }}
            >
              Cancel
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {changePlanModal?.companyName || changePlanModal?.companyId}
          </p>
          <Input
            label="New Plan Code"
            value={newPlanCode}
            onChange={(e) => setNewPlanCode(e.target.value)}
            placeholder="e.g. professional"
          />
        </div>
      </Modal>
    </Layout>
  );
}
