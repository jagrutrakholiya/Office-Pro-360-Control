"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
 getGlobalOptions,
 updateGlobalOptions,
 initializeGlobalDefaults,
 type OptionItem,
} from "@/lib/contentOptionsAPI";
import {
 PageHeader,
 Card,
 Button,
 IconButton,
 Badge,
 Tabs,
 Input,
 EmptyState,
 Skeleton,
} from "@/components/ui";

export default function ContentOptionsPage() {
 const router = useRouter();
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [options, setOptions] = useState<any>(null);
 const [activeTab, setActiveTab] = useState<string>("departments");

 const optionTypes = [
 { key: "departments", label: "Departments", icon: "" },
 { key: "employmentTypes", label: "Employment Types", icon: "" },
 { key: "locations", label: "Locations", icon: "" },
 { key: "tutorialCategories", label: "Tutorial Categories", icon: "" },
 { key: "tutorialLevels", label: "Tutorial Levels", icon: "" },
 { key: "industries", label: "Industries", icon: "" },
 { key: "companySizes", label: "Company Sizes", icon: "" },
 { key: "contentCategories", label: "Content Categories", icon: "" },
 ];

 useEffect(() => {
 loadOptions();
 }, []);

 const loadOptions = async () => {
 try {
 setLoading(true);
 const data = await getGlobalOptions();
 setOptions(data);
 } catch (error: any) {
 console.error("Failed to load options:", error);
 alert(error.response?.data?.message || "Failed to load options");
 } finally {
 setLoading(false);
 }
 };

 const handleSave = async () => {
 try {
 setSaving(true);
 await updateGlobalOptions(options);
 alert(" Global options saved successfully!");
 } catch (error: any) {
 console.error("Failed to save:", error);
 alert(error.response?.data?.message || "Failed to save options");
 } finally {
 setSaving(false);
 }
 };

 const handleReset = async () => {
 if (
 !confirm(
 " This will reset all global options to defaults. Company-specific options will remain unchanged. Continue?"
 )
 ) {
 return;
 }

 try {
 setSaving(true);
 await initializeGlobalDefaults();
 await loadOptions();
 alert(" Global options reset to defaults!");
 } catch (error: any) {
 console.error("Failed to reset:", error);
 alert(error.response?.data?.message || "Failed to reset options");
 } finally {
 setSaving(false);
 }
 };

 const addOption = (type: string) => {
 const currentOptions = options[type] || [];
 const newOption: OptionItem = {
 value: "",
 label: "",
 order: currentOptions.length + 1,
 active: true,
 };

 setOptions({
 ...options,
 [type]: [...currentOptions, newOption],
 });
 };

 const updateOption = (
 type: string,
 index: number,
 field: keyof OptionItem,
 value: any
 ) => {
 const updatedOptions = [...(options[type] || [])];
 updatedOptions[index] = {
 ...updatedOptions[index],
 [field]: value,
 };

 // If value changes, sync label
 if (field === "value" && !updatedOptions[index].label) {
 updatedOptions[index].label = value;
 }

 setOptions({
 ...options,
 [type]: updatedOptions,
 });
 };

 const removeOption = (type: string, index: number) => {
 const updatedOptions = (options[type] || []).filter(
 (_: any, i: number) => i !== index
 );
 setOptions({
 ...options,
 [type]: updatedOptions,
 });
 };

 const moveOption = (type: string, index: number, direction: "up" | "down") => {
 const arr = [...(options[type] || [])];
 const newIndex = direction === "up" ? index - 1 : index + 1;

 if (newIndex < 0 || newIndex >= arr.length) return;

 [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];

 // Update order numbers
 arr.forEach((item, idx) => {
 item.order = idx + 1;
 });

 setOptions({
 ...options,
 [type]: arr,
 });
 };

 if (loading) {
 return (
 <div className="p-6 space-y-6">
 <PageHeader
 title="Content Options Manager"
 description="Manage global default options for marketing content."
 breadcrumbs={[
 { label: "Settings", href: "/settings" },
 { label: "Content Options" },
 ]}
 />
 <Skeleton className="h-10 w-full rounded-lg" />
 <Skeleton className="h-64 w-full rounded-xl" />
 </div>
 );
 }

 const currentOptions = options?.[activeTab] || [];
 const currentLabel = optionTypes.find((t) => t.key === activeTab)?.label;

 return (
 <div className="p-6 space-y-6">
 <PageHeader
 title="Content Options Manager"
 description="Manage global default options for marketing content. Companies can override these with their own values."
 breadcrumbs={[
 { label: "Settings", href: "/settings" },
 { label: "Content Options" },
 ]}
 actions={
 <>
 <Button variant="outline" onClick={handleReset} disabled={saving}>
 Reset to Defaults
 </Button>
 <Button onClick={handleSave} loading={saving} disabled={saving}>
 {saving ? "Saving..." : "Save Changes"}
 </Button>
 </>
 }
 />

 <Tabs
 tabs={optionTypes.map((t) => ({
 key: t.key,
 label: t.label,
 badge: (options?.[t.key] || []).length,
 }))}
 activeKey={activeTab}
 onChange={setActiveTab}
 />

 <Card>
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
 {currentLabel} Options
 </h2>
 <Button size="sm" onClick={() => addOption(activeTab)}>
 Add Option
 </Button>
 </div>

 {currentOptions.length === 0 ? (
 <EmptyState
 size="compact"
 title="No options yet"
 description='Click "Add Option" to create one.'
 action={<Button size="sm" onClick={() => addOption(activeTab)}>Add Option</Button>}
 />
 ) : (
 <div className="space-y-3">
 {currentOptions.map((option: OptionItem, index: number) => (
 <div
 key={index}
 className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
 >
 {/* Reorder controls */}
 <div className="flex flex-col gap-1 text-slate-400 dark:text-slate-500">
 <button
 type="button"
 onClick={() => moveOption(activeTab, index, "up")}
 disabled={index === 0}
 className="hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30"
 aria-label="Move up"
 >
 ▲
 </button>
 <button
 type="button"
 onClick={() => moveOption(activeTab, index, "down")}
 disabled={index === currentOptions.length - 1}
 className="hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30"
 aria-label="Move down"
 >
 ▼
 </button>
 </div>

 {/* Value Input */}
 <Input
 type="text"
 value={option.value}
 onChange={(e) => updateOption(activeTab, index, "value", e.target.value)}
 placeholder="Value (e.g., engineering)"
 wrapperClassName="flex-1"
 />

 {/* Label Input */}
 <Input
 type="text"
 value={option.label}
 onChange={(e) => updateOption(activeTab, index, "label", e.target.value)}
 placeholder="Label (e.g., Engineering)"
 wrapperClassName="flex-1"
 />

 {/* Active Toggle */}
 <button
 type="button"
 onClick={() => updateOption(activeTab, index, "active", !option.active)}
 title={option.active ? "Active" : "Inactive"}
 >
 <Badge variant={option.active ? "success" : "neutral"}>
 {option.active ? "Active" : "Inactive"}
 </Badge>
 </button>

 {/* Delete Button */}
 <IconButton
 variant="danger"
 size="sm"
 aria-label="Delete option"
 onClick={() => removeOption(activeTab, index)}
 >
 ✕
 </IconButton>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>
 );
}
