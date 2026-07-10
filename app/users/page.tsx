"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
 PageHeader,
 Card,
 Button,
 Badge,
 Input,
 Select,
 DataTable,
 Modal,
} from "@/components/ui";
import type { Column } from "@/components/ui";

type User = {
 _id: string;
 name: string;
 email: string;
 role: string;
 status: string;
 companyId: string;
 companyName?: string;
 lastActive?: string;
 createdAt: string;
};

type Company = {
 _id: string;
 name: string;
 code: string;
};

export default function UsersPage() {
 const router = useRouter();
 const [companies, setCompanies] = useState<Company[]>([]);
 const [allUsers, setAllUsers] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [filterCompany, setFilterCompany] = useState("");
 const [filterRole, setFilterRole] = useState("");
 const [filterStatus, setFilterStatus] = useState("");
 const [page, setPage] = useState(1);
 const [viewUser, setViewUser] = useState<User | null>(null);
 const perPage = 20;

 async function loadData() {
 setLoading(true);
 try {
 const compRes = await api.get("/admin/companies");
 const comps: Company[] = compRes.data.companies || [];
 setCompanies(comps);

 const userPromises = comps.map(async (c) => {
 try {
 const res = await api.get(`/admin/companies/${c._id}/users`);
 return (res.data.users || []).map((u: any) => ({
 ...u,
 companyId: c._id,
 companyName: c.name,
 }));
 } catch {
 return [];
 }
 });

 const results = await Promise.all(userPromises);
 setAllUsers(results.flat());
 } catch (err) {
 console.error("Failed to load data", err);
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 loadData();
 }, []);

 const filtered = useMemo(() => {
 let list = allUsers;
 if (search) {
 const q = search.toLowerCase();
 list = list.filter(
 (u) =>
 u.name.toLowerCase().includes(q) ||
 u.email.toLowerCase().includes(q)
 );
 }
 if (filterCompany) list = list.filter((u) => u.companyId === filterCompany);
 if (filterRole) list = list.filter((u) => u.role === filterRole);
 if (filterStatus) list = list.filter((u) => u.status === filterStatus);
 return list;
 }, [allUsers, search, filterCompany, filterRole, filterStatus]);

 const totalPages = Math.ceil(filtered.length / perPage);
 const paged = filtered.slice((page - 1) * perPage, page * perPage);

 const roles = useMemo(
 () => Array.from(new Set(allUsers.map((u) => u.role))).sort(),
 [allUsers]
 );

 async function resetPassword(userId: string) {
 if (!confirm("Send password reset for this user?")) return;
 try {
 await api.put(`/users/${userId}`, { passwordReset: true });
 alert("Password reset initiated.");
 } catch (err: any) {
 alert(
 `Failed: ${err.response?.data?.message || err.message}`
 );
 }
 }

 async function toggleStatus(user: User) {
 const newStatus = user.status === "active" ? "inactive" : "active";
 try {
 await api.put(`/users/${user._id}`, { status: newStatus });
 setAllUsers((prev) =>
 prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
 );
 } catch (err: any) {
 alert(
 `Failed: ${err.response?.data?.message || err.message}`
 );
 }
 }

 function exportCSV() {
 const headers = [
 "Name",
 "Email",
 "Role",
 "Company",
 "Status",
 "Created At",
 ];
 const rows = filtered.map((u) => [
 u.name,
 u.email,
 u.role,
 u.companyName || "",
 u.status,
 new Date(u.createdAt).toLocaleDateString(),
 ]);
 const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
 const blob = new Blob([csv], { type: "text/csv" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = "users_export.csv";
 a.click();
 URL.revokeObjectURL(url);
 }

 const roleBadge = (role: string) => {
 const colors: Record<string, string> = {
 admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
 super_admin: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
 manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
 employee: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
 hr: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
 };
 return colors[role] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
 };

 const columns: Column<User>[] = [
 {
 key: "name",
 header: "Name",
 render: (u) => (
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
 {u.name.charAt(0).toUpperCase()}
 </div>
 <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
 {u.name}
 </span>
 </div>
 ),
 },
 { key: "email", header: "Email", render: (u) => <span className="text-slate-600 dark:text-slate-400">{u.email}</span> },
 {
 key: "role",
 header: "Role",
 render: (u) => (
 <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(u.role)}`}>
 {u.role}
 </span>
 ),
 },
 { key: "company", header: "Company", render: (u) => u.companyName },
 {
 key: "status",
 header: "Status",
 render: (u) => (
 <Badge variant={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>
 ),
 },
 {
 key: "lastActive",
 header: "Last Active",
 render: (u) => (
 <span className="text-slate-500 dark:text-slate-400">
 {u.lastActive ? new Date(u.lastActive).toLocaleDateString() : "N/A"}
 </span>
 ),
 },
 {
 key: "actions",
 header: "Actions",
 render: (u) => (
 <div className="flex gap-2">
 <Button size="sm" variant="secondary" onClick={() => setViewUser(u)}>
 View
 </Button>
 <Button size="sm" variant="outline" onClick={() => resetPassword(u._id)}>
 Reset Pwd
 </Button>
 <Button
 size="sm"
 variant={u.status === "active" ? "danger" : "success"}
 onClick={() => toggleStatus(u)}
 >
 {u.status === "active" ? "Deactivate" : "Activate"}
 </Button>
 </div>
 ),
 },
 ];

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="All Users"
 description={`${filtered.length} users across ${companies.length} companies`}
 actions={<Button onClick={exportCSV}>Export CSV</Button>}
 />

 {/* Filters */}
 <Card>
 <div className="flex flex-col sm:flex-row gap-3">
 <Input
 type="search"
 placeholder="Search by name or email..."
 value={search}
 onChange={(e) => {
 setSearch(e.target.value);
 setPage(1);
 }}
 wrapperClassName="flex-1"
 />
 <Select
 value={filterCompany}
 onChange={(e) => {
 setFilterCompany(e.target.value);
 setPage(1);
 }}
 wrapperClassName="sm:w-48"
 >
 <option value="">All Companies</option>
 {companies.map((c) => (
 <option key={c._id} value={c._id}>
 {c.name}
 </option>
 ))}
 </Select>
 <Select
 value={filterRole}
 onChange={(e) => {
 setFilterRole(e.target.value);
 setPage(1);
 }}
 wrapperClassName="sm:w-40"
 >
 <option value="">All Roles</option>
 {roles.map((r) => (
 <option key={r} value={r}>
 {r}
 </option>
 ))}
 </Select>
 <Select
 value={filterStatus}
 onChange={(e) => {
 setFilterStatus(e.target.value);
 setPage(1);
 }}
 wrapperClassName="sm:w-40"
 >
 <option value="">All Statuses</option>
 <option value="active">Active</option>
 <option value="inactive">Inactive</option>
 </Select>
 </div>
 </Card>

 {/* Table */}
 <DataTable<User>
 columns={columns}
 data={paged}
 loading={loading}
 rowKey={(u) => u._id}
 emptyTitle="No users found"
 emptyDescription="Try adjusting your search or filters."
 />

 {/* Pagination */}
 {!loading && totalPages > 1 && (
 <div className="flex items-center justify-between">
 <p className="text-sm text-slate-500 dark:text-slate-400">
 Showing {(page - 1) * perPage + 1} -{" "}
 {Math.min(page * perPage, filtered.length)} of {filtered.length}
 </p>
 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 disabled={page <= 1}
 onClick={() => setPage((p) => p - 1)}
 >
 Previous
 </Button>
 <span className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
 {page} / {totalPages}
 </span>
 <Button
 variant="outline"
 size="sm"
 disabled={page >= totalPages}
 onClick={() => setPage((p) => p + 1)}
 >
 Next
 </Button>
 </div>
 </div>
 )}
 </div>

 {/* View User Modal */}
 {viewUser && (
 <Modal
 open
 onClose={() => setViewUser(null)}
 title="User Details"
 footer={
 <>
 <Button
 variant="outline"
 onClick={() => resetPassword(viewUser._id)}
 >
 Reset Password
 </Button>
 <Button
 variant={viewUser.status === "active" ? "danger" : "success"}
 onClick={() => {
 toggleStatus(viewUser);
 setViewUser(null);
 }}
 >
 {viewUser.status === "active" ? "Deactivate" : "Activate"}
 </Button>
 <Button variant="secondary" onClick={() => setViewUser(null)}>
 Close
 </Button>
 </>
 }
 >
 <div className="space-y-4">
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
 {viewUser.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
 {viewUser.name}
 </div>
 <div className="text-sm text-slate-500 dark:text-slate-400">{viewUser.email}</div>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
 Role
 </div>
 <span
 className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(
 viewUser.role
 )}`}
 >
 {viewUser.role}
 </span>
 </div>
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
 Status
 </div>
 <div className="mt-1">
 <Badge variant={viewUser.status === "active" ? "success" : "danger"}>
 {viewUser.status}
 </Badge>
 </div>
 </div>
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
 Company
 </div>
 <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
 {viewUser.companyName}
 </div>
 </div>
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
 Joined
 </div>
 <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
 {new Date(viewUser.createdAt).toLocaleDateString()}
 </div>
 </div>
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
 Last Active
 </div>
 <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
 {viewUser.lastActive
 ? new Date(viewUser.lastActive).toLocaleDateString()
 : "N/A"}
 </div>
 </div>
 </div>
 </div>
 </Modal>
 )}
 </Layout>
 );
}
