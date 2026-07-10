"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import { useToast } from "../../../components/ui/Toast";
import { PageHeader, Button, Badge, DataTable, StatCard } from "@/components/ui";
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

  const columns = [
    {
      key: "title",
      header: "Title",
      render: (a: HelpArticle) => (
        <div className="flex items-center gap-2">
          {a.featured && <FaStar className="text-amber-500 flex-shrink-0" />}
          <div>
            <div className="font-medium text-slate-900 dark:text-white">{a.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">/{a.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (a: HelpArticle) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{a.category}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a: HelpArticle) => (
        <Badge variant={a.status === "published" ? "success" : "warning"}>{a.status}</Badge>
      ),
    },
    {
      key: "views",
      header: "Views",
      render: (a: HelpArticle) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{a.views || 0}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (a: HelpArticle) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leadingIcon={<FaPencilAlt />}
            onClick={() => router.push(`/marketing/help-articles/edit/${a._id}`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => remove(a._id!, a.title)}
            aria-label="Delete article"
          >
            <FaTrash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Help Articles"
          description="Manage help center documentation"
          actions={
            <Button leadingIcon={<FaPlus />} onClick={() => router.push("/marketing/help-articles/new")}>
              Add Article
            </Button>
          }
        />

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Articles" value={items.length} accent="primary" />
            <StatCard
              label="Published"
              value={items.filter((i) => i.status === "published").length}
              accent="success"
            />
            <StatCard
              label="Drafts"
              value={items.filter((i) => i.status === "draft").length}
              accent="warning"
            />
            <StatCard
              label="Featured"
              value={items.filter((i) => i.featured).length}
              accent="neutral"
            />
          </div>
        )}

        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={!filterCategory ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterCategory("")}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filterCategory === cat ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}

        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          rowKey={(a) => a._id!}
          emptyIcon={<FaQuestionCircle className="w-6 h-6" />}
          emptyTitle="No articles yet"
          emptyDescription="Create help center articles to support your customers."
          emptyAction={
            <Button leadingIcon={<FaPlus />} onClick={() => router.push("/marketing/help-articles/new")}>
              Add Article
            </Button>
          }
        />
      </div>
    </Layout>
  );
}
