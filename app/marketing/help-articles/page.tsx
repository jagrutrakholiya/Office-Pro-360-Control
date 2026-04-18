"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import { useToast } from "../../../components/ui/Toast";
import { helpArticleAPI, HelpArticle } from "@/lib/marketingAPI";
import { FaPlus, FaPencilAlt, FaTrash, FaStar, FaQuestionCircle } from "react-icons/fa";

export default function HelpArticlesListPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");

  const load = async () => {
    try {
      const params = filterCategory ? { category: filterCategory } : undefined;
      setItems(await helpArticleAPI.list(params));
    } catch {
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete article "${title}"?`)) return;
    try {
      await helpArticleAPI.delete(id);
      toast.success("Article deleted");
      await load();
    } catch {
      toast.error("Failed to delete article");
    }
  };

  const categories = Array.from(new Set(items.map((i) => i.category))).sort();

  return (
    <Layout>
      <PageHeader
        title="Help Articles"
        description="Manage help center documentation"
        actions={
          <button
            onClick={() => router.push("/marketing/help-articles/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
          >
            <FaPlus className="text-xs" /> Add Article
          </button>
        }
      />

      {categories.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory("")}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              !filterCategory
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                filterCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FaQuestionCircle className="w-6 h-6" />}
          title="No articles yet"
          description="Create help center articles to support your customers."
          action={{ label: "+ Add Article", onClick: () => router.push("/marketing/help-articles/new") }}
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Title</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Views</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {a.featured && <FaStar className="text-amber-500 flex-shrink-0" />}
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{a.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">/{a.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{a.category}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        a.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{a.views || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/marketing/help-articles/edit/${a._id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <FaPencilAlt className="text-xs" /> Edit
                      </button>
                      <button
                        onClick={() => remove(a._id!, a.title)}
                        className="p-2 text-red-600 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
