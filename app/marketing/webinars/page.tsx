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
import { webinarAPI, Webinar } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaVideo, FaStar, FaUsers } from "react-icons/fa";

export default function WebinarsManagement() {
  const router = useRouter();
  const toast = useToast();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWebinars();
  }, []);

  const loadWebinars = async () => {
    try {
      setLoading(true);
      const data = await webinarAPI.list();
      setWebinars(data);
    } catch (error) {
      console.error("Failed to load webinars:", error);
      toast.error("Failed to load webinars");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await webinarAPI.delete(id);
      toast.success("Webinar deleted");
      loadWebinars();
    } catch (error) {
      toast.error("Failed to delete webinar");
    }
  };

  const columns: Column<Webinar>[] = [
    {
      key: "title",
      header: "Webinar",
      render: (w) => (
        <div className="flex items-center gap-3 min-w-0">
          {w.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={w.image}
              alt={w.title}
              className="w-16 h-10 object-cover rounded-md shrink-0"
            />
          ) : (
            <div className="w-16 h-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <FaVideo />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {w.title}
              </span>
              {w.featured && (
                <FaStar className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 max-w-md">
              {w.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (w) => (
        <Badge variant={w.type === "upcoming" ? "success" : "info"}>{w.type}</Badge>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      render: (w) => (
        <div className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
          <div>{w.date}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {w.time} {w.timezone} · {w.duration} min
          </div>
        </div>
      ),
    },
    {
      key: "registered",
      header: "Registered",
      render: (w) => (
        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <FaUsers /> {w.registered || 0}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "1%",
      render: (w) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            leadingIcon={<FaEdit />}
            onClick={() => router.push(`/marketing/webinars/edit/${w._id}`)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            leadingIcon={<FaTrash />}
            onClick={() => handleDelete(w._id!, w.title)}
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
          title="Webinars"
          description="Training sessions"
          icon={<FaVideo />}
          actions={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/webinars/new")}
            >
              Add Webinar
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={webinars.length} accent="primary" />
          <StatCard
            label="Upcoming"
            value={webinars.filter((w) => w.type === "upcoming").length}
            accent="success"
          />
          <StatCard
            label="Recorded"
            value={webinars.filter((w) => w.type === "recorded").length}
            accent="neutral"
          />
          <StatCard
            label="Registrations"
            value={webinars.reduce((sum, w) => sum + (w.registered || 0), 0)}
            accent="warning"
          />
        </div>

        <DataTable
          columns={columns}
          data={webinars}
          loading={loading}
          rowKey={(w) => w._id!}
          emptyIcon={<FaVideo className="w-6 h-6" />}
          emptyTitle="No webinars yet"
          emptyDescription="Schedule training sessions to engage your audience."
          emptyAction={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/webinars/new")}
            >
              Add Webinar
            </Button>
          }
        />
      </div>
    </Layout>
  );
}
