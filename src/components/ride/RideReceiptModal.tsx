import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, Loader2, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { saveRideRating, saveRideTip } from "@/lib/supabaseRide";
import { PLATFORM_COMMISSION_RATE, DRIVER_SHARE_RATE } from "@/config/adminConfig";
import { toast } from "sonner";

interface RideReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripElapsed: number; // seconds
  distance: number; // miles
  price: number;
  rideName: string;
  onDone: () => void;
  tripId?: string;
}

const RideReceiptModal = ({ 
  isOpen, 
  onClose, 
  tripElapsed,
  distance,
  price,
  rideName,
  onDone,
  tripId,
}: RideReceiptModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [tipSaved, setTipSaved] = useState(false);
  const [isSavingTip, setIsSavingTip] = useState(false);
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [customTipValue, setCustomTipValue] = useState("");
  const [ratingCategories, setRatingCategories] = useState<Record<string, number>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Format elapsed time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate fare breakdown
  const baseFare = 2.50;
  const serviceFee = 1.50;
  const timeMinutes = Math.ceil(tripElapsed / 60);
  const timeCost = timeMinutes * 0.30;
  const distanceCost = Math.max(0, price - baseFare - serviceFee - timeCost);
  
  // Total with tip
  const totalWithTip = price + (selectedTip || 0);

  const handleStarClick = (stars: number) => {
    setRating(stars);
    setRatingError(null);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) return;
    
    if (tripId) {
      setIsSaving(true);
      setRatingError(null);
      
      const result = await saveRideRating({
        tripId,
        rating,
        feedback: feedback.trim() || undefined,
        ratingCategories: Object.keys(ratingCategories).length > 0 ? ratingCategories : undefined,
        ratingTags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      
      setIsSaving(false);
      
      if (!result.success) {
        setRatingError("Failed to save rating. Please try again.");
        return;
      }
    }
    
    setHasRated(true);
  };

  const handleDone = async () => {
    // Save tip if selected and not yet saved
    if (selectedTip && selectedTip > 0 && !tipSaved && tripId) {
      setIsSavingTip(true);
      const result = await saveRideTip(tripId, selectedTip);
      setIsSavingTip(false);
      if (result.success) {
        setTipSaved(true);
        toast.success("Tip added! 100% goes to your driver.");
        // Brief delay to show confirmation
        await new Promise(r => setTimeout(r, 1200));
      } else {
        toast.error("Failed to save tip. Please try again.");
        return;
      }
    }

    onDone();
    // Reset state for next use
    setRating(0);
    setHasRated(false);
    setSelectedTip(null);
    setFeedback("");
    setRatingError(null);
    setTipSaved(false);
    setShowCustomTip(false);
    setCustomTipValue("");
    setRatingCategories({});
    setSelectedTags([]);
  };

  const RIDE_FEEDBACK_TAGS = [
    { id: "great_conversation", label: "Great conversation", positive: true },
    { id: "smooth_ride", label: "Smooth ride", positive: true },
    { id: "clean_car", label: "Clean car", positive: true },
    { id: "late_arrival", label: "Late arrival", positive: false },
    { id: "unsafe_driving", label: "Unsafe driving", positive: false },
    { id: "rude_behavior", label: "Rude behavior", positive: false },
  ];

  const CATEGORY_LABELS = [
    { key: "driving", label: "Driving" },
    { key: "cleanliness", label: "Cleanliness" },
    { key: "friendliness", label: "Friendliness" },
    { key: "navigation", label: "Navigation" },
  ];

  const toggleFeedbackTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/10 text-white max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3"
          >
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </motion.div>
          <DialogTitle className="text-2xl font-bold text-white">Trip Complete!</DialogTitle>
        </DialogHeader>

        {/* Fare Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 py-4"
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Base fare</span>
              <span className="text-white">${baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Time ({formatTime(tripElapsed)})</span>
              <span className="text-white">${timeCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Distance ({distance.toFixed(1)} mi)</span>
              <span className="text-white">${distanceCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Service fee</span>
              <span className="text-white">${serviceFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 space-y-2">
            {selectedTip && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Tip</span>
                <span className="text-white">${selectedTip.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-primary">${totalWithTip.toFixed(2)}</span>
            </div>
          </div>

          {/* Commission Breakdown - read-only display */}
          <div className="pt-3 mt-3 border-t border-white/10 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Driver earned</span>
              <span className="text-green-400">${(price * DRIVER_SHARE_RATE).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Platform fee</span>
              <span className="text-white/40">${(price * PLATFORM_COMMISSION_RATE).toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="py-4 border-t border-white/10"
        >
          <p className="text-center text-white/60 mb-3">Rate your driver</p>
          
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleStarClick(star)}
                disabled={isSaving || hasRated}
                className="p-1 transition-colors disabled:opacity-50"
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    (hoveredStar >= star || rating >= star)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-white/20"
                  )}
                />
              </motion.button>
            ))}
          </div>

          {/* Category Ratings */}
          {rating > 0 && !hasRated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 space-y-3"
            >
              <p className="text-xs text-white/40 text-center">Rate specific areas (optional)</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_LABELS.map(({ key, label }) => (
                  <div key={key} className="p-2 bg-white/5 rounded-xl">
                    <p className="text-xs text-white/60 mb-1">{label}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRatingCategories((prev) => ({ ...prev, [key]: s }))}
                          className="p-0.5"
                        >
                          <Star
                            className={cn(
                              "w-4 h-4 transition-colors",
                              (ratingCategories[key] || 0) >= s
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-white/15"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback Tags */}
              <div className="flex flex-wrap gap-1.5">
                {RIDE_FEEDBACK_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleFeedbackTag(tag.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                      selectedTags.includes(tag.id)
                        ? tag.positive
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-destructive border-destructive text-white"
                        : "bg-transparent border-white/15 text-white/60 hover:bg-white/5"
                    )}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {!hasRated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4"
            >
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience (optional)..."
                className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
                maxLength={500}
                disabled={isSaving || hasRated}
              />
              <p className="text-xs text-white/30 mt-1 text-right">
                {feedback.length}/500
              </p>
            </motion.div>
          )}

          {/* Submit Rating Button */}
          {!hasRated && (
            <Button
              onClick={handleSubmitRating}
              disabled={isSaving || rating === 0}
              className="w-full mt-3 h-11 bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {ratingError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-sm text-red-400 mt-2"
              >
                {ratingError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {hasRated && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 text-green-400 mt-3"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Thanks for your feedback!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tip Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="py-4 border-t border-white/10"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-emerald-500" />
            <p className="text-white/60">Add a tip</p>
          </div>

          {tipSaved ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-emerald-400 font-medium">
                ${selectedTip?.toFixed(2)} tip added — 100% goes to your driver
              </span>
            </motion.div>
          ) : (
            <>
              <div className="flex justify-center gap-2">
                {[1, 3, 5].map((amount) => (
                  <motion.button
                    key={amount}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSavingTip}
                    onClick={() => setSelectedTip(selectedTip === amount ? null : amount)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                      selectedTip === amount
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                    )}
                  >
                    ${amount}
                  </motion.button>
                ))}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={isSavingTip}
                  onClick={() => {
                    setCustomTipValue(selectedTip && ![1, 3, 5].includes(selectedTip) ? selectedTip.toString() : "");
                    setShowCustomTip(true);
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                    selectedTip && ![1, 3, 5].includes(selectedTip)
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                  )}
                >
                  Custom
                </motion.button>
              </div>
              {selectedTip && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedTip(null)}
                  className="block mx-auto mt-2 text-xs text-white/40 hover:text-white/60"
                >
                  No tip
                </motion.button>
              )}
              <p className="text-xs text-white/30 mt-2 text-center">100% of tip goes to your driver</p>
            </>
          )}
        </motion.div>

        {/* Custom Tip Dialog */}
        <Dialog open={showCustomTip} onOpenChange={setShowCustomTip}>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-xs">
            <DialogHeader>
              <DialogTitle>Custom Tip</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={customTipValue}
                  onChange={(e) => setCustomTipValue(e.target.value)}
                  className="pl-7 bg-zinc-800 border-white/10 text-lg h-12"
                  autoFocus
                />
              </div>
              <Button
                onClick={() => {
                  const val = parseFloat(customTipValue);
                  if (!isNaN(val) && val > 0) {
                    setSelectedTip(Math.round(val * 100) / 100);
                    setShowCustomTip(false);
                  }
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11"
              >
                Add Tip
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Done Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleDone}
            disabled={isSavingTip}
            className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90"
          >
            {isSavingTip ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving tip...
              </>
            ) : (
              "DONE"
            )}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default RideReceiptModal;