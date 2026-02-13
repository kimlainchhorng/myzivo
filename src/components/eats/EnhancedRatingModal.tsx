/**
 * Enhanced Rating Modal
 * Post-delivery review with category ratings, tags, and optional photo
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
import { useCreateEnhancedReview } from "@/hooks/useEnhancedEatsReviews";
import {
  UtensilsCrossed,
  Truck,
  Package,
  ClipboardCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnhancedRatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  restaurantId: string;
  restaurantName: string;
}

const REVIEW_TAGS = [
  { id: "delicious", label: "Delicious", positive: true },
  { id: "fresh", label: "Fresh", positive: true },
  { id: "well_packaged", label: "Well Packaged", positive: true },
  { id: "fast_delivery", label: "Fast Delivery", positive: true },
  { id: "generous_portions", label: "Generous Portions", positive: true },
  { id: "cold_food", label: "Cold Food", positive: false },
  { id: "wrong_items", label: "Wrong Items", positive: false },
  { id: "missing_items", label: "Missing Items", positive: false },
  { id: "poor_packaging", label: "Poor Packaging", positive: false },
  { id: "late_delivery", label: "Late Delivery", positive: false },
];

export function EnhancedRatingModal({
  open,
  onOpenChange,
  orderId,
  restaurantId,
  restaurantName,
}: EnhancedRatingModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [packagingRating, setPackagingRating] = useState(0);
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const createReview = useCreateEnhancedReview();

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (overallRating === 0) return;

    await createReview.mutateAsync({
      orderId,
      restaurantId,
      rating: overallRating,
      foodRating: foodRating > 0 ? foodRating : undefined,
      deliveryRating: deliveryRating > 0 ? deliveryRating : undefined,
      packagingRating: packagingRating > 0 ? packagingRating : undefined,
      accuracyRating: accuracyRating > 0 ? accuracyRating : undefined,
      comment: comment.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });

    onOpenChange(false);
  };

  const categoryRows = [
    { label: "Food Quality", icon: UtensilsCrossed, value: foodRating, set: setFoodRating },
    { label: "Delivery", icon: Truck, value: deliveryRating, set: setDeliveryRating },
    { label: "Packaging", icon: Package, value: packagingRating, set: setPackagingRating },
    { label: "Accuracy", icon: ClipboardCheck, value: accuracyRating, set: setAccuracyRating },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            How was your order?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Restaurant Info */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <UtensilsCrossed className="w-6 h-6 text-primary" />
            </div>
            <p className="font-medium text-muted-foreground">{restaurantName}</p>
          </div>

          {/* Overall Rating */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Overall experience</p>
            <div className="flex justify-center">
              <StarRating value={overallRating} onChange={setOverallRating} size="lg" />
            </div>
          </div>

          {/* Category Ratings */}
          <AnimatePresence>
            {overallRating > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-primary font-medium w-full text-center flex items-center justify-center gap-1"
                >
                  {showDetails ? "Hide" : "Rate"} categories
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {categoryRows.map((cat) => (
                      <div key={cat.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <cat.icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{cat.label}</span>
                        </div>
                        <StarRating value={cat.value} onChange={cat.set} size="sm" />
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Tags */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Quick feedback (optional)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REVIEW_TAGS.map((tag) => {
                      const selected = selectedTags.includes(tag.id);
                      return (
                        <Badge
                          key={tag.id}
                          variant={selected ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer text-xs transition-all",
                            selected && tag.positive && "bg-primary hover:bg-primary/90 border-primary",
                            selected && !tag.positive && "bg-destructive hover:bg-destructive/90",
                            !selected && "hover:bg-muted"
                          )}
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Comment */}
                <Textarea
                  placeholder="Tell us about your experience (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none"
                  rows={3}
                  maxLength={500}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createReview.isPending}
              className="flex-1 h-11 rounded-xl"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={overallRating === 0 || createReview.isPending}
              className="flex-1 h-11 rounded-xl font-bold"
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
