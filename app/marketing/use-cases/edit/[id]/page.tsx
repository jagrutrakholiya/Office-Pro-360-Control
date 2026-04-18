"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../../../components/Layout";
import UseCaseForm from "../../../../../components/UseCaseForm";
import { useToast } from "../../../../../components/ui/Toast";
import { useCaseAPI, UseCase } from "@/lib/marketingAPI";

export default function EditUseCasePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params?.id as string;
  const [initial, setInitial] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const list = await useCaseAPI.list();
        const found = list.find((u) => u._id === id);
        if (!found) {
          toast.error("Use case not found");
          router.push("/marketing/use-cases");
          return;
        }
        setInitial(found);
      } catch {
        toast.error("Failed to load use case");
        router.push("/marketing/use-cases");
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
      <UseCaseForm mode="edit" id={id} initial={initial} />
    </Layout>
  );
}
