import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RideOption } from "@/components/ride/RideCard";
import { cn } from "@/lib/utils";

interface RideReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: RideOption;
  onDone: () => void;
}

const RideReceiptModal = ({ isOpen, onClose, ride, onDone }: RideReceiptModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  // Calculate mock fare breakdown that sums to ride.price
  const baseFare = 2.50;
  const serviceFee = 1.50;
  const timeCost = ride.eta * 0.30;
  const distanceCost = Math.max(0, ride.price - baseFare - serviceFee - timeCost);

  const handleRate = (stars: number) => {
    setRating(stars);
    setHasRated(true);
  };

  const handleDone = () => {
    onDone();
    // Reset state for next use
    setRating(0);
    setHasRated(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/10 text-white max-w-sm mx-auto">
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
              <span className="text-white/60">Time ({ride.eta} min)</span>
              <span className="text-white">${timeCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Distance</span>
              <span className="text-white">${distanceCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Service fee</span>
              <span className="text-white">${serviceFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-primary">${ride.price.toFixed(2)}</span>
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
                onClick={() => handleRate(star)}
                className="p-1 transition-colors"
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

          <AnimatePresence>
            {hasRated && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-sm text-green-400 mt-2"
              >
                Thanks for your feedback!
              </motion.p>
            )}
          </AnimatePresence>
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
