import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Flag, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Average Rating */}
              <div className="text-center md:border-r md:border-border/50 md:pr-6">
                <motion.p 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-6xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
                >
                  {averageRating.toFixed(1)}
                </motion.p>
                <div className="flex justify-center my-3 gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: star * 0.1 }}
                    >
                      <Star
                        className={cn(
                          "h-6 w-6",
                          star <= Math.round(averageRating)
                            ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                            : "text-muted/30"
                        )}
                      />
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-medium">{totalReviews.toLocaleString()} reviews</p>
              </div>

              {/* Rating Breakdown */}
              <div className="flex-1 space-y-3">
                {ratingBreakdown.map((item, index) => (
                  <motion.div 
                    key={item.stars} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm w-8 font-semibold flex items-center gap-1">
                      {item.stars} <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    </span>
                    <div className="flex-1 h-3 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / totalReviews) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 font-medium">{item.count}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Write Review */}
      {onSubmitReview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/30">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                Write a Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showReviewForm ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => setShowReviewForm(true)} 
                    className="bg-gradient-to-r from-primary to-teal-400 text-white font-semibold shadow-lg shadow-primary/30"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Share Your Experience
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-3">Rate this {serviceLabel}</p>
                    <div className="flex gap-2 p-3 rounded-xl bg-muted/20">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          whileHover={{ scale: 1.15, y: -4 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 transition-transform focus:outline-none"
                        >
                          <Star
                            className={cn(
                              "h-10 w-10 transition-all",
                              star <= (hoverRating || newRating)
                                ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                : "text-muted/30"
                            )}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Textarea
                      placeholder={`Share your experience with this ${serviceLabel.toLowerCase()}...`}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                      className="rounded-xl border-border/50 bg-muted/20"
                    />
                  </div>
                  <div className="flex gap-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={newRating === 0}
                        className="bg-gradient-to-r from-primary to-teal-400 text-white font-semibold"
                      >
                        Submit Review
                      </Button>
                    </motion.div>
                    <Button variant="outline" onClick={() => setShowReviewForm(false)} className="rounded-xl">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card className="border-0 bg-gradient-to-br from-card/90 to-card shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                    <AvatarImage src={review.userAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-teal-400/20">
                      <User className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold">{review.userName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-4 w-4",
                                  star <= review.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-muted/30"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">• {review.date}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive rounded-xl">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{review.comment}</p>
                    <div className="flex items-center gap-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" className="text-muted-foreground rounded-xl hover:text-emerald-500 hover:border-emerald-500/50">
                          <ThumbsUp className="h-4 w-4 mr-1.5" />
                          Helpful ({review.helpful})
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="sm" className="text-muted-foreground rounded-xl">
                          <ThumbsDown className="h-4 w-4 mr-1.5" />
                          ({review.notHelpful})
                        </Button>
                      </motion.div>
                    </div>

                    {/* Business Response */}
                    {review.response && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-teal-400/5 rounded-xl border border-primary/10"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-gradient-to-r from-primary to-teal-400 text-white border-0 font-semibold">
                            Response from {review.response.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{review.response.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{review.response.comment}</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsDisplay;
