"use client";
import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
 PageHeader,
 StatCard,
 DataTable,
 Badge,
 Button,
 Input,
 Select,
 Modal,
} from "@/components/ui";

/**
 * AI Audit page — super-admin observability over the AI assistant.
 *
 * Three sections:
 * 1. Headline cards (this month)
 * - Total questions across all companies
 * - Total tool calls
 * - Active companies
 * - Flagged conversations (heuristic)
 * 2. Top users + companies tables
 * 3. Conversation browser with filters (company, user, flag, search)
 * and a "View" modal that shows the full message thread
 *
 * The "flagged" view is the most important one — it surfaces prompts that
 * LOOK like attempts to extract sensitive data (salary probes, role
 * elevation, prompt injection, cross-tenant probes, bulk PII dumps).
 * The actual security boundary is enforced in the backend tool executor;
 * this view is for human review of who tried what.
 */

type Summary = {
 monthKey: string;
 caps: { companyMonthly: number; userMonthly: number };
 totals: {
 questions: number;
 toolCalls: number;
 companiesActive: number;
 usersActive: number;
 };
 byCompany: {
 companyId: string;
 companyName: string;
 questions: number;
 toolCalls: number;
 cap: number;
 pctOfCap: number;
 lastUsedAt: string;
 }[];
 topUsers: {
 userId: string;
 userName: string;
 userEmail: string;
 userRole: string;
 companyId: string;
 companyName: string;
 questions: number;
 toolCalls: number;
 cap: number;
 pctOfCap: number;
 lastUsedAt: string;
 }[];
 audit: {
 scannedConversations: number;
 flaggedConversations: number;
 flagBreakdown: Record<string, number>;
 patterns: { flag: string; label: string }[];
 };
};

type ConversationRow = {
 id: string;
 title: string;
 companyName: string;
 userName: string;
 userEmail: string;
 userRole: string;
 messageCount: number;
 firstMessage: string;
 flags: string[];
 createdAt: string;
 updatedAt: string;
};

type ConversationDetail = ConversationRow & {
 messages: {
 role: "user" | "assistant" | "tool";
 text?: string;
 name?: string;
 result?: any;
 toolCalls?: { name: string; args: any }[];
 at?: string;
 }[];
};

export default function AiAuditPage() {
 const [summary, setSummary] = useState<Summary | null>(null);
 const [convos, setConvos] = useState<ConversationRow[]>([]);
 const [convoLoading, setConvoLoading] = useState(false);
 const [search, setSearch] = useState("");
 const [flagFilter, setFlagFilter] = useState("");
 const [page, setPage] = useState(1);
 const [total, setTotal] = useState(0);
 const [detail, setDetail] = useState<ConversationDetail | null>(null);
 const [detailLoading, setDetailLoading] = useState(false);

 // Load summary on mount
 useEffect(() => {
 (async () => {
 try {
 const res = await api.get("/admin/ai-audit/summary");
 setSummary(res.data);
 } catch (e) {
 console.error(e);
 }
 })();
 }, []);

 // Load conversations whenever filters change. Debounced 300ms on search.
 const loadConvos = useCallback(async () => {
 setConvoLoading(true);
 try {
 const params: any = { page, limit: 20 };
 if (search) params.search = search;
 if (flagFilter) params.flag = flagFilter;
 const res = await api.get("/admin/ai-audit/conversations", { params });
 setConvos(res.data.conversations || []);
 setTotal(res.data.total || 0);
 } catch (e) {
 console.error(e);
 } finally {
 setConvoLoading(false);
 }
 }, [page, search, flagFilter]);

 useEffect(() => {
 const t = setTimeout(loadConvos, 300);
 return () => clearTimeout(t);
 }, [loadConvos]);

 const openDetail = async (id: string) => {
 setDetailLoading(true);
 try {
 const res = await api.get(`/admin/ai-audit/conversations/${id}`);
 setDetail(res.data);
 } catch (e) {
 console.error(e);
 } finally {
 setDetailLoading(false);
 }
 };

 const flagLabels: Record<string, string> = Object.fromEntries(
 (summary?.audit.patterns || []).map((p) => [p.flag, p.label])
 );

 const totalPages = Math.max(1, Math.ceil(total / 20));

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="AI Audit"
 description="Watch how every company is using the AI assistant. Flagged conversations are heuristic matches for sensitive-data probes — review them and act if needed. The actual lockdown (who can read what) is enforced in the tool executor."
 />

 {/* ── Headline cards ────────────────────────────────────────── */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard
 label="Questions this month"
 value={summary?.totals.questions ?? "—"}
 description="Across all companies"
 accent="primary"
 />
 <StatCard
 label="Tool calls"
 value={summary?.totals.toolCalls ?? "—"}
 description="DB lookups via the LLM"
 accent="neutral"
 />
 <StatCard
 label="Active companies"
 value={summary?.totals.companiesActive ?? "—"}
 description="Used the AI this month"
 accent="neutral"
 />
 <StatCard
 label="Flagged conversations"
 value={summary?.audit.flaggedConversations ?? "—"}
 description={`Scanned latest ${summary?.audit.scannedConversations ?? "—"}`}
 accent={(summary?.audit.flaggedConversations || 0) > 0 ? "warning" : "neutral"}
 />
 </div>

 {/* Flag breakdown chips */}
 {summary && summary.audit.flaggedConversations > 0 && (
 <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40">
 <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2">
 Flag breakdown
 </div>
 <div className="flex flex-wrap gap-2">
 {Object.entries(summary.audit.flagBreakdown).map(([flag, count]) => (
 <button
 key={flag}
 onClick={() => {
 setFlagFilter(flag);
 setPage(1);
 }}
 className="px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-xs font-medium text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
 >
 {flagLabels[flag] || flag}{" "}
 <span className="text-amber-600 dark:text-amber-400">({count})</span>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* ── Top users + companies (side by side) ─────────────────── */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div className="space-y-3">
 <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
 Top Users (this month)
 </h3>
 <DataTable
 data={(summary?.topUsers || []).slice(0, 10)}
 rowKey={(u: Summary["topUsers"][number]) => u.userId}
 emptyTitle="No usage yet."
 columns={[
 {
 key: "user",
 header: "User",
 render: (u: Summary["topUsers"][number]) => (
 <div>
 <div className="font-medium text-slate-900 dark:text-slate-100">
 {u.userName}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400">
 {u.userRole} · {u.userEmail}
 </div>
 </div>
 ),
 },
 {
 key: "company",
 header: "Company",
 render: (u: Summary["topUsers"][number]) => u.companyName,
 },
 {
 key: "qs",
 header: "Qs",
 className: "text-right",
 render: (u: Summary["topUsers"][number]) => (
 <span className="tabular-nums font-semibold text-slate-900 dark:text-slate-100">
 {u.questions}
 </span>
 ),
 },
 {
 key: "pct",
 header: "% cap",
 className: "text-right",
 render: (u: Summary["topUsers"][number]) => <PctBar pct={u.pctOfCap} />,
 },
 ]}
 />
 </div>

 <div className="space-y-3">
 <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
 Top Companies (this month)
 </h3>
 <DataTable
 data={(summary?.byCompany || []).slice(0, 10)}
 rowKey={(c: Summary["byCompany"][number]) => c.companyId}
 emptyTitle="No usage yet."
 columns={[
 {
 key: "company",
 header: "Company",
 render: (c: Summary["byCompany"][number]) => (
 <span className="font-medium text-slate-900 dark:text-slate-100">
 {c.companyName}
 </span>
 ),
 },
 {
 key: "questions",
 header: "Questions",
 className: "text-right",
 render: (c: Summary["byCompany"][number]) => (
 <span className="tabular-nums font-semibold text-slate-900 dark:text-slate-100">
 {c.questions}
 </span>
 ),
 },
 {
 key: "toolCalls",
 header: "Tool calls",
 className: "text-right",
 render: (c: Summary["byCompany"][number]) => (
 <span className="tabular-nums text-slate-700 dark:text-slate-300">
 {c.toolCalls}
 </span>
 ),
 },
 {
 key: "pct",
 header: "% cap",
 className: "text-right",
 render: (c: Summary["byCompany"][number]) => <PctBar pct={c.pctOfCap} />,
 },
 ]}
 />
 </div>
 </div>

 {/* ── Conversation browser ─────────────────────────────────── */}
 <div className="space-y-3">
 <div className="flex flex-wrap items-end gap-3">
 <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex-1">
 Conversations
 </h3>
 <Input
 placeholder="Search title or message text…"
 value={search}
 onChange={(e) => {
 setSearch(e.target.value);
 setPage(1);
 }}
 className="w-64"
 />
 <Select
 value={flagFilter}
 onChange={(e) => {
 setFlagFilter(e.target.value);
 setPage(1);
 }}
 >
 <option value="">All flags</option>
 {(summary?.audit.patterns || []).map((p) => (
 <option key={p.flag} value={p.flag}>
 {p.label}
 </option>
 ))}
 </Select>
 {(search || flagFilter) && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => {
 setSearch("");
 setFlagFilter("");
 setPage(1);
 }}
 >
 Clear
 </Button>
 )}
 </div>

 <DataTable
 loading={convoLoading}
 data={convos}
 rowKey={(c: ConversationRow) => c.id}
 emptyTitle="No conversations match."
 columns={[
 {
 key: "when",
 header: "When",
 render: (c: ConversationRow) => (
 <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
 {new Date(c.updatedAt).toLocaleString("en-IN", {
 day: "2-digit",
 month: "short",
 hour: "2-digit",
 minute: "2-digit",
 })}
 </span>
 ),
 },
 {
 key: "user",
 header: "User",
 render: (c: ConversationRow) => (
 <div>
 <div className="font-medium text-slate-900 dark:text-slate-100">
 {c.userName}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400">
 {c.userRole}
 </div>
 </div>
 ),
 },
 {
 key: "company",
 header: "Company",
 render: (c: ConversationRow) => c.companyName,
 },
 {
 key: "firstMessage",
 header: "First Message",
 render: (c: ConversationRow) => (
 <span className="max-w-xs truncate block" title={c.firstMessage}>
 {c.firstMessage || (
 <em className="text-slate-400 dark:text-slate-500">empty</em>
 )}
 </span>
 ),
 },
 {
 key: "flags",
 header: "Flags",
 render: (c: ConversationRow) => (
 <div className="flex flex-wrap gap-1">
 {c.flags.length === 0 ? (
 <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
 ) : (
 c.flags.map((f) => (
 <Badge key={f} variant="warning" size="sm">
 {flagLabels[f] || f}
 </Badge>
 ))
 )}
 </div>
 ),
 },
 {
 key: "msgs",
 header: "Msgs",
 className: "text-right",
 render: (c: ConversationRow) => (
 <span className="tabular-nums text-slate-700 dark:text-slate-300">
 {c.messageCount}
 </span>
 ),
 },
 {
 key: "action",
 header: "",
 className: "text-right",
 render: (c: ConversationRow) => (
 <Button variant="secondary" size="sm" onClick={() => openDetail(c.id)}>
 View
 </Button>
 ),
 },
 ]}
 />

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between text-sm">
 <div className="text-slate-600 dark:text-slate-400">
 Page {page} of {totalPages} · {total} total
 </div>
 <div className="flex items-center gap-2">
 <Button
 variant="secondary"
 size="sm"
 disabled={page <= 1}
 onClick={() => setPage(page - 1)}
 >
 Prev
 </Button>
 <Button
 variant="secondary"
 size="sm"
 disabled={page >= totalPages}
 onClick={() => setPage(page + 1)}
 >
 Next
 </Button>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* ── Detail Modal ─────────────────────────────────────────── */}
 <Modal
 open={!!detail}
 onClose={() => setDetail(null)}
 size="lg"
 title={detail?.title}
 footer={
 <Button variant="secondary" onClick={() => setDetail(null)}>
 Close
 </Button>
 }
 >
 {detail && (
 <div className="space-y-3">
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400">
 {detail.companyName} · {detail.userName} ({detail.userRole})
 </div>
 {detail.flags.length > 0 && (
 <div className="flex flex-wrap gap-1 mt-2">
 {detail.flags.map((f) => (
 <Badge key={f} variant="warning" size="sm">
 {flagLabels[f] || f}
 </Badge>
 ))}
 </div>
 )}
 </div>
 <div className="space-y-3">
 {detail.messages.map((m, i) => (
 <Message key={i} msg={m} />
 ))}
 </div>
 </div>
 )}
 </Modal>

 {detailLoading && !detail && (
 <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 text-sm text-slate-600 dark:text-slate-300">
 Loading conversation…
 </div>
 </div>
 )}
 </Layout>
 );
}

// ─── tiny presentational helpers ────────────────────────────────────────────

function PctBar({ pct }: { pct: number }) {
 const clamped = Math.min(100, Math.max(0, pct));
 const tone =
 clamped >= 90
 ? "bg-red-500"
 : clamped >= 70
 ? "bg-amber-500"
 : "bg-slate-900 dark:bg-slate-300";
 return (
 <div className="flex items-center gap-2 justify-end">
 <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
 <div className={`h-full ${tone}`} style={{ width: `${clamped}%` }} />
 </div>
 <span className="text-xs text-slate-600 dark:text-slate-400 w-10 text-right">
 {clamped}%
 </span>
 </div>
 );
}

function Message({ msg }: { msg: ConversationDetail["messages"][number] }) {
 if (msg.role === "user") {
 return (
 <div className="flex justify-end">
 <div className="max-w-[80%] rounded-lg bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 text-sm">
 {msg.text}
 </div>
 </div>
 );
 }
 if (msg.role === "tool") {
 return (
 <div className="flex justify-start">
 <div className="max-w-[80%] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-mono text-slate-700 dark:text-slate-300">
 <div className="text-slate-500 dark:text-slate-400 mb-1">tool: {msg.name}</div>
 <pre className="whitespace-pre-wrap break-words">
 {typeof msg.result === "string"
 ? msg.result
 : JSON.stringify(msg.result, null, 2).slice(0, 600)}
 </pre>
 </div>
 </div>
 );
 }
 // assistant
 if (msg.toolCalls && msg.toolCalls.length > 0) {
 return (
 <div className="flex justify-start">
 <div className="max-w-[80%] rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/40 px-4 py-2 text-xs font-mono text-blue-800 dark:text-blue-300">
 <div className="text-blue-500 dark:text-blue-400 mb-1">calling tool(s)</div>
 {msg.toolCalls.map((tc, i) => (
 <div key={i}>
 {tc.name}({JSON.stringify(tc.args).slice(0, 200)})
 </div>
 ))}
 </div>
 </div>
 );
 }
 return (
 <div className="flex justify-start">
 <div className="max-w-[80%] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-800 dark:text-slate-200">
 {msg.text}
 </div>
 </div>
 );
}
