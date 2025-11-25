"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../../components/Layout";
import { webinarAPI, Webinar } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaVideo, FaStar, FaUsers } from "react-icons/fa";

export default function WebinarsManagement() {
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await webinarAPI.delete(id);
      alert("Webinar deleted");
      loadWebinars();
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
              <FaVideo className="text-red-500" />
              Webinars
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Training sessions</p>
          </div>
          <Link
            href="/marketing/webinars/new"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FaPlus /> Add Webinar
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold">{webinars.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {webinars.filter((w) => w.type === "upcoming").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">
              {webinars.filter((w) => w.type === "recorded").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Recorded</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="text-2xl font-bold text-purple-600">
              {webinars.reduce((sum, w) => sum + (w.registered || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Registrations</div>
          </div>
        </div>

        <div className="space-y-4">
          {webinars.map((webinar) => (
            <div
              key={webinar._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start gap-6">
                {webinar.image && (
                  <img src={webinar.image} alt={webinar.title} className="w-48 h-32 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{webinar.title}</h3>
                    {webinar.featured && <FaStar className="w-4 h-4 text-yellow-500" />}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        webinar.type === "upcoming"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {webinar.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{webinar.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>{webinar.date}</span>
                    <span>{webinar.time} {webinar.timezone}</span>
                    <span>{webinar.duration} min</span>
                    <span className="flex items-center gap-1">
                      <FaUsers /> {webinar.registered || 0} registered
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/marketing/webinars/edit/${webinar._id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <FaEdit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(webinar._id!, webinar.title)}
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
