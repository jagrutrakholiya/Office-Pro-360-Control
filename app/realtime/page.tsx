"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Layout from "../../components/Layout";
import api from "../../lib/api";
import { getSocket } from "../../lib/socket";

type OnlineUser = {
  userId: string;
  name: string;
  email: string;
  role: string;
  company: string;
  companyId: string;
  lastSeen: string;
};

type Activity = {
  event: string;
  userId?: string;
  userName?: string;
  companyId?: string;
  summary?: string;
  _ts: string;
};

export default function RealtimeDashboard() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const maxActivities = 50;
  const socketRef = useRef<any>(null);

  // Load initial online users from API
  const loadOnlineUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/realtime/online-users");
      setOnlineUsers(res.data.users || []);
    } catch (e) {
      console.error("Failed to load online users:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOnlineUsers();
    const interval = setInterval(loadOnlineUsers, 15000); // Refresh every 15s

    // Connect socket
    const socket = getSocket();
    socketRef.current = socket;

    if (socket) {
      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));

      // Listen for real-time events
      socket.on("platform:activity", (data: Activity) => {
        setActivities((prev) => [data, ...prev].slice(0, maxActivities));
      });

      socket.on("user:online", (data: any) => {
        setOnlineUsers((prev) => {
          if (prev.some((u) => u.userId === data.userId)) return prev;
          return [
            ...prev,
            {
              userId: data.userId,
              name: data.name || data.userName || "Unknown",
              email: data.email || "",
              role: "",
              company: "",
              companyId: "",
              lastSeen: new Date().toISOString(),
            },
          ];
        });
      });

      socket.on("user:offline", (data: any) => {
        setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      });

      setConnected(socket.connected);
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off("platform:activity");
        socket.off("user:online");
        socket.off("user:offline");
      }
    };
  }, [loadOnlineUsers]);

  // Group online users by company
  const byCompany: Record<string, OnlineUser[]> = {};
  onlineUsers.forEach((u) => {
    const key = u.company || "Unknown";
    if (!byCompany[key]) byCompany[key] = [];
    byCompany[key].push(u);
  });

  const roleColor = (role: string) => {
    if (role === "admin") return "text-red-600";
    if (role === "hr") return "text-purple-600";
    if (role === "manager") return "text-blue-600";
    return "text-slate-600";
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "";
    }
  };

  const eventLabel = (event: string) => {
    return event
      .replace(/_/g, " ")
      .replace(/:/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Real-Time Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">Live platform activity and online users across all companies.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${connected ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            {connected ? "Live" : "Disconnected"}
          </div>
          <button onClick={loadOnlineUsers} className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 hover:bg-slate-50">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Online Users */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Online Users</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {onlineUsers.length}
              </span>
            </div>

            {loading ? (
              <div className="p-6 text-center text-sm text-slate-400">Loading...</div>
            ) : onlineUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">No users online right now.</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {Object.entries(byCompany)
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([company, users]) => (
                    <div key={company}>
                      <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                        <span>{company}</span>
                        <span>{users.length}</span>
                      </div>
                      {users.map((u) => (
                        <div key={u.userId} className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                              {u.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">{u.name}</div>
                            <div className={`text-[11px] ${roleColor(u.role)} capitalize`}>{u.role || "employee"}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Live Activity</h3>
              <span className="text-xs text-slate-500">{activities.length} events</span>
            </div>

            {activities.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-sm text-slate-400 mb-2">Waiting for activity...</div>
                <p className="text-xs text-slate-400">
                  Events will appear here in real-time as users perform actions across the platform.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {activities.map((a, i) => (
                  <div key={`${a._ts}-${i}`} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-900">
                        <span className="font-medium">{a.userName || "System"}</span>
                        {" "}
                        <span className="text-slate-600">{eventLabel(a.event)}</span>
                      </div>
                      {a.summary && (
                        <div className="text-xs text-slate-500 mt-0.5">{a.summary}</div>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">
                      {formatTime(a._ts)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
