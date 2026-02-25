/**
 * My Reviews Page
 * Shows all past reviews the user has submitted
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Utensils, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useMyOrderReviews } from "@/hooks/useEatsReviews";
import { format } from "date-fns";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${
            s <= rating
              ? "fill-primary text-primary"
              : "fill-transparent text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function MyReviewsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: reviewsMap, isLoading } = useMyOrderReviews();

  const reviews = reviewsMap ? Array.from(reviewsMap.values()) : [];
  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
        ) / 10
      : 0;

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 -ml-2 rounded-full hover:bg-muted touch-manipulation active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">My Reviews</h1>
        </div>
      </div>

      {/* Summary Card */}
      <div className="px-4 pt-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-primary/5 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-3xl font-bold">{reviews.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-2xl font-bold">
                    {avgRating > 0 ? avgRating : "—"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <Tabs defaultValue="all">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="food" className="flex-1">
              Food
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ReviewsList reviews={reviews} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="food">
            <ReviewsList reviews={reviews} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ReviewsList({
  reviews,
  isLoading,
}: {
  reviews: Array<{
    id: string;
    rating: number;
    food_rating: number | null;
    delivery_rating: number | null;
    comment: string | null;
    created_at: string;
    restaurant_id: string;
  }>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No reviews yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          After completing an order, you can rate your experience here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-3">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-orange-500" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Food Order
                </Badge>
              </div>
              <StarDisplay rating={review.rating} />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Clock className="w-3 h-3" />
              {format(new Date(review.created_at), "MMM d, yyyy")}
            </div>

            {review.comment && (
              <p className="text-sm text-foreground/80 italic">
                "{review.comment}"
              </p>
            )}

            {(review.food_rating || review.delivery_rating) && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {review.food_rating && (
                  <Badge variant="outline" className="text-xs">
                    Food: {review.food_rating}★
                  </Badge>
                )}
                {review.delivery_rating && (
                  <Badge variant="outline" className="text-xs">
                    Delivery: {review.delivery_rating}★
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
