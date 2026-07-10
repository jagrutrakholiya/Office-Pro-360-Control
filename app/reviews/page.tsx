"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import {
  PageHeader,
  EmptyState,
  DataTable,
  Column,
  Badge,
  Button,
  IconButton,
} from "@/components/ui";
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
        <Badge
          variant={r.status === "published" ? "success" : r.status === "pending" ? "warning" : "neutral"}
        >
          {r.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "160px",
      render: (r) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            leadingIcon={<FaPencilAlt className="text-[10px]" />}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/reviews/edit/${r._id}`);
            }}
          >
            Edit
          </Button>
          <IconButton
            size="sm"
            variant="outline"
            aria-label="Delete"
            className="text-danger-600"
            onClick={(e) => {
              e.stopPropagation();
              deleteReview(r._id, r.author);
            }}
          >
            <FaTrash className="text-[11px]" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Reviews"
          description="Manage testimonials displayed on the marketing site"
          actions={
            <Button
              leadingIcon={<FaPlus className="text-xs" />}
              onClick={() => router.push("/reviews/new")}
            >
              Add Review
            </Button>
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
      </div>
    </Layout>
  );
}
