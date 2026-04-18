"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import DataTable, { Column } from "../../components/ui/DataTable";
import { useToast } from "../../components/ui/Toast";
import api from "../../lib/api";
import { FaPlus, FaPencilAlt, FaTrash, FaStar, FaRegStar, FaCommentDots } from "react-icons/fa";

type Review = {
  _id: string;
  author: string;
  role?: string;
  company?: string;
  rating: number;
  quote: string;
  status: string;
  createdAt?: string;
};

export default function ReviewsPage() {
  const router = useRouter();
  const toast = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/marketing/admin/reviews");
      setReviews(res.data.reviews || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteReview = async (id: string, author: string) => {
    if (!confirm(`Delete review from ${author}?`)) return;
    try {
      await api.delete(`/marketing/admin/reviews/${id}`);
      toast.success("Review deleted");
      await load();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const columns: Column<Review>[] = [
    {
      key: "author",
      header: "Author",
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{r.author}</div>
          {(r.role || r.company) && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {r.role}
              {r.role && r.company && " · "}
              {r.company}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) => (
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) =>
            n <= r.rating ? (
              <FaStar key={n} className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <FaRegStar key={n} className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            )
          )}
        </div>
      ),
    },
    {
      key: "quote",
      header: "Quote",
      render: (r) => (
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md truncate" title={r.quote}>
          &ldquo;{r.quote}&rdquo;
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`badge ${r.status === "published" ? "badge-active" : r.status === "pending" ? "badge-pending" : "badge-view-only"}`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "160px",
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/reviews/edit/${r._id}`);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <FaPencilAlt className="text-[10px]" /> Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteReview(r._id, r.author);
            }}
            className="p-1.5 text-red-600 border border-red-200 dark:border-red-900/30 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Delete"
          >
            <FaTrash className="text-[11px]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <PageHeader
        title="Reviews"
        description="Manage testimonials displayed on the marketing site"
        actions={
          <button
            onClick={() => router.push("/reviews/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
          >
            <FaPlus className="text-xs" /> Add Review
          </button>
        }
      />

      {!loading && reviews.length === 0 ? (
        <EmptyState
          icon={<FaCommentDots className="w-6 h-6" />}
          title="No reviews yet"
          description="Add your first customer testimonial to build trust on the marketing site."
          action={{ label: "+ Add Review", onClick: () => router.push("/reviews/new") }}
        />
      ) : (
        <DataTable<Review>
          columns={columns}
          data={reviews}
          loading={loading}
          rowKey={(r) => r._id}
          emptyMessage="No reviews yet"
        />
      )}
    </Layout>
  );
}
