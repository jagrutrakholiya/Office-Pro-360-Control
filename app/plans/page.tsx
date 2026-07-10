"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import { PageHeader, Button, DataTable } from "@/components/ui";
import api from "../../lib/api";

type Plan = {
  _id: string;
  name: string;
  code: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  status: string;
};

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);

  async function loadPlans() {
    try {
      const res = await api.get("/admin/plans");
      setPlans(res.data.plans || []);
    } catch {}
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function deletePlan(id: string) {
    if (!confirm("Delete plan?")) return;
    await api.delete(`/admin/plans/${id}`);
    await loadPlans();
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Plans"
          description="Configure subscription plans and pricing"
          actions={
            <Button onClick={() => router.push("/plans/new")}>
              + Add New Plan
            </Button>
          }
        />

        <DataTable<Plan>
          data={plans}
          rowKey={(p) => p._id}
          emptyTitle="No plans yet"
          emptyDescription="Create your first subscription plan to get started."
          columns={[
            {
              key: "name",
              header: "Name",
              render: (p) => (
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {p.name}
                </span>
              ),
            },
            {
              key: "code",
              header: "Code",
              render: (p) => (
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {p.code}
                </span>
              ),
            },
            { key: "monthly", header: "Monthly", render: (p) => <>₹{p.priceMonthly}</> },
            { key: "yearly", header: "Yearly", render: (p) => <>₹{p.priceYearly}</> },
            {
              key: "actions",
              header: "Actions",
              render: (p) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push(`/plans/${p._id}`)}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => deletePlan(p._id)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </Layout>
  );
}
