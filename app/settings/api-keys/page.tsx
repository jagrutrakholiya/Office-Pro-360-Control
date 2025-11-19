"use client";

import { useState, useEffect } from "react";

interface ApiKey {
  _id: string;
  name: string;
  description: string;
  prefix: string;
  permissions: string[];
  status: string;
  environment: string;
  usage: {
    totalRequests: number;
    lastUsed?: string;
  };
  createdAt: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState({ name: "", description: "", environment: "production" });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/api-keys`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKey.name) {
      alert("Please provide a name for the API key");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/api-keys`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newKey),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGeneratedKey(data.data.plainKey);
        setNewKey({ name: "", description: "", environment: "production" });
        fetchApiKeys();
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      alert("Failed to create API key");
    }
  };

  const revokeApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone."))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-settings/api-keys/${id}/revoke`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      console.error("Error revoking API key:", error);
      alert("Failed to revoke API key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("API key copied to clipboard!");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500",
      inactive: "bg-gray-500",
      revoked: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <p className="text-gray-600 mt-1">
            Manage API keys for programmatic access to your account
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔑 Create API Key
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900">Security Notice</h4>
            <p className="text-sm text-yellow-800 mt-1">
              API keys provide full access to your account. Keep them secret and never share them publicly. Store them securely and rotate them regularly.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Keys</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{apiKeys.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {apiKeys.filter((k) => k.status === "active").length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Revoked</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {apiKeys.filter((k) => k.status === "revoked").length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Requests</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {apiKeys.reduce((sum, k) => sum + k.usage.totalRequests, 0)}
          </div>
        </div>
      </div>

      {/* API Keys List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading API keys...</div>
      ) : apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">🔑</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No API keys yet</h3>
          <p className="text-gray-600 mb-4">Create your first API key to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create API Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{key.name}</h3>
                    <span
                      className={`${getStatusColor(key.status)} text-white text-xs px-2 py-1 rounded-full`}
                    >
                      {key.status}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {key.environment}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{key.description}</p>
                  <div className="flex items-center gap-2 font-mono text-sm bg-gray-50 px-3 py-2 rounded">
                    <span>{key.prefix}••••••••••••••••</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <div className="text-xs text-gray-600">Total Requests</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {key.usage.totalRequests}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Permissions</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {key.permissions.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Created</div>
                  <div className="text-sm text-gray-900">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  ⚙️ Configure
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  🔄 Rotate
                </button>
                {key.status === "active" && (
                  <button
                    onClick={() => revokeApiKey(key._id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm"
                  >
                    🚫 Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Create API Key</h3>
            
            {generatedKey ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xl">✓</span>
                    <div>
                      <h4 className="font-semibold text-green-900">API Key Created</h4>
                      <p className="text-sm text-green-800 mt-1">
                        Please copy your API key now. You won't be able to see it again!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded mb-4 font-mono text-sm break-all">
                  {generatedKey}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedKey)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    📋 Copy Key
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedKey(null);
                      setShowCreateModal(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      placeholder="My API Key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newKey.description}
                      onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                      placeholder="Purpose of this API key"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Environment
                    </label>
                    <select
                      value={newKey.environment}
                      onChange={(e) => setNewKey({ ...newKey, environment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createApiKey}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Key
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
