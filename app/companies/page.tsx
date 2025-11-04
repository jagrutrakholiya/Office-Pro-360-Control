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

const SERVICE_CATEGORIES = {
  "Core Features": ["tasks", "calendar", "attendance", "performance"],
  Management: ["users", "teams", "projects"],
  Administration: [
    "leave",
    "payroll",
    "roles",
    "statuses",
    "holidays",
    "overtime",
  ],
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

  async function loadCompanies() {
    try {
      const res = await api.get("/admin/companies");
      setCompanies(res.data.companies || []);
    } catch {}
  }

  async function loadPlans() {
    try {
      const res = await api.get("/admin/plans");
      setPlans(res.data.plans || []);
    } catch {}
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
        `Are you sure you want to delete "${name}"?\n\nThis will permanently delete:\n• The company\n• All users in this company\n• All company data (tasks, projects, attendance, etc.)\n\nThis action cannot be undone!`
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
    await api.patch(`/admin/companies/${id}/plan`, { plan });
    await loadCompanies();
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
              Manage companies, plans, and subscriptions
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
                  Plan
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Services
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
                    <select
                      defaultValue={c.plan}
                      onChange={(e) => changePlan(c._id, e.target.value)}
                      className="select-small"
                    >
                      <option value="starter">Starter</option>
                      <option value="growth">Growth</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">
                        {c.features
                          ? Object.values(c.features).filter(Boolean).length
                          : 0}
                      </span>
                      <span className="text-sm text-slate-500">features</span>
                    </div>
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadCompanyUsers(c._id)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        👥 View Users
                      </button>
                      <button
                        onClick={() => openEditServices(c)}
                        className="btn-primary-small"
                      >
                        ⚙️ Edit Services
                      </button>
                      <button
                        onClick={() => deleteCompany(c._id, c.name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Cards */}
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
                <span
                  className={`badge ${
                    c.status === "active"
                      ? "badge-active"
                      : c.status === "view_only"
                      ? "badge-view-only"
                      : "badge-suspended"
                  }`}
                >
                  <div
                    className={`status-dot ${
                      c.status === "active"
                        ? "status-dot-active"
                        : c.status === "suspended"
                        ? "status-dot-suspended"
                        : "status-dot-pending"
                    }`}
                  ></div>
                  {c.status}
                </span>
              </div>
              <div className="mobile-card-content">
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Plan</span>
                  <select
                    defaultValue={c.plan}
                    onChange={(e) => changePlan(c._id, e.target.value)}
                    className="select-small w-32"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Status</span>
                  <select
                    defaultValue={c.status}
                    onChange={(e) => changeStatus(c._id, e.target.value)}
                    className="select-small w-32"
                  >
                    <option value="active">Active</option>
                    <option value="view_only">View Only</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Services</span>
                  <span className="mobile-card-value">
                    {c.features
                      ? Object.values(c.features).filter(Boolean).length
                      : 0}{" "}
                    features
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => loadCompanyUsers(c._id)}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    👥 View Users
                  </button>
                  <button
                    onClick={() => openEditServices(c)}
                    className="w-full btn-primary-small"
                  >
                    ⚙️ Edit Services
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

      {/* Users Modal */}
      {viewingUsers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span>👥</span>
                    Company Users
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {companies.find((c) => c._id === viewingUsers)?.name || ""}{" "}
                    - {companyUsers.length} users
                  </p>
                </div>
                <button
                  onClick={() => {
                    setViewingUsers(null);
                    setCompanyUsers([]);
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="text-slate-600 font-medium">
                      Loading users...
                    </div>
                  </div>
                </div>
              ) : companyUsers.length > 0 ? (
                <div className="space-y-3">
                  {companyUsers.map((user) => (
                    <div
                      key={user._id}
                      className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 truncate">
                              {user.name}
                            </div>
                            <div className="text-sm text-slate-600 truncate">
                              {user.email}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="badge badge-pending text-xs">
                                {user.role}
                              </span>
                              <span
                                className={`badge text-xs ${
                                  user.status === "active"
                                    ? "badge-active"
                                    : "badge-suspended"
                                }`}
                              >
                                {user.status}
                              </span>
                              <span className="text-xs text-slate-500">
                                Joined:{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="text-lg font-medium">No users found</p>
                  <p className="text-sm mt-2">
                    This company doesn't have any users yet
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setViewingUsers(null);
                  setCompanyUsers([]);
                }}
                className="btn-secondary w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Services Section */}
      {editingId && (
        <div className="p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>⚙️</span>
                Edit Services / Features
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                {selectedCount} of {availableServices.length} services selected
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const allEnabled = Object.fromEntries(
                    availableServices.map((s) => [s.key, true])
                  );
                  setEditServices(allEnabled);
                }}
                className="btn-secondary-small"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setEditServices({})}
                className="btn-secondary-small"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              {Object.entries(categorizedServices).map(
                ([category, services]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                      <h5 className="text-sm font-bold text-slate-900">
                        {category}
                      </h5>
                      <span className="badge badge-pending text-2xs">
                        {services.length} services
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {services.map((svc) => (
                        <label
                          key={svc.key}
                          className="group flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300"
                        >
                          <input
                            type="checkbox"
                            checked={!!editServices[svc.key]}
                            onChange={(e) =>
                              setEditServices({
                                ...editServices,
                                [svc.key]: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-900 group-hover:text-blue-900">
                              {svc.label || svc.key}
                            </div>
                            {svc.description && (
                              <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {svc.description}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button onClick={saveEditServices} className="btn-primary">
              <span className="mr-2">💾</span>
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setEditServices({});
              }}
              className="btn-secondary"
            >
              <span className="mr-2">❌</span>
              Cancel
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
