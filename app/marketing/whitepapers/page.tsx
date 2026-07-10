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
import { whitepaperAPI, Whitepaper } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaFileDownload, FaStar, FaDownload } from "react-icons/fa";

export default function WhitepapersManagement() {
  const router = useRouter();
  const toast = useToast();
  const [whitepapers, setWhitepapers] = useState<Whitepaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWhitepapers();
  }, []);

  const loadWhitepapers = async () => {
    try {
      setLoading(true);
      const data = await whitepaperAPI.list();
      setWhitepapers(data);
    } catch (error) {
      console.error("Failed to load whitepapers:", error);
      toast.error("Failed to load whitepapers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await whitepaperAPI.delete(id);
      toast.success("Whitepaper deleted");
      loadWhitepapers();
    } catch (error) {
      toast.error("Failed to delete whitepaper");
    }
  };

  const columns: Column<Whitepaper>[] = [
    {
      key: "title",
      header: "Whitepaper",
      render: (p) => (
        <div className="flex items-center gap-3 min-w-0">
          {p.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.coverImage}
              alt={p.title}
              className="w-12 h-16 object-cover rounded-md shrink-0"
            />
          ) : (
            <div className="w-12 h-16 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <FaFileDownload />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {p.title}
              </span>
              {p.featured && (
                <FaStar className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 max-w-md">
              {p.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (p) => (
        <div className="flex flex-col gap-1">
          <Badge variant="neutral">{p.category}</Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">{p.pages} pages</span>
        </div>
      ),
    },
    {
      key: "downloads",
      header: "Downloads",
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <FaDownload /> {p.downloads || 0}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "1%",
      render: (p) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            leadingIcon={<FaEdit />}
            onClick={() => router.push(`/marketing/whitepapers/edit/${p._id}`)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            leadingIcon={<FaTrash />}
            onClick={() => handleDelete(p._id!, p.title)}
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
          title="Whitepapers"
          description="Research documents"
          icon={<FaFileDownload />}
          actions={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/whitepapers/new")}
            >
              Add Whitepaper
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={whitepapers.length} accent="primary" />
          <StatCard
            label="Published"
            value={whitepapers.filter((w) => w.status === "published").length}
            accent="success"
          />
          <StatCard
            label="Featured"
            value={whitepapers.filter((w) => w.featured).length}
            accent="warning"
          />
          <StatCard
            label="Downloads"
            value={whitepapers.reduce((sum, w) => sum + (w.downloads || 0), 0)}
            accent="neutral"
          />
        </div>

        <DataTable
          columns={columns}
          data={whitepapers}
          loading={loading}
          rowKey={(p) => p._id!}
          emptyIcon={<FaFileDownload className="w-6 h-6" />}
          emptyTitle="No whitepapers yet"
          emptyDescription="Publish research documents for your audience to download."
          emptyAction={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/whitepapers/new")}
            >
              Add Whitepaper
            </Button>
          }
        />
      </div>
    </Layout>
  );
}
