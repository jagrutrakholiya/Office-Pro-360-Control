"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import {
  PageHeader,
  StatCard,
  Button,
  Badge,
  DataTable,
  type Column,
} from "../../../components/ui";
import { useToast } from "../../../components/ui/Toast";
import { teamAPI, TeamMember } from "@/lib/marketingAPI";
import { FaPlus, FaEdit, FaTrash, FaUsers, FaStar } from "react-icons/fa";

export default function TeamManagement() {
  const router = useRouter();
  const toast = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await teamAPI.list();
      setMembers(data);
    } catch (error) {
      console.error("Failed to load team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await teamAPI.delete(id);
      toast.success("Team member deleted");
      loadMembers();
    } catch (error) {
      console.error("Failed to delete team member:", error);
      toast.error("Failed to delete team member");
    }
  };

  const filteredMembers = members.filter((member) => {
    if (filter === "all") return true;
    return member.status === filter;
  });

  const columns: Column<TeamMember>[] = [
    {
      key: "name",
      header: "Member",
      render: (member) => (
        <div className="flex items-center gap-3 min-w-0">
          {member.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.image}
              alt={member.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <FaUsers />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {member.name}
              </span>
              {member.featured && (
                <FaStar className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (member) => (
        <span className="text-slate-600 dark:text-slate-400">{member.department || "—"}</span>
      ),
    },
    {
      key: "bio",
      header: "Bio",
      render: (member) => (
        <span className="text-slate-600 dark:text-slate-400 line-clamp-2 max-w-sm block">
          {member.bio}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (member) => (
        <Badge variant={member.status === "active" ? "success" : "neutral"}>{member.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "1%",
      render: (member) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            leadingIcon={<FaEdit />}
            onClick={() => router.push(`/marketing/team/edit/${member._id}`)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            leadingIcon={<FaTrash />}
            onClick={() => handleDelete(member._id!, member.name)}
            aria-label="Delete"
          />
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Team Members"
          description="Manage company team profiles"
          icon={<FaUsers />}
          actions={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/team/new")}
            >
              Add Team Member
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Members" value={members.length} accent="primary" />
          <StatCard
            label="Active"
            value={members.filter((m) => m.status === "active").length}
            accent="success"
          />
          <StatCard
            label="Featured"
            value={members.filter((m) => m.featured).length}
            accent="warning"
          />
          <StatCard
            label="Departments"
            value={new Set(members.map((m) => m.department)).size}
            accent="neutral"
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredMembers}
          loading={loading}
          rowKey={(m) => m._id!}
          emptyIcon={<FaUsers className="w-6 h-6" />}
          emptyTitle="No team members found"
          emptyDescription="Add your first team member to display on the marketing site."
          emptyAction={
            <Button
              variant="primary"
              leadingIcon={<FaPlus />}
              onClick={() => router.push("/marketing/team/new")}
            >
              Add First Member
            </Button>
          }
        />
      </div>
    </Layout>
  );
}
