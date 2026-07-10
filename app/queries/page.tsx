"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
 PageHeader,
 StatCard,
 Badge,
 Button,
 DataTable,
 Column,
 Modal,
 Textarea,
} from "@/components/ui";
import api from "../../lib/api";

// userId / companyId / resolvedBy are Mongoose populate() results. They come
// back as `null` when the referenced document was deleted (user/company
// off-boarded, orphaned query). The page must never assume they're present —
// a deleted user used to crash the entire /queries route with
// `Cannot read properties of null (reading 'name')` before this type change
// made the nullability explicit and we null-guarded every access.
type Query = {
 _id: string;
 userId: {
 _id: string;
 name: string;
 email: string;
 role: string;
 } | null;
 companyId: {
 _id: string;
 name: string;
 code: string;
 } | null;
 subject: string;
 description: string;
 screenshot: string | null;
 status: "new" | "in_progress" | "resolved" | "closed";
 priority: "low" | "medium" | "high" | "critical";
 adminNotes: string;
 createdAt: string;
 resolvedAt: string | null;
 resolvedBy: {
 name: string;
 email: string;
 } | null;
};

type Stats = {
 new: number;
 in_progress: number;
 resolved: number;
 closed: number;
};

type BadgeVariant = "default" | "neutral" | "success" | "warning" | "danger" | "info";

export default function QueriesPage() {
 const [queries, setQueries] = useState<Query[]>([]);
 const [stats, setStats] = useState<Stats>({
 new: 0,
 in_progress: 0,
 resolved: 0,
 closed: 0,
 });
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState<string>("all");
 const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
 const [updatingStatus, setUpdatingStatus] = useState(false);
 const [adminNotes, setAdminNotes] = useState("");

 async function loadQueries() {
 setLoading(true);
 try {
 const params: any = {};
 if (filter !== "all") {
 params.status = filter;
 }

 const res = await api.get("/queries/all", { params });
 setQueries(res.data.queries || []);
 setStats(
 res.data.stats || { new: 0, in_progress: 0, resolved: 0, closed: 0 }
 );
 } catch (error) {
 console.error("Failed to load queries:", error);
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 loadQueries();
 }, [filter]);

 async function updateQueryStatus(
 queryId: string,
 newStatus: string,
 newPriority?: string
 ) {
 setUpdatingStatus(true);
 try {
 const payload: any = { status: newStatus };
 if (adminNotes) payload.adminNotes = adminNotes;
 if (newPriority) payload.priority = newPriority;

 await api.patch(`/queries/${queryId}/status`, payload);
 await loadQueries();

 // Update selected query if it's the one being updated
 if (selectedQuery && selectedQuery._id === queryId) {
 const updated = queries.find((q) => q._id === queryId);
 if (updated) {
 setSelectedQuery({ ...updated, status: newStatus as any });
 }
 }

 setAdminNotes("");
 alert("Query updated successfully!");
 } catch (error: any) {
 console.error("Failed to update query:", error);
 alert(
 `Failed to update: ${error.response?.data?.message || error.message}`
 );
 } finally {
 setUpdatingStatus(false);
 }
 }

 const getPriorityVariant = (priority: string): BadgeVariant => {
 switch (priority) {
 case "low":
 return "success";
 case "medium":
 return "info";
 case "high":
 return "warning";
 case "critical":
 return "danger";
 default:
 return "neutral";
 }
 };

 const getStatusVariant = (status: string): BadgeVariant => {
 switch (status) {
 case "new":
 return "warning";
 case "in_progress":
 return "info";
 case "resolved":
 return "success";
 case "closed":
 return "neutral";
 default:
 return "warning";
 }
 };

 const columns: Column<Query>[] = [
 {
 key: "priority",
 header: "Priority",
 render: (query) => (
 <Badge variant={getPriorityVariant(query.priority)}>{query.priority}</Badge>
 ),
 },
 {
 key: "subject",
 header: "Subject",
 render: (query) => (
 <div className="font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
 {query.subject}
 </div>
 ),
 },
 {
 key: "user",
 header: "User",
 render: (query) => (
 <div>
 <div className="font-medium text-slate-900 dark:text-slate-100">
 {query.userId?.name ?? <span className="italic text-slate-400 dark:text-slate-500">(deleted user)</span>}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400">
 {query.userId?.email ?? "—"}
 </div>
 </div>
 ),
 },
 {
 key: "company",
 header: "Company",
 render: (query) => (
 <div>
 <div className="font-medium text-slate-900 dark:text-slate-100">
 {query.companyId?.name ?? <span className="italic text-slate-400 dark:text-slate-500">(deleted company)</span>}
 </div>
 {query.companyId?.code && (
 <code className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
 {query.companyId.code}
 </code>
 )}
 </div>
 ),
 },
 {
 key: "status",
 header: "Status",
 render: (query) => (
 <Badge variant={getStatusVariant(query.status)}>{query.status.replace("_", " ")}</Badge>
 ),
 },
 {
 key: "created",
 header: "Created",
 render: (query) => (
 <div>
 <div className="text-sm text-slate-600 dark:text-slate-300">
 {new Date(query.createdAt).toLocaleDateString()}
 </div>
 <div className="text-xs text-slate-500 dark:text-slate-400">
 {new Date(query.createdAt).toLocaleTimeString()}
 </div>
 </div>
 ),
 },
 {
 key: "actions",
 header: "Actions",
 render: (query) => (
 <Button
 size="sm"
 variant="outline"
 onClick={() => {
 setSelectedQuery(query);
 setAdminNotes(query.adminNotes || "");
 }}
 >
 View Details
 </Button>
 ),
 },
 ];

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="User Queries & Issues"
 description="Manage and resolve user-reported issues"
 />

 {/* Stats Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard label="New Issues" value={stats.new} accent="danger" />
 <StatCard label="In Progress" value={stats.in_progress} accent="primary" />
 <StatCard label="Resolved" value={stats.resolved} accent="success" />
 <StatCard label="Closed" value={stats.closed} accent="neutral" />
 </div>

 {/* Filter Tabs */}
 <div className="flex flex-wrap gap-2">
 {[
 { key: "all", label: "All Queries", count: queries.length },
 { key: "new", label: "New", count: stats.new },
 { key: "in_progress", label: "In Progress", count: stats.in_progress },
 { key: "resolved", label: "Resolved", count: stats.resolved },
 { key: "closed", label: "Closed", count: stats.closed },
 ].map((tab) => (
 <Button
 key={tab.key}
 size="sm"
 variant={filter === tab.key ? "primary" : "outline"}
 onClick={() => setFilter(tab.key)}
 >
 {tab.label} ({tab.count})
 </Button>
 ))}
 </div>

 {/* Queries Table */}
 <DataTable<Query>
 columns={columns}
 data={queries}
 loading={loading}
 rowKey={(q) => q._id}
 emptyTitle="No queries found"
 emptyDescription={
 filter === "all"
 ? "No user queries have been submitted yet"
 : `No ${filter.replace("_", " ")} queries found`
 }
 />

 {/* Query Detail Modal */}
 <Modal
 open={!!selectedQuery}
 onClose={() => setSelectedQuery(null)}
 title={selectedQuery?.subject}
 size="lg"
 footer={
 <Button variant="secondary" onClick={() => setSelectedQuery(null)}>
 Close
 </Button>
 }
 >
 {selectedQuery && (
 <div className="space-y-6">
 {/* Meta */}
 <div>
 <div className="flex items-center gap-2 mb-2">
 <Badge variant={getPriorityVariant(selectedQuery.priority)}>
 {selectedQuery.priority}
 </Badge>
 <Badge variant={getStatusVariant(selectedQuery.status)}>
 {selectedQuery.status.replace("_", " ")}
 </Badge>
 </div>
 <p className="text-sm text-slate-600 dark:text-slate-400">
 Reported by{" "}
 <strong>{selectedQuery.userId?.name ?? "(deleted user)"}</strong>
 {selectedQuery.userId?.email ? ` (${selectedQuery.userId.email})` : ""}
 {" "}from{" "}
 <strong>{selectedQuery.companyId?.name ?? "(deleted company)"}</strong>
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 {new Date(selectedQuery.createdAt).toLocaleString()}
 </p>
 </div>

 {/* Description */}
 <div>
 <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
 Description
 </h4>
 <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
 {selectedQuery.description}
 </div>
 </div>

 {/* Screenshot */}
 {selectedQuery.screenshot && (
 <div>
 <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
 Screenshot
 </h4>
 <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
 <img
 src={selectedQuery.screenshot}
 alt="Issue screenshot"
 className="w-full h-auto"
 />
 </div>
 </div>
 )}

 {/* Admin Notes */}
 <Textarea
 label="Admin Notes"
 value={adminNotes}
 onChange={(e) => setAdminNotes(e.target.value)}
 placeholder="Add notes about this query..."
 rows={4}
 />

 {/* Status Update */}
 <div>
 <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
 Update Status
 </h4>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {["new", "in_progress", "resolved", "closed"].map((status) => (
 <Button
 key={status}
 fullWidth
 variant={selectedQuery.status === status ? "primary" : "outline"}
 onClick={() => updateQueryStatus(selectedQuery._id, status)}
 disabled={updatingStatus || selectedQuery.status === status}
 >
 {status.replace("_", " ").toUpperCase()}
 </Button>
 ))}
 </div>
 </div>

 {/* Resolution Info */}
 {selectedQuery.resolvedAt && selectedQuery.resolvedBy && (
 <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
 <h4 className="text-sm font-semibold text-success-900 dark:text-success-300 mb-1">
 Resolved
 </h4>
 <p className="text-sm text-success-700 dark:text-success-400">
 Resolved by{" "}
 <strong>{selectedQuery.resolvedBy?.name ?? "(deleted admin)"}</strong>{" "}
 on {new Date(selectedQuery.resolvedAt).toLocaleString()}
 </p>
 </div>
 )}
 </div>
 )}
 </Modal>
 </div>
 </Layout>
 );
}
