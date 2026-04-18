"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../../../components/Layout";
import HelpArticleForm from "../../../../../components/HelpArticleForm";
import { useToast } from "../../../../../components/ui/Toast";
import { helpArticleAPI, HelpArticle } from "@/lib/marketingAPI";

export default function EditHelpArticlePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params?.id as string;
  const [initial, setInitial] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const list = await helpArticleAPI.list();
        const found = list.find((a) => a._id === id);
        if (!found) {
          toast.error("Article not found");
          router.push("/marketing/help-articles");
          return;
        }
        setInitial(found);
      } catch {
        toast.error("Failed to load article");
        router.push("/marketing/help-articles");
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
      <HelpArticleForm mode="edit" id={id} initial={initial} />
    </Layout>
  );
}
