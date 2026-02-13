/**
 * Merchant Review Dashboard
 * Shows rating analytics, trends, recent reviews, and reply functionality
 */
import { useState } from "react";
import {
  Star,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Send,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  useReviewStats,
  useMerchantReviews,
  useMerchantReply,
  type EnhancedReview,
} from "@/hooks/useEnhancedEatsReviews";
import { format, subDays, isAfter } from "date-fns";

interface MerchantReviewDashboardProps {
  restaurantId: string;
  className?: string;
}

function ReviewReplyCard({ review, restaurantId }: { review: EnhancedReview; restaurantId: string }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState(review.merchant_reply || "");
  const replyMutation = useMerchantReply();

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ reviewId: review.id, reply: replyText, restaurantId });
    setShowReply(false);
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
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
          </div>
          <div className="flex items-center gap-2">
            {review.rating <= 2 && (
              <Badge variant="destructive" className="text-xs">Low</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {review.created_at ? format(new Date(review.created_at), "MMM d, yyyy") : ""}
            </span>
          </div>
        </div>

        {review.comment && (
          <p className="text-sm text-foreground">{review.comment}</p>
        )}

        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {review.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag.replace(/_/g, " ")}</Badge>
            ))}
          </div>
        )}

        {/* Category mini ratings */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {review.food_rating && <span>Food: {review.food_rating}★</span>}
          {review.delivery_rating && <span>Delivery: {review.delivery_rating}★</span>}
          {review.packaging_rating && <span>Packaging: {review.packaging_rating}★</span>}
          {review.accuracy_rating && <span>Accuracy: {review.accuracy_rating}★</span>}
        </div>

        {/* Existing reply */}
        {review.merchant_reply && !showReply && (
          <div className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary/50">
            <p className="text-xs font-medium text-primary mb-1">Your Reply</p>
            <p className="text-sm">{review.merchant_reply}</p>
          </div>
        )}

        {/* Reply button / form */}
        {!showReply ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReply(true)}
            className="text-xs gap-1"
          >
            <MessageSquare className="w-3 h-3" />
            {review.merchant_reply ? "Edit Reply" : "Reply"}
          </Button>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a public reply..."
              rows={2}
              maxLength={300}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowReply(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || replyMutation.isPending}
                className="gap-1"
              >
                <Send className="w-3 h-3" />
                Post Reply
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MerchantReviewDashboard({ restaurantId, className }: MerchantReviewDashboardProps) {
  const { data: stats, isLoading: statsLoading } = useReviewStats(restaurantId);
  const { data: reviews, isLoading: reviewsLoading } = useMerchantReviews(restaurantId);

  if (statsLoading || reviewsLoading) {
    return <div className="py-8 text-center text-muted-foreground text-sm">Loading reviews...</div>;
  }

  const recentReviews = reviews || [];
  const lowRatingReviews = recentReviews.filter((r) => r.rating <= 2);
  const recentLow = lowRatingReviews.filter(
    (r) => r.created_at && isAfter(new Date(r.created_at), subDays(new Date(), 7))
  );

  // Trend: compare last 30 days vs previous 30 days
  const now = new Date();
  const last30 = recentReviews.filter((r) => r.created_at && isAfter(new Date(r.created_at), subDays(now, 30)));
  const prev30 = recentReviews.filter(
    (r) =>
      r.created_at &&
      isAfter(new Date(r.created_at), subDays(now, 60)) &&
      !isAfter(new Date(r.created_at), subDays(now, 30))
  );
  const avgLast = last30.length > 0 ? last30.reduce((s, r) => s + r.rating, 0) / last30.length : 0;
  const avgPrev = prev30.length > 0 ? prev30.reduce((s, r) => s + r.rating, 0) / prev30.length : 0;
  const trend = avgLast - avgPrev;

  // Common tags
  const tagCounts: Record<string, number> = {};
  recentReviews.forEach((r) => {
    (r.tags || []).forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats?.avgRating || "—"}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats?.totalReviews || 0}</p>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            {trend >= 0 ? (
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive mx-auto mb-1" />
            )}
            <p className="text-2xl font-bold">
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">30-day Trend</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={cn("w-5 h-5 mx-auto mb-1", recentLow.length > 0 ? "text-destructive" : "text-primary")} />
            <p className="text-2xl font-bold">{recentLow.length}</p>
            <p className="text-xs text-muted-foreground">Low This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution */}
      {stats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] || 0;
              const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-medium w-3">{star}</span>
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground w-10 text-right">{count} ({Math.round(pct)}%)</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Top Feedback Tags */}
      {topTags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Common Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                  {tag.replace(/_/g, " ")}
                  <span className="text-muted-foreground">({count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reviews with Reply */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Recent Reviews</h3>
        <div className="space-y-3">
          {recentReviews.length > 0 ? (
            recentReviews.map((review) => (
              <ReviewReplyCard key={review.id} review={review} restaurantId={restaurantId} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
