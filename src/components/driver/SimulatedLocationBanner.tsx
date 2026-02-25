import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinOff, X } from "lucide-react";

interface SimulatedLocationBannerProps {
  onDismiss?: () => void;
  className?: string;
}

const SimulatedLocationBanner = ({ onDismiss, className = "" }: SimulatedLocationBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`mx-4 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between ${className}`}
      >
        <div className="flex items-center gap-2">
          <MapPinOff className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400">Using simulated location</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-yellow-400/60 hover:text-yellow-400 transition-all duration-200 p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default SimulatedLocationBanner;
