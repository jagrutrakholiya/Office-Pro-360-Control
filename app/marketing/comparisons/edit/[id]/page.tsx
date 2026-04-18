"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../../../components/Layout";
import ComparisonForm from "../../../../../components/ComparisonForm";
import { useToast } from "../../../../../components/ui/Toast";
import { comparisonAPI, Comparison } from "@/lib/marketingAPI";

export default function EditComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params?.id as string;
  const [initial, setInitial] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const list = await comparisonAPI.list();
        const found = list.find((c) => c._id === id);
        if (!found) {
          toast.error("Comparison not found");
          router.push("/marketing/comparisons");
          return;
        }
        setInitial(found);
      } catch {
        toast.error("Failed to load comparison");
        router.push("/marketing/comparisons");
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
      <ComparisonForm mode="edit" id={id} initial={initial} />
    </Layout>
  );
}
