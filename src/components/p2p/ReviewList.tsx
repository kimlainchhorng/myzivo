/**
 * Review List Component
 * Displays reviews for a vehicle or owner
 */

import { format, parseISO } from "date-fns";
import { Star, User, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { P2PReview } from "@/types/p2p";

interface ReviewListProps {
  reviews: P2PReview[];
  isLoading?: boolean;
  emptyMessage?: string;
  showVehicleStats?: boolean;
  averageRating?: number;
  reviewCount?: number;
}

interface ReviewCardProps {
  review: P2PReview;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-4 h-4",
            star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-b last:border-b-0 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">Guest</p>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(review.created_at!), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {review.title && <p className="font-medium mb-1">{review.title}</p>}
      {review.comment && (
        <p className="text-muted-foreground text-sm">{review.comment}</p>
      )}

      {/* Sub-ratings */}
      {(review.cleanliness || review.communication || review.accuracy || review.value || review.condition) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {review.cleanliness && (
            <Badge variant="outline" className="text-xs">
              Cleanliness: {review.cleanliness}/5
            </Badge>
          )}
          {review.accuracy && (
            <Badge variant="outline" className="text-xs">
              Accuracy: {review.accuracy}/5
            </Badge>
          )}
          {review.value && (
            <Badge variant="outline" className="text-xs">
              Value: {review.value}/5
            </Badge>
          )}
          {review.condition && (
            <Badge variant="outline" className="text-xs">
              Condition: {review.condition}/5
            </Badge>
          )}
          {review.communication && (
            <Badge variant="outline" className="text-xs">
              Communication: {review.communication}/5
            </Badge>
          )}
        </div>
      )}

      {/* Owner response */}
      {review.owner_response && (
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border-l-2 border-primary">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Owner Response</span>
            {review.owner_responded_at && (
              <span className="text-xs text-muted-foreground">
                • {format(parseISO(review.owner_responded_at), "MMM d, yyyy")}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{review.owner_response}</p>
        </div>
      )}
    </div>
  );
}

export default function ReviewList({
  reviews,
  isLoading,
  emptyMessage = "No reviews yet",
  showVehicleStats = false,
  averageRating,
  reviewCount,
}: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Reviews</CardTitle>
          {showVehicleStats && reviewCount !== undefined && averageRating !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-bold">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">({reviewCount} reviews)</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
