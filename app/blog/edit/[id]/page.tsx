"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import api from "@/lib/api";
import Layout from "@/components/Layout";
import FirebaseImageUpload from "@/components/FirebaseImageUpload";
import RichTextEditor from "@/components/RichTextEditor";
import { PageHeader, Card, Button, Input, Textarea, Select, Skeleton } from "@/components/ui";

export default function EditBlogPost() {
 const router = useRouter();
 const params = useParams();
 const { id } = params;

 const [formData, setFormData] = useState({
 title: "",
 slug: "",
 excerpt: "",
 content: "",
 featuredImage: "",
 category: "Company News",
 tags: [] as string[],
 status: "draft",
 metaTitle: "",
 metaDescription: "",
 });
 const [tagInput, setTagInput] = useState("");
 const [saving, setSaving] = useState(false);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 if (id) {
 fetchPost();
 }
 }, [id]);

 const fetchPost = async () => {
 try {
 const response = await api.get(`/blog/${id}`);
 setFormData(response.data);
 } catch (error) {
 console.error("Error fetching post:", error);
 alert("Failed to load blog post");
 router.push("/blog");
 } finally {
 setLoading(false);
 }
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setFormData((prev) => ({ ...prev, [name]: value }));

 // Auto-generate slug from title ONLY if it's empty (don't overwrite existing slug on edit unless cleared)
 if (name === "title" && !formData.slug) {
 const slug = value
 .toLowerCase()
 .replace(/[^a-z0-9]+/g, "-")
 .replace(/(^-|-$)/g, "");
 setFormData((prev) => ({ ...prev, slug }));
 }
 };

 const handleAddTag = () => {
 if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
 setFormData((prev) => ({
 ...prev,
 tags: [...prev.tags, tagInput.trim()],
 }));
 setTagInput("");
 }
 };

 const handleRemoveTag = (tag: string) => {
 setFormData((prev) => ({
 ...prev,
 tags: prev.tags.filter((t) => t !== tag),
 }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setSaving(true);

 try {
 await api.put(`/blog/${id}`, formData);
 router.push("/blog");
 } catch (error) {
 console.error("Error updating post:", error);
 alert("Failed to update blog post");
 } finally {
 setSaving(false);
 }
 };

 if (loading) {
 return (
 <Layout>
 <div className="space-y-6">
 <Skeleton variant="rounded" height={40} width={280} />
 <Skeleton variant="rounded" height={120} />
 <Skeleton variant="rounded" height={360} />
 </div>
 </Layout>
 );
 }

 return (
 <Layout>
 <div className="space-y-6">
 <PageHeader
 title="Edit Blog Post"
 description="Update existing blog post"
 actions={
 <Button
 variant="outline"
 leadingIcon={<FiArrowLeft />}
 onClick={() => router.push("/blog")}
 >
 Back
 </Button>
 }
 />

 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Title */}
 <Card className="p-6">
 <Input
 label="Title *"
 type="text"
 name="title"
 value={formData.title}
 onChange={handleChange}
 required
 placeholder="Enter post title"
 />
 </Card>

 {/* Slug */}
 <Card className="p-6">
 <Input
 label="Slug *"
 type="text"
 name="slug"
 value={formData.slug}
 onChange={handleChange}
 required
 placeholder="post-url-slug"
 helperText={`URL: /blog/${formData.slug || "post-url-slug"}`}
 />
 </Card>

 {/* Excerpt */}
 <Card className="p-6">
 <Textarea
 label="Excerpt *"
 name="excerpt"
 value={formData.excerpt}
 onChange={handleChange}
 required
 maxLength={300}
 rows={3}
 placeholder="Brief description (max 300 characters)"
 helperText={`${formData.excerpt.length}/300 characters`}
 />
 </Card>

 {/* Content */}
 <Card className="p-6">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
 Content *
 </label>
 <RichTextEditor
 value={formData.content}
 onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
 placeholder="Write your blog post content..."
 minHeight={400}
 />
 </Card>

 {/* Category and Status */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <Card className="p-6">
 <Select
 label="Category"
 name="category"
 value={formData.category}
 onChange={handleChange}
 >
 <option value="Product Updates">Product Updates</option>
 <option value="HR Tips">HR Tips</option>
 <option value="Company News">Company News</option>
 <option value="Case Studies">Case Studies</option>
 <option value="Guides">Guides</option>
 </Select>
 </Card>

 <Card className="p-6">
 <Select
 label="Status"
 name="status"
 value={formData.status}
 onChange={handleChange}
 >
 <option value="draft">Draft</option>
 <option value="published">Published</option>
 <option value="archived">Archived</option>
 </Select>
 </Card>
 </div>

 {/* Tags */}
 <Card className="p-6">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
 Tags
 </label>
 <div className="flex gap-2 mb-3">
 <input
 type="text"
 value={tagInput}
 onChange={(e) => setTagInput(e.target.value)}
 onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
 className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
 placeholder="Add tag and press Enter"
 />
 <Button type="button" onClick={handleAddTag}>
 Add
 </Button>
 </div>
 <div className="flex flex-wrap gap-2">
 {formData.tags.map((tag) => (
 <span
 key={tag}
 className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm flex items-center gap-2"
 >
 {tag}
 <button
 type="button"
 onClick={() => handleRemoveTag(tag)}
 className="hover:text-primary-900 dark:hover:text-primary-200"
 >
 ×
 </button>
 </span>
 ))}
 </div>
 </Card>

 {/* Featured Image */}
 <Card className="p-6">
 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
 Featured Image
 </label>
 <FirebaseImageUpload
 label="Featured Image"
 onUpload={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
 currentImage={formData.featuredImage}
 folder="blog-images"
 />
 </Card>

 {/* SEO Meta */}
 <Card className="p-6">
 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
 SEO Meta Data
 </h3>
 <div className="space-y-4">
 <Input
 label="Meta Title"
 type="text"
 name="metaTitle"
 value={formData.metaTitle}
 onChange={handleChange}
 placeholder="SEO title (defaults to post title)"
 />
 <Textarea
 label="Meta Description"
 name="metaDescription"
 value={formData.metaDescription}
 onChange={handleChange}
 rows={3}
 placeholder="SEO description (defaults to excerpt)"
 />
 </div>
 </Card>

 {/* Submit Button */}
 <div className="flex items-center justify-end gap-4">
 <Button type="button" variant="outline" onClick={() => router.push("/blog")}>
 Cancel
 </Button>
 <Button type="submit" loading={saving} leadingIcon={<FiSave />}>
 {saving ? "Saving..." : "Update Post"}
 </Button>
 </div>
 </form>
 </div>
 </Layout>
 );
}
