"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../../components/Layout";
import { whitepaperAPI, Whitepaper } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaFileDownload, FaStar, FaDownload } from "react-icons/fa";

export default function WhitepapersManagement() {
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await whitepaperAPI.delete(id);
      alert("Whitepaper deleted");
      loadWhitepapers();
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
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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
              <FaFileDownload className="text-pink-500" />
              Whitepapers
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Research documents</p>
          </div>
          <Link
            href="/marketing/whitepapers/new"
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            <FaPlus /> Add Whitepaper
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold">{whitepapers.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {whitepapers.filter((w) => w.status === "published").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-orange-600">
              {whitepapers.filter((w) => w.featured).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">
              {whitepapers.reduce((sum, w) => sum + (w.downloads || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whitepapers.map((paper) => (
            <div
              key={paper._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {paper.coverImage && (
                <img src={paper.coverImage} alt={paper.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold flex-1">{paper.title}</h3>
                  {paper.featured && <FaStar className="w-4 h-4 text-yellow-500" />}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{paper.description}</p>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{paper.category}</span>
                  <span className="text-gray-500">{paper.pages} pages</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <FaDownload /> {paper.downloads || 0}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/marketing/whitepapers/edit/${paper._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                      <FaEdit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(paper._id!, paper.title)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
