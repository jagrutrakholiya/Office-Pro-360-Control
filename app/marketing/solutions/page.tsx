"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
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

  return (
    <Layout>
      <PageHeader
        title="Solutions"
        description="Manage solution pages (HR, Payroll, Tasks, Attendance, Performance)"
        actions={
          <button
            onClick={() => router.push("/marketing/solutions/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
          >
            <FaPlus className="text-xs" /> Add Solution
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : solutions.length === 0 ? (
        <EmptyState
          icon={<FaLightbulb className="w-6 h-6" />}
          title="No solutions yet"
          description="Create your first solution page to show up on the marketing site."
          action={{ label: "+ Add Solution", onClick: () => router.push("/marketing/solutions/new") }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {solutions.map((s) => (
            <div
              key={s._id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{s.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">/{s.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.featured && <FaStar className="text-amber-500" title="Featured" />}
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      s.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : s.status === "draft"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {s.hero?.description || "No description"}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                <span>{s.features?.length || 0} features</span>
                <span>{s.metrics?.length || 0} metrics</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/marketing/solutions/edit/${s._id}`)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <FaPencilAlt className="text-xs" /> Edit
                </button>
                <button
                  onClick={() => remove(s._id!, s.name)}
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
