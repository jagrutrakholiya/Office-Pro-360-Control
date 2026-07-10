"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  DataTable,
  Button,
  Badge,
  Select,
} from "@/components/ui";

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

      alert(" Approved! Share the setup token with the requester (shown below).");
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
      alert(" Request rejected");
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
      <div className="space-y-6">
        <PageHeader
          title="Bot Installation Approvals"
          description="Approve or reject Microsoft Teams bot installation requests"
        />

        {/* Setup Token Display */}
        {setupToken && approvingId && (
          <Card
            padding="lg"
            className="border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-success-900 dark:text-success-200 mb-2">
                  Bot Approved! Setup Token Generated
                </h3>
                <p className="text-sm text-success-700 dark:text-success-300 mb-4">
                  Share this token with the requester. They must enter it in
                  Teams within{" "}
                  <strong className="text-danger-600 dark:text-danger-400">
                    {getMinutesRemaining()} minutes
                  </strong>
                  .
                </p>

                <div className="flex gap-2 mb-3">
                  <code className="flex-1 bg-white dark:bg-slate-900 px-4 py-3 rounded-lg font-mono text-sm text-slate-900 dark:text-slate-100 border border-success-300 dark:border-success-700 select-all break-all">
                    {setupToken}
                  </code>
                  <Button variant="success" onClick={copyToken}>
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-success-700 dark:text-success-300">
                  <span>⏱</span>
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
                  className="mt-4 text-sm text-success-700 dark:text-success-300 hover:text-success-900 dark:hover:text-success-100 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </Card>
        )}

        <Card padding="none">
          <CardHeader className="flex-row items-center gap-2 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <CardTitle>Pending Requests</CardTitle>
            <Badge variant="warning">{requests.length} pending</Badge>
          </CardHeader>

          <DataTable
            loading={loading}
            data={requests}
            rowKey={(req) => req._id}
            emptyTitle="No Pending Requests"
            emptyDescription="All bot installation requests have been processed"
            columns={[
              {
                key: "tenant",
                header: "Tenant Info",
                render: (req) => (
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {req.tenantId.substring(0, 24)}...
                    </div>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                      {req.tenantId}
                    </code>
                  </div>
                ),
              },
              {
                key: "requestedBy",
                header: "Requested By",
                render: (req) => (
                  <div>
                    <div className="text-sm text-slate-900 dark:text-slate-100">
                      {req.requestedByName || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      ID: {req.requestedBy.substring(0, 16)}...
                    </div>
                  </div>
                ),
              },
              {
                key: "date",
                header: "Date",
                render: (req) => (
                  <div>
                    <div className="text-sm text-slate-900 dark:text-slate-100">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(req.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ),
              },
              {
                key: "company",
                header: "Assign Company",
                render: () => (
                  <Select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="max-w-xs"
                  >
                    <option value="">Select company...</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </Select>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (req) => (
                  <div className="flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => approveRequest(req._id)}
                      disabled={!selectedCompany}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => rejectRequest(req._id)}
                    >
                      Reject
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-sm text-primary-900 dark:text-primary-200">
              <p className="font-semibold mb-2">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-primary-800 dark:text-primary-300">
                <li>User installs bot in their Teams → Creates pending request</li>
                <li>You approve & assign to correct company → Setup token generated</li>
                <li>Share token with user (15-min expiry)</li>
                <li>User enters token in Teams → Bot activates</li>
                <li>Employees can then connect freely (no approval needed)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
