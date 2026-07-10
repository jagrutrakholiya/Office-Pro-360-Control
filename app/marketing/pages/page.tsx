"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../../components/Layout";
import { useToast } from "../../../components/ui/Toast";
import { pageContentAPI, PageContent } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaFileAlt } from "react-icons/fa";
import { PageHeader, Button, Card, Badge, StatCard, EmptyState, Skeleton } from "@/components/ui";

export default function PagesManagement() {
  const toast = useToast();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await pageContentAPI.list();
      setPages(data);
    } catch (error) {
      console.error("Failed to load pages:", error);
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, pageName: string) => {
    if (!confirm(`Delete "${pageName}"?`)) return;
    try {
      await pageContentAPI.delete(id);
      toast.success("Page deleted");
      loadPages();
    } catch (error) {
      toast.error("Failed to delete page");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Page Content"
          description="Manage page sections and content"
          icon={<FaFileAlt />}
          actions={
            <Link href="/marketing/pages/new">
              <Button leadingIcon={<FaPlus />}>Add Page</Button>
            </Link>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Pages" value={pages.length} accent="primary" />
          <StatCard
            label="Published"
            value={pages.filter((p) => p.status === "published").length}
            accent="success"
          />
          <StatCard
            label="Drafts"
            value={pages.filter((p) => p.status === "draft").length}
            accent="neutral"
          />
        </div>

        {pages.length === 0 ? (
          <EmptyState
            icon={<FaFileAlt />}
            title="No pages yet"
            description="Create your first page to manage its sections and content."
            action={
              <Link href="/marketing/pages/new">
                <Button leadingIcon={<FaPlus />}>Add Page</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <Card key={page._id} padding="md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                      {page.pageName}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {page.sections.length} sections • {page.seo?.title || "No SEO title"}
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge variant={page.status === "published" ? "success" : "neutral"}>
                        {page.status}
                      </Badge>
                      {page.lastModifiedBy && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Modified by {page.lastModifiedBy.firstName} {page.lastModifiedBy.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/marketing/pages/edit/${page._id}`}>
                      <Button variant="ghost" size="sm" leadingIcon={<FaEdit />}>
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      leadingIcon={<FaTrash />}
                      onClick={() => handleDelete(page._id!, page.pageName)}
                    >
                      Delete
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
