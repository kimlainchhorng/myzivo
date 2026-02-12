/**
 * RatePassengerModal
 * Allows drivers to rate passengers after trip completion
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/rating/StarRating";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RatePassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  passengerName?: string;
}

const PASSENGER_TAGS = [
  { id: "punctual", label: "Punctual", category: "positive" as const },
  { id: "respectful", label: "Respectful", category: "positive" as const },
  { id: "good_directions", label: "Good directions", category: "positive" as const },
  { id: "friendly", label: "Friendly", category: "positive" as const },
  { id: "late_to_pickup", label: "Late to pickup", category: "negative" as const },
  { id: "no_show", label: "No-show", category: "negative" as const },
  { id: "incorrect_address", label: "Incorrect address", category: "negative" as const },
  { id: "rude", label: "Rude", category: "negative" as const },
];

const RatePassengerModal = ({
  isOpen,
  onClose,
  tripId,
  passengerName,
}: RatePassengerModalProps) => {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("trips")
        .update({
          rider_rating: rating,
          rider_feedback: comment.trim() || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", tripId);

      if (error) throw error;

      setHasRated(true);
      toast.success("Passenger rated!");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Failed to rate passenger:", err);
      toast.error("Failed to save rating");
    } finally {
      setIsSaving(false);
    }
  };

  const positiveTags = PASSENGER_TAGS.filter((t) => t.category === "positive");
  const negativeTags = PASSENGER_TAGS.filter((t) => t.category === "negative");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/10 text-white max-w-sm mx-auto">
        <DialogHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3"
          >
            <User className="w-7 h-7 text-primary" />
          </motion.div>
          <DialogTitle className="text-xl font-bold text-white">
            Rate {passengerName || "Passenger"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {hasRated ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 py-6"
            >
              <CheckCircle2 className="w-10 h-10 text-green-400" />
              <p className="text-green-400 font-medium">Thanks for your feedback!</p>
            </motion.div>
          ) : (
            <motion.div key="form" className="space-y-5">
              {/* Star Rating */}
              <div className="flex justify-center">
                <StarRating value={rating} onChange={setRating} size="lg" />
              </div>

              {/* Positive Tags */}
              <div>
                <p className="text-sm text-white/60 mb-2">What went well?</p>
                <div className="flex flex-wrap gap-2">
                  {positiveTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedTags.includes(tag.id)
                          ? "bg-green-600 hover:bg-green-700 border-green-600 text-white"
                          : "border-white/20 text-white/70 hover:bg-white/10"
                      )}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Negative Tags */}
              <div>
                <p className="text-sm text-white/60 mb-2">Any issues?</p>
                <div className="flex flex-wrap gap-2">
                  {negativeTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedTags.includes(tag.id)
                          ? "bg-destructive hover:bg-destructive/90 border-destructive text-white"
                          : "border-white/20 text-white/70 hover:bg-white/10"
                      )}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 200))}
                placeholder="Optional comment (max 200 chars)..."
                className="min-h-[70px] bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
                maxLength={200}
              />
              <p className="text-xs text-white/30 text-right -mt-3">
                {comment.length}/200
              </p>

              <Button
                onClick={handleSubmit}
                disabled={isSaving || rating === 0}
                className="w-full h-11 bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Submit Rating"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RatePassengerModal;
