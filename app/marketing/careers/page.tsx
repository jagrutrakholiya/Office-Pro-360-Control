"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../../components/Layout";
import { careerAPI, JobOpening } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaBriefcase, FaMapMarkerAlt, FaClock, FaStar } from "react-icons/fa";

export default function CareersManagement() {
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
      alert("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await careerAPI.delete(id);
      alert("Job deleted successfully");
      loadJobs();
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") return true;
    return job.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      open: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      closed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">{/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FaBriefcase className="text-orange-500" />
            Job Openings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage career opportunities on the marketing site
          </p>
        </div>
        <Link
          href="/marketing/careers/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <FaPlus /> Add New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{jobs.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">
            {jobs.filter((j) => j.status === "open").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Open Positions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="text-2xl font-bold text-orange-600">
            {jobs.filter((j) => j.featured).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Featured Jobs</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">
            {jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Applications</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            All ({jobs.length})
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "open"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Open ({jobs.filter((j) => j.status === "open").length})
          </button>
          <button
            onClick={() => setFilter("closed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "closed"
                ? "bg-red-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Closed ({jobs.filter((j) => j.status === "closed").length})
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "draft"
                ? "bg-gray-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Draft ({jobs.filter((j) => j.status === "draft").length})
          </button>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          <FaBriefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No job openings found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === "all"
              ? "Get started by creating your first job opening"
              : `No ${filter} jobs at the moment`}
          </p>
          {filter === "all" && (
            <Link
              href="/marketing/careers/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FaPlus /> Add First Job
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>
                      {job.featured && (
                        <FaStar className="w-4 h-4 text-yellow-500" title="Featured" />
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                          job.status
                        )}`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {job.applicationCount} applications
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/marketing/careers/edit/${job._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(job._id!, job.title)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {job.salaryRange && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                      {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} -{" "}
                      {job.salaryRange.max.toLocaleString()}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                    {job.requirements.length} requirements
                  </span>
                  {job.benefits && job.benefits.length > 0 && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-xs">
                      {job.benefits.length} benefits
                    </span>
                  )}
                </div>

                {job.postedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      Posted on {new Date(job.postedAt).toLocaleDateString()}
                      {job.closesAt &&
                        ` • Closes on ${new Date(job.closesAt).toLocaleDateString()}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
}
