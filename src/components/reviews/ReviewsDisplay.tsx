import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Flag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  notHelpful: number;
  response?: {
    name: string;
    date: string;
    comment: string;
  };
}

interface ReviewsDisplayProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: { stars: number; count: number }[];
  serviceType: 'driver' | 'restaurant' | 'hotel' | 'car';
  onSubmitReview?: (rating: number, comment: string) => void;
}

const ReviewsDisplay = ({
  reviews,
  averageRating,
  totalReviews,
  ratingBreakdown,
  serviceType,
  onSubmitReview,
}: ReviewsDisplayProps) => {
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleSubmit = () => {
    if (newRating > 0 && onSubmitReview) {
      onSubmitReview(newRating, newComment);
      setNewRating(0);
      setNewComment("");
      setShowReviewForm(false);
    }
  };

  const serviceLabel = {
    driver: 'Driver',
    restaurant: 'Restaurant',
    hotel: 'Hotel',
    car: 'Vehicle',
  }[serviceType];

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Average Rating */}
            <div className="text-center md:border-r md:pr-6">
              <p className="text-5xl font-bold">{averageRating.toFixed(1)}</p>
              <div className="flex justify-center my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= Math.round(averageRating)
                        ? "text-warning fill-warning"
                        : "text-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{totalReviews} reviews</p>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 space-y-2">
              {ratingBreakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <span className="text-sm w-8">{item.stars} ★</span>
                  <Progress
                    value={(item.count / totalReviews) * 100}
                    className="h-2 flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review */}
      {onSubmitReview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Write a Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showReviewForm ? (
              <Button onClick={() => setShowReviewForm(true)}>Share Your Experience</Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Rate this {serviceLabel}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1"
                      >
                        <Star
                          className={cn(
                            "h-8 w-8 transition-colors",
                            star <= (hoverRating || newRating)
                              ? "text-warning fill-warning"
                              : "text-muted"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Textarea
                    placeholder={`Share your experience with this ${serviceLabel.toLowerCase()}...`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={newRating === 0}>
                    Submit Review
                  </Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={review.userAvatar} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{review.userName}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-4 w-4",
                                star <= review.rating
                                  ? "text-warning fill-warning"
                                  : "text-muted"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground mb-3">{review.comment}</p>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      ({review.notHelpful})
                    </Button>
                  </div>

                  {/* Business Response */}
                  {review.response && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Response from {review.response.name}</Badge>
                        <span className="text-xs text-muted-foreground">{review.response.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.response.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewsDisplay;
