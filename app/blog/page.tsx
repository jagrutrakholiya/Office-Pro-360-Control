"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiTrendingUp } from "react-icons/fi";
import api from "@/lib/api";
import Layout from "../../components/Layout";
import {
 PageHeader,
 StatCard,
 Card,
 Button,
 IconButton,
 Input,
 Select,
 Badge,
 EmptyState,
 Skeleton,
} from "@/components/ui";
import {
 BarChart,
 Bar,
 PieChart,
 Pie,
 Cell,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface BlogPost {
 _id: string;
 title: string;
 slug: string;
 excerpt: string;
 status: "draft" | "published" | "archived";
 category: string;
 views: number;
 createdAt: string;
 publishedAt?: string;
}

export default function BlogManagement() {
 const router = useRouter();
 const [posts, setPosts] = useState<BlogPost[]>([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState("all");
 const [search, setSearch] = useState("");

 useEffect(() => {
 fetchPosts();
 }, [filter]);

 const fetchPosts = async () => {
 try {
 const params: any = {};
 if (filter !== "all") params.status = filter;
 const response = await api.get("/blog", { params });
 setPosts(response.data.posts);
 } catch (error) {
 console.error("Error fetching posts:", error);
 } finally {
 setLoading(false);
 }
 };

 const handleDelete = async (id: string) => {
 if (!confirm("Are you sure you want to delete this blog post?")) return;

 try {
 await api.delete(`/blog/${id}`);
 fetchPosts();
 } catch (error) {
 console.error("Error deleting post:", error);
 }
 };

 const filteredPosts = posts.filter(
 (post) =>
 post.title.toLowerCase().includes(search.toLowerCase()) ||
 post.excerpt.toLowerCase().includes(search.toLowerCase())
 );

 // Calculate stats for charts
 const categoryData = posts.reduce((acc: any[], post) => {
 const existing = acc.find((item) => item.name === post.category);
 if (existing) {
 existing.value += 1;
 } else {
 acc.push({ name: post.category, value: 1 });
 }
 return acc;
 }, []);

 const statusData = [
 { name: "Published", value: posts.filter((p) => p.status === "published").length },
 { name: "Draft", value: posts.filter((p) => p.status === "draft").length },
 { name: "Archived", value: posts.filter((p) => p.status === "archived").length },
 ];

 const viewsData = posts
 .sort((a, b) => b.views - a.views)
 .slice(0, 5)
 .map((post) => ({
 title: post.title.substring(0, 20) + "...",
 views: post.views,
 }));

 const chartTooltipStyle = {
 backgroundColor: "#fff",
 border: "1px solid #e5e7eb",
 borderRadius: "8px",
 };

 const statusVariant: Record<string, "success" | "warning" | "neutral"> = {
 published: "success",
 draft: "warning",
 archived: "neutral",
 };

 if (loading) {
 return (
 <Layout>
 <div className="space-y-6">
 <Skeleton variant="rounded" height={40} width={280} />
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 {[1, 2, 3, 4].map((i) => (
 <Skeleton key={i} variant="rounded" height={96} />
 ))}
 </div>
 <Skeleton variant="rounded" height={300} />
 </div>
 </Layout>
 );
 }

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="Blog Management"
 description="Create and manage blog posts for marketing website"
 actions={
 <Button leadingIcon={<FiPlus />} onClick={() => router.push("/blog/new")}>
 New Post
 </Button>
 }
 />

 {/* Filters and Search */}
 <Card className="p-4">
 <div className="flex flex-col md:flex-row gap-4">
 <div className="flex-1">
 <Input
 leadingIcon={<FiSearch />}
 type="text"
 placeholder="Search posts..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
 <option value="all">All Posts</option>
 <option value="published">Published</option>
 <option value="draft">Draft</option>
 <option value="archived">Archived</option>
 </Select>
 </div>
 </Card>

 {/* Stats */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <StatCard label="Total Posts" value={posts.length} accent="neutral" />
 <StatCard label="Published" value={posts.filter(p => p.status === 'published').length} accent="success" />
 <StatCard label="Drafts" value={posts.filter(p => p.status === 'draft').length} accent="warning" />
 <StatCard label="Total Views" value={posts.reduce((sum, p) => sum + p.views, 0)} accent="primary" />
 </div>

 {/* Analytics Charts */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Posts by Category */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
 <FiTrendingUp className="text-primary-600" />
 Posts by Category
 </h3>
 {categoryData.length > 0 ? (
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={categoryData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis dataKey="name" stroke="#64748b" />
 <YAxis stroke="#64748b" />
 <Tooltip contentStyle={chartTooltipStyle} />
 <Bar dataKey="value" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <p className="text-slate-500 dark:text-slate-400 text-center py-20">No data available</p>
 )}
 </Card>

 {/* Status Distribution */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
 <FiTrendingUp className="text-success-600" />
 Status Distribution
 </h3>
 {statusData.some(d => d.value > 0) ? (
 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={statusData.filter(d => d.value > 0)}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
 outerRadius={100}
 fill="#8884d8"
 dataKey="value"
 >
 {statusData.filter(d => d.value > 0).map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={chartTooltipStyle} />
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <p className="text-slate-500 dark:text-slate-400 text-center py-20">No data available</p>
 )}
 </Card>

 {/* Top 5 Posts by Views */}
 <Card className="p-6 lg:col-span-2">
 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
 <FiEye className="text-purple-600" />
 Top 5 Posts by Views
 </h3>
 {viewsData.length > 0 ? (
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={viewsData} layout="vertical">
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis type="number" stroke="#64748b" />
 <YAxis dataKey="title" type="category" width={150} stroke="#64748b" />
 <Tooltip contentStyle={chartTooltipStyle} />
 <Bar dataKey="views" fill={COLORS[2]} radius={[0, 8, 8, 0]}>
 {viewsData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <p className="text-slate-500 dark:text-slate-400 text-center py-20">No posts with views yet</p>
 )}
 </Card>
 </div>

 {/* Posts List */}
 <div className="space-y-4">
 {filteredPosts.length === 0 ? (
 <EmptyState title="No blog posts found" description="Try adjusting your search or filter." />
 ) : (
 filteredPosts.map((post) => (
 <Card key={post._id} variant="interactive" className="p-6">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
 {post.title}
 </h3>
 <Badge variant={statusVariant[post.status] || "neutral"}>{post.status}</Badge>
 </div>
 <p className="text-slate-600 dark:text-slate-400 mb-4">
 {post.excerpt}
 </p>
 <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
 <span className="flex items-center gap-1">
 <FiEye />
 {post.views} views
 </span>
 <span>{post.category}</span>
 <span>
 {new Date(post.createdAt).toLocaleDateString()}
 </span>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-2 ml-4">
 <IconButton
 size="sm"
 variant="ghost"
 aria-label="Edit"
 className="text-primary-600"
 onClick={() => router.push(`/blog/edit/${post._id}`)}
 >
 <FiEdit2 />
 </IconButton>
 <IconButton
 size="sm"
 variant="ghost"
 aria-label="Delete"
 className="text-danger-600"
 onClick={() => handleDelete(post._id)}
 >
 <FiTrash2 />
 </IconButton>
 </div>
 </div>
 </Card>
 ))
 )}
 </div>
 </div>
 </Layout>
 );
}
