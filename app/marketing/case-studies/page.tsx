"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../../components/Layout";
import { useToast } from "../../../components/ui/Toast";
import { caseStudyAPI, CaseStudy } from "@/lib/marketingAPI";
import { PageHeader, Button, Card, Badge, StatCard, EmptyState, Skeleton } from "@/components/ui";
import { FaPlus, FaEdit, FaTrash, FaChartLine, FaStar } from "react-icons/fa";

export default function CaseStudiesManagement() {
  const toast = useToast();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadCaseStudies();
  }, []);

  const loadCaseStudies = async () => {
    try {
      setLoading(true);
      const data = await caseStudyAPI.list();
      setCaseStudies(data);
    } catch (error) {
      console.error("Failed to load case studies:", error);
      toast.error("Failed to load case studies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await caseStudyAPI.delete(id);
      toast.success("Case study deleted");
      loadCaseStudies();
    } catch (error) {
      console.error("Failed to delete case study:", error);
      toast.error("Failed to delete case study");
    }
  };

  const filteredStudies = caseStudies.filter((study) => {
    if (filter === "all") return true;
    return study.status === filter;
  });

  const getStatusVariant = (status: string): "success" | "neutral" | "danger" => {
    const variants = {
      published: "success" as const,
      draft: "neutral" as const,
      archived: "danger" as const,
    };
    return variants[status as keyof typeof variants] || "neutral";
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Case Studies"
          description="Manage customer success stories"
          icon={<FaChartLine />}
          actions={
            <Link href="/marketing/case-studies/new">
              <Button leadingIcon={<FaPlus />}>Add Case Study</Button>
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Case Studies" value={caseStudies.length} accent="neutral" />
          <StatCard
            label="Published"
            value={caseStudies.filter((cs) => cs.status === "published").length}
            accent="success"
          />
          <StatCard
            label="Featured"
            value={caseStudies.filter((cs) => cs.featured).length}
            accent="warning"
          />
          <StatCard
            label="Industries"
            value={new Set(caseStudies.map((cs) => cs.industry)).size}
            accent="primary"
          />
        </div>

        {/* Filters */}
        <Card padding="md">
          <div className="flex flex-wrap gap-2">
            {["all", "published", "draft", "archived"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filter === status ? "primary" : "outline"}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {status === "all" ? caseStudies.length : caseStudies.filter((cs) => cs.status === status).length})
              </Button>
            ))}
          </div>
        </Card>

        {/* List */}
        {filteredStudies.length === 0 ? (
          <EmptyState
            icon={<FaChartLine />}
            title="No case studies found"
            description={
              filter === "all"
                ? "Get started by creating your first case study"
                : `No ${filter} case studies at the moment`
            }
            action={
              filter === "all" ? (
                <Link href="/marketing/case-studies/new">
                  <Button leadingIcon={<FaPlus />}>Add First Case Study</Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredStudies.map((study) => (
              <Card key={study._id} padding="md">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {study.title}
                      </h3>
                      {study.featured && (
                        <FaStar className="w-4 h-4 text-yellow-500" title="Featured" />
                      )}
                      <Badge variant={getStatusVariant(study.status)}>
                        {study.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <span>{study.company.name}</span>
                      <span>•</span>
                      <span>{study.industry}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {study.challenge}
                    </p>
                    {study.metrics && study.metrics.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {study.metrics.slice(0, 3).map((metric, idx) => (
                          <div key={idx} className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs">
                            <span className="font-bold text-green-600 dark:text-green-400">{metric.value}</span>
                            <span className="text-slate-600 dark:text-slate-400 ml-1">{metric.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/marketing/case-studies/edit/${study._id}`}>
                      <Button variant="ghost" size="sm" title="Edit">
                        <FaEdit className="w-5 h-5" />
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(study._id!, study.title)}
                      title="Delete"
                    >
                      <FaTrash className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
