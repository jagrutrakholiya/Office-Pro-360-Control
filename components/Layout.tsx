"use client";
import { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-slate-600 font-medium">
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (pathname !== "/login") router.push("/login");
    return null;
  }

  const nav = [
    {
      href: "/",
      label: "Dashboard",
      icon: "📊",
      description: "Overview & analytics",
    },
    {
      href: "/companies",
      label: "Companies",
      icon: "🏢",
      description: "Manage organizations",
    },
    {
      href: "/plans",
      label: "Plans",
      icon: "💎",
      description: "Subscription plans",
    },
    {
      href: "/marketing-stats",
      label: "Marketing Stats",
      icon: "📈",
      description: "Website content & stats",
    },
    {
      href: "/inquiries",
      label: "Inquiries",
      icon: "📬",
      description: "Customer inquiries",
    },
    {
      href: "/reviews",
      label: "Reviews",
      icon: "⭐",
      description: "Customer feedback",
    },
    {
      href: "/earnings",
      label: "Earnings",
      icon: "💰",
      description: "Revenue analytics",
    },
  ];

  const NavContent = () => (
    <>
      <div className="mb-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          OfficePro360
        </div>
        <div className="text-xs text-slate-400 mt-1">Control Panel</div>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
              pathname === n.href
                ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 text-white"
                : "hover:bg-slate-700/50 text-slate-300 hover:text-white"
            }`}
          >
            <span className="text-lg">{n.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{n.label}</div>
              <div
                className={`text-xs truncate transition-colors ${
                  pathname === n.href
                    ? "text-blue-100"
                    : "text-slate-400 group-hover:text-slate-300"
                }`}
              >
                {n.description}
              </div>
            </div>
          </Link>
        ))}
      </nav>
      <div className="border-t border-slate-700 pt-6 mt-6">
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/50 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.name || "Admin"}
            </div>
            <div className="text-xs text-slate-400 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl font-medium text-sm shadow-lg transition-all duration-300 hover:shadow-red-500/25"
        >
          <span className="mr-2">🚪</span>
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex-col shadow-2xl">
        <NavContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-slate-900 text-white rounded-xl shadow-lg transition-all duration-200 hover:bg-slate-800"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative w-80 max-w-[85vw] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex flex-col shadow-2xl transform transition-transform">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
