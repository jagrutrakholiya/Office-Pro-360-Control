"use client";
import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";

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

 return (
 <Layout>
 <div className="mb-6">
 <h1 className="text-2xl font-bold text-slate-900">Profit Calculator</h1>
 <p className="text-sm text-slate-600 mt-1">
 Project revenue, costs, and profit at any user count and plan. Uses your real platform costs from the Costs page.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* ── Inputs ────────────────────────────────────────────── */}
 <div className="bg-white rounded-lg border border-slate-200 p-6">
 <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Inputs</h2>

 <div className="space-y-4">
 <Field label="Number of paying users">
 <input
 type="number"
 min={1}
 value={userCount}
 onChange={(e) => setUserCount(Math.max(1, Number(e.target.value) || 1))}
 className="input"
 />
 <input
 type="range"
 min={1}
 max={1000}
 value={userCount}
 onChange={(e) => setUserCount(Number(e.target.value))}
 className="w-full mt-2 accent-slate-900"
 />
 <div className="flex justify-between text-xs text-slate-400 mt-1">
 <span>1</span>
 <span>1000</span>
 </div>
 </Field>

 <Field label="Plan">
 <select
 value={planCode}
 onChange={(e) => setPlanCode(e.target.value)}
 className="input"
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
 </select>
 {plans.length === 0 && (
 <p className="text-xs text-amber-600 mt-1">
 No plans found. Run <code className="bg-amber-50 px-1 rounded">node scripts/seedPricingPlans.js</code> to create them.
 </p>
 )}
 </Field>

 <Field label="Billing cycle">
 <div className="grid grid-cols-2 gap-2">
 <button
 type="button"
 onClick={() => setBillingCycle("monthly")}
 className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
 billingCycle === "monthly"
 ? "bg-slate-900 text-white border-slate-900"
 : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
 }`}
 >
 Monthly
 </button>
 <button
 type="button"
 onClick={() => setBillingCycle("yearly")}
 className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
 billingCycle === "yearly"
 ? "bg-slate-900 text-white border-slate-900"
 : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
 }`}
 >
 Yearly
 </button>
 </div>
 </Field>
 </div>

 <button
 onClick={saveScenario}
 disabled={!result}
 className="w-full mt-6 px-4 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
 >
 Save scenario
 </button>
 </div>

 {/* ── Results ───────────────────────────────────────────── */}
 <div className="lg:col-span-2 space-y-4">
 {error && (
 <div className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
 {error}
 </div>
 )}

 {!result && !calculating && (
 <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-sm text-slate-400">
 Pick inputs to see projection.
 </div>
 )}

 {result && (
 <>
 {/* Hero profit card */}
 <div
 className={`rounded-lg border p-6 ${
 isProfit ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
 }`}
 >
 <div className="text-xs font-medium uppercase tracking-wider text-slate-600">
 {isProfit ? "Projected monthly profit" : "Projected monthly loss"}
 </div>
 <div className={`mt-2 text-4xl font-bold tabular-nums ${isProfit ? "text-emerald-700" : "text-red-700"}`}>
 {formatCurrency(Math.abs(result.profit.perMonth))}
 </div>
 <div className="text-sm text-slate-600 mt-1">
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
 <div className="bg-white rounded-lg border border-slate-200 p-5">
 <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Breakeven</div>
 {result.breakeven.userCount !== null ? (
 <div>
 <div className="text-3xl font-bold text-slate-900 tabular-nums">
 {result.breakeven.userCount}
 </div>
 <div className="text-xs text-slate-500 mt-1">{result.breakeven.note}</div>
 </div>
 ) : (
 <div className="text-sm text-slate-500">{result.breakeven.note}</div>
 )}
 {result.costs.fixedCostCount === 0 && (
 <div className="text-xs text-amber-600 mt-3">
 No platform costs tracked yet — breakeven is meaningless until you{" "}
 <a href="/costs" className="underline">add costs</a>.
 </div>
 )}
 </div>
 </>
 )}
 </div>
 </div>

 {/* ── Saved scenarios ─────────────────────────────────────── */}
 {scenarios.length > 0 && (
 <div className="mt-8">
 <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Saved scenarios</h2>
 <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
 <table className="w-full">
 <thead className="bg-slate-50">
 <tr>
 <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Scenario</th>
 <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Revenue/mo</th>
 <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Costs/mo</th>
 <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Profit/mo</th>
 <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Margin</th>
 <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Yearly profit</th>
 <th></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {scenarios.map((s) => (
 <tr key={s.id}>
 <td className="px-4 py-3 text-sm text-slate-900 font-medium">{s.label}</td>
 <td className="px-4 py-3 text-sm text-right tabular-nums text-slate-700">
 {formatCurrency(s.result.revenue.perMonth)}
 </td>
 <td className="px-4 py-3 text-sm text-right tabular-nums text-slate-700">
 {formatCurrency(s.result.costs.perMonth)}
 </td>
 <td
 className={`px-4 py-3 text-sm text-right tabular-nums font-semibold ${
 s.result.profit.perMonth >= 0 ? "text-emerald-700" : "text-red-700"
 }`}
 >
 {formatCurrency(s.result.profit.perMonth)}
 </td>
 <td className="px-4 py-3 text-sm text-right tabular-nums text-slate-700">
 {s.result.profit.margin.toFixed(1)}%
 </td>
 <td className="px-4 py-3 text-sm text-right tabular-nums text-slate-700">
 {formatCurrency(s.result.profit.perYear)}
 </td>
 <td className="px-4 py-3 text-right">
 <button
 onClick={() => removeScenario(s.id)}
 className="text-xs text-slate-400 hover:text-red-600"
 title="Remove"
 >
 
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
 return (
 <label className="block">
 <div className="text-xs font-medium text-slate-700 mb-1">{label}</div>
 {children}
 </label>
 );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
 return (
 <div className="bg-white rounded-lg border border-slate-200 p-5">
 <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">{title}</div>
 <div className="space-y-2">{children}</div>
 </div>
 );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
 return (
 <div className="flex items-center justify-between text-sm">
 <span className={muted ? "text-slate-400" : "text-slate-600"}>{label}</span>
 <span
 className={`tabular-nums ${
 bold ? "font-semibold text-slate-900" : muted ? "text-slate-400" : "text-slate-700"
 }`}
 >
 {value}
 </span>
 </div>
 );
}
