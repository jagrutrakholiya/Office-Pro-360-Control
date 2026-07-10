"use client";

import { useState, useEffect } from "react";
import {
 PageHeader,
 Card,
 CardHeader,
 CardTitle,
 CardDescription,
 CardFooter,
 Button,
 Badge,
 Input,
 Textarea,
 Select,
} from "@/components/ui";

interface ProfileData {
 bio?: string;
 signature?: string;
 phoneNumber?: string;
 timezone?: string;
 language?: string;
 dateFormat?: string;
 timeFormat?: string;
}

export default function ProfileSettingsPage() {
 const [profile, setProfile] = useState<ProfileData>({
 timezone: "UTC",
 language: "en",
 dateFormat: "MM/DD/YYYY",
 timeFormat: "12h"
 });
 const [loading, setLoading] = useState(false);
 const [saved, setSaved] = useState(false);

 useEffect(() => {
 fetchProfile();
 }, []);

 const fetchProfile = async () => {
 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/preferences`,
 {
 headers: {
 Authorization: `Bearer ${token}`,
 },
 }
 );

 if (response.ok) {
 const data = await response.json();
 if (data.data?.profile) {
 setProfile(data.data.profile);
 }
 }
 } catch (error) {
 console.error("Error fetching profile:", error);
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setSaved(false);

 try {
 const token = localStorage.getItem("cp_token");
 const response = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/user-settings/preferences/profile`,
 {
 method: "PUT",
 headers: {
 Authorization: `Bearer ${token}`,
 "Content-Type": "application/json",
 },
 body: JSON.stringify(profile),
 }
 );

 if (response.ok) {
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 }
 } catch (error) {
 console.error("Error updating profile:", error);
 alert("Failed to update profile");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="p-6 space-y-6">
 <PageHeader
 title="Profile Settings"
 description="Manage your personal information and preferences"
 breadcrumbs={[
 { label: "Settings", href: "/settings" },
 { label: "Profile" },
 ]}
 />

 <form onSubmit={handleSubmit}>
 <Card className="max-w-2xl">
 <CardHeader>
 <CardTitle>Personal Information</CardTitle>
 <CardDescription>
 This information may be displayed on your profile.
 </CardDescription>
 </CardHeader>

 <div className="mt-6 space-y-5">
 {/* Bio */}
 <Textarea
 label="Bio"
 value={profile.bio || ""}
 onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
 rows={4}
 maxLength={500}
 placeholder="Tell us about yourself..."
 helperText={`${profile.bio?.length || 0}/500 characters`}
 />

 {/* Signature */}
 <Input
 label="Email Signature"
 type="text"
 value={profile.signature || ""}
 onChange={(e) =>
 setProfile({ ...profile, signature: e.target.value })
 }
 maxLength={200}
 placeholder="Best regards, John Doe"
 />

 {/* Phone Number */}
 <Input
 label="Phone Number"
 type="tel"
 value={profile.phoneNumber || ""}
 onChange={(e) =>
 setProfile({ ...profile, phoneNumber: e.target.value })
 }
 placeholder="+1 (555) 123-4567"
 />

 {/* Timezone */}
 <Select
 label="Timezone"
 value={profile.timezone}
 onChange={(e) =>
 setProfile({ ...profile, timezone: e.target.value })
 }
 >
 <option value="UTC">UTC (Coordinated Universal Time)</option>
 <option value="America/New_York">Eastern Time (ET)</option>
 <option value="America/Chicago">Central Time (CT)</option>
 <option value="America/Denver">Mountain Time (MT)</option>
 <option value="America/Los_Angeles">Pacific Time (PT)</option>
 <option value="Europe/London">London (GMT)</option>
 <option value="Europe/Paris">Paris (CET)</option>
 <option value="Asia/Tokyo">Tokyo (JST)</option>
 <option value="Asia/Kolkata">India (IST)</option>
 <option value="Australia/Sydney">Sydney (AEDT)</option>
 </Select>

 {/* Language */}
 <Select
 label="Language"
 value={profile.language}
 onChange={(e) =>
 setProfile({ ...profile, language: e.target.value })
 }
 >
 <option value="en">English</option>
 <option value="es">Español</option>
 <option value="fr">Français</option>
 <option value="de">Deutsch</option>
 <option value="it">Italiano</option>
 <option value="pt">Português</option>
 <option value="ja">日本語</option>
 <option value="zh">中文</option>
 </Select>

 {/* Date Format */}
 <Select
 label="Date Format"
 value={profile.dateFormat}
 onChange={(e) =>
 setProfile({ ...profile, dateFormat: e.target.value })
 }
 >
 <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
 <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
 <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
 </Select>

 {/* Time Format */}
 <Select
 label="Time Format"
 value={profile.timeFormat}
 onChange={(e) =>
 setProfile({ ...profile, timeFormat: e.target.value })
 }
 >
 <option value="12h">12-hour (2:30 PM)</option>
 <option value="24h">24-hour (14:30)</option>
 </Select>
 </div>

 {/* Actions */}
 <CardFooter>
 <Button type="submit" loading={loading} disabled={loading}>
 {loading ? "Saving..." : "Save Changes"}
 </Button>

 {saved && (
 <Badge variant="success">Profile updated successfully</Badge>
 )}
 </CardFooter>
 </Card>
 </form>
 </div>
 );
}
