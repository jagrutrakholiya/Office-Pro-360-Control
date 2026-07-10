"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../../../components/Layout";
import SolutionForm from "../../../../../components/SolutionForm";
import { Skeleton } from "../../../../../components/ui";
import { useToast } from "../../../../../components/ui/Toast";
import { solutionAPI, Solution } from "@/lib/marketingAPI";

export default function EditSolutionPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params?.id as string;
  const [initial, setInitial] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const list = await solutionAPI.list();
        const sol = list.find((s) => s._id === id);
        if (!sol) {
          toast.error("Solution not found");
          router.push("/marketing/solutions");
          return;
        }
        setInitial(sol);
      } catch {
        toast.error("Failed to load solution");
        router.push("/marketing/solutions");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  if (loading || !initial) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SolutionForm mode="edit" id={id} initial={initial} />
    </Layout>
  );
}
