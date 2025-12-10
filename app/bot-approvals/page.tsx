"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";

type BotRequest = {
  _id: string;
  tenantId: string;
  requestedBy: string;
  requestedByName?: string;
  createdAt: string;
  status: string;
  companyId?: {
    _id: string;
    name: string;
  };
};

type Company = {
  _id: string;
  name: string;
  code: string;
};

export default function BotApprovalsPage() {
  const [requests, setRequests] = useState<BotRequest[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [setupToken, setSetupToken] = useState("");
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRequests();
    loadCompanies();
  }, []);

  async function loadRequests() {
    setLoading(true);
    try {
      const res = await api.get("/teams-bot/admin/pending-requests");
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanies() {
    try {
      const res = await api.get("/admin/companies");
      setCompanies(res.data.companies || []);
    } catch (err) {
      console.error("Failed to load companies:", err);
    }
  }

  async function approveRequest(requestId: string) {
    if (!selectedCompany) {
      alert("Please select a company first");
      return;
    }

    setApprovingId(requestId);
    try {
      const res = await api.post(`/teams-bot/admin/approve/${requestId}`, {
        companyId: selectedCompany,
      });

      setSetupToken(res.data.setupToken);
      setTokenExpiry(new Date(res.data.tokenExpiry));

      alert("✅ Approved! Share the setup token with the requester (shown below).");
      await loadRequests();
    } catch (err: any) {
      alert(
        `Failed to approve: ${err?.response?.data?.message || err?.message}`
      );
      setApprovingId(null);
    }
  }

  async function rejectRequest(requestId: string) {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    try {
      await api.post(`/teams-bot/admin/reject/${requestId}`, { reason });
      alert("✅ Request rejected");
      await loadRequests();
    } catch (err: any) {
      alert(
        `Failed to reject: ${err?.response?.data?.message || err?.message}`
      );
    }
  }

  function copyToken() {
    navigator.clipboard.writeText(setupToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const getMinutesRemaining = () => {
    if (!tokenExpiry) return 0;
    const now = new Date().getTime();
    const expiry = tokenExpiry.getTime();
    const diff = expiry - now;
    return Math.max(0, Math.floor(diff / 60000));
  };

  return (
    <Layout>
      <div className="section-header">
        <div className="section-actions">
          <div>
            <h2 className="section-title">🤖 Bot Installation Approvals</h2>
            <p className="section-subtitle">
              Approve or reject Microsoft Teams bot installation requests
            </p>
          </div>
        </div>
      </div>

      {/* Setup Token Display */}
      {setupToken && approvingId && (
        <div className="mb-6 p-6 border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">
                Bot Approved! Setup Token Generated
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Share this token with the requester. They must enter it in Teams
                within{" "}
                <strong className="text-red-600">
                  {getMinutesRemaining()} minutes
                </strong>
                .
              </p>

              <div className="flex gap-2 mb-3">
                <code className="flex-1 bg-white px-4 py-3 rounded-lg font-mono text-sm text-slate-900 border border-green-300 select-all">
                  {setupToken}
                </code>
                <button
                  onClick={copyToken}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-green-700">
                <span>⏱️</span>
                <span>
                  Expires at: {tokenExpiry?.toLocaleTimeString()} (
                  {getMinutesRemaining()} min remaining)
                </span>
              </div>

              <button
                onClick={() => {
                  setSetupToken("");
                  setTokenExpiry(null);
                  setApprovingId(null);
                  setSelectedCompany("");
                }}
                className="mt-4 text-sm text-green-700 hover:text-green-900 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="table-wrapper">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-900">
              Pending Requests
            </h3>
            <span className="badge badge-pending">{requests.length} pending</span>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-lg font-medium text-slate-900">
                No Pending Requests
              </p>
              <p className="text-sm text-slate-500 mt-2">
                All bot installation requests have been processed
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Tenant Info
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Requested By
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Assign Company
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req._id} className="table-row">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {req.tenantId.substring(0, 24)}...
                        </div>
                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {req.tenantId}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {req.requestedByName || "Unknown"}
                      </div>
                      <div className="text-xs text-slate-500">
                        ID: {req.requestedBy.substring(0, 16)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(req.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="select-small w-full max-w-xs"
                      >
                        <option value="">Select company...</option>
                        {companies.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveRequest(req._id)}
                          disabled={!selectedCompany}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => rejectRequest(req._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>User installs bot in their Teams → Creates pending request</li>
              <li>You approve & assign to correct company → Setup token generated</li>
              <li>Share token with user (15-min expiry)</li>
              <li>User enters token in Teams → Bot activates</li>
              <li>Employees can then connect freely (no approval needed)</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}
