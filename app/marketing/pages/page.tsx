"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../../components/Layout";
import { pageContentAPI, PageContent } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaEye } from "react-icons/fa";

export default function PagesManagement() {
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, pageName: string) => {
    if (!confirm(`Delete "${pageName}"?`)) return;
    try {
      await pageContentAPI.delete(id);
      alert("Page deleted");
      loadPages();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaFileAlt className="text-blue-500" />
              Page Content
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage page sections and content</p>
          </div>
          <Link
            href="/marketing/pages/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus /> Add Page
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold">{pages.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Pages</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {pages.filter((p) => p.status === "published").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-600">
              {pages.filter((p) => p.status === "draft").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Drafts</div>
          </div>
        </div>

        <div className="space-y-4">
          {pages.map((page) => (
            <div
              key={page._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{page.pageName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {page.sections.length} sections • {page.seo?.title || "No SEO title"}
                  </p>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        page.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {page.status}
                    </span>
                    {page.lastModifiedBy && (
                      <span className="text-xs text-gray-500">
                        Modified by {page.lastModifiedBy.firstName} {page.lastModifiedBy.lastName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/marketing/pages/edit/${page._id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <FaEdit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(page._id!, page.pageName)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
