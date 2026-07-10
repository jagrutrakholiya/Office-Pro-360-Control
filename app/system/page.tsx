"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import {
 PageHeader,
 Button,
 Badge,
 StatCard,
 Card,
 CardTitle,
 EmptyState,
 Skeleton,
} from "@/components/ui";

type HealthData = {
 status?: string;
 uptime?: number;
 version?: string;
 environment?: string;
 database?: {
 status?: string;
 name?: string;
 };
 memory?: {
 rss?: number;
 heapUsed?: number;
 heapTotal?: number;
 };
};

type PaymentConfig = {
 configured?: boolean;
 provider?: string;
};

export default function SystemPage() {
 const router = useRouter();
 const [health, setHealth] = useState<HealthData | null>(null);
 const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
 const [loading, setLoading] = useState(true);
 const [seedingPlans, setSeedingPlans] = useState(false);

 async function loadHealth() {
 setLoading(true);
 try {
 const [healthRes, paymentRes] = await Promise.allSettled([
 api.get("/health"),
 api.get("/payment/config"),
 ]);

 if (healthRes.status === "fulfilled") {
 setHealth(healthRes.value.data);
 }
 if (paymentRes.status === "fulfilled") {
 setPaymentConfig(paymentRes.value.data);
 }
 } catch (err) {
 console.error("Failed to load system health", err);
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 loadHealth();
 }, []);

 function formatUptime(seconds?: number): string {
 if (!seconds) return "N/A";
 const d = Math.floor(seconds / 86400);
 const h = Math.floor((seconds % 86400) / 3600);
 const m = Math.floor((seconds % 3600) / 60);
 const s = Math.floor(seconds % 60);
 const parts = [];
 if (d > 0) parts.push(`${d}d`);
 if (h > 0) parts.push(`${h}h`);
 if (m > 0) parts.push(`${m}m`);
 parts.push(`${s}s`);
 return parts.join(" ");
 }

 function formatBytes(bytes?: number): string {
 if (!bytes) return "N/A";
 return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
 }

 async function seedPlans() {
 if (!confirm("This will seed default plans. Continue?")) return;
 setSeedingPlans(true);
 try {
 await api.post("/admin/plans/seed");
 alert("Default plans seeded successfully.");
 } catch (err: any) {
 alert(`Failed: ${err.response?.data?.message || err.message}`);
 } finally {
 setSeedingPlans(false);
 }
 }

 const dbStatus = health?.database?.status || "unknown";
 const dbOk = dbStatus === "connected" || dbStatus === "ok";

 const serverBadge: "success" | "warning" | "danger" =
 health?.status === "ok" || health?.status === "healthy"
 ? "success"
 : health
 ? "warning"
 : "danger";

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="System Health"
 description="Monitor server status, database, and configuration"
 actions={
 <Button variant="secondary" onClick={loadHealth}>
 Refresh
 </Button>
 }
 />

 {loading ? (
 <div className="space-y-6">
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-24 w-full" />
 </div>
 <Skeleton className="h-40 w-full" />
 </div>
 ) : (
 <div className="space-y-6">
 {/* Server Status */}
 <Card padding="lg">
 <CardTitle className="text-lg mb-4">Server Status</CardTitle>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard
 label="Status"
 accent={serverBadge === "success" ? "success" : serverBadge === "warning" ? "warning" : "danger"}
 value={
 <Badge variant={serverBadge}>{health?.status || "Unknown"}</Badge>
 }
 />
 <StatCard label="Uptime" value={formatUptime(health?.uptime)} accent="primary" />
 <StatCard label="Version" value={health?.version || "N/A"} accent="neutral" />
 <StatCard label="Environment" value={health?.environment || "N/A"} accent="neutral" />
 </div>
 </Card>

 {/* Database Status */}
 <Card padding="lg">
 <CardTitle className="text-lg mb-4">Database</CardTitle>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <StatCard
 label="MongoDB Status"
 accent={dbOk ? "success" : "danger"}
 value={<Badge variant={dbOk ? "success" : "danger"}>{dbStatus}</Badge>}
 />
 <StatCard label="Database Name" value={health?.database?.name || "N/A"} accent="neutral" />
 {health?.memory && (
 <StatCard
 label="Memory Usage"
 value={`${formatBytes(health.memory.heapUsed)} / ${formatBytes(health.memory.heapTotal)}`}
 accent="primary"
 />
 )}
 </div>
 </Card>

 {/* Configuration */}
 <Card padding="lg">
 <CardTitle className="text-lg mb-4">Configuration</CardTitle>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard label="NODE_ENV" value={health?.environment || "N/A"} accent="neutral" />
 <StatCard
 label="Razorpay"
 accent={paymentConfig?.configured ? "success" : "danger"}
 value={
 <Badge variant={paymentConfig?.configured ? "success" : "danger"}>
 {paymentConfig?.configured ? "Configured" : "Not Configured"}
 </Badge>
 }
 />
 <StatCard
 label="Email"
 accent="neutral"
 value={<Badge variant="neutral">Check Server Logs</Badge>}
 />
 <StatCard
 label="Firebase"
 accent="neutral"
 value={<Badge variant="neutral">Check Server Logs</Badge>}
 />
 </div>
 </Card>

 {/* Quick Actions */}
 <Card padding="lg">
 <CardTitle className="text-lg mb-4">Quick Actions</CardTitle>
 <div className="flex flex-wrap gap-3">
 <Button
 variant="primary"
 onClick={seedPlans}
 disabled={seedingPlans}
 loading={seedingPlans}
 >
 {seedingPlans ? "Seeding..." : "Seed Default Plans"}
 </Button>
 <Button
 variant="secondary"
 onClick={() => alert("API cache clearing is not yet implemented.")}
 >
 Clear API Cache
 </Button>
 </div>
 </Card>

 {/* Recent Errors */}
 <Card padding="lg">
 <CardTitle className="text-lg mb-4">Recent Errors</CardTitle>
 <EmptyState
 title="Coming Soon"
 description="Error tracking will be available in a future update."
 icon={
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 }
 />
 </Card>
 </div>
 )}
 </div>
 </Layout>
 );
}
