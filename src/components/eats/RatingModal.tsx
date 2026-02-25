/**
 * Rating Modal
 * Post-delivery rating prompt with stars and optional comment
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/rating/StarRating";
import { useCreateEatsReview } from "@/hooks/useEatsReviews";
import { UtensilsCrossed, Truck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  restaurantId: string;
  restaurantName: string;
}

export function RatingModal({
  open,
  onOpenChange,
  orderId,
  restaurantId,
  restaurantName,
}: RatingModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const createReview = useCreateEatsReview();

  const handleSubmit = async () => {
    if (overallRating === 0) return;

    await createReview.mutateAsync({
      orderId,
      restaurantId,
      rating: overallRating,
      foodRating: foodRating > 0 ? foodRating : undefined,
      deliveryRating: deliveryRating > 0 ? deliveryRating : undefined,
      comment: comment.trim() || undefined,
    });

    onOpenChange(false);
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            How was your order?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Restaurant Info */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-zinc-800 flex items-center justify-center mx-auto mb-3">
              <UtensilsCrossed className="w-7 h-7 text-orange-500" />
            </div>
            <p className="font-medium text-zinc-300">{restaurantName}</p>
          </div>

          {/* Overall Rating */}
          <div className="text-center">
            <p className="text-sm text-zinc-400 mb-3">Tap to rate</p>
            <div className="flex justify-center">
              <StarRating
                value={overallRating}
                onChange={setOverallRating}
                size="lg"
              />
            </div>
          </div>

          {/* Detailed Ratings Toggle */}
          {overallRating > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-orange-500 font-medium w-full text-center"
              >
                {showDetails ? "Hide details" : "Add detailed ratings (optional)"}
              </button>

              {showDetails && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 pt-2"
                >
                  {/* Food Rating */}
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="text-sm font-medium">Food Quality</span>
                    </div>
                    <StarRating
                      value={foodRating}
                      onChange={setFoodRating}
                      size="sm"
                    />
                  </div>

                  {/* Delivery Rating */}
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="text-sm font-medium">Delivery</span>
                    </div>
                    <StarRating
                      value={deliveryRating}
                      onChange={setDeliveryRating}
                      size="sm"
                    />
                  </div>
                </motion.div>
              )}

              {/* Comment */}
              <div>
                <Textarea
                  placeholder="Tell us about your experience (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="bg-zinc-800 border-white/5 text-white placeholder:text-zinc-500 resize-none"
                  rows={3}
                />
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={createReview.isPending}
              className="flex-1 h-12 rounded-xl border-zinc-700 bg-zinc-800 text-white active:scale-95 transition-all duration-200 touch-manipulation"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={overallRating === 0 || createReview.isPending}
              className={cn(
                "flex-1 h-12 rounded-xl font-bold shadow-lg active:scale-[0.97] transition-all duration-200 touch-manipulation",
                overallRating > 0
                  ? "bg-gradient-to-r from-orange-500 to-orange-600"
                  : "bg-zinc-700 text-zinc-400"
              )}
            >
              {createReview.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
