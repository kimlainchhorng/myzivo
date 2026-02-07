import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { saveRideRating } from "@/lib/supabaseRide";

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
      });
      
      setIsSaving(false);
      
      if (!result.success) {
        setRatingError("Failed to save rating. Please try again.");
        return;
      }
    }
    
    setHasRated(true);
  };

  const handleDone = () => {
    onDone();
    // Reset state for next use
    setRating(0);
    setHasRated(false);
    setSelectedTip(null);
    setFeedback("");
    setRatingError(null);
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

          {/* Feedback Textarea */}
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
          <p className="text-center text-white/60 mb-3">Add a tip</p>
          <div className="flex justify-center gap-2">
            {[1, 3, 5].map((amount) => (
              <motion.button
                key={amount}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTip(selectedTip === amount ? null : amount)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all border",
                  selectedTip === amount
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                )}
              >
                ${amount}
              </motion.button>
            ))}
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
        </motion.div>

        {/* Done Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleDone}
            className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90"
          >
            DONE
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default RideReceiptModal;