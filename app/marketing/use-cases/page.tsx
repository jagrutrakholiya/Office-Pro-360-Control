"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
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

  return (
    <Layout>
      <PageHeader
        title="Use Cases"
        description="Show real customer scenarios and workflows"
        actions={
          <button
            onClick={() => router.push("/marketing/use-cases/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
          >
            <FaPlus className="text-xs" /> Add Use Case
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FaClipboardList className="w-6 h-6" />}
          title="No use cases yet"
          description="Add customer workflows to showcase real-world value."
          action={{ label: "+ Add Use Case", onClick: () => router.push("/marketing/use-cases/new") }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((u) => (
            <div
              key={u._id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {u.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{u.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">/{u.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.featured && <FaStar className="text-amber-500" />}
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      u.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {u.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{u.summary}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/marketing/use-cases/edit/${u._id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <FaPencilAlt className="text-xs" /> Edit
                </button>
                <button
                  onClick={() => remove(u._id!, u.title)}
                  className="px-3 py-2 text-sm text-red-600 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
