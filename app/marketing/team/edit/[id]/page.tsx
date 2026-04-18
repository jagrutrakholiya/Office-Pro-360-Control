"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Layout from "../../../../../components/Layout";
import FirebaseImageUpload from "../../../../../components/FirebaseImageUpload";
import { useToast } from "../../../../../components/ui/Toast";
import { teamAPI, TeamMember } from "@/lib/marketingAPI";
import { getMergedOptions, type OptionItem } from "@/lib/contentOptionsAPI";
import { FaSave, FaArrowLeft } from "react-icons/fa";

export default function EditTeamMember() {
  const router = useRouter();
  const toast = useToast();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deptOptions, setDeptOptions] = useState<OptionItem[]>([]);
  const [formData, setFormData] = useState<Omit<TeamMember, "_id">>({
    name: "",
    role: "",
    bio: "",
    image: "",
    department: "",
    social: { email: "", linkedin: "", twitter: "" },
    order: 0,
    featured: false,
    status: "active",
  });

  useEffect(() => {
    getMergedOptions()
      .then((opts) => setDeptOptions(opts.departments || []))
      .catch(() => setDeptOptions([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const members: TeamMember[] = await teamAPI.list();
        const member = members.find((m) => m._id === id);
        if (!member) {
          toast.error("Team member not found");
          router.push("/marketing/team");
          return;
        }
        setFormData({
          name: member.name || "",
          role: member.role || "",
          bio: member.bio || "",
          image: member.image || "",
          department: member.department || "",
          social: {
            email: member.social?.email || "",
            linkedin: member.social?.linkedin || "",
            twitter: member.social?.twitter || "",
          },
          order: member.order ?? 0,
          featured: !!member.featured,
          status: member.status || "active",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load team member");
        router.push("/marketing/team");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      toast.warning("Please fill in required fields");
      return;
    }
    setSaving(true);
    try {
      await teamAPI.update(id, formData);
      toast.success("Team member updated");
      router.push("/marketing/team");
    } catch (error) {
      console.error("Failed to update team member:", error);
      toast.error("Failed to update team member");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/marketing/team")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
          >
            <FaArrowLeft /> Back to Team
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Team Member</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Role/Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., CEO, Senior Developer, Marketing Manager"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Department</label>
                <input
                  list="team-department-options"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Type or select department"
                />
                <datalist id="team-department-options">
                  {deptOptions.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <FirebaseImageUpload
                label="Profile Photo"
                currentImage={formData.image}
                onUpload={(url) => setFormData({ ...formData, image: url })}
                folder="team-members"
                maxSize={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded"
                  />
                  Featured (Show on homepage)
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Social Links (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={formData.social?.email || ""}
                  onChange={(e) => setFormData({ ...formData, social: { ...formData.social!, email: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">LinkedIn</label>
                <input
                  type="url"
                  value={formData.social?.linkedin || ""}
                  onChange={(e) => setFormData({ ...formData, social: { ...formData.social!, linkedin: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Twitter</label>
                <input
                  type="url"
                  value={formData.social?.twitter || ""}
                  onChange={(e) => setFormData({ ...formData, social: { ...formData.social!, twitter: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              <FaSave /> {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/marketing/team")}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
