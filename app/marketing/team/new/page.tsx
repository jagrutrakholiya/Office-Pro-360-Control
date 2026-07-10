"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../../components/Layout";
import FirebaseImageUpload from "../../../../components/FirebaseImageUpload";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Select,
} from "../../../../components/ui";
import { useToast } from "../../../../components/ui/Toast";
import { teamAPI, TeamMember } from "@/lib/marketingAPI";
import { getMergedOptions, type OptionItem } from "@/lib/contentOptionsAPI";
import { FaSave, FaArrowLeft } from "react-icons/fa";

export default function NewTeamMember() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [deptOptions, setDeptOptions] = useState<OptionItem[]>([]);
  const [formData, setFormData] = useState<Omit<TeamMember, "_id">>({
    name: "",
    role: "",
    bio: "",
    image: "",
    department: "",
    social: {
      email: "",
      linkedin: "",
      twitter: "",
    },
    order: 0,
    featured: false,
    status: "active",
  });

  useEffect(() => {
    // Load options from content options API (merged global + company)
    getMergedOptions()
      .then((opts) => {
        setDeptOptions(opts.departments || []);
      })
      .catch((err) => {
        console.error("Failed to load options:", err);
        setDeptOptions([]);
      })
      .finally(() => {
        setLoadingOptions(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      toast.warning("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      await teamAPI.create(formData);
      toast.success("Team member added");
      router.push("/marketing/team");
    } catch (error) {
      console.error("Failed to add team member:", error);
      toast.error("Failed to add team member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Add Team Member"
          description="Create a new company team profile"
          breadcrumbs={[
            { label: "Team", href: "/marketing/team" },
            { label: "New" },
          ]}
          actions={
            <Button
              variant="outline"
              leadingIcon={<FaArrowLeft />}
              onClick={() => router.push("/marketing/team")}
            >
              Back to Team
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>

            <div className="mt-4 space-y-4">
              <Input
                label={
                  <>
                    Full Name <span className="text-danger-500">*</span>
                  </>
                }
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label={
                  <>
                    Role/Title <span className="text-danger-500">*</span>
                  </>
                }
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., CEO, Senior Developer, Marketing Manager"
                required
              />

              <div>
                <Input
                  label="Department"
                  list="team-department-options"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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

              <Textarea
                label="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Brief description about the team member..."
              />

              <FirebaseImageUpload
                label="Profile Photo"
                currentImage={formData.image}
                onUpload={(url) => setFormData({ ...formData, image: url })}
                folder="team-members"
                required
                maxSize={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Display Order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  min="0"
                />
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "active" | "inactive" })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded"
                />
                Featured (Show on homepage)
              </label>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links (Optional)</CardTitle>
            </CardHeader>

            <div className="mt-4 space-y-4">
              <Input
                label="Email"
                type="email"
                value={formData.social?.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, social: { ...formData.social!, email: e.target.value } })
                }
                placeholder="john@example.com"
              />

              <Input
                label="LinkedIn"
                type="url"
                value={formData.social?.linkedin || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social!, linkedin: e.target.value },
                  })
                }
                placeholder="https://linkedin.com/in/username"
              />

              <Input
                label="Twitter"
                type="url"
                value={formData.social?.twitter || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social: { ...formData.social!, twitter: e.target.value },
                  })
                }
                placeholder="https://twitter.com/username"
              />
            </div>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={loading} leadingIcon={<FaSave />}>
              {loading ? "Adding..." : "Add Team Member"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/marketing/team")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
