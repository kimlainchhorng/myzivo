import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewSubmissionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: "hotel" | "flight" | "car_rental" | "restaurant" | "activity";
  serviceId: string;
  bookingReference?: string;
  title: string;
}

export function ReviewSubmissionSheet({
  isOpen,
  onClose,
  serviceType,
  serviceId,
  bookingReference,
  title,
}: ReviewSubmissionSheetProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to write a review");
      return;
    }
    if (!reviewTitle.trim() || !reviewBody.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("reviews").insert([
        {
          reviewer_id: user.id,
          service_type: serviceType,
          service_id: serviceId,
          booking_reference: bookingReference,
          rating,
          title: reviewTitle,
          body: reviewBody,
          verified_purchase: !!bookingReference,
          status: "published",
        },
      ]);

      if (error) throw error;
      toast.success("Review posted!");
      setReviewTitle("");
      setReviewBody("");
      setRating(5);
      onClose();
    } catch (err) {
      toast.error("Failed to post review");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl p-6 max-w-lg mx-auto w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Write a Review</h2>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Sum up your experience"
                  className="w-full rounded-lg bg-muted/30 border border-border/30 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  Your Review
                </label>
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Share details about your experience..."
                  rows={4}
                  className="w-full rounded-lg bg-muted/30 border border-border/30 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-1.5" />
                  )}
                  Post Review
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
