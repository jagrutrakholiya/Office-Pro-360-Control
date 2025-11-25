"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../../components/Layout";
import { tutorialAPI, Tutorial } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaBook, FaStar, FaEye } from "react-icons/fa";

export default function TutorialsManagement() {
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await tutorialAPI.delete(id);
      alert("Tutorial deleted");
      loadTutorials();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          {[1, 2, 3].map((i) => (
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
              <FaBook className="text-cyan-500" />
              Tutorials
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Help center guides</p>
          </div>
          <Link
            href="/marketing/tutorials/new"
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            <FaPlus /> Add Tutorial
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold">{tutorials.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {tutorials.filter((t) => t.status === "published").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-orange-600">
              {tutorials.filter((t) => t.featured).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">
              {tutorials.reduce((sum, t) => sum + (t.views || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
          </div>
        </div>

        <div className="space-y-4">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{tutorial.title}</h3>
                    {tutorial.featured && <FaStar className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{tutorial.excerpt}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{tutorial.category}</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded">
                      {tutorial.level}
                    </span>
                    <span className="text-gray-500">{tutorial.duration} min</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <FaEye /> {tutorial.views || 0}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/marketing/tutorials/edit/${tutorial._id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <FaEdit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(tutorial._id!, tutorial.title)}
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
