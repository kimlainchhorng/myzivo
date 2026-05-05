import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft, Star, Trash2, Edit2, MessageSquare, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";

interface UserReview {
  id: string;
  service_type: string;
  service_id: string;
  booking_reference: string | null;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  status: string;
}

const serviceTypeLabel: Record<string, string> = {
  flight: "Flight",
  hotel: "Hotel",
  car_rental: "Car Rental",
  restaurant: "Restaurant",
  activity: "Activity",
};

export default function MyReviewsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchReviews();
  }, [user, navigate]);

  const fetchReviews = async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase as any)
        .from("reviews")
        .select("*")
        .eq("reviewer_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReviews(data as UserReview[]);
      }
    } catch {
      // best-effort
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (!error) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        setDeleteConfirm(null);
        toast.success("Review deleted");
      }
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const filteredReviews = filterType === "all"
    ? reviews
    : reviews.filter(r => r.service_type === filterType);

  const serviceTypes = ["all", ...new Set(reviews.map(r => r.service_type))];

  return (
    <div className="min-h-screen bg-background pb-32">
      <SEOHead
        title="My Reviews"
        description="View and manage your reviews."
      />

      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-full bg-muted/60 flex items-center justify-center active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">My Reviews</h1>
          <p className="text-[11px] text-muted-foreground truncate">
            {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {/* Filter */}
        {serviceTypes.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4"
          >
            {serviceTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-[12px] font-semibold whitespace-nowrap transition-all",
                  filterType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/20 text-foreground border-border/20 hover:bg-muted/40"
                )}
              >
                {type === "all" ? "All Services" : serviceTypeLabel[type] || type}
              </button>
            ))}
          </motion.div>
        )}

        {loading ? (
          <>
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </>
        ) : filteredReviews.length > 0 ? (
          <div className="space-y-3">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-border/40 bg-card p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-3 h-3",
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {serviceTypeLabel[review.service_type] || review.service_type}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      {review.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => navigate(`/my-trips`)}
                      className="h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center hover:bg-muted/60 transition"
                      title="View trip"
                    >
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => toast.info("Edit coming soon")}
                      className="h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center hover:bg-muted/60 transition"
                      title="Edit review"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(review.id)}
                      className="h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center hover:bg-red-500/10 hover:text-red-600 transition"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <p className="text-[13px] text-foreground line-clamp-2 mb-2">
                  {review.body}
                </p>

                {/* Status Badge */}
                {review.status !== "published" && (
                  <div className={cn(
                    "inline-block px-2 py-1 rounded-full text-[10px] font-semibold",
                    review.status === "pending"
                      ? "bg-amber-500/10 text-amber-700"
                      : review.status === "rejected"
                      ? "bg-red-500/10 text-red-700"
                      : "bg-muted/20 text-muted-foreground"
                  )}>
                    {review.status === "pending" ? "Pending Review" : "Rejected"}
                  </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm === review.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 pt-3 border-t border-border/20 flex gap-2"
                  >
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(review.id)}
                      className="flex-1 h-8 text-xs"
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/40 bg-card p-8 text-center"
          >
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">
              No reviews yet
            </p>
            <p className="text-[12px] text-muted-foreground mb-4">
              Start leaving reviews for your trips and experiences.
            </p>
            <Button
              onClick={() => navigate("/my-trips")}
              className="rounded-2xl h-9"
            >
              View My Trips
            </Button>
          </motion.div>
        )}
      </div>

      <ZivoMobileNav />
    </div>
  );
}
