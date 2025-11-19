"use client";

import { useState, useEffect } from "react";

interface Integration {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  status: string;
  icon: string;
  stats?: {
    totalCalls: number;
    successfulCalls: number;
    lastUsed?: string;
  };
}

const availableIntegrations = [
  { name: "slack", displayName: "Slack", icon: "💬", description: "Team messaging and collaboration" },
  { name: "email", displayName: "Email", icon: "📧", description: "SMTP email integration" },
  { name: "calendar", displayName: "Calendar", icon: "📅", description: "Google Calendar sync" },
  { name: "github", displayName: "GitHub", icon: "🐙", description: "Code repository integration" },
  { name: "webhook", displayName: "Webhook", icon: "🔗", description: "Custom webhook integration" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/integrations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/integrations/${id}/test`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert("Integration test successful!");
        fetchIntegrations();
      }
    } catch (error) {
      console.error("Error testing integration:", error);
      alert("Integration test failed");
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this integration?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/integrations/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        fetchIntegrations();
      }
    } catch (error) {
      console.error("Error deleting integration:", error);
      alert("Failed to delete integration");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500",
      inactive: "bg-gray-500",
      error: "bg-red-500",
      pending: "bg-yellow-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
          <p className="text-gray-600 mt-1">
            Connect third-party services to enhance your workflow
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Add Integration
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Integrations</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{integrations.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {integrations.filter((i) => i.status === "active").length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Available</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{availableIntegrations.length}</div>
        </div>
      </div>

      {/* Integrations List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading integrations...</div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">🔌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No integrations yet</h3>
          <p className="text-gray-600 mb-4">
            Connect your first integration to get started
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Integration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{integration.icon || "🔌"}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.displayName}</h3>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <span
                  className={`${getStatusColor(
                    integration.status
                  )} text-white text-xs px-2 py-1 rounded-full`}
                >
                  {integration.status}
                </span>
              </div>

              {integration.stats && (
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="text-xs text-gray-600">Total Calls</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {integration.stats.totalCalls}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                    <div className="text-lg font-semibold text-green-600">
                      {integration.stats.totalCalls > 0
                        ? Math.round(
                            (integration.stats.successfulCalls / integration.stats.totalCalls) * 100
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => testIntegration(integration._id)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  🧪 Test
                </button>
                <button className="flex-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  ⚙️ Configure
                </button>
                <button
                  onClick={() => deleteIntegration(integration._id)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Integrations */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableIntegrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{integration.icon}</div>
                <div className="font-medium text-gray-900">{integration.displayName}</div>
              </div>
              <p className="text-sm text-gray-600">{integration.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
