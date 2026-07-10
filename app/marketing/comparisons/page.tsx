"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import { PageHeader, EmptyState, Button, Card, Badge } from "@/components/ui";
import { useToast } from "../../../components/ui/Toast";
import { comparisonAPI, Comparison } from "@/lib/marketingAPI";
import { FaPlus, FaPencilAlt, FaTrash, FaStar, FaBalanceScale } from "react-icons/fa";

export default function ComparisonsListPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setItems(await comparisonAPI.list());
    } catch {
      toast.error("Failed to load comparisons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete comparison "${name}"?`)) return;
    try {
      await comparisonAPI.delete(id);
      toast.success("Comparison deleted");
      await load();
    } catch {
      toast.error("Failed to delete comparison");
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Comparisons"
        description="Compare OfficePro360 against competitors (e.g. Keka, Zoho People, greytHR)"
        actions={
          <Button
            variant="primary"
            leadingIcon={<FaPlus />}
            onClick={() => router.push("/marketing/comparisons/new")}
          >
            Add Comparison
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<FaBalanceScale className="w-6 h-6" />}
          title="No comparisons yet"
          description="Create honest comparisons against competitors to improve SEO and AI search visibility."
          action={{ label: "+ Add Comparison", onClick: () => router.push("/marketing/comparisons/new") }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((c) => (
            <Card key={c._id} padding="md" className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {c.pageType === "versus" ? "vs" : "Alternative"}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {c.pageType === "versus" ? `OfficePro360 vs ${c.competitorName}` : `${c.competitorName} Alternative`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">/compare/{c.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.featured && <FaStar className="text-amber-500" />}
                  <Badge variant={c.status === "published" ? "success" : "warning"}>{c.status}</Badge>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {c.hero?.description || "No description"}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                <span>{c.features?.length || 0} features</span>
                <span>
                  {(c.us?.pros?.length || 0)}/{c.us?.cons?.length || 0} pros/cons
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leadingIcon={<FaPencilAlt />}
                  className="flex-1"
                  onClick={() => router.push(`/marketing/comparisons/edit/${c._id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => remove(c._id!, c.competitorName)}
                >
                  <FaTrash />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
