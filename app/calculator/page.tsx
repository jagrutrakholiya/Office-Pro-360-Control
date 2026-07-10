"use client";
import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
  PageHeader,
  Card,
  CardTitle,
  Button,
  Input,
  Select,
  DataTable,
} from "../../components/ui";
import type { Column } from "../../components/ui";

/**
 * Profit Calculator — what-if scenarios.
 *
 * The user picks a plan + user count + billing cycle, and we hit
 * POST /admin/finance/calculate to get back:
 * - revenue (per cycle, per month, per year)
 * - costs (fixed monthly burn from PlatformCost)
 * - profit (per month, per year, margin)
 * - breakeven user count
 *
 * The plan dropdown is loaded from /admin/finance/plans (real plans from
 * the DB, not hardcoded). Inputs auto-recalculate on change with a small
 * debounce so users don't see flickering numbers.
 *
 * Bonus feature: "Saved scenarios" — we keep up to 5 scenarios in
 * localStorage so the user can compare a few what-ifs side by side.
 */

type Plan = {
  code: string;
  name: string;
  priceMonthly?: number;
  priceYearly?: number;
  pricing: {
    model: string;
    baseMonthly: number;
    baseYearly: number;
    perUserMonthly: number;
    perUserYearly: number;
    includedUsers: number;
    currency: string;
  };
};

type Result = {
  input: { userCount: number; planCode: string; billingCycle: string };
  plan: { code: string; name: string; pricing: any };
  revenue: { pricePerCycle: number; perMonth: number; perYear: number };
  costs: {
    fixedMonthly: number;
    variableMonthly: number;
    perMonth: number;
    perYear: number;
    fixedCostCount: number;
  };
  profit: { perMonth: number; perYear: number; margin: number };
  breakeven: { userCount: number | null; note: string };
};

type Scenario = {
  id: string;
  label: string;
  result: Result;
};

const STORAGE_KEY = "cp_calculator_scenarios";

export default function CalculatorPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userCount, setUserCount] = useState(100);
  const [planCode, setPlanCode] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [result, setResult] = useState<Result | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  // Load plans on mount, plus any saved scenarios
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/finance/plans");
        const list = res.data.plans || [];
        setPlans(list);
        if (list.length > 0) setPlanCode(list[0].code);
      } catch (e) {
        console.error("Failed to load plans:", e);
      }
    })();

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setScenarios(JSON.parse(raw));
    } catch {}
  }, []);

  const calculate = useCallback(async () => {
    if (!planCode) return;
    setCalculating(true);
    setError("");
    try {
      const res = await api.post("/admin/finance/calculate", {
        userCount,
        planCode,
        billingCycle,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to calculate");
      setResult(null);
    } finally {
      setCalculating(false);
    }
  }, [userCount, planCode, billingCycle]);

  // Auto-recalculate on input change (debounced 300ms)
  useEffect(() => {
    if (!planCode) return;
    const t = setTimeout(() => calculate(), 300);
    return () => clearTimeout(t);
  }, [calculate, planCode]);

  const saveScenario = () => {
    if (!result) return;
    const label = `${result.input.userCount} × ${result.plan.name} (${result.input.billingCycle})`;
    const next: Scenario[] = [
      { id: Date.now().toString(), label, result },
      ...scenarios,
    ].slice(0, 5);
    setScenarios(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const removeScenario = (id: string) => {
    const next = scenarios.filter((s) => s.id !== id);
    setScenarios(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const isProfit = (result?.profit.perMonth || 0) >= 0;

  const scenarioColumns: Column<Scenario>[] = [
    {
      key: "label",
      header: "Scenario",
      render: (s) => <span className="font-medium text-slate-900 dark:text-slate-100">{s.label}</span>,
    },
    {
      key: "revenue",
      header: "Revenue/mo",
      className: "text-right",
      render: (s) => <span className="tabular-nums">{formatCurrency(s.result.revenue.perMonth)}</span>,
    },
    {
      key: "costs",
      header: "Costs/mo",
      className: "text-right",
      render: (s) => <span className="tabular-nums">{formatCurrency(s.result.costs.perMonth)}</span>,
    },
    {
      key: "profit",
      header: "Profit/mo",
      className: "text-right",
      render: (s) => (
        <span
          className={`tabular-nums font-semibold ${
            s.result.profit.perMonth >= 0
              ? "text-success-600 dark:text-success-400"
              : "text-danger-600 dark:text-danger-400"
          }`}
        >
          {formatCurrency(s.result.profit.perMonth)}
        </span>
      ),
    },
    {
      key: "margin",
      header: "Margin",
      className: "text-right",
      render: (s) => <span className="tabular-nums">{s.result.profit.margin.toFixed(1)}%</span>,
    },
    {
      key: "yearly",
      header: "Yearly profit",
      className: "text-right",
      render: (s) => <span className="tabular-nums">{formatCurrency(s.result.profit.perYear)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <Button variant="ghost" size="sm" onClick={() => removeScenario(s.id)} title="Remove">
          Remove
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Profit Calculator"
          description="Project revenue, costs, and profit at any user count and plan. Uses your real platform costs from the Costs page."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Inputs ────────────────────────────────────────────── */}
          <Card padding="lg">
            <CardTitle className="text-sm uppercase tracking-wider mb-4">Inputs</CardTitle>

            <div className="space-y-4">
              <div>
                <Input
                  label="Number of paying users"
                  type="number"
                  min={1}
                  value={userCount}
                  onChange={(e) => setUserCount(Math.max(1, Number(e.target.value) || 1))}
                />
                <input
                  type="range"
                  min={1}
                  max={1000}
                  value={userCount}
                  onChange={(e) => setUserCount(Number(e.target.value))}
                  className="w-full mt-2 accent-primary-600"
                />
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
                  <span>1</span>
                  <span>1000</span>
                </div>
              </div>

              <div>
                <Select
                  label="Plan"
                  value={planCode}
                  onChange={(e) => setPlanCode(e.target.value)}
                  disabled={plans.length === 0}
                >
                  {plans.length === 0 ? (
                    <option>No plans available — run seedPricingPlans.js</option>
                  ) : (
                    plans.map((p) => {
                      const base = p.pricing?.baseMonthly || p.priceMonthly || 0;
                      const perUser = p.pricing?.perUserMonthly || 0;
                      const included = p.pricing?.includedUsers || 0;
                      const priceLabel = base === 0
                        ? "Free"
                        : `₹${base}/mo${perUser > 0 ? ` + ₹${perUser}/user` : ""}${included > 0 ? ` (${included} incl)` : ""}`;
                      return (
                        <option key={p.code} value={p.code}>
                          {p.name} — {priceLabel}
                        </option>
                      );
                    })
                  )}
                </Select>
                {plans.length === 0 && (
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                    No plans found. Run{" "}
                    <code className="bg-warning-50 dark:bg-warning-900/30 px-1 rounded">
                      node scripts/seedPricingPlans.js
                    </code>{" "}
                    to create them.
                  </p>
                )}
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Billing cycle</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={billingCycle === "monthly" ? "primary" : "outline"}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    type="button"
                    variant={billingCycle === "yearly" ? "primary" : "outline"}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={saveScenario}
              disabled={!result}
              className="mt-6"
            >
              Save scenario
            </Button>
          </Card>

          {/* ── Results ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 text-sm">
                {error}
              </div>
            )}

            {!result && !calculating && (
              <Card padding="lg" className="p-12 text-center text-sm text-slate-400 dark:text-slate-500">
                Pick inputs to see projection.
              </Card>
            )}

            {result && (
              <>
                {/* Hero profit card */}
                <div
                  className={`rounded-xl border p-6 ${
                    isProfit
                      ? "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800"
                      : "bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800"
                  }`}
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {isProfit ? "Projected monthly profit" : "Projected monthly loss"}
                  </div>
                  <div
                    className={`mt-2 text-4xl font-bold tabular-nums ${
                      isProfit ? "text-success-700 dark:text-success-400" : "text-danger-700 dark:text-danger-400"
                    }`}
                  >
                    {formatCurrency(Math.abs(result.profit.perMonth))}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {result.profit.margin.toFixed(1)}% margin · {formatCurrency(result.profit.perYear)} per year
                  </div>
                </div>

                {/* Revenue / Costs breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Block title="Revenue">
                    <Row label="Per cycle" value={formatCurrency(result.revenue.pricePerCycle)} />
                    <Row label="Per month" value={formatCurrency(result.revenue.perMonth)} bold />
                    <Row label="Per year" value={formatCurrency(result.revenue.perYear)} muted />
                  </Block>

                  <Block title="Costs">
                    <Row label="Fixed (monthly burn)" value={formatCurrency(result.costs.fixedMonthly)} />
                    <Row label="Variable (estimate)" value={formatCurrency(result.costs.variableMonthly)} />
                    <Row label="Total per month" value={formatCurrency(result.costs.perMonth)} bold />
                    <Row label="Total per year" value={formatCurrency(result.costs.perYear)} muted />
                  </Block>
                </div>

                {/* Breakeven card */}
                <Card>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Breakeven
                  </div>
                  {result.breakeven.userCount !== null ? (
                    <div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {result.breakeven.userCount}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{result.breakeven.note}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 dark:text-slate-400">{result.breakeven.note}</div>
                  )}
                  {result.costs.fixedCostCount === 0 && (
                    <div className="text-xs text-warning-600 dark:text-warning-400 mt-3">
                      No platform costs tracked yet — breakeven is meaningless until you{" "}
                      <a href="/costs" className="underline">
                        add costs
                      </a>
                      .
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>

        {/* ── Saved scenarios ─────────────────────────────────────── */}
        {scenarios.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Saved scenarios
            </h2>
            <DataTable columns={scenarioColumns} data={scenarios} rowKey={(s) => s.id} />
          </div>
        )}
      </div>
    </Layout>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </Card>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-400"}>
        {label}
      </span>
      <span
        className={`tabular-nums ${
          bold
            ? "font-semibold text-slate-900 dark:text-slate-100"
            : muted
            ? "text-slate-400 dark:text-slate-500"
            : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
