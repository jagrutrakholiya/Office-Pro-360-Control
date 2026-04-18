"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../../../components/Layout";
import IndustryForm from "../../../../../components/IndustryForm";
import { useToast } from "../../../../../components/ui/Toast";
import { industryAPI, Industry } from "@/lib/marketingAPI";

export default function EditIndustryPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params?.id as string;
  const [initial, setInitial] = useState<Industry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const list = await industryAPI.list();
        const found = list.find((i) => i._id === id);
        if (!found) {
          toast.error("Industry not found");
          router.push("/marketing/industries");
          return;
        }
        setInitial(found);
      } catch {
        toast.error("Failed to load industry");
        router.push("/marketing/industries");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  if (loading || !initial) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <IndustryForm mode="edit" id={id} initial={initial} />
    </Layout>
  );
}
