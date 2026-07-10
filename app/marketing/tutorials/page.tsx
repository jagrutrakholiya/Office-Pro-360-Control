"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import {
  PageHeader,
  StatCard,
  Button,
  Badge,
  DataTable,
  type Column,
} from "../../../components/ui";
import { useToast } from "../../../components/ui/Toast";
import { tutorialAPI, Tutorial } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaBook, FaStar, FaEye } from "react-icons/fa";

export default function TutorialsManagement() {
  const router = useRouter();
  const toast = useToast();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    try {
      setLoading(true);
      const data = await tutorialAPI.list();
      setTutorials(data);
    } catch (error) {
      console.error("Failed to load tutorials:", error);
      toast.error("Failed to load tutorials");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await tutorialAPI.delete(id);
      toast.success("Tutorial deleted");
      loadTutorials();
    } catch (error) {
      toast.error("Failed to delete tutorial");
    }
  };

  const columns: Column<Tutorial>[] = [
    {
      key: "title",
      header: "Tutorial",
      render: (t) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {t.title}
            </span>
            {t.featured && (
              <FaStar className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 max-w-md">
            {t.excerpt}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (t) => (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{t.category}</Badge>
          <Badge variant="info">{t.level}</Badge>
        </div>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (t) => (
        <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {t.duration} min
        </span>
      ),
    },
    {
      key: "views",
      header: "Views",
      render: (t) => (
        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <FaEye /> {t.views || 0}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "1%",
      render: (t) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            leadingIcon={<FaEdit />}
            onClick={() => router.push(`/marketing/tutorials/edit/${t._id}`)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            leadingIcon={<FaTrash />}
            onClick={() => handleDelete(t._id!, t.title)}
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
          title="Tutorials"
          description="Help center guides"
          icon={<FaBook />}
          actions={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/tutorials/new")}
            >
              Add Tutorial
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={tutorials.length} accent="primary" />
          <StatCard
            label="Published"
            value={tutorials.filter((t) => t.status === "published").length}
            accent="success"
          />
          <StatCard
            label="Featured"
            value={tutorials.filter((t) => t.featured).length}
            accent="warning"
          />
          <StatCard
            label="Total Views"
            value={tutorials.reduce((sum, t) => sum + (t.views || 0), 0)}
            accent="neutral"
          />
        </div>

        <DataTable
          columns={columns}
          data={tutorials}
          loading={loading}
          rowKey={(t) => t._id!}
          emptyIcon={<FaBook className="w-6 h-6" />}
          emptyTitle="No tutorials yet"
          emptyDescription="Create help center guides to support your users."
          emptyAction={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/tutorials/new")}
            >
              Add Tutorial
            </Button>
          }
        />
      </div>
    </Layout>
  );
}
