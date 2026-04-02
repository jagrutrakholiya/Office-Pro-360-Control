"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
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

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      trial: "bg-blue-100 text-blue-700",
      active: "bg-green-100 text-green-700",
      lifetime: "bg-purple-100 text-purple-700",
      expired: "bg-red-100 text-red-700",
      cancelled: "bg-slate-100 text-slate-600",
    };
    return map[status] || "bg-slate-100 text-slate-600";
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
      <div className="section-header">
        <div className="section-actions">
          <div>
            <h2 className="section-title">Subscriptions</h2>
            <p className="section-subtitle">
              Manage billing, plans, and revenue
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm text-slate-500 font-medium">Total Active</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm text-slate-500 font-medium">Trials</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{stats.trials}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm text-slate-500 font-medium">Lifetime</div>
          <div className="text-3xl font-bold text-purple-600 mt-1">{stats.lifetime}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm text-slate-500 font-medium">Est. Monthly Revenue</div>
          <div className="text-3xl font-bold text-slate-900 mt-1">
            &#8377;{stats.monthlyRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="select-small"
        >
          <option value="">All Statuses</option>
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="lifetime">Lifetime</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <section className="table-wrapper">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-900">All Subscriptions</h3>
            <span className="badge badge-pending">{filtered.length} total</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-slate-600 font-medium">Loading subscriptions...</div>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden lg:block table-responsive">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Plan</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Cycle</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Start</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">End</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((s) => (
                    <tr key={s._id} className="table-row">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {s.companyName || s.companyId}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {s.plan || s.planCode || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {s.billingCycle || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {s.amount != null ? `${s.currency || "\u20B9"}${s.amount}` : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {s.startDate ? new Date(s.startDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {s.endDate ? new Date(s.endDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setLifetimeModal(s)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            Grant Lifetime
                          </button>
                          <button
                            onClick={() => setChangePlanModal(s)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            Change Plan
                          </button>
                          <button
                            onClick={() => downloadInvoice(s._id)}
                            className="bg-slate-500 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {paged.map((s) => (
                <div key={s._id} className="mobile-card">
                  <div className="mobile-card-header">
                    <h4 className="font-semibold text-slate-900">{s.companyName || s.companyId}</h4>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="mobile-card-content">
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Plan</span>
                      <span className="mobile-card-value">{s.plan || s.planCode || "N/A"}</span>
                    </div>
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Amount</span>
                      <span className="mobile-card-value">
                        {s.amount != null ? `${s.currency || "\u20B9"}${s.amount}` : "N/A"}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      <button onClick={() => setLifetimeModal(s)} className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                        Grant Lifetime
                      </button>
                      <button onClick={() => setChangePlanModal(s)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                        Change Plan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary-small disabled:opacity-50">
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm font-medium text-slate-700">{page} / {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary-small disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Revenue Summary */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Revenue Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-slate-500">MRR (Monthly Recurring Revenue)</div>
            <div className="text-2xl font-bold text-slate-900">&#8377;{mrr.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">ARR (Annual Recurring Revenue)</div>
            <div className="text-2xl font-bold text-slate-900">&#8377;{arr.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Total Lifetime Grants</div>
            <div className="text-2xl font-bold text-purple-600">{lifetimeGrants}</div>
          </div>
        </div>
      </div>

      {/* Grant Lifetime Modal */}
      {lifetimeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h3 className="text-xl font-bold text-slate-900">Grant Lifetime Subscription</h3>
              <p className="text-sm text-slate-600 mt-1">{lifetimeModal.companyName || lifetimeModal.companyId}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                <input
                  type="text"
                  value={lifetimePlan}
                  onChange={(e) => setLifetimePlan(e.target.value)}
                  placeholder="e.g. enterprise"
                  className="input-small w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea
                  value={lifetimeReason}
                  onChange={(e) => setLifetimeReason(e.target.value)}
                  placeholder="Reason for granting lifetime access..."
                  className="input-small w-full h-24 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button onClick={grantLifetime} className="btn-primary">
                Grant Lifetime
              </button>
              <button
                onClick={() => {
                  setLifetimeModal(null);
                  setLifetimePlan("");
                  setLifetimeReason("");
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {changePlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <h3 className="text-xl font-bold text-slate-900">Change Plan</h3>
              <p className="text-sm text-slate-600 mt-1">{changePlanModal.companyName || changePlanModal.companyId}</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">New Plan Code</label>
              <input
                type="text"
                value={newPlanCode}
                onChange={(e) => setNewPlanCode(e.target.value)}
                placeholder="e.g. professional"
                className="input-small w-full"
              />
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button onClick={changePlan} className="btn-primary">
                Change Plan
              </button>
              <button
                onClick={() => {
                  setChangePlanModal(null);
                  setNewPlanCode("");
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
