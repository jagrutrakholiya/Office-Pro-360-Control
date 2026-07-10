"use client";

import { useState, useEffect } from "react";
import {
 PageHeader,
 StatCard,
 Card,
 Button,
 Badge,
 Input,
 Textarea,
 Select,
 EmptyState,
 Skeleton,
} from "@/components/ui";

interface ApiKey {
 _id: string;
 name: string;
 description: string;
 prefix: string;
 permissions: string[];
 status: string;
 environment: string;
 usage: {
 totalRequests: number;
 lastUsed?: string;
 };
 createdAt: string;
}

export default function ApiKeysPage() {
 const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
 const [loading, setLoading] = useState(true);
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [newKey, setNewKey] = useState({ name: "", description: "", environment: "production" });
 const [generatedKey, setGeneratedKey] = useState<string | null>(null);

 useEffect(() => {
 fetchApiKeys();
 }, []);

 const fetchApiKeys = async () => {
 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/api-keys`,
 {
 headers: { Authorization: `Bearer ${token}` },
 }
 );

 if (response.ok) {
 const data = await response.json();
 setApiKeys(data.data || []);
 }
 } catch (error) {
 console.error("Error fetching API keys:", error);
 } finally {
 setLoading(false);
 }
 };

 const createApiKey = async () => {
 if (!newKey.name) {
 alert("Please provide a name for the API key");
 return;
 }

 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/api-keys`,
 {
 method: "POST",
 headers: {
 Authorization: `Bearer ${token}`,
 "Content-Type": "application/json",
 },
 body: JSON.stringify(newKey),
 }
 );

 if (response.ok) {
 const data = await response.json();
 setGeneratedKey(data.data.plainKey);
 setNewKey({ name: "", description: "", environment: "production" });
 fetchApiKeys();
 }
 } catch (error) {
 console.error("Error creating API key:", error);
 alert("Failed to create API key");
 }
 };

 const revokeApiKey = async (id: string) => {
 if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone."))
 return;

 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/api-keys/${id}/revoke`,
 {
 method: "POST",
 headers: { Authorization: `Bearer ${token}` },
 }
 );

 if (response.ok) {
 fetchApiKeys();
 }
 } catch (error) {
 console.error("Error revoking API key:", error);
 alert("Failed to revoke API key");
 }
 };

 const copyToClipboard = (text: string) => {
 navigator.clipboard.writeText(text);
 alert("API key copied to clipboard!");
 };

 const statusVariant = (status: string): "success" | "neutral" | "danger" => {
 const variants: Record<string, "success" | "neutral" | "danger"> = {
 active: "success",
 inactive: "neutral",
 revoked: "danger",
 };
 return variants[status] || "neutral";
 };

 return (
 <div className="p-6 space-y-6">
 <PageHeader
 title="API Keys"
 description="Manage API keys for programmatic access to your account"
 breadcrumbs={[
 { label: "Settings", href: "/settings" },
 { label: "API Keys" },
 ]}
 actions={
 <Button onClick={() => setShowCreateModal(true)}>Create API Key</Button>
 }
 />

 {/* Security Notice */}
 <Card className="border-warning-200 dark:border-warning-900/50 bg-warning-50 dark:bg-warning-900/20">
 <h4 className="font-semibold text-warning-900 dark:text-warning-200">Security Notice</h4>
 <p className="text-sm text-warning-800 dark:text-warning-300 mt-1">
 API keys provide full access to your account. Keep them secret and never share them publicly. Store them securely and rotate them regularly.
 </p>
 </Card>

 {/* Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard label="Total Keys" value={apiKeys.length} accent="neutral" />
 <StatCard
 label="Active"
 value={apiKeys.filter((k) => k.status === "active").length}
 accent="success"
 />
 <StatCard
 label="Revoked"
 value={apiKeys.filter((k) => k.status === "revoked").length}
 accent="danger"
 />
 <StatCard
 label="Total Requests"
 value={apiKeys.reduce((sum, k) => sum + k.usage.totalRequests, 0)}
 accent="primary"
 />
 </div>

 {/* API Keys List */}
 {loading ? (
 <div className="space-y-4">
 <Skeleton className="h-40 w-full rounded-xl" />
 <Skeleton className="h-40 w-full rounded-xl" />
 </div>
 ) : apiKeys.length === 0 ? (
 <EmptyState
 title="No API keys yet"
 description="Create your first API key to get started"
 action={<Button onClick={() => setShowCreateModal(true)}>Create API Key</Button>}
 />
 ) : (
 <div className="space-y-4">
 {apiKeys.map((key) => (
 <Card key={key._id} variant="interactive">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 mb-2 flex-wrap">
 <h3 className="font-semibold text-slate-900 dark:text-slate-100">{key.name}</h3>
 <Badge variant={statusVariant(key.status)} size="sm">{key.status}</Badge>
 <Badge variant="neutral" size="sm">{key.environment}</Badge>
 </div>
 <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{key.description}</p>
 <div className="flex items-center gap-2 font-mono text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded">
 <span>{key.prefix}••••••••••••••••</span>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400">Total Requests</div>
 <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
 {key.usage.totalRequests}
 </div>
 </div>
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400">Permissions</div>
 <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
 {key.permissions.length}
 </div>
 </div>
 <div>
 <div className="text-xs text-slate-500 dark:text-slate-400">Created</div>
 <div className="text-sm text-slate-900 dark:text-slate-100">
 {new Date(key.createdAt).toLocaleDateString()}
 </div>
 </div>
 </div>

 <div className="flex gap-2">
 <Button variant="outline" size="sm">Configure</Button>
 <Button variant="outline" size="sm">Rotate</Button>
 {key.status === "active" && (
 <Button variant="danger" size="sm" onClick={() => revokeApiKey(key._id)}>
 Revoke
 </Button>
 )}
 </div>
 </Card>
 ))}
 </div>
 )}

 {/* Create Modal */}
 {showCreateModal && (
 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
 <Card className="max-w-md w-full shadow-xl">
 <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Create API Key</h3>

 {generatedKey ? (
 <div>
 <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-900/50 rounded-lg p-4 mb-4">
 <h4 className="font-semibold text-success-900 dark:text-success-200">API Key Created</h4>
 <p className="text-sm text-success-800 dark:text-success-300 mt-1">
 Please copy your API key now. You won't be able to see it again!
 </p>
 </div>
 <div className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-3 rounded mb-4 font-mono text-sm break-all">
 {generatedKey}
 </div>
 <div className="flex gap-2">
 <Button fullWidth onClick={() => copyToClipboard(generatedKey)}>
 Copy Key
 </Button>
 <Button
 variant="outline"
 onClick={() => {
 setGeneratedKey(null);
 setShowCreateModal(false);
 }}
 >
 Done
 </Button>
 </div>
 </div>
 ) : (
 <div>
 <div className="space-y-4 mb-4">
 <Input
 label="Name *"
 type="text"
 value={newKey.name}
 onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
 placeholder="My API Key"
 />
 <Textarea
 label="Description"
 value={newKey.description}
 onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
 placeholder="Purpose of this API key"
 rows={3}
 />
 <Select
 label="Environment"
 value={newKey.environment}
 onChange={(e) => setNewKey({ ...newKey, environment: e.target.value })}
 >
 <option value="development">Development</option>
 <option value="staging">Staging</option>
 <option value="production">Production</option>
 </Select>
 </div>
 <div className="flex gap-2">
 <Button fullWidth onClick={createApiKey}>Create Key</Button>
 <Button variant="outline" onClick={() => setShowCreateModal(false)}>
 Cancel
 </Button>
 </div>
 </div>
 )}
 </Card>
 </div>
 )}
 </div>
 );
}
