"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../../components/Layout";
import { useToast } from "../../../components/ui/Toast";
import { careerAPI, JobOpening } from "@/lib/marketingAPI";
import { PageHeader, Button, Card, Badge, StatCard, EmptyState, Skeleton } from "@/components/ui";
import { FaPlus, FaEdit, FaTrash, FaBriefcase, FaMapMarkerAlt, FaClock, FaStar } from "react-icons/fa";

export default function CareersManagement() {
  const toast = useToast();
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await careerAPI.list();
      setJobs(data);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await careerAPI.delete(id);
      toast.success("Job deleted");
      loadJobs();
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") return true;
    return job.status === filter;
  });

  const statusVariant = (status: string): "success" | "danger" | "neutral" => {
    if (status === "open") return "success";
    if (status === "closed") return "danger";
    return "neutral";
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64 mb-8" />
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
          title="Job Openings"
          description="Manage career opportunities on the marketing site"
          icon={<FaBriefcase />}
          actions={
            <Link href="/marketing/careers/new">
              <Button leadingIcon={<FaPlus />}>Add New Job</Button>
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Jobs" value={jobs.length} accent="primary" />
          <StatCard
            label="Open Positions"
            value={jobs.filter((j) => j.status === "open").length}
            accent="success"
          />
          <StatCard
            label="Featured Jobs"
            value={jobs.filter((j) => j.featured).length}
            accent="warning"
          />
          <StatCard
            label="Total Applications"
            value={jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)}
            accent="neutral"
          />
        </div>

        {/* Filters */}
        <Card padding="md">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({jobs.length})
            </Button>
            <Button
              variant={filter === "open" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter("open")}
            >
              Open ({jobs.filter((j) => j.status === "open").length})
            </Button>
            <Button
              variant={filter === "closed" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter("closed")}
            >
              Closed ({jobs.filter((j) => j.status === "closed").length})
            </Button>
            <Button
              variant={filter === "draft" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter("draft")}
            >
              Draft ({jobs.filter((j) => j.status === "draft").length})
            </Button>
          </div>
        </Card>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <Card padding="md">
            <EmptyState
              icon={<FaBriefcase />}
              title="No job openings found"
              description={
                filter === "all"
                  ? "Get started by creating your first job opening"
                  : `No ${filter} jobs at the moment`
              }
              action={
                filter === "all" ? (
                  <Link href="/marketing/careers/new">
                    <Button leadingIcon={<FaPlus />}>Add First Job</Button>
                  </Link>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job._id} padding="md">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {job.title}
                      </h3>
                      {job.featured && (
                        <FaStar className="w-4 h-4 text-yellow-500" title="Featured" />
                      )}
                      <Badge variant={statusVariant(job.status)}>
                        {job.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <FaBriefcase className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock className="w-4 h-4" />
                        {job.type}
                      </span>
                      {(job.applicationCount || 0) > 0 && (
                        <span className="text-primary-600 dark:text-primary-400 font-medium">
                          {job.applicationCount} applications
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/marketing/careers/edit/${job._id}`}>
                      <Button variant="ghost" size="sm" title="Edit">
                        <FaEdit className="w-5 h-5" />
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(job._id!, job.title)}
                      title="Delete"
                    >
                      <FaTrash className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {job.salaryRange && (
                    <Badge variant="success">
                      {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} -{" "}
                      {job.salaryRange.max.toLocaleString()}
                    </Badge>
                  )}
                  <Badge variant="neutral">{job.requirements.length} requirements</Badge>
                  {job.benefits && job.benefits.length > 0 && (
                    <Badge variant="info">{job.benefits.length} benefits</Badge>
                  )}
                </div>

                {job.postedAt && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      Posted on {new Date(job.postedAt).toLocaleDateString()}
                      {job.closesAt &&
                        ` • Closes on ${new Date(job.closesAt).toLocaleDateString()}`}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
