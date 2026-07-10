"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import { useToast } from "../../../components/ui/Toast";
import { PageHeader, Button, Card, Badge, EmptyState } from "@/components/ui";
import { industryAPI, Industry } from "@/lib/marketingAPI";
import { FaPlus, FaPencilAlt, FaTrash, FaStar, FaBuilding } from "react-icons/fa";

export default function IndustriesListPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setItems(await industryAPI.list());
    } catch {
      toast.error("Failed to load industries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete industry "${name}"?`)) return;
    try {
      await industryAPI.delete(id);
      toast.success("Industry deleted");
      await load();
    } catch {
      toast.error("Failed to delete industry");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Industries"
          description="Manage industry pages (Small Business, Enterprise, etc.)"
          icon={<FaBuilding />}
          actions={
            <Button
              leadingIcon={<FaPlus className="text-xs" />}
              onClick={() => router.push("/marketing/industries/new")}
            >
              Add Industry
            </Button>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<FaBuilding className="w-6 h-6" />}
            title="No industries yet"
            description="Create industry-specific pages for Small Business, Enterprise, etc."
            action={{ label: "+ Add Industry", onClick: () => router.push("/marketing/industries/new") }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((s) => (
              <Card key={s._id} variant="interactive">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{s.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">/{s.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.featured && <FaStar className="text-amber-500" />}
                    <Badge variant={s.status === "published" ? "success" : "warning"}>
                      {s.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {s.hero?.description || "No description"}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <span>{s.benefits?.length || 0} benefits</span>
                  <span>{s.stats?.length || 0} stats</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leadingIcon={<FaPencilAlt className="text-xs" />}
                    onClick={() => router.push(`/marketing/industries/edit/${s._id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    aria-label="Delete industry"
                    onClick={() => remove(s._id!, s.name)}
                  >
                    <FaTrash className="text-xs" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
