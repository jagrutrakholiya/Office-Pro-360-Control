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
import { useCaseAPI, UseCase } from "@/lib/marketingAPI";
import { FaPlus, FaPencilAlt, FaTrash, FaStar, FaClipboardList } from "react-icons/fa";

export default function UseCasesListPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setItems(await useCaseAPI.list());
    } catch {
      toast.error("Failed to load use cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete use case "${title}"?`)) return;
    try {
      await useCaseAPI.delete(id);
      toast.success("Use case deleted");
      await load();
    } catch {
      toast.error("Failed to delete use case");
    }
  };

  const columns: Column<UseCase>[] = [
    {
      key: "title",
      header: "Use Case",
      render: (u) => (
        <div className="min-w-0">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {u.category}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {u.title}
            </span>
            {u.featured && (
              <FaStar className="text-amber-500 dark:text-amber-400 shrink-0" title="Featured" />
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">/{u.slug}</p>
        </div>
      ),
    },
    {
      key: "summary",
      header: "Summary",
      render: (u) => (
        <span className="text-slate-600 dark:text-slate-400 line-clamp-2 max-w-md block">
          {u.summary}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge variant={u.status === "published" ? "success" : "warning"}>{u.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "1%",
      render: (u) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            leadingIcon={<FaPencilAlt />}
            onClick={() => router.push(`/marketing/use-cases/edit/${u._id}`)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            leadingIcon={<FaTrash />}
            onClick={() => remove(u._id!, u.title)}
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
          title="Use Cases"
          description="Show real customer scenarios and workflows"
          icon={<FaClipboardList />}
          actions={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/use-cases/new")}
            >
              Add Use Case
            </Button>
          }
        />

        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          rowKey={(u) => u._id!}
          emptyIcon={<FaClipboardList className="w-6 h-6" />}
          emptyTitle="No use cases yet"
          emptyDescription="Add customer workflows to showcase real-world value."
          emptyAction={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/use-cases/new")}
            >
              Add Use Case
            </Button>
          }
        />
      </div>
    </Layout>
  );
}
