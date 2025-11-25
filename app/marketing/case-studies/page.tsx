"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../../components/Layout";
import { caseStudyAPI, CaseStudy } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaChartLine, FaStar, FaEye } from "react-icons/fa";

export default function CaseStudiesManagement() {
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
      alert("Failed to load case studies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await caseStudyAPI.delete(id);
      alert("Case study deleted successfully");
      loadCaseStudies();
    } catch (error) {
      console.error("Failed to delete case study:", error);
      alert("Failed to delete case study. Please try again.");
    }
  };

  const filteredStudies = caseStudies.filter((study) => {
    if (filter === "all") return true;
    return study.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      archived: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaChartLine className="text-green-500" />
              Case Studies
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage customer success stories
            </p>
          </div>
          <Link
            href="/marketing/case-studies/new"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus /> Add Case Study
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{caseStudies.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Case Studies</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {caseStudies.filter((cs) => cs.status === "published").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-orange-600">
              {caseStudies.filter((cs) => cs.featured).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(caseStudies.map((cs) => cs.industry)).size}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Industries</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {["all", "published", "draft", "archived"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {status === "all" ? caseStudies.length : caseStudies.filter((cs) => cs.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filteredStudies.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <FaChartLine className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No case studies found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === "all"
                ? "Get started by creating your first case study"
                : `No ${filter} case studies at the moment`}
            </p>
            {filter === "all" && (
              <Link
                href="/marketing/case-studies/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaPlus /> Add First Case Study
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudies.map((study) => (
              <div
                key={study._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {study.title}
                        </h3>
                        {study.featured && (
                          <FaStar className="w-4 h-4 text-yellow-500" title="Featured" />
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(study.status)}`}>
                          {study.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span>{study.company.name}</span>
                        <span>•</span>
                        <span>{study.industry}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {study.challenge}
                      </p>
                      {study.metrics && study.metrics.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {study.metrics.slice(0, 3).map((metric, idx) => (
                            <div key={idx} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-xs">
                              <span className="font-bold text-green-600">{metric.value}</span>
                              <span className="text-gray-600 dark:text-gray-400 ml-1">{metric.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        href={`/marketing/case-studies/edit/${study._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(study._id!, study.title)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
