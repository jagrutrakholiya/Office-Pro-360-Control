"use client";
import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";

/**
 * AI Audit page — super-admin observability over the AI assistant.
 *
 * Three sections:
 *   1. Headline cards (this month)
 *      - Total questions across all companies
 *      - Total tool calls
 *      - Active companies
 *      - Flagged conversations (heuristic)
 *   2. Top users + companies tables
 *   3. Conversation browser with filters (company, user, flag, search)
 *      and a "View" modal that shows the full message thread
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Audit</h1>
        <p className="text-sm text-slate-600 mt-1">
          Watch how every company is using the AI assistant. Flagged conversations are heuristic
          matches for sensitive-data probes — review them and act if needed. The actual lockdown
          (who can read what) is enforced in the tool executor.
        </p>
      </div>

      {/* ── Headline cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card label="Questions this month" value={summary?.totals.questions ?? "—"} sub="Across all companies" />
        <Card label="Tool calls" value={summary?.totals.toolCalls ?? "—"} sub="DB lookups via the LLM" />
        <Card label="Active companies" value={summary?.totals.companiesActive ?? "—"} sub="Used the AI this month" />
        <Card
          label="Flagged conversations"
          value={summary?.audit.flaggedConversations ?? "—"}
          sub={`Scanned latest ${summary?.audit.scannedConversations ?? "—"}`}
          tone={(summary?.audit.flaggedConversations || 0) > 0 ? "warn" : "neutral"}
        />
      </div>

      {/* Flag breakdown chips */}
      {summary && summary.audit.flaggedConversations > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 mb-2">
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
                className="px-3 py-1 rounded-full border border-amber-300 bg-white text-xs font-medium text-amber-900 hover:bg-amber-100"
              >
                {flagLabels[flag] || flag} <span className="text-amber-600">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Top users + companies (side by side) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Top Users (this month)</h3>
          </div>
          {!summary || summary.topUsers.length === 0 ? (
            <div className="p-6 text-sm text-slate-400 text-center">No usage yet.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">User</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Company</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Qs</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">% cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.topUsers.slice(0, 10).map((u) => (
                  <tr key={u.userId} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-sm">
                      <div className="font-medium text-slate-900">{u.userName}</div>
                      <div className="text-xs text-slate-500">
                        {u.userRole} · {u.userEmail}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-700">{u.companyName}</td>
                    <td className="px-4 py-2 text-sm text-right tabular-nums font-semibold text-slate-900">
                      {u.questions}
                    </td>
                    <td className="px-4 py-2 text-sm text-right tabular-nums">
                      <PctBar pct={u.pctOfCap} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-5 py-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Top Companies (this month)</h3>
          </div>
          {!summary || summary.byCompany.length === 0 ? (
            <div className="p-6 text-sm text-slate-400 text-center">No usage yet.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Company</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Questions</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Tool calls</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">% cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.byCompany.slice(0, 10).map((c) => (
                  <tr key={c.companyId} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-sm font-medium text-slate-900">{c.companyName}</td>
                    <td className="px-4 py-2 text-sm text-right tabular-nums font-semibold text-slate-900">
                      {c.questions}
                    </td>
                    <td className="px-4 py-2 text-sm text-right tabular-nums text-slate-700">{c.toolCalls}</td>
                    <td className="px-4 py-2 text-sm text-right tabular-nums">
                      <PctBar pct={c.pctOfCap} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Conversation browser ─────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-900 flex-1">Conversations</h3>
          <input
            placeholder="Search title or message text…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
          <select
            value={flagFilter}
            onChange={(e) => {
              setFlagFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            <option value="">All flags</option>
            {(summary?.audit.patterns || []).map((p) => (
              <option key={p.flag} value={p.flag}>
                {p.label}
              </option>
            ))}
          </select>
          {(search || flagFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setFlagFilter("");
                setPage(1);
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline"
            >
              Clear
            </button>
          )}
        </div>

        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">When</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">User</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Company</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">First Message</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Flags</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-slate-600 uppercase">Msgs</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {convoLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : convos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">
                  No conversations match.
                </td>
              </tr>
            ) : (
              convos.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(c.updatedAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-slate-900">{c.userName}</div>
                    <div className="text-xs text-slate-500">{c.userRole}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{c.companyName}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate" title={c.firstMessage}>
                    {c.firstMessage || <em className="text-slate-400">empty</em>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.flags.length === 0 ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        c.flags.map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"
                          >
                            {flagLabels[f] || f}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-slate-700">{c.messageCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openDetail(c.id)}
                      className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-sm">
            <div className="text-slate-600">
              Page {page} of {totalPages} · {total} total
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  {detail.companyName} · {detail.userName} ({detail.userRole})
                </div>
                <h2 className="text-lg font-bold text-slate-900">{detail.title}</h2>
                {detail.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {detail.flags.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"
                      >
                        {flagLabels[f] || f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 text-xl">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {detail.messages.map((m, i) => (
                <Message key={i} msg={m} />
              ))}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDetail(null)}
                className="px-4 py-2 rounded-md border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {detailLoading && !detail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-sm text-slate-600">Loading conversation…</div>
        </div>
      )}
    </Layout>
  );
}

// ─── tiny presentational helpers ────────────────────────────────────────────

function Card({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number | string;
  sub: string;
  tone?: "warn" | "neutral";
}) {
  const styles =
    tone === "warn"
      ? { bg: "bg-amber-50 border-amber-200", value: "text-amber-700" }
      : { bg: "bg-white border-slate-200", value: "text-slate-900" };
  return (
    <div className={`rounded-lg border p-5 ${styles.bg}`}>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
      <div className={`mt-2 text-2xl font-bold tabular-nums ${styles.value}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function PctBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const tone = clamped >= 90 ? "bg-red-500" : clamped >= 70 ? "bg-amber-500" : "bg-slate-900";
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs text-slate-600 w-10 text-right">{clamped}%</span>
    </div>
  );
}

function Message({ msg }: { msg: ConversationDetail["messages"][number] }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg bg-slate-900 text-white px-4 py-2 text-sm">{msg.text}</div>
      </div>
    );
  }
  if (msg.role === "tool") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-lg bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-mono text-slate-700">
          <div className="text-slate-500 mb-1">tool: {msg.name}</div>
          <pre className="whitespace-pre-wrap break-words">
            {typeof msg.result === "string" ? msg.result : JSON.stringify(msg.result, null, 2).slice(0, 600)}
          </pre>
        </div>
      </div>
    );
  }
  // assistant
  if (msg.toolCalls && msg.toolCalls.length > 0) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-xs font-mono text-blue-800">
          <div className="text-blue-500 mb-1">calling tool(s)</div>
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
      <div className="max-w-[80%] rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm text-slate-800">
        {msg.text}
      </div>
    </div>
  );
}
