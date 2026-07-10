"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import {
  PageHeader,
  Button,
  Badge,
  DataTable,
  type Column,
} from "../../../components/ui";
import { useToast } from "../../../components/ui/Toast";
import { solutionAPI, Solution } from "@/lib/marketingAPI";
import { FaPlus, FaPencilAlt, FaTrash, FaStar, FaLightbulb } from "react-icons/fa";

export default function SolutionsListPage() {
  const router = useRouter();
  const toast = useToast();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await solutionAPI.list();
      setSolutions(data);
    } catch {
      toast.error("Failed to load solutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete solution "${name}"?`)) return;
    try {
      await solutionAPI.delete(id);
      toast.success("Solution deleted");
      await load();
    } catch {
      toast.error("Failed to delete solution");
    }
  };

  const columns: Column<Solution>[] = [
    {
      key: "name",
      header: "Solution",
      render: (s) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {s.name}
              </span>
              {s.featured && (
                <FaStar className="text-amber-500 dark:text-amber-400 shrink-0" title="Featured" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">/{s.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (s) => (
        <span className="text-slate-600 dark:text-slate-400 line-clamp-2 max-w-md block">
          {s.hero?.description || "No description"}
        </span>
      ),
    },
    {
      key: "features",
      header: "Content",
      render: (s) => (
        <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {s.features?.length || 0} features · {s.metrics?.length || 0} metrics
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <Badge
          variant={
            s.status === "published" ? "success" : s.status === "draft" ? "warning" : "neutral"
          }
        >
          {s.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "1%",
      render: (s) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            leadingIcon={<FaPencilAlt />}
            onClick={() => router.push(`/marketing/solutions/edit/${s._id}`)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            leadingIcon={<FaTrash />}
            onClick={() => remove(s._id!, s.name)}
            aria-label="Delete"
          />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Solutions"
          description="Manage solution pages (HR, Payroll, Tasks, Attendance, Performance)"
          icon={<FaLightbulb />}
          actions={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/solutions/new")}
            >
              Add Solution
            </Button>
          }
        />

        <DataTable
          columns={columns}
          data={solutions}
          loading={loading}
          rowKey={(s) => s._id!}
          emptyIcon={<FaLightbulb className="w-6 h-6" />}
          emptyTitle="No solutions yet"
          emptyDescription="Create your first solution page to show up on the marketing site."
          emptyAction={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/solutions/new")}
            >
              Add Solution
            </Button>
          }
        />
      </div>
    </Layout>
  );
}
