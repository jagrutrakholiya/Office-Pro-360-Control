"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  pageContentAPI,
  caseStudyAPI,
  teamAPI,
  careerAPI,
  tutorialAPI,
  whitepaperAPI,
  webinarAPI,
} from "@/lib/marketingAPI";
import {
  FaFileAlt,
  FaUsers,
  FaBriefcase,
  FaBook,
  FaFileDownload,
  FaVideo,
  FaChartLine,
  FaStar,
  FaEye,
  FaDownload,
} from "react-icons/fa";

interface ContentStats {
  pages: number;
  caseStudies: number;
  team: number;
  careers: number;
  tutorials: number;
  whitepapers: number;
  webinars: number;
}

export default function MarketingDashboard() {
  const [stats, setStats] = useState<ContentStats>({
    pages: 0,
    caseStudies: 0,
    team: 0,
    careers: 0,
    tutorials: 0,
    whitepapers: 0,
    webinars: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [pages, caseStudies, team, careers, tutorials, whitepapers, webinars] = await Promise.all([
        pageContentAPI.list(),
        caseStudyAPI.list(),
        teamAPI.list(),
        careerAPI.list(),
        tutorialAPI.list(),
        whitepaperAPI.list(),
        webinarAPI.list(),
      ]);

      setStats({
        pages: pages.length,
        caseStudies: caseStudies.length,
        team: team.length,
        careers: careers.length,
        tutorials: tutorials.length,
        whitepapers: whitepapers.length,
        webinars: webinars.length,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const contentTypes = [
    {
      name: "Page Content",
      count: stats.pages,
      icon: FaFileAlt,
      href: "/marketing/pages",
      color: "bg-blue-500",
      description: "Manage page sections and content",
    },
    {
      name: "Case Studies",
      count: stats.caseStudies,
      icon: FaChartLine,
      href: "/marketing/case-studies",
      color: "bg-green-500",
      description: "Customer success stories",
    },
    {
      name: "Team Members",
      count: stats.team,
      icon: FaUsers,
      href: "/marketing/team",
      color: "bg-purple-500",
      description: "Company team profiles",
    },
    {
      name: "Job Openings",
      count: stats.careers,
      icon: FaBriefcase,
      href: "/marketing/careers",
      color: "bg-orange-500",
      description: "Career opportunities",
    },
    {
      name: "Tutorials",
      count: stats.tutorials,
      icon: FaBook,
      href: "/marketing/tutorials",
      color: "bg-cyan-500",
      description: "Help center guides",
    },
    {
      name: "Whitepapers",
      count: stats.whitepapers,
      icon: FaFileDownload,
      href: "/marketing/whitepapers",
      color: "bg-pink-500",
      description: "Research documents",
    },
    {
      name: "Webinars",
      count: stats.webinars,
      icon: FaVideo,
      href: "/marketing/webinars",
      color: "bg-red-500",
      description: "Training sessions",
    },
  ];

  const quickActions = [
    { label: "Create Page Content", href: "/marketing/pages/new", icon: FaFileAlt },
    { label: "Add Case Study", href: "/marketing/case-studies/new", icon: FaChartLine },
    { label: "Add Team Member", href: "/marketing/team/new", icon: FaUsers },
    { label: "Post Job Opening", href: "/marketing/careers/new", icon: FaBriefcase },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Marketing Content Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage all marketing website content from one place
          </p>
        </div>
        <Link
          href="/marketing-stats"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Analytics
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
              >
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Link
              key={type.name}
              href={type.href}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${type.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {type.count}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {type.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </div>
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                  Manage →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <FaStar className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Featured Content</h3>
          </div>
          <p className="text-blue-100 text-sm mb-4">
            Highlight important content on your marketing pages by marking items as featured
          </p>
          <div className="text-2xl font-bold">
            {stats.caseStudies + stats.tutorials + stats.whitepapers} items
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <FaEye className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Published</h3>
          </div>
          <p className="text-green-100 text-sm mb-4">
            Total published content items visible on the marketing website
          </p>
          <div className="text-2xl font-bold">
            {Object.values(stats).reduce((a, b) => a + b, 0)} items
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <FaDownload className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Resources</h3>
          </div>
          <p className="text-purple-100 text-sm mb-4">
            Downloadable resources like whitepapers and guides
          </p>
          <div className="text-2xl font-bold">{stats.whitepapers} items</div>
        </div>
      </div>
    </div>
  );
}
