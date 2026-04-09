"use client";
import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";

/**
 * Costs page — manages PlatformCost records (the platform owner's expenses).
 *
 * What lives here:
 *   - Summary cards: monthly burn, yearly burn, active count, top category
 *   - Filterable table of every cost (name, category, amount, frequency,
 *     start date, vendor, status)
 *   - Add / edit modal that talks to /admin/costs
 *   - Per-row "Retire" (set endDate=now) and "Delete" actions
 *
 * The minimal/no-gradient style here is intentional — matches the rest of
 * the project's redesigned aesthetic. No hardcoded data, no fake values.
 */

type Cost = {
  _id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  frequency: "one_time" | "monthly" | "yearly";
  startDate: string;
  endDate: string | null;
  vendor: string;
  notes: string;
  createdAt: string;
};

type Summary = {
  monthlyBurn: number;
  yearlyBurn: number;
  activeCostCount: number;
  byCategory: Record<string, number>;
  largestCost: { name: string; amount: number; frequency: string; category: string } | null;
};

type Meta = { categories: string[]; frequencies: string[] };

const emptyForm = {
  name: "",
  category: "infrastructure",
  amount: "",
  currency: "INR",
  frequency: "monthly" as "one_time" | "monthly" | "yearly",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  vendor: "",
  notes: "",
};

export default function CostsPage() {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [meta, setMeta] = useState<Meta>({ categories: [], frequencies: [] });
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const params = filterCategory ? { category: filterCategory } : {};
      const [costsRes, summaryRes, metaRes] = await Promise.all([
        api.get("/admin/costs", { params }),
        api.get("/admin/costs/summary"),
        api.get("/admin/costs/meta"),
      ]);
      setCosts(costsRes.data.costs || []);
      setSummary(summaryRes.data);
      setMeta(metaRes.data);
    } catch (e) {
      console.error("Failed to load costs:", e);
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    load();
  }, [load]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (cost: Cost) => {
    setEditingId(cost._id);
    setForm({
      name: cost.name,
      category: cost.category,
      amount: String(cost.amount),
      currency: cost.currency,
      frequency: cost.frequency,
      startDate: cost.startDate.slice(0, 10),
      endDate: cost.endDate ? cost.endDate.slice(0, 10) : "",
      vendor: cost.vendor || "",
      notes: cost.notes || "",
    });
    setError("");
    setShowModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        endDate: form.endDate || null,
      };
      if (editingId) {
        await api.patch(`/admin/costs/${editingId}`, payload);
      } else {
        await api.post("/admin/costs", payload);
      }
      setShowModal(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save cost");
    } finally {
      setSaving(false);
    }
  };

  const retire = async (id: string) => {
    if (!confirm("Mark this cost as retired (set end date to today)?")) return;
    await api.patch(`/admin/costs/${id}`, { endDate: new Date().toISOString() });
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this cost permanently? (Tip: use Retire instead to keep it in P&L history.)")) return;
    await api.delete(`/admin/costs/${id}`);
    await load();
  };

  return (
    <Layout>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Costs</h1>
          <p className="text-sm text-slate-600 mt-1">
            Track every expense — cloud, salaries, tools, anything you pay for. Used by P&amp;L and the profit calculator.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
        >
          + Add Cost
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Monthly Burn"
          value={summary ? formatCurrency(summary.monthlyBurn) : "—"}
          sub="Recurring + amortized yearly"
          loading={loading}
        />
        <SummaryCard
          label="Yearly Burn"
          value={summary ? formatCurrency(summary.yearlyBurn) : "—"}
          sub="Monthly × 12"
          loading={loading}
        />
        <SummaryCard
          label="Active Costs"
          value={summary ? String(summary.activeCostCount) : "—"}
          sub="Currently contributing"
          loading={loading}
        />
        <SummaryCard
          label="Top Category"
          value={
            summary && Object.keys(summary.byCategory).length > 0
              ? formatCurrency(
                  Math.max(...Object.values(summary.byCategory))
                )
              : "—"
          }
          sub={
            summary && Object.keys(summary.byCategory).length > 0
              ? Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])[0][0]
              : "no data"
          }
          loading={loading}
        />
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex items-center gap-3">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        >
          <option value="">All</option>
          {meta.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Costs table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Amount</Th>
              <Th>Frequency</Th>
              <Th>Start</Th>
              <Th>Status</Th>
              <Th>Vendor</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : costs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                  No costs yet. Click <b>Add Cost</b> to start tracking expenses.
                </td>
              </tr>
            ) : (
              costs.map((c) => {
                const isRetired = c.endDate && new Date(c.endDate) < new Date();
                return (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <Td>
                      <div className="font-medium text-slate-900">{c.name}</div>
                      {c.notes && <div className="text-xs text-slate-500 mt-0.5">{c.notes}</div>}
                    </Td>
                    <Td>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {c.category}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-semibold text-slate-900">{formatCurrency(c.amount)}</span>
                    </Td>
                    <Td className="capitalize text-slate-700">{c.frequency.replace("_", " ")}</Td>
                    <Td className="text-slate-600">{new Date(c.startDate).toLocaleDateString("en-IN")}</Td>
                    <Td>
                      {isRetired ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                          Retired
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          Active
                        </span>
                      )}
                    </Td>
                    <Td className="text-slate-600">{c.vendor || "—"}</Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"
                        >
                          Edit
                        </button>
                        {!isRetired && (
                          <button
                            onClick={() => retire(c._id)}
                            className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"
                          >
                            Retire
                          </button>
                        )}
                        <button
                          onClick={() => remove(c._id)}
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={submit}>
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Cost" : "Add Cost"}
                </h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="px-3 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Field label="Name" required>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Wasabi storage"
                    className="input"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input capitalize"
                    >
                      {meta.categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Frequency">
                    <select
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
                      className="input"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="one_time">One time</option>
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Amount (₹)" required>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="0"
                      className="input"
                    />
                  </Field>
                  <Field label="Currency">
                    <input
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className="input"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start Date">
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="input"
                    />
                  </Field>
                  <Field label="End Date (optional)">
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="input"
                    />
                  </Field>
                </div>

                <Field label="Vendor (optional)">
                  <input
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    placeholder="e.g. Wasabi Inc."
                    className="input"
                  />
                </Field>

                <Field label="Notes (optional)">
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="input"
                  />
                </Field>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Create Cost"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
          color: #0f172a;
          outline: none;
        }
        .input:focus {
          border-color: #0f172a;
          box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
        }
      `}</style>
    </Layout>
  );
}

// ─── tiny presentational helpers (kept inline so this page is self-contained) ─

function SummaryCard({ label, value, sub, loading }: { label: string; value: string; sub: string; loading: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
        {loading ? <span className="inline-block w-20 h-6 bg-slate-100 rounded animate-pulse" /> : value}
      </div>
      <div className="text-xs text-slate-500 mt-1 capitalize">{sub}</div>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  className = "",
}: {
  children: React.ReactNode;
  align?: "right";
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 text-sm ${align === "right" ? "text-right" : "text-left"} ${className}`}>
      {children}
    </td>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      {children}
    </label>
  );
}
