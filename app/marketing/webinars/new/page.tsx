"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../../components/Layout";
import FirebaseImageUpload from "../../../../components/FirebaseImageUpload";
import { useToast } from "../../../../components/ui/Toast";
import { Button, Card, CardHeader, CardTitle, PageHeader, Input, Textarea, Select } from "../../../../components/ui";
import { webinarAPI, Webinar } from "@/lib/marketingAPI";
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";

export default function NewWebinar() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Webinar, '_id' | 'slug'>>({
    title: "",
    description: "",
    type: "upcoming",
    category: "",
    date: "",
    time: "",
    timezone: "UTC",
    duration: 60,
    speakers: [{ name: "", title: "", bio: "", image: "" }],
    image: "",
    registrationUrl: "",
    featured: false,
    status: "draft"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      toast.warning("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      await webinarAPI.create(formData);
      toast.success("Webinar created");
      router.push("/marketing/webinars");
    } catch (error) {
      console.error("Failed to create webinar:", error);
      toast.error("Failed to create webinar");
    } finally {
      setLoading(false);
    }
  };

  const addSpeaker = () => {
    setFormData({
      ...formData,
      speakers: [...formData.speakers, { name: "", title: "", bio: "", image: "" }]
    });
  };

  const removeSpeaker = (index: number) => {
    setFormData({
      ...formData,
      speakers: formData.speakers.filter((_, i) => i !== index)
    });
  };

  const updateSpeaker = (index: number, field: keyof Webinar['speakers'][0], value: string) => {
    const newSpeakers = [...formData.speakers];
    newSpeakers[index] = { ...newSpeakers[index], [field]: value };
    setFormData({ ...formData, speakers: newSpeakers });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Create Webinar"
          breadcrumbs={[{ label: 'Webinars', href: '/marketing/webinars' }, { label: 'New' }]}
          actions={
            <Button
              type="button"
              variant="outline"
              leadingIcon={<FaArrowLeft />}
              onClick={() => router.push("/marketing/webinars")}
            >
              Back to Webinars
            </Button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>

            <div className="mt-4 space-y-4">
              <Input
                label="Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Mastering Product Management"
              />

              <Textarea
                label="Description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will attendees learn?"
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="recorded">Recorded</option>
                </Select>

                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Product, Development"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Date"
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />

                <Input
                  label="Time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />

                <Select
                  label="Timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                  <option value="IST">IST</option>
                  <option value="GMT">GMT</option>
                </Select>
              </div>

              <Input
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="0"
              />

              <FirebaseImageUpload
                label="Thumbnail Image"
                currentImage={formData.image}
                onUpload={(url) => setFormData({ ...formData, image: url })}
                folder="webinars"
              />

              <Input
                label="Registration URL"
                type="url"
                value={formData.registrationUrl || ""}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                placeholder="https://zoom.us/webinar/..."
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded"
                    />
                    Featured
                  </label>
                </div>

                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Speakers */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>Speakers</CardTitle>
              <Button
                type="button"
                variant="primary"
                leadingIcon={<FaPlus />}
                onClick={addSpeaker}
              >
                Add Speaker
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {formData.speakers.map((speaker, index) => (
                <div key={index} className="border border-slate-300 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-slate-900 dark:text-white">Speaker {index + 1}</h3>
                    {formData.speakers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpeaker(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Input
                      value={speaker.name}
                      onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                      placeholder="Speaker name"
                    />

                    <Input
                      value={speaker.title}
                      onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                      placeholder="Title/Position"
                    />

                    <Textarea
                      value={speaker.bio}
                      onChange={(e) => updateSpeaker(index, 'bio', e.target.value)}
                      placeholder="Brief bio"
                      rows={2}
                    />

                    <FirebaseImageUpload
                      label={`Speaker ${index + 1} Photo`}
                      currentImage={speaker.image}
                      onUpload={(url) => updateSpeaker(index, 'image', url)}
                      folder="webinars/speakers"
                      maxSize={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              leadingIcon={<FaSave />}
            >
              {loading ? "Creating..." : "Create Webinar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/marketing/webinars")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
