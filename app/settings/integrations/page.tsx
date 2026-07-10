"use client";

import { useState, useEffect } from "react";
import {
 PageHeader,
 StatCard,
 Card,
 CardTitle,
 CardDescription,
 Button,
 Badge,
 EmptyState,
 Skeleton,
} from "@/components/ui";

interface Integration {
 _id: string;
 name: string;
 displayName: string;
 description: string;
 status: string;
 icon: string;
 stats?: {
 totalCalls: number;
 successfulCalls: number;
 lastUsed?: string;
 };
}

const availableIntegrations = [
 { name: "slack", displayName: "Slack", icon: "", description: "Team messaging and collaboration" },
 { name: "email", displayName: "Email", icon: "", description: "SMTP email integration" },
 { name: "calendar", displayName: "Calendar", icon: "", description: "Google Calendar sync" },
 { name: "github", displayName: "GitHub", icon: "", description: "Code repository integration" },
 { name: "webhook", displayName: "Webhook", icon: "", description: "Custom webhook integration" },
];

export default function IntegrationsPage() {
 const [integrations, setIntegrations] = useState<Integration[]>([]);
 const [loading, setLoading] = useState(true);
 const [showAddModal, setShowAddModal] = useState(false);

 useEffect(() => {
 fetchIntegrations();
 }, []);

 const fetchIntegrations = async () => {
 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/integrations`,
 {
 headers: { Authorization: `Bearer ${token}` },
 }
 );

 if (response.ok) {
 const data = await response.json();
 setIntegrations(data.data || []);
 }
 } catch (error) {
 console.error("Error fetching integrations:", error);
 } finally {
 setLoading(false);
 }
 };

 const testIntegration = async (id: string) => {
 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/integrations/${id}/test`,
 {
 method: "POST",
 headers: { Authorization: `Bearer ${token}` },
 }
 );

 if (response.ok) {
 alert("Integration test successful!");
 fetchIntegrations();
 }
 } catch (error) {
 console.error("Error testing integration:", error);
 alert("Integration test failed");
 }
 };

 const deleteIntegration = async (id: string) => {
 if (!confirm("Are you sure you want to delete this integration?")) return;

 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/integrations/${id}`,
 {
 method: "DELETE",
 headers: { Authorization: `Bearer ${token}` },
 }
 );

 if (response.ok) {
 fetchIntegrations();
 }
 } catch (error) {
 console.error("Error deleting integration:", error);
 alert("Failed to delete integration");
 }
 };

 const statusVariant = (status: string): "success" | "neutral" | "danger" | "warning" => {
 const variants: Record<string, "success" | "neutral" | "danger" | "warning"> = {
 active: "success",
 inactive: "neutral",
 error: "danger",
 pending: "warning",
 };
 return variants[status] || "neutral";
 };

 return (
 <div className="p-6 space-y-6">
 <PageHeader
 title="Integrations"
 description="Connect third-party services to enhance your workflow"
 breadcrumbs={[
 { label: "Settings", href: "/settings" },
 { label: "Integrations" },
 ]}
 actions={
 <Button onClick={() => setShowAddModal(true)}>Add Integration</Button>
 }
 />

 {/* Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <StatCard label="Total Integrations" value={integrations.length} accent="neutral" />
 <StatCard
 label="Active"
 value={integrations.filter((i) => i.status === "active").length}
 accent="success"
 />
 <StatCard label="Available" value={availableIntegrations.length} accent="primary" />
 </div>

 {/* Integrations List */}
 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Skeleton className="h-44 w-full rounded-xl" />
 <Skeleton className="h-44 w-full rounded-xl" />
 </div>
 ) : integrations.length === 0 ? (
 <EmptyState
 title="No integrations yet"
 description="Connect your first integration to get started"
 action={<Button onClick={() => setShowAddModal(true)}>Add Integration</Button>}
 />
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {integrations.map((integration) => (
 <Card key={integration._id} variant="interactive">
 <div className="flex items-start justify-between mb-4">
 <div className="min-w-0">
 <CardTitle>{integration.displayName}</CardTitle>
 <CardDescription className="mt-1">{integration.description}</CardDescription>
 </div>
 <Badge variant={statusVariant(integration.status)} size="sm">
 {integration.status}
 </Badge>
 </div>

 {integration.stats && (
 <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400">Total Calls</div>
 <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
 {integration.stats.totalCalls}
 </div>
 </div>
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400">Success Rate</div>
 <div className="text-lg font-semibold text-success-600 dark:text-success-400">
 {integration.stats.totalCalls > 0
 ? Math.round(
 (integration.stats.successfulCalls / integration.stats.totalCalls) * 100
 )
 : 0}
 %
 </div>
 </div>
 </div>
 )}

 <div className="flex gap-2">
 <Button variant="outline" size="sm" fullWidth onClick={() => testIntegration(integration._id)}>
 Test
 </Button>
 <Button variant="outline" size="sm" fullWidth>Configure</Button>
 <Button variant="danger" size="sm" onClick={() => deleteIntegration(integration._id)}>
 Delete
 </Button>
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* Available Integrations */}
 <div>
 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Available Integrations</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {availableIntegrations.map((integration) => (
 <Card key={integration.name} variant="interactive">
 <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
 {integration.displayName}
 </div>
 <p className="text-sm text-slate-500 dark:text-slate-400">{integration.description}</p>
 </Card>
 ))}
 </div>
 </div>
 </div>
 );
}
