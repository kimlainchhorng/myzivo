/**
 * Restaurant Reviews Section
 * Displays rating summary, distribution bar, and filterable review list on restaurant pages
 */
import { useState } from "react";
import { Star, MessageSquare, ThumbsUp, Camera, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useFilteredRestaurantReviews, useReviewStats } from "@/hooks/useEnhancedEatsReviews";
import { format } from "date-fns";

interface RestaurantReviewsSectionProps {
  restaurantId: string;
  className?: string;
}

const ratingLabels: Record<number, string> = {
  5: "Excellent",
  4: "Great",
  3: "Good",
  2: "Fair",
  1: "Poor",
};

export function RestaurantReviewsSection({ restaurantId, className }: RestaurantReviewsSectionProps) {
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const { data: stats, isLoading: statsLoading } = useReviewStats(restaurantId);
  const { data: reviews, isLoading: reviewsLoading } = useFilteredRestaurantReviews(restaurantId, ratingFilter);

  if (statsLoading) return null;
  if (!stats || stats.totalReviews === 0) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Rating Summary Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Big Average Score */}
        <div className="text-center sm:text-left shrink-0">
          <div className="text-5xl font-bold text-foreground">{stats.avgRating}</div>
          <div className="flex items-center gap-1 justify-center sm:justify-start mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  "w-4 h-4",
                  s <= Math.round(stats.avgRating || 0) ? "fill-primary text-primary" : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}</p>
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 w-full space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star] || 0;
            const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <button
                key={star}
                onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                className={cn(
                  "flex items-center gap-2 w-full group transition-opacity",
                  ratingFilter !== null && ratingFilter !== star && "opacity-40"
                )}
              >
                <span className="text-xs font-medium w-3 text-muted-foreground">{star}</span>
                <Star className="w-3 h-3 fill-primary text-primary shrink-0" />
                <Progress value={pct} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Averages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Food", value: stats.avgFood },
          { label: "Delivery", value: stats.avgDelivery },
          { label: "Packaging", value: stats.avgPackaging },
          { label: "Accuracy", value: stats.avgAccuracy },
        ]
          .filter((c) => c.value !== null)
          .map((cat) => (
            <div key={cat.label} className="p-3 rounded-xl bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">{cat.label}</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                <span className="font-semibold text-sm">{cat.value}</span>
              </div>
            </div>
          ))}
      </div>

      {/* Filter chips */}
      {ratingFilter !== null && (
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Badge variant="secondary" className="gap-1">
            {ratingFilter} star{ratingFilter !== 1 ? "s" : ""}
            <button onClick={() => setRatingFilter(null)} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
          </Badge>
        </div>
      )}

      {/* Review Cards */}
      <div className="space-y-4">
        {reviewsLoading ? (
          <div className="text-center py-6 text-muted-foreground text-sm">Loading reviews...</div>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="border-border/50">
              <CardContent className="p-4 space-y-3">
                {/* Stars + Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "w-4 h-4",
                          s <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/20"
                        )}
                      />
                    ))}
                    {review.rating >= 1 && review.rating <= 5 && (
                      <span className="text-xs text-muted-foreground ml-1">{ratingLabels[review.rating]}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {review.created_at ? format(new Date(review.created_at), "MMM d, yyyy") : ""}
                  </span>
                </div>

                {/* Category mini-ratings */}
                {(review.food_rating || review.packaging_rating || review.accuracy_rating) && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {review.food_rating && <span>Food: {review.food_rating}★</span>}
                    {review.delivery_rating && <span>Delivery: {review.delivery_rating}★</span>}
                    {review.packaging_rating && <span>Packaging: {review.packaging_rating}★</span>}
                    {review.accuracy_rating && <span>Accuracy: {review.accuracy_rating}★</span>}
                  </div>
                )}

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                )}

                {/* Tags */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {review.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Photo */}
                {review.photo_url && (
                  <img
                    src={review.photo_url}
                    alt="Review photo"
                    className="w-24 h-24 object-cover rounded-xl border border-border/50"
                    loading="lazy"
                  />
                )}

                {/* Merchant Reply */}
                {review.merchant_reply && (
                  <div className="ml-4 p-3 bg-muted/50 rounded-xl border-l-2 border-primary/50">
                    <p className="text-xs font-medium text-primary mb-1">Restaurant Reply</p>
                    <p className="text-sm text-foreground">{review.merchant_reply}</p>
                    {review.merchant_reply_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(review.merchant_reply_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            {ratingFilter ? `No ${ratingFilter}-star reviews yet` : "No reviews yet"}
          </p>
        )}
      </div>
    </div>
  );
}
