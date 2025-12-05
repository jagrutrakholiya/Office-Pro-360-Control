"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import api from "../../lib/api";

type Company = {
  _id: string;
  name: string;
  code: string;
  plan: string;
  status: string;
  createdAt: string;
  features?: Record<string, boolean>;
  analytics?: {
    users: { total: number; active: number };
    documents: { count: number; storageMB: string; storageGB: string };
    expenses: { count: number };
    tasks: { count: number };
  };
};

type Plan = { _id: string; name: string; code: string };
type CompanyUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

type Service = { key: string; label: string; description: string };

// ... existing SERVICE_CATEGORIES...
const SERVICE_CATEGORIES = {
  "Core Features": ["tasks", "calendar", "attendance", "performance"],
  Management: ["users", "teams", "projects"],
  Administration: ["leave", "payroll", "roles", "statuses", "holidays", "overtime"],
  "Office Management": ["offices", "shifts"],
  Communication: ["chat", "messages"],
  Personal: ["profile", "settings"],
};

export default function CompaniesPage() {
  const router = useRouter();
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editServices, setEditServices] = useState<Record<string, boolean>>({});
  const [viewingUsers, setViewingUsers] = useState<string | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string>("");
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  async function loadCompanies() {
    try {
      setLoadingAnalytics(true);
      // Try to load with analytics first
      const res = await api.get("/companies/analytics");
      setCompanies(res.data.companies || []);
    } catch {
      // Fallback to regular endpoint
      try {
        const res = await api.get("/admin/companies");
        setCompanies(res.data.companies || []);
      } catch {}
    } finally {
      setLoadingAnalytics(false);
    }
  }

  async function exportCompanyData(companyId: string, companyName: string, format: string = 'json') {
    try {
      const res = await api.get(`/companies/${companyId}/export?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Download CSV
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${companyName}_data.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Download JSON
        const dataStr = JSON.stringify(res.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `${companyName}_data.json`);
        link.click();
      }
      
      alert(`Exported ${companyName} data as ${format.toUpperCase()}`);
    } catch (err: any) {
      alert(`Failed to export: ${err.response?.data?.message || err.message}`);
    }
  }

  // ... existing loadPlans function ...
  async function loadPlans() {
    setPlansLoading(true);
    setPlansError("");
    try {
      const res = await api.get("/admin/plans");
      setPlans(res.data.plans || []);
    } catch (err: any) {
      console.error("Failed to load plans", err);
      setPlansError("Failed to load plans. Plan changes are disabled.");
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
    loadPlans();
    api
      .get("/public/services")
      .then(({ data }) => {
        setAvailableServices(data?.services || []);
      })
      .catch(() => {
        setAvailableServices([]);
      });
  }, []);

  // ... rest of existing functions (getServicesByCategory, openEditServices, saveEditServices, changeStatus, deleteCompany, changePlan, loadCompanyUsers) ...

  const getServicesByCategory = () => {
    const categorized: Record<string, Service[]> = {};
    availableServices.forEach((svc) => {
      for (const [category, keys] of Object.entries(SERVICE_CATEGORIES)) {
        if (keys.includes(svc.key)) {
          if (!categorized[category]) categorized[category] = [];
          categorized[category].push(svc);
          return;
        }
      }
      if (!categorized["Other"]) categorized["Other"] = [];
      categorized["Other"].push(svc);
    });
    return categorized;
  };

  const openEditServices = (c: Company) => {
    setEditingId(c._id);
    const current = (c.features || {}) as Record<string, boolean>;
    setEditServices({ ...current });
  };

  const saveEditServices = async () => {
    if (!editingId) return;
    await api.patch(`/admin/companies/${editingId}/features`, {
      features: Object.fromEntries(
        Object.entries(editServices).filter(([_, v]) => v)
      ),
    });
    setEditingId(null);
    setEditServices({});
    await loadCompanies();
  };

  async function changeStatus(id: string, status: string) {
    await api.patch(`/admin/companies/${id}/status`, { status });
    loadCompanies();
  }

  async function deleteCompany(id: string, name: string) {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"?\\n\\nThis will permanently delete:\\n• The company\\n• All users in this company\\n• All company data (tasks, projects, attendance, etc.)\\n\\nThis action cannot be undone!`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/admin/companies/${id}`);
      alert(`Successfully deleted company and ${res.data.deleted.users} users`);
      loadCompanies();
    } catch (err: any) {
      alert(
        `Failed to delete company: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  }

  async function changePlan(id: string, plan: string) {
    try {
      await api.patch(`/admin/companies/${id}/plan`, { plan });
      await loadCompanies();
    } catch (err: any) {
      console.error("Failed to change plan", err);
      alert(
        `Failed to change plan: ${err?.response?.data?.message || err?.message || "Unknown error"}`
      );
      await loadCompanies();
    }
  }

  async function loadCompanyUsers(companyId: string) {
    setLoadingUsers(true);
    try {
      const res = await api.get(`/admin/companies/${companyId}/users`);
      setCompanyUsers(res.data.users || []);
      setViewingUsers(companyId);
    } catch (err) {
      console.error("Failed to load users:", err);
      alert("Failed to load company users");
    } finally {
      setLoadingUsers(false);
    }
  }

  const categorizedServices = getServicesByCategory();
  const selectedCount = editingId
    ? Object.values(editServices).filter(Boolean).length
    : 0;

  return (
    <Layout>
      <div className="section-header">
        <div className="section-actions">
          <div>
            <h2 className="section-title">Companies</h2>
            <p className="section-subtitle">
              Manage companies, plans, and storage
            </p>
          </div>
          <button
            onClick={() => router.push("/companies/new")}
            className="btn-primary"
          >
            <span className="mr-2">+</span>
            Add New Company
          </button>
        </div>
      </div>

      <section className="table-wrapper">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h3 className="text-lg font-bold text-slate-900">
                All Companies
              </h3>
              <span className="badge badge-pending">
                {companies.length} total
              </span>
              {loadingAnalytics && <span className="text-sm text-slate-500">Loading analytics...</span>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="search"
                placeholder="Search companies..."
                className="input-small w-full sm:w-64"
              />
              <button className="btn-secondary-small">🔍</button>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block table-responsive">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Company
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Storage
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Users
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Plan
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => (
                <tr key={c._id} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {c.name}
                        </div>
                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {c.code}
                        </code>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.analytics ? (
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {c.analytics.documents.storageMB} MB
                        </div>
                        <div className="text-xs text-slate-500">
                          {c.analytics.documents.count} docs
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.analytics ? (
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {c.analytics.users.total}
                        </div>
                        <div className="text-xs text-slate-500">
                          {c.analytics.users.active} active
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      defaultValue={c.plan}
                      onChange={(e) => changePlan(c._id, e.target.value)}
                      className="select-small"
                      disabled={plansLoading || plans.length === 0}
                    >
                      {plans.length > 0 ? (
                        plans.map((p) => (
                          <option key={p._id} value={p.code}>
                            {p.name}
                          </option>
                        ))
                      ) : (
                        <option value={c.plan}>{c.plan}</option>
                      )}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      defaultValue={c.status}
                      onChange={(e) => changeStatus(c._id, e.target.value)}
                      className="select-small"
                    >
                      <option value="active">Active</option>
                      <option value="view_only">View Only</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => loadCompanyUsers(c._id)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        👥
                      </button>
                      <button
                        onClick={() => exportCompanyData(c._id, c.name, 'csv')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        title="Export CSV"
                      >
                        📊 CSV
                      </button>
                      <button
                        onClick={() => exportCompanyData(c._id, c.name, 'json')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        title="Export JSON"
                      >
                        💾 JSON
                      </button>
                      <button
                        onClick={() => deleteCompany(c._id, c.name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        🗑️
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
          {companies.map((c) => (
            <div key={c._id} className="mobile-card">
              <div className="mobile-card-header">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{c.name}</h4>
                    <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {c.code}
                    </code>
                  </div>
                </div>
              </div>
              <div className="mobile-card-content">
                {c.analytics && (
                  <>
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Storage</span>
                      <span className="mobile-card-value">
                        {c.analytics.documents.storageMB} MB ({c.analytics.documents.count} docs)
                      </span>
                    </div>
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Users</span>
                      <span className="mobile-card-value">
                        {c.analytics.users.total} ({c.analytics.users.active} active)
                      </span>
                    </div>
                  </>
                )}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => exportCompanyData(c._id, c.name, 'csv')}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      📊 Export CSV
                    </button>
                    <button
                      onClick={() => exportCompanyData(c._id, c.name, 'json')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      💾 Export JSON
                    </button>
                  </div>
                  <button
                    onClick={() => loadCompanyUsers(c._id)}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    👥 View Users
                  </button>
                  <button
                    onClick={() => deleteCompany(c._id, c.name)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    🗑️ Delete Company
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Users Modal - Keep existing implementation */}
      {viewingUsers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {/* Existing users modal code... */}
        </div>
      )}

      {/* Edit Services Section - Keep existing implementation */}
      {editingId && (
        <div className="p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          {/* Existing edit services code... */}
        </div>
      )}
    </Layout>
  );
}
