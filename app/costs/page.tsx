"use client";
import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
  PageHeader,
  StatCard,
  DataTable,
  Button,
  Badge,
  Modal,
  Input,
  Select,
  Textarea,
  Skeleton,
} from "../../components/ui";
import type { Column } from "../../components/ui";

/**
 * Costs page — manages PlatformCost records (the platform owner's expenses).
 *
 * What lives here:
 * - Summary cards: monthly burn, yearly burn, active count, top category
 * - Filterable table of every cost (name, category, amount, frequency,
 * start date, vendor, status)
 * - Add / edit modal that talks to /admin/costs
 * - Per-row "Retire" (set endDate=now) and "Delete" actions
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

  const topCategoryValue =
    summary && Object.keys(summary.byCategory).length > 0
      ? formatCurrency(Math.max(...Object.values(summary.byCategory)))
      : "—";
  const topCategoryLabel =
    summary && Object.keys(summary.byCategory).length > 0
      ? Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1])[0][0]
      : "no data";

  const columns: Column<Cost>[] = [
    {
      key: "name",
      header: "Name",
      render: (c) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{c.name}</div>
          {c.notes && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.notes}</div>}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (c) => (
        <Badge variant="neutral" className="capitalize">
          {c.category}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (c) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
          {formatCurrency(c.amount)}
        </span>
      ),
    },
    {
      key: "frequency",
      header: "Frequency",
      className: "capitalize",
      render: (c) => c.frequency.replace("_", " "),
    },
    {
      key: "startDate",
      header: "Start",
      render: (c) => new Date(c.startDate).toLocaleDateString("en-IN"),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => {
        const isRetired = c.endDate && new Date(c.endDate) < new Date();
        return isRetired ? (
          <Badge variant="neutral">Retired</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        );
      },
    },
    {
      key: "vendor",
      header: "Vendor",
      render: (c) => c.vendor || "—",
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (c) => {
        const isRetired = c.endDate && new Date(c.endDate) < new Date();
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
              Edit
            </Button>
            {!isRetired && (
              <Button variant="outline" size="sm" onClick={() => retire(c._id)}>
                Retire
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={() => remove(c._id)}>
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Platform Costs"
          description="Track every expense — cloud, salaries, tools, anything you pay for. Used by P&L and the profit calculator."
          actions={<Button onClick={openAdd}>+ Add Cost</Button>}
        />

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Monthly Burn"
            value={loading ? <Skeleton className="h-7 w-24" /> : summary ? formatCurrency(summary.monthlyBurn) : "—"}
            description="Recurring + amortized yearly"
            accent="primary"
          />
          <StatCard
            label="Yearly Burn"
            value={loading ? <Skeleton className="h-7 w-24" /> : summary ? formatCurrency(summary.yearlyBurn) : "—"}
            description="Monthly × 12"
            accent="warning"
          />
          <StatCard
            label="Active Costs"
            value={loading ? <Skeleton className="h-7 w-16" /> : summary ? String(summary.activeCostCount) : "—"}
            description="Currently contributing"
            accent="success"
          />
          <StatCard
            label="Top Category"
            value={loading ? <Skeleton className="h-7 w-24" /> : topCategoryValue}
            description={<span className="capitalize">{topCategoryLabel}</span>}
            accent="neutral"
          />
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Category:
          </label>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            wrapperClassName="w-48"
          >
            <option value="">All</option>
            {meta.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        {/* Costs table */}
        <DataTable
          columns={columns}
          data={costs}
          loading={loading}
          rowKey={(c) => c._id}
          emptyTitle="No costs yet"
          emptyDescription="Click Add Cost to start tracking expenses."
          emptyAction={<Button onClick={openAdd}>+ Add Cost</Button>}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Cost" : "Add Cost"}
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="cost-form" loading={saving} disabled={saving}>
              {editingId ? "Save Changes" : "Create Cost"}
            </Button>
          </>
        }
      >
        <form id="cost-form" onSubmit={submit} className="space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Name *"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Wasabi storage"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              className="capitalize"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {meta.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              label="Frequency"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="one_time">One time</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (₹) *"
              required
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
            />
            <Input
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="End Date (optional)"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <Input
            label="Vendor (optional)"
            value={form.vendor}
            onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            placeholder="e.g. Wasabi Inc."
          />

          <Textarea
            label="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
          />
        </form>
      </Modal>
    </Layout>
  );
}
